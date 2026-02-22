import { useState, useEffect } from "react";

const badgeColor = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-red-500",
};

const textColor = {
  LOW: "text-green-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-red-400",
};

function DispatchList({ onDelete, deletedIds = [], severityFilter = "ALL", newMarker = null }) {
  const [items, setItems] = useState([]);

  // Poll only refreshes EXISTING items — never dumps new ones in bulk
  const fetchDamage = async () => {
    try {
      const res = await fetch("http://localhost:8001/api/damage/all");
      const data = await res.json();
      setItems(prev => {
        if (prev.length === 0) return prev;
        const existingIds = new Set(prev.map(i => i.id));
        return data.filter(d => existingIds.has(d.id));
      });
    } catch (err) {
      console.error("Could not fetch damage list");
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchDamage, 5000);
    return () => clearInterval(interval);
  }, []);

  // New marker from CSV stagger or manual upload — add instantly, sorted by priority
  useEffect(() => {
    if (!newMarker) return;
    setItems(prev => {
      const alreadyExists = prev.some(item => item.id === newMarker.id);
      if (alreadyExists) return prev;
      const priority = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const updated = [...prev, newMarker];
      return updated.sort((a, b) => (priority[a.severity] ?? 3) - (priority[b.severity] ?? 3));
    });
  }, [newMarker]);

  const visibleItems = items.filter(item =>
    !deletedIds.includes(item.id) &&
    (severityFilter === "ALL" || item.severity === severityFilter)
  );

  if (visibleItems.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-xl p-5">
        <h3 className="font-semibold text-white mb-3">Priority Dispatch List</h3>
        <p className="text-slate-500 text-sm">No damage reports yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-xl p-5 flex flex-col gap-3">
      <h3 className="font-semibold text-white">Priority Dispatch List</h3>
      <div className="flex flex-col gap-2">
        {visibleItems.map((item, i) => (
          <div key={item.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${textColor[item.severity]}`}>#{i + 1}</span>
              <span className="text-white text-sm">{item.location_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xs">{item.confidence}%</span>
              <span className="text-slate-500 text-xs">{item.timestamp}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${badgeColor[item.severity]}`}>
                {item.severity}
              </span>
              <button
                onClick={() => onDelete(item.id)}
                className="text-slate-500 hover:text-red-400 text-xs"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DispatchList;