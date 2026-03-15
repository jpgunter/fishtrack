import json
import os
import boto3
from collections import defaultdict
from datetime import datetime, timedelta

DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "fish-tracker")
S3_BUCKET = os.environ.get("S3_BUCKET")
S3_PREFIX = os.environ.get("S3_PREFIX", "heatmap/")

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")


def iso_week_key(date_str):
    """Return (iso_year, iso_week) tuple from a date string."""
    dt = datetime.fromisoformat(date_str[:10])
    iso = dt.isocalendar()
    return (iso[0], iso[1])


def week_start_date(iso_year, iso_week):
    """Return the Monday date string for a given ISO year/week."""
    jan4 = datetime(iso_year, 1, 4)
    start = jan4 - timedelta(days=jan4.weekday()) + timedelta(weeks=iso_week - 1)
    return start.strftime("%Y-%m-%d")


def scan_all(table):
    """Paginate through a full DynamoDB table scan."""
    items = []
    resp = table.scan()
    items.extend(resp["Items"])
    while "LastEvaluatedKey" in resp:
        resp = table.scan(ExclusiveStartKey=resp["LastEvaluatedKey"])
        items.extend(resp["Items"])
    return items


def aggregate(items):
    """
    Aggregate raw DynamoDB items into weekly buckets per marine_area.
    Returns dict: { marine_area -> { (iso_year, iso_week) -> totals } }
    """
    data = defaultdict(lambda: defaultdict(lambda: {
        "anglers": 0, "chinook": 0, "coho": 0, "pink": 0
    }))

    for item in items:
        area = str(item.get("marine_area") or item.get("PK", "unknown"))
        date_str = str(item.get("date") or item.get("SK", ""))
        if not date_str:
            continue

        week = iso_week_key(date_str)
        bucket = data[area][week]
        bucket["anglers"] += int(item.get("anglers", 0))
        bucket["chinook"] += int(item.get("chinook", 0))
        bucket["coho"]    += int(item.get("coho", 0))
        bucket["pink"]    += int(item.get("pink", 0))

    return data


def build_output(area, weekly_buckets):
    """Build the JSON payload for a single marine_area."""
    weeks = []
    for (iso_year, iso_week), totals in sorted(weekly_buckets.items()):
        anglers = totals["anglers"]
        chinook = totals["chinook"]
        coho    = totals["coho"]
        pink    = totals["pink"]

        weeks.append({
            "week": f"{iso_year}-W{iso_week:02d}",
            "week_start": week_start_date(iso_year, iso_week),
            "total_anglers": anglers,
            "chinook": chinook,
            "coho": coho,
            "pink": pink,
            "chinook_per_angler": round(chinook / anglers, 4) if anglers else 0,
            "coho_per_angler":    round(coho    / anglers, 4) if anglers else 0,
            "pink_per_angler":    round(pink    / anglers, 4) if anglers else 0,
        })

    return {"marine_area": area, "weeks": weeks}


def lambda_handler(event, context):
    table = dynamodb.Table(DYNAMODB_TABLE)
    items = scan_all(table)
    aggregated = aggregate(items)

    uploaded = []
    for area, weekly_buckets in aggregated.items():
        payload = build_output(area, weekly_buckets)
        key = f"{S3_PREFIX}area_{area}.json"
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=json.dumps(payload, indent=2),
            ContentType="application/json",
        )
        uploaded.append(key)

    # Also write a manifest so the webapp knows which areas exist
    manifest = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "marine_areas": sorted(aggregated.keys()),
    }
    s3.put_object(
        Bucket=S3_BUCKET,
        Key=f"{S3_PREFIX}manifest.json",
        Body=json.dumps(manifest, indent=2),
        ContentType="application/json",
    )

    print(f"Uploaded {len(uploaded)} area files + manifest to s3://{S3_BUCKET}/{S3_PREFIX}")
    return {"statusCode": 200, "uploaded": uploaded}
