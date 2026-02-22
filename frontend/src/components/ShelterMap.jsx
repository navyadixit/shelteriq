import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const shelters = [
  { name: "Shelter Alpha", count: 87, capacity: 100, risk: "HIGH", lat: 12.9763, lng: 77.5929 },
  { name: "Shelter Beta", count: 45, capacity: 120, risk: "LOW", lat: 12.9507, lng: 77.5848 },
  { name: "Shelter Gamma", count: 110, capacity: 110, risk: "HIGH", lat: 12.9716, lng: 77.5946 },
];

function ShelterMap() {
  return (
    <div className="bg-[#1e293b] rounded-xl p-5 flex flex-col gap-3">
      <h3 className="font-semibold text-white">Shelter Network Map</h3>
      <div style={{ height: "350px", width: "100%" }}>
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={9}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {shelters.map((s) => (
            <Marker key={s.name} position={[s.lat, s.lng]}>
              <Popup>
                <strong>{s.name}</strong><br />
                {s.count} / {s.capacity}<br />
                {s.risk}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default ShelterMap;