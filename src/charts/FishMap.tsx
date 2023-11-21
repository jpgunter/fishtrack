import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet'

import rawGeo from '../data/marineAreas.json';
import { GeoJsonObject, Feature } from 'geojson';
import { useState } from 'react';

import { MarineAreasRetriever } from '../data/MarineAreas';


interface FishMapProps {
    marineAreasRetriever?: MarineAreasRetriever;
}

export function FishMap(props: FishMapProps) {
    const marineAreasRetriever = props.marineAreasRetriever || new MarineAreasRetriever();
    const heatedGeo : GeoJsonObject = marineAreasRetriever.getMarineAreasGeo({start: new Date("2023-07-01"), end: new Date("2023-08-01")});
    const [geoData, setGeoData] = useState(heatedGeo);

    const featureHandler = (feature: Feature, layer: any) => {
        layer.options.color = feature.properties?.color;
        layer.options.borderColor = feature.properties?.color;
        layer.options.fillOpacity = 0.5
        layer.options.weight = 2
        layer.options.dashArray = 1
        layer.options.opacity = 0.5
    }

    return (
      <>
        <MapContainer center={[47.7, -124]} zoom={7.5} scrollWheelZoom={true} style={{ height: '800px', width: '100%' }}>
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON data={geoData} interactive={true} onEachFeature={featureHandler} />
        </MapContainer>
        <p>This is where the time slider will be</p>
        <pre>
            {JSON.stringify(geoData, null , 2)}
        </pre>
      </>
    )
}