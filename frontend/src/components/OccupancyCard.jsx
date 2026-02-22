function OccupancyCard({ name, count, capacity, risk }) {
  const percent = Math.round((count / capacity) * 100);

  const badgeColor = {
    LOW: "bg-green-500",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-red-500",
  }[risk];

  const actionText = {
    LOW: "Shelter operating normally.",
    MEDIUM: "Monitor closely. Prepare overflow plan.",
    HIGH: "Redirect incoming evacuees immediately.",
  }[risk];

  return (
    <div className="bg-[#1e293b] rounded-xl p-5 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white text-lg">{name}</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${badgeColor}`}>
          {risk}
        </span>
      </div>

      <p className="text-slate-400 text-sm">{count} / {capacity} people</p>

      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${badgeColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-slate-400 text-xs italic">{actionText}</p>
    </div>
  );
}

export default OccupancyCard;