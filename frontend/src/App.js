import { useState, useEffect } from "react";
import OccupancyCard from './components/OccupancyCard';
import ResourcePanel from './components/ResourcePanel';
import DamageUpload from './components/DamageUpload';
import UnifiedNetworkMap from './components/UnifiedNetworkMap'; 
import AlertFeed from './components/AlertFeed';
import SituationReport from './components/SituationReport';
import DispatchList from './components/DispatchList';

function App() {
  const [damageMarkers, setDamageMarkers] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [liveData, setLiveData] = useState({ count: 0, risk: "LOW", alerts: [], resources: {}, report: "", ttf: "" });

  // App.js - Inside function App()

const handleBulkUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://10.7.16.234:8000/process-bulk-damage", {
      method: "POST",
      body: formData,
    });
    const allResults = await response.json();

    // STEP BY STEP: Add one to the map every 2 seconds
    allResults.forEach((marker, index) => {
      setTimeout(() => {
        // Reuse your existing assessment handler!
        handleNewAssessment(marker);
      }, index * 2000); 
    });
  } catch (err) {
    console.error("Bulk upload failed", err);
  }
};

  useEffect(() => {
    const fetchData = () => {
      fetch(`http://10.7.16.234:8000/api/dashboard`)
        .then(res => res.json())
        .then(data => setLiveData(data))
        .catch(err => console.log("Backend connecting..."));
    };
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNewAssessment = (data) => setDamageMarkers(prev => [...prev, data]);
  const handleDelete = (id) => setDeletedIds(prev => [...prev, id]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col max-h-screen overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#1e293b] border-b border-slate-700 shrink-0">
        <h1 className="text-xl font-bold tracking-wide text-blue-400 uppercase">ShelterIQ Dashboard</h1>
        <span className="text-green-400 text-xs font-bold uppercase tracking-widest animate-pulse">● System Live</span>
      </div>
      
      {/* NEW: Map spans the top of the dashboard content */}
      <div className="px-4 pt-4 shrink-0">
         <UnifiedNetworkMap 
            damageMarkers={damageMarkers.filter(m => !deletedIds.includes(m.id))}
            severityFilter={severityFilter}
            liveCount={liveData.count}
            liveRisk={liveData.risk}
          />
      </div>

      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* Left Column — Shelter Monitoring */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
          <h2 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Shelter Monitoring</h2>
          <OccupancyCard name="Shelter Alpha" count={liveData.count} capacity={100} risk={liveData.risk} />
          <ResourcePanel resources={liveData.resources} /> 
          <AlertFeed alerts={liveData.alerts} />
          <SituationReport report={liveData.report} ttf={liveData.ttf} />
        </div>

        {/* Right Column — Damage Assessment */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 border-l border-slate-800 pl-4">
          <h2 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Damage Assessment</h2>
          <DamageUpload onNewAssessment={handleNewAssessment} />
          <div className="flex gap-2 shrink-0">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map(f => (
              <button
                key={f}
                onClick={() => setSeverityFilter(f)}
                className={`text-[10px] font-extrabold px-3 py-1 rounded-full transition ${
                  severityFilter === f ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <DispatchList onDelete={handleDelete} deletedIds={deletedIds} severityFilter={severityFilter} />
        </div>
      </div>
    </div>
  );
}

export default App;