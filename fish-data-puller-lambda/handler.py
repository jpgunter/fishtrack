
def lambda_handler(event, context):
    import json
    import requests
    from bs4 import BeautifulSoup
    from datetime import datetime
    from dateutil.parser import parse
    from decimal import Decimal
    from io import StringIO
    import boto3
    import pandas as pd
    
    dynamodb = boto3.resource('dynamodb')
    dyanmo_table = dynamodb.Table('fish-tracker')
    
    items = []
    for marine_area in ['01','02','03','04', '4B', '05', '06', '61', '62', '07', '81', '82', '09', '10', '11', '12', '13']:
    	url = 'https://wdfw.wa.gov/fishing/reports/creel/puget?ramp=&sample_date=3&catch_area=%s' % marine_area
    	html = requests.get(url).content
    	page_soup = BeautifulSoup(html, 'html.parser')
    
    	for table in page_soup.find_all('table'):
    		date_str = table.caption.string
    		date = parse(date_str)
    		df = pd.read_html(StringIO(str(table)))[0]
    
    		item = {}
    		item['PK'] = marine_area
    		item['SK'] = str(date)
    		item['date'] = date.isoformat()
    		item['marine_area'] = marine_area
    		item['chinook'] = df['Chinook'].sum().item()
    		item['coho'] = df['Coho'].sum().item()
    		item['pink'] = df['Pink'].sum().item()
    		item['anglers'] = df['Anglers'].sum().item()
    
    		items.append(item)
    
    with dyanmo_table.batch_writer() as batch:
    	for item in items:
    		print(item)
    		batch.put_item(Item=item)
    
    return 1