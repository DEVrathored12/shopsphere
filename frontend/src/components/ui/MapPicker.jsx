import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function DraggableMarker({ position, onChange }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return (
    <Marker
      position={position}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const m = markerRef.current;
          if (m) {
            const { lat, lng } = m.getLatLng();
            onChange({ lat, lng });
          }
        },
      }}
    />
  );
}

/**
 * Map picker — click or drag the pin to set shop coordinates.
 * `value`    : { lat, lng } or null
 * `onChange` : ({ lat, lng }) => void
 */
export default function MapPicker({ value, onChange }) {
  const defaultCenter = value?.lat ? [value.lat, value.lng] : [20.5937, 78.9629]; // India center
  const position = value?.lat ? [value.lat, value.lng] : defaultCenter;

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: 320 }}>
      <MapContainer center={defaultCenter} zoom={value?.lat ? 15 : 5} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker position={position} onChange={onChange} />
        <RecenterMap center={defaultCenter} />
      </MapContainer>
    </div>
  );
}

function RecenterMap({ center }) {
  // no-op after initial render — map is controlled by user interaction
  return null;
}
