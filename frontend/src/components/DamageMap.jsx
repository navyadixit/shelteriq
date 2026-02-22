import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const createIcon = (severity) => {
  const colors = { HIGH: "red", MEDIUM: "orange", LOW: "green" };
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${colors[severity] || "blue"}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

function DamageMap({ markers, severityFilter = "ALL" }) {
  const filteredMarkers = severityFilter === "ALL" ? markers : markers.filter(m => m.severity === severityFilter);
  const offsetMarkers = markers.map((m, i) => {
    const duplicates = markers.slice(0, i).filter(
      prev => prev.lat === m.lat && prev.lng === m.lng
    );
    const offset = duplicates.length * 0.001;
    return { ...m, lat: m.lat + offset, lng: m.lng + offset };
  });

  return (
    <div className="bg-[#1e293b] rounded-xl p-5 flex flex-col gap-3">
      <h3 className="font-semibold text-white">Damage Location Map</h3>
      <div style={{ height: "300px", width: "100%" }}>
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {offsetMarkers.map((m, i) => (
              <Marker key={i} position={[m.lat, m.lng]} icon={createIcon(m.severity)}>
              <Popup>
                <strong>{m.location_name}</strong><br />
                Severity: {m.severity}<br />
                Confidence: {m.confidence}%<br />
                {m.timestamp}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default DamageMap;