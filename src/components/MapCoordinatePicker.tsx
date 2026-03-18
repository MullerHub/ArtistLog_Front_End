import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapCoordinatePickerProps {
  latitude: number | null;
  longitude: number | null;
  onPick: (latitude: number, longitude: number) => void;
  className?: string;
}

interface ClickToPickProps {
  onPick: (latitude: number, longitude: number) => void;
}

function ClickToPick({ onPick }: ClickToPickProps) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

interface RecenterOnSelectionProps {
  latitude: number | null;
  longitude: number | null;
}

function RecenterOnSelection({ latitude, longitude }: RecenterOnSelectionProps) {
  const map = useMap();

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      map.setView([latitude, longitude], 15, { animate: true });
    }
  }, [latitude, longitude, map]);

  return null;
}

// Keep marker icons working in Vite by setting explicit CDN assets.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function MapCoordinatePicker({ latitude, longitude, onPick, className = "" }: MapCoordinatePickerProps) {
  const center: [number, number] = latitude !== null && longitude !== null ? [latitude, longitude] : [-14.235, -51.9253];

  return (
    <div className={`rounded-lg overflow-hidden border border-border ${className}`}>
      <MapContainer center={center} zoom={latitude !== null && longitude !== null ? 15 : 4} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPick onPick={onPick} />
        <RecenterOnSelection latitude={latitude} longitude={longitude} />
        {latitude !== null && longitude !== null && <Marker position={[latitude, longitude]} />}
      </MapContainer>
    </div>
  );
}
