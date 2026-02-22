import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const severityStyle = {
  HIGH:   { color: "#ff2200", fillColor: "#ff2200" },
  MEDIUM: { color: "#ff8800", fillColor: "#ff8800" },
  LOW:    { color: "#00e676", fillColor: "#00e676" },
};

const shelterIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 24px; height: 24px;
      background: #0ea5e9;
      border: 2px solid #fff;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      font-size: 14px;
      line-height: 1;
    ">⛺</div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
});

const shelters = [
  { id: 1,  name: "Shelter Alpha — Cubbon Park Relief Camp",        capacity: 45,  count: 0,   lat: 12.9763, lng: 77.5929, volunteers: 8,  kits: 10, zone: "Central Bengaluru" },
  { id: 2,  name: "Shelter Beta — Lalbagh Relief Camp",             capacity: 60,  count: 45,  lat: 12.9507, lng: 77.5848, volunteers: 6,  kits: 8,  zone: "South Bengaluru" },
  { id: 3,  name: "Shelter Gamma — Kanteerava Stadium Camp",        capacity: 50,  count: 110, lat: 12.9716, lng: 77.5946, volunteers: 3,  kits: 5,  zone: "Central Bengaluru" },
  { id: 4,  name: "Shelter Delta — Yelahanka Community Hall",       capacity: 40,  count: 60,  lat: 13.1007, lng: 77.5963, volunteers: 7,  kits: 12, zone: "North Bengaluru" },
  { id: 5,  name: "Shelter Epsilon — Whitefield Sports Complex",    capacity: 60,  count: 72,  lat: 12.9698, lng: 77.7500, volunteers: 9,  kits: 14, zone: "East Bengaluru" },
  { id: 6,  name: "Shelter Zeta — Electronic City Convention Hall", capacity: 80,  count: 95,  lat: 12.8399, lng: 77.6770, volunteers: 11, kits: 15, zone: "South Bengaluru" },
  { id: 7,  name: "Shelter Eta — Rajajinagar Indoor Stadium",       capacity: 100, count: 50,  lat: 12.9916, lng: 77.5553, volunteers: 6,  kits: 10, zone: "West Bengaluru" },
  { id: 8,  name: "Shelter Theta — Hebbal Lake Grounds",            capacity: 120, count: 65,  lat: 13.0359, lng: 77.5970, volunteers: 7,  kits: 9,  zone: "North Bengaluru" },
  { id: 9,  name: "Shelter Iota — Koramangala Indoor Arena",        capacity: 75,  count: 88,  lat: 12.9279, lng: 77.6271, volunteers: 8,  kits: 11, zone: "South East Bengaluru" },
  { id: 10, name: "Shelter Kappa — Banashankari Community Hall",    capacity: 70,  count: 54,  lat: 12.9250, lng: 77.5468, volunteers: 6,  kits: 9,  zone: "South West Bengaluru" },
  { id: 11, name: "Shelter Lambda — KR Puram Grounds",              capacity: 70,  count: 102, lat: 13.0100, lng: 77.6950, volunteers: 10, kits: 13, zone: "North East Bengaluru" },
];

function occupancyColor(count, capacity) {
  const pct = count / capacity;
  if (pct >= 1)   return "#ff2200";
  if (pct >= 0.8) return "#ff8800";
  return "#00e676";
}

function UnifiedNetworkMap({ damageMarkers, severityFilter, liveCount, liveRisk }) {
  const filteredDamage = severityFilter === "ALL"
    ? damageMarkers
    : damageMarkers.filter(m => m.severity === severityFilter);

  const enrichedShelters = shelters.map(s =>
    s.id === 1 ? { ...s, count: liveCount } : s
  );

  return (
    <div className="bg-[#1e293b] rounded-xl p-4 flex flex-col gap-2">
      <h3 className="font-semibold text-white text-xs uppercase tracking-widest text-slate-400">
        Unified Crisis Network Map
      </h3>
      <div style={{ height: "800px", width: "100%" }}>
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {filteredDamage.map((m, i) => {
            const style = severityStyle[m.severity] || severityStyle.LOW;
            return (
              <CircleMarker
                key={`damage-${i}`}
                center={[m.lat, m.lng]}
                radius={8}
                pathOptions={{
                  color: style.color,
                  fillColor: style.fillColor,
                  fillOpacity: 0.9,
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div style={{ minWidth: "220px" }}>
                    <strong style={{ fontSize: "13px" }}>📍 {m.location_name}</strong><br />
                    <span style={{ color: "#64748b", fontSize: "11px" }}>{m.timestamp}</span>
                    <hr style={{ margin: "6px 0", borderColor: "#e2e8f0" }} />
                    <span style={{ fontWeight: "bold", color: m.severity === "HIGH" ? "#ff2200" : m.severity === "MEDIUM" ? "#ff8800" : "#00c853" }}>
                      {m.severity}
                    </span>
                    <span style={{ color: "#475569", fontSize: "12px" }}> — {m.confidence}% confidence</span>
                    <hr style={{ margin: "6px 0", borderColor: "#e2e8f0" }} />
                    <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
                      🏥 <strong>{m.nearest_hospital?.name || "N/A"}</strong><br />
                      <span style={{ color: "#64748b", fontSize: "11px", paddingLeft: "20px" }}>
                        {m.nearest_hospital?.distance_km ?? "?"} km away
                      </span><br />
                      ⛺ <strong>{m.nearest_shelter?.name || "N/A"}</strong><br />
                      <span style={{ color: "#64748b", fontSize: "11px", paddingLeft: "20px" }}>
                        {m.nearest_shelter?.distance_km ?? "?"} km away
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {enrichedShelters.map((s) => {
            const statusColor = occupancyColor(s.count, s.capacity);
            return (
              <Marker key={s.id} position={[s.lat, s.lng]} icon={shelterIcon}>
                <Popup>
                  <div style={{ minWidth: "210px" }}>
                    <strong>{s.name}</strong><br />
                    <span style={{ color: "#64748b", fontSize: "11px" }}>{s.zone}</span>
                    <hr style={{ margin: "6px 0", borderColor: "#e2e8f0" }} />
                    <span style={{ color: statusColor, fontWeight: "bold" }}>
                      {s.count} / {s.capacity} people
                    </span><br />
                    Volunteers: {s.volunteers}<br />
                    Medical Kits: {s.kits}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default UnifiedNetworkMap;