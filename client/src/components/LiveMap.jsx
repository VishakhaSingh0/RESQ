
import { useEffect, useState } from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const incidents = [
  {
    id: 1,
    name: 'Demo Incident',
    type: 'Flood',
    position: [25.5941, 85.1376],
    severity: 'High',
  },
];

function LiveMap() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchShelters() {
      try {
        const response = await fetch(`${API_BASE_URL}/shelters`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Failed to load shelters'
          );
        }

        setShelters(result.data);
      } catch (err) {
        setError(err.message || 'Unable to load shelters');
      } finally {
        setLoading(false);
      }
    }

    fetchShelters();
  }, []);

  return (
    <section className="live-map-section">
      <h2>Live Map</h2>

      <p className="map-note">
        Shelter markers show database records. Locations and
        availability are not independently verified.
      </p>

      <div className="map-legend">
        <span>🔴 Demo incident</span>
        <span>🟢 Database shelter</span>
      </div>

      {loading && <p>Loading shelters...</p>}

      {error && (
        <p className="map-note">
          Shelter data error: {error}
        </p>
      )}

      <p>Total shelters loaded: {shelters.length}</p>

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
            key={shelter._id}
            position={[
              Number(shelter.latitude),
              Number(shelter.longitude),
            ]}
          >
            <Popup>
              <strong>{shelter.name}</strong>
              <br />
              Location: {shelter.location}
              <br />
              Status: {shelter.status}
              <br />
              Available: {shelter.available} / {shelter.capacity}
              <br />
              Database record — availability unverified.
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}

export default LiveMap;
