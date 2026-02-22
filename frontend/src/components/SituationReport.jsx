// SituationReport.jsx
function SituationReport({ report, ttf }) {
  return (
    <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-700 mt-auto">
      <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-2 font-semibold">Live Situation Report</h3>
      <p className="text-white text-sm leading-relaxed">
        {report ? report : "Analyzing system data..."}
      </p>
      <div className="mt-2 text-[10px] text-yellow-500 font-bold uppercase tracking-tighter">
        Estimated Time to Full: {ttf}
      </div>
    </div>
  );
}

export default SituationReport; // THIS LINE IS CRITICAL