import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet'

import rawGeo from '../data/marineAreas.json';
import { GeoJsonObject } from 'geojson';

export function FishMap() {

    const geoData: GeoJsonObject = rawGeo as GeoJsonObject;

    return (
      <MapContainer center={[47.34766, -122.47850]} zoom={10} scrollWheelZoom={false} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[47.34766, -122.47850]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        <GeoJSON data={geoData} />
      </MapContainer>
    )
}