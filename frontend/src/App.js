import { useState, useEffect } from "react";
import LandingPage from './components/LandingPage';
import OccupancyCard from './components/OccupancyCard';
import ResourcePanel from './components/ResourcePanel';
import DamageUpload from './components/DamageUpload';
import UnifiedNetworkMap from './components/UnifiedNetworkMap'; 
import AlertFeed from './components/AlertFeed';
import SituationReport from './components/SituationReport';
import DispatchList from './components/DispatchList';
import './App.css';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [viewMode, setViewMode] = useState("SHELTER");
  const [damageMarkers, setDamageMarkers] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [liveData, setLiveData] = useState({ count: 0, risk: "LOW", alerts: [], resources: {}, report: "", ttf: "" });
  const [latestMarker, setLatestMarker] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch(`http://10.7.16.234:8000/api/dashboard`)
        .then(res => res.json())
        .then(data => setLiveData(data))
        .catch(err => console.log("Backend connecting..."));
    };
    setInterval(fetchData, 1000);
  }, []);

  const handleNewAssessment = (data) => {
    setDamageMarkers(prev => [...prev, data]);
    setLatestMarker(data); // triggers DispatchList to add immediately
  };

  if (!showDashboard) return <LandingPage onEnter={() => setShowDashboard(true)} liveData={liveData} />;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col max-h-screen overflow-hidden font-sans">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between px-8 py-4 glass-panel border-b border-white/5 shrink-0">
        <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-500">SHELTERIQ // COMMAND</h1>
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-900 p-1 rounded-full border border-white/10">
            <button onClick={() => setViewMode("SHELTER")} className={`px-4 py-1 rounded-full text-[10px] font-bold transition ${viewMode === "SHELTER" ? "bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "text-slate-500"}`}>SHELTER</button>
            <button onClick={() => setViewMode("DISASTER")} className={`px-4 py-1 rounded-full text-[10px] font-bold transition ${viewMode === "DISASTER" ? "bg-pink-600 shadow-[0_0_15px_rgba(244,114,182,0.5)]" : "text-slate-500"}`}>DISASTER</button>
          </div>
          <span className="text-green-400 text-[10px] font-bold tracking-widest animate-pulse">● ENCRYPTED LINK LIVE</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Interactive Column */}
        <div className="w-[450px] flex flex-col gap-4 p-6 overflow-y-auto glass-panel border-r border-white/5">
          {viewMode === "SHELTER" ? (
            <>
              <h2 className="text-yellow-400 text-[10px] font-bold uppercase tracking-[0.3em]">Shelter Analytics</h2>
              <OccupancyCard name="Alpha Base" count={liveData.count} capacity={100} risk={liveData.risk} />
              <ResourcePanel resources={liveData.resources} /> 
              <AlertFeed alerts={liveData.alerts} />
              <SituationReport report={liveData.report} ttf={liveData.ttf} />
            </>
          ) : (
            <>
              <h2 className="text-pink-400 text-[10px] font-bold uppercase tracking-[0.3em]">Damage Vector Analysis</h2>
              <DamageUpload onNewAssessment={handleNewAssessment} />
              <DispatchList
                onDelete={(id) => setDeletedIds([...deletedIds, id])}
                deletedIds={deletedIds}
                severityFilter={severityFilter}
                newMarker={latestMarker}
              />
            </>
          )}
        </div>

        {/* Right Tactical Map Column */}
        <div className="flex-1 relative p-4 bg-[#020617]">
          <div className="absolute top-8 right-8 z-[1000] flex flex-col gap-2">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map(f => (
              <button key={f} onClick={() => setSeverityFilter(f)} className={`text-[10px] font-bold w-12 h-12 rounded-full border transition ${severityFilter === f ? "bg-white text-black border-white" : "bg-black/50 text-white border-white/20 backdrop-blur-md"}`}>{f}</button>
            ))}
          </div>
          <UnifiedNetworkMap 
            damageMarkers={damageMarkers.filter(m => !deletedIds.includes(m.id))}
            severityFilter={severityFilter}
            liveCount={liveData.count}
            liveRisk={liveData.risk}
          />
        </div>
      </div>
    </div>
  );
}

export default App;