// ── Config ────────────────────────────────────────────────────────────────────
const S3_BASE_URL = 'https://wa-fish-tracker-data.s3.amazonaws.com/heatmap';
const GEOJSON_URL = 'marine_areas.geojson';
const PLAY_INTERVAL_MS = 800;

// ── State ─────────────────────────────────────────────────────────────────────
let allData = {};       // { areaId -> { week -> weekObj } }
let weeks = [];         // sorted list of all week strings
let geojsonLayer = null;
let playTimer = null;
let currentWeekIdx = 0;
let currentSpecies = 'chinook';

// ── Map setup ─────────────────────────────────────────────────────────────────
const map = L.map('map', { zoomControl: true }).setView([47.5, -122.5], 8);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  maxZoom: 14,
}).addTo(map);

// ── Colour scale (dark → bright yellow) ───────────────────────────────────────
function valueToColor(ratio) {
  // ratio 0..1 mapped through a blue→red→yellow heat ramp
  const stops = [
    [0,    [13,  2,  33]],
    [0.15, [26, 10,  78]],
    [0.35, [61, 26, 120]],
    [0.55, [123, 45, 139]],
    [0.70, [196, 77,  88]],
    [0.85, [244,162,  97]],
    [1.0,  [255,255,   0]],
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (ratio >= stops[i][0] && ratio <= stops[i + 1][0]) {
      lo = stops[i]; hi = stops[i + 1]; break;
    }
  }
  const t = lo[0] === hi[0] ? 0 : (ratio - lo[0]) / (hi[0] - lo[0]);
  const r = Math.round(lo[1][0] + t * (hi[1][0] - lo[1][0]));
  const g = Math.round(lo[1][1] + t * (hi[1][1] - lo[1][1]));
  const b = Math.round(lo[1][2] + t * (hi[1][2] - lo[1][2]));
  return `rgb(${r},${g},${b})`;
}

// ── Extract area number from GeoJSON Label property ───────────────────────────
function labelToAreaId(label) {
  // "US 13" -> "13", "US 4B" -> "4B"
  return label.replace(/^US\s*/i, '').trim();
}

// ── Fetch manifest then all area data ─────────────────────────────────────────
async function loadData() {
  const manifest = await fetch(`${S3_BASE_URL}/manifest.json`).then(r => r.json());

  const fetches = manifest.marine_areas.map(area =>
    fetch(`${S3_BASE_URL}/area_${area}.json`)
      .then(r => r.json())
      .then(d => { allData[String(area)] = d; })
  );
  await Promise.all(fetches);

  // Build sorted global week list
  const weekSet = new Set();
  Object.values(allData).forEach(d => d.weeks.forEach(w => weekSet.add(w.week)));
  weeks = Array.from(weekSet).sort();

  const slider = document.getElementById('week-slider');
  slider.max = weeks.length - 1;
  slider.value = 0;
}

// ── Compute max value across all areas/weeks for normalisation ────────────────
function globalMax(species) {
  let max = 0;
  Object.values(allData).forEach(d =>
    d.weeks.forEach(w => { if (w[`${species}_per_angler`] > max) max = w[`${species}_per_angler`]; })
  );
  return max || 1;
}

// ── Render GeoJSON layer for the current week ─────────────────────────────────
function render() {
  const week = weeks[currentWeekIdx];
  const species = currentSpecies;
  const max = globalMax(species);
  const metricKey = `${species}_per_angler`;

  document.getElementById('week-label').textContent = week;
  document.getElementById('legend-max').textContent = max.toFixed(3);

  if (geojsonLayer) geojsonLayer.remove();

  geojsonLayer = L.geoJSON(window._geojson, {
    style(feature) {
      const areaId = labelToAreaId(feature.properties.Label);
      const areaData = allData[areaId];
      const weekObj = areaData?.weeks.find(w => w.week === week);
      const val = weekObj ? weekObj[metricKey] : 0;
      const ratio = val / max;
      return {
        fillColor: valueToColor(ratio),
        fillOpacity: 0.75,
        color: '#ffffff',
        weight: 1,
        opacity: 0.4,
      };
    },
    onEachFeature(feature, layer) {
      const areaId = labelToAreaId(feature.properties.Label);
      const desc = feature.properties.Description;

      layer.on('mouseover', () => {
        layer.setStyle({ weight: 2, opacity: 0.9 });
        const areaData = allData[areaId];
        const weekObj = areaData?.weeks.find(w => w.week === week);

        document.getElementById('tooltip-area').textContent =
          `Area ${areaId} — ${desc}`;

        if (weekObj) {
          document.getElementById('tooltip-stats').innerHTML = `
            <div><span>Anglers</span><span>${weekObj.total_anglers}</span></div>
            <div><span>Chinook / angler</span><span>${weekObj.chinook_per_angler.toFixed(3)}</span></div>
            <div><span>Coho / angler</span><span>${weekObj.coho_per_angler.toFixed(3)}</span></div>
            <div><span>Pink / angler</span><span>${weekObj.pink_per_angler.toFixed(3)}</span></div>
          `;
        } else {
          document.getElementById('tooltip-stats').innerHTML =
            '<div><span>No data this week</span></div>';
        }
      });

      layer.on('mouseout', () => {
        geojsonLayer.resetStyle(layer);
      });
    },
  }).addTo(map);
}

// ── Playback controls ─────────────────────────────────────────────────────────
function stepWeek(delta) {
  currentWeekIdx = Math.max(0, Math.min(weeks.length - 1, currentWeekIdx + delta));
  document.getElementById('week-slider').value = currentWeekIdx;
  render();
}

document.getElementById('btn-play').addEventListener('click', () => {
  if (playTimer) return;
  playTimer = setInterval(() => {
    if (currentWeekIdx >= weeks.length - 1) {
      clearInterval(playTimer); playTimer = null; return;
    }
    stepWeek(1);
  }, PLAY_INTERVAL_MS);
});

document.getElementById('btn-stop').addEventListener('click', () => {
  clearInterval(playTimer); playTimer = null;
});

document.getElementById('week-slider').addEventListener('input', e => {
  clearInterval(playTimer); playTimer = null;
  currentWeekIdx = parseInt(e.target.value, 10);
  render();
});

document.getElementById('species-select').addEventListener('change', e => {
  currentSpecies = e.target.value;
  render();
});

// ── Boot ──────────────────────────────────────────────────────────────────────
(async () => {
  const [geojson] = await Promise.all([
    fetch(GEOJSON_URL).then(r => r.json()),
    loadData(),
  ]);
  window._geojson = geojson;
  render();
})();
