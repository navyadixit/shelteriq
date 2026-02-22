function AlertFeed() {
  const alerts = [
    { time: "14:32", message: "Shelter Alpha crossed 80% capacity.", status: "HIGH" },
    { time: "14:15", message: "Volunteers below safe ratio at Shelter Alpha.", status: "MEDIUM" },
    { time: "13:58", message: "Shelter Gamma reached full capacity.", status: "HIGH" },
  ];

  const badgeColor = {
    LOW: "bg-green-500",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-red-500",
  };

  return (
    <div className="bg-[#1e293b] rounded-xl p-5 flex flex-col gap-3">
      <h3 className="font-semibold text-white">Alert Feed</h3>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-start gap-3 bg-slate-800 rounded-lg px-3 py-2">
            <span className="text-slate-500 text-xs mt-0.5 shrink-0">{alert.time}</span>
            <span className="text-slate-300 text-sm flex-1">{alert.message}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0 ${badgeColor[alert.status]}`}>
              {alert.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertFeed;