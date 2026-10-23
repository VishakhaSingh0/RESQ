
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

const incidents = [
  {
    id: 1,
    name: 'Demo Incident',
    type: 'Flood',
    position: [25.5941, 85.1376],
    severity: 'High',
  },
];

const shelters = [
  {
    id: 1,
    name: 'Demo Safe Shelter',
    position: [25.602, 85.15],
  },
];

function LiveMap() {
  return (
    <section className="live-map-section">
      <h2>Live Map</h2>
      <p className="map-note">
        Demo locations only — not verified emergency information.
      </p>

      <div className="map-legend">
        <span>🔴 Demo incident</span>
        <span>🟢 Demo shelter</span>
      </div>

      <MapContainer
        center={[25.5941, 85.1376]}
        zoom={12}
        scrollWheelZoom
        className="resq-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.map((incident) => (
          <CircleMarker
            key={incident.id}
            center={incident.position}
            radius={9}
            pathOptions={{
              color: '#c53030',
              fillColor: '#e05252',
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <strong>{incident.name}</strong>
              <br />
              Type: {incident.type}
              <br />
              Severity: {incident.severity}
              <br />
              Demo data only
            </Popup>
          </CircleMarker>
        ))}

        {shelters.map((shelter) => (
          <Marker
            key={shelter.id}
            position={shelter.position}
          >
            <Popup>
              <strong>{shelter.name}</strong>
              <br />
              Demo location only — availability unverified.
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}

export default LiveMap;
