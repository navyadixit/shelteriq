import React from 'react'; // No more useState or useEffect needed here!

// We pass { alerts } as a "prop" now
const AlertFeed = ({ alerts }) => {
  const badgeColor = {
    LOW: "bg-green-500",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-red-500",
  };

  return (
    <div className="bg-[#1e293b] rounded-xl p-5 flex flex-col gap-3">
      <h3 className="font-semibold text-white uppercase text-xs tracking-widest">Live Alert Feed</h3>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {/* If alerts haven't loaded yet */}
        {!alerts || alerts.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Waiting for detection data...</p>
        ) : (
          alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-800 rounded-lg px-3 py-2 border-l-4 border-slate-700">
              <span className="text-slate-500 text-xs mt-0.5 shrink-0">{alert.time}</span>
              <span className="text-slate-300 text-sm flex-1">{alert.message}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0 ${badgeColor[alert.status]}`}>
                {alert.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertFeed;