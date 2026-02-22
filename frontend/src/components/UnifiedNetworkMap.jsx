import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Custom icon for Damage Markers
const createDamageIcon = (severity) => {
  const colors = { HIGH: "red", MEDIUM: "orange", LOW: "green" };
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${colors[severity] || "blue"}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Custom icon for Shelters (Gold/Yellow)
const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const staticShelters = [
  { name: "Shelter Alpha", capacity: 100, lat: 12.9763, lng: 77.5929 },
  { name: "Shelter Beta", capacity: 120, lat: 12.9507, lng: 77.5848 },
  { name: "Shelter Gamma", capacity: 110, lat: 12.9716, lng: 77.5946 },
];

function UnifiedNetworkMap({ damageMarkers, severityFilter, liveCount, liveRisk }) {
  // Filter damage markers
  const filteredDamage = severityFilter === "ALL" 
    ? damageMarkers 
    : damageMarkers.filter(m => m.severity === severityFilter);

  return (
    <div className="bg-[#1e293b] rounded-xl p-4 flex flex-col gap-2">
      <h3 className="font-semibold text-white text-xs uppercase tracking-widest text-slate-400">
        Unified Crisis Network Map
      </h3>
      <div style={{ height: "450px", width: "100%" }}>
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* 1. Render Damage Markers */}
          {filteredDamage.map((m, i) => (
            <Marker key={`damage-${i}`} position={[m.lat, m.lng]} icon={createDamageIcon(m.severity)}>
              <Popup>
                <strong>DAMAGE: {m.location_name}</strong><br />
                Severity: {m.severity} | Conf: {m.confidence}%
              </Popup>
            </Marker>
          ))}

          {/* 2. Render Shelter Markers */}
          {staticShelters.map((s) => (
            <Marker key={s.name} position={[s.lat, s.lng]} icon={shelterIcon}>
              <Popup>
                <strong>SHELTER: {s.name}</strong><br />
                {s.name === "Shelter Alpha" ? `${liveCount} / ${s.capacity}` : `Capacity: ${s.capacity}`}<br />
                Status: {s.name === "Shelter Alpha" ? liveRisk : "NORMAL"}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default UnifiedNetworkMap;