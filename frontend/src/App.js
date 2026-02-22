import { useState } from "react";
import OccupancyCard from './components/OccupancyCard';
import ResourcePanel from './components/ResourcePanel';
import DamageUpload from './components/DamageUpload';
import ShelterMap from './components/ShelterMap';
import AlertFeed from './components/AlertFeed';
import SituationReport from './components/SituationReport';
import DispatchList from './components/DispatchList';
import DamageMap from './components/DamageMap';

function App() {
  const [damageMarkers, setDamageMarkers] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const handleNewAssessment = (data) => {
    setDamageMarkers(prev => [...prev, data]);
  };

  const handleDelete = (id) => {
    setDeletedIds(prev => [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#1e293b] border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wide">ShelterIQ</h1>
        <span className="text-green-400 text-sm font-medium">● SYSTEM LIVE</span>
      </div>

      
      {/* Main content */}
      <div className="flex flex-1 gap-4 p-4">

        {/* Left half — Shelter Monitoring */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-slate-400 text-xs uppercase tracking-widest">Shelter Monitoring</h2>
          <OccupancyCard name="Shelter Alpha" count={87} capacity={100} risk="HIGH" />
          <ResourcePanel count={87} />
          <AlertFeed />
          <SituationReport />
          <ShelterMap />
        </div>

        {/* Right half — Damage Assessment */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-slate-400 text-xs uppercase tracking-widest">Damage Assessment</h2>
          <DamageUpload onNewAssessment={handleNewAssessment} />
          {/* Filter bar */}
        <div className="flex gap-2">
          {["ALL", "HIGH", "MEDIUM", "LOW"].map(f => (
            <button
              key={f}
              onClick={() => setSeverityFilter(f)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition ${
                severityFilter === f
                  ? f === "HIGH" ? "bg-red-500 text-white"
                  : f === "MEDIUM" ? "bg-yellow-500 text-white"
                  : f === "LOW" ? "bg-green-500 text-white"
                  : "bg-slate-500 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
          <DispatchList onDelete={handleDelete} deletedIds={deletedIds} severityFilter={severityFilter} />
          <DamageMap markers={damageMarkers.filter(m => !deletedIds.includes(m.id))} severityFilter={severityFilter} />
          
        </div>

      </div>
    </div>
  );
}

export default App;
