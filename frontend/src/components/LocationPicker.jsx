import { useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

const KATHMANDU = { lat: 27.7172, lng: 85.3240 };
const pinIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onChange }) {
  useMapEvents({ click: event => onChange(event.latlng) });
  return null;
}

function MapViewport({ position }) {
  const map = useMap();
  map.setView(position, Math.max(map.getZoom(), 16));
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);
  const position = value || KATHMANDU;

  const updatePosition = latlng => onChange({ lat: Number(latlng.lat.toFixed(7)), lng: Number(latlng.lng.toFixed(7)) });

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Location services are not available in this browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      result => {
        updatePosition({ lat: result.coords.latitude, lng: result.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError('We could not get your location. Allow location access or choose a point on the map.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span className="form-label" style={{ marginBottom: 0 }}>Delivery pin</span>
        <button className="btn btn-outline btn-sm" type="button" onClick={useCurrentLocation} disabled={locating}>
          {locating ? 'Finding location…' : 'Use my location'}
        </button>
      </div>
      <p className="text-muted text-sm" style={{ marginBottom: '0.6rem' }}>Required: click the map, drag the pin, or use your current location.</p>
      <div className="location-map">
        <MapContainer center={position} zoom={15} scrollWheelZoom={false}>
          <MapViewport position={position} />
          <TileLayer
            attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={pinIcon} draggable eventHandlers={{ dragend: event => updatePosition(event.target.getLatLng()) }} />
          <MapClickHandler onChange={updatePosition} />
        </MapContainer>
      </div>
      <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>{value ? `Selected: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : 'No delivery point selected yet.'}</p>
      {locationError && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.4rem' }}>{locationError}</p>}
    </div>
  );
}
