import { useState } from "react";

const areas = ["Whitefield", "Marathahalli", "Yelahanka", "Hebbal", "Electronic City", "Koramangala", "Rajajinagar"];

const subLocations = {
  "Whitefield": [
    { name: "Whitefield — ITPL Gate", lat: 12.9856, lng: 77.7272 },
    { name: "Whitefield — Kadugodi Metro", lat: 12.9980, lng: 77.7508 },
    { name: "Vydehi Hospital Area", lat: 12.9868, lng: 77.7275 },
    { name: "Hope Farm Junction", lat: 12.9875, lng: 77.7539 },
    { name: "Forum Shantiniketan Mall", lat: 12.9955, lng: 77.7295 },
    { name: "Prestige Shantiniketan", lat: 12.9921, lng: 77.7294 },
  ],
  "Marathahalli": [
    { name: "Marathahalli — Bridge", lat: 12.9591, lng: 77.6974 },
    { name: "Marathahalli — Outer Ring Road", lat: 12.9553, lng: 77.7018 },
  ],
  "Yelahanka": [
    { name: "Yelahanka — Old Town", lat: 13.1007, lng: 77.5963 },
    { name: "Yelahanka — New Town", lat: 13.1194, lng: 77.5940 },
  ],
  "Hebbal": [
    { name: "Hebbal — Flyover", lat: 13.0359, lng: 77.5970 },
    { name: "Hebbal — Kempapura", lat: 13.0450, lng: 77.5900 },
    { name: "Hebbal Flyover", lat: 13.0353, lng: 77.5976 },
    { name: "Manyata Tech Park Gate", lat: 13.0487, lng: 77.6206 },
    { name: "Hebbal Lake Park", lat: 13.0400, lng: 77.6000 },
    { name: "Esteem Mall Junction", lat: 13.0415, lng: 77.5960 },
    { name: "Aster CMI Hospital Area", lat: 13.0336, lng: 77.5970 },
    { name: "Hebbal Railway Station", lat: 13.0357, lng: 77.5979 },
  ],
  "Electronic City": [
    { name: "Infosys Campus Gate", lat: 12.8452, lng: 77.6630 },
    { name: "Narayana Health City", lat: 12.8351, lng: 77.6623 },
    { name: "Neeladri Road", lat: 12.8406, lng: 77.6768 },
    { name: "Electronic City Phase 1 Bus Stop", lat: 12.8441, lng: 77.6649 },
    { name: "TCS Gate", lat: 12.8394, lng: 77.6690 },
    { name: "Wipro Campus Junction", lat: 12.8401, lng: 77.6717 },
  ],
  "Koramangala": [
    { name: "Forum Mall", lat: 12.9346, lng: 77.6110 },
    { name: "Sony Signal", lat: 12.9352, lng: 77.6245 },
    { name: "St Johns Junction", lat: 12.9345, lng: 77.6200 },
    { name: "Jyoti Nivas College Road", lat: 12.9290, lng: 77.6150 },
    { name: "Koramangala Indoor Stadium", lat: 12.9288, lng: 77.6208 },
    { name: "Wipro Park Area", lat: 12.9313, lng: 77.6241 },
  ],
  "Rajajinagar": [
    { name: "Orion Mall", lat: 12.9916, lng: 77.5553 },
    { name: "ISKCON Temple", lat: 12.9955, lng: 77.5512 },
    { name: "Dr Rajkumar Road Metro", lat: 12.9913, lng: 77.5526 },
    { name: "ESI Hospital Junction", lat: 12.9911, lng: 77.5550 },
    { name: "Navrang Theatre Signal", lat: 12.9938, lng: 77.5529 },
    { name: "Rajajinagar 5th Block Market", lat: 12.9960, lng: 77.5565 },
  ],
};

const badgeColor = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-red-500",
};

const emptyRow = () => ({
  area: areas[0],
  subLocation: subLocations[areas[0]][0].name,
  file: null,
  preview: null,
  result: null,
});

function DamageUpload({ onNewAssessment }) {
  const [rows, setRows] = useState([emptyRow()]);
  const [loading, setLoading] = useState(false);

  const updateRow = (index, changes) => {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, ...changes } : r));
  };

  const handleAreaChange = (index, newArea) => {
    updateRow(index, {
      area: newArea,
      subLocation: subLocations[newArea][0].name,
    });
  };

  const handleImage = (index, e) => {
    const f = e.target.files[0];
    if (f) updateRow(index, { file: f, preview: URL.createObjectURL(f), result: null });
  };

  const addRow = () => setRows(prev => [...prev, emptyRow()]);

  const removeRow = (index) => setRows(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const rowsWithFiles = rows.filter(r => r.file);
    if (rowsWithFiles.length === 0) return;
    setLoading(true);

    const results = await Promise.all(rowsWithFiles.map(async (row, i) => {
      const selectedLocation = subLocations[row.area].find(l => l.name === row.subLocation);
      const formData = new FormData();
      formData.append("file", row.file);
      formData.append("location_name", selectedLocation.name);
      formData.append("lat", selectedLocation.lat);
      formData.append("lng", selectedLocation.lng);

      try {
        const res = await fetch("http://localhost:8000/api/damage", {
          method: "POST",
          body: formData,
        });
        return { index: rows.indexOf(rowsWithFiles[i]), data: await res.json() };
      } catch {
        return null;
      }
    }));

    results.forEach(r => {
      if (r) {
        updateRow(r.index, { result: r.data });
        if (onNewAssessment) onNewAssessment(r.data);
      }
    });

    setLoading(false);
  };

  return (
    <div className="bg-[#1e293b] rounded-xl p-5 flex flex-col gap-4">
      <h3 className="font-semibold text-white">Upload Damage Photos</h3>

      {rows.map((row, i) => (
        <div key={i} className="bg-slate-800 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">Location {i + 1}</span>
            {rows.length > 1 && (
              <button
                onClick={() => removeRow(i)}
                className="text-slate-500 hover:text-red-400 text-xs"
              >
                Remove
              </button>
            )}
          </div>

          <select
            value={row.area}
            onChange={(e) => handleAreaChange(i, e.target.value)}
            className="bg-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
          >
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select
            value={row.subLocation}
            onChange={(e) => updateRow(i, { subLocation: e.target.value })}
            className="bg-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
          >
            {subLocations[row.area].map(l => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImage(i, e)}
            className="text-sm text-slate-400"
          />

          {row.preview && (
            <img src={row.preview} alt="preview" className="rounded-lg max-h-32 object-cover" />
          )}

          {row.result && (
            <div className="flex items-center gap-3 bg-slate-900 rounded-lg px-3 py-2">
              <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${badgeColor[row.result.severity]}`}>
                {row.result.severity}
              </span>
              <span className="text-slate-300 text-xs">Confidence: {row.result.confidence}%</span>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addRow}
        className="border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white text-sm py-2 rounded-lg transition"
      >
        + Add Another Location
      </button>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition"
      >
        {loading ? "Analysing..." : "Submit All"}
      </button>
    </div>
  );
}

export default DamageUpload;