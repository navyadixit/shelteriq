import { useState } from "react";

const areas = ["Whitefield", "Marathahalli", "Yelahanka", "Hebbal", "Electronic City", "Koramangala"];

const subLocations = {
  "Whitefield": [
    { name: "Whitefield — ITPL", lat: 12.9856, lng: 77.7272 },
    { name: "Whitefield — Kadugodi", lat: 12.9980, lng: 77.7508 },
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
  ],
  "Electronic City": [
    { name: "Electronic City — Phase 1", lat: 12.8399, lng: 77.6770 },
    { name: "Electronic City — Phase 2", lat: 12.8283, lng: 77.6746 },
  ],
  "Koramangala": [
    { name: "Koramangala — 5th Block", lat: 12.9279, lng: 77.6271 },
    { name: "Koramangala — 8th Block", lat: 12.9347, lng: 77.6205 },
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