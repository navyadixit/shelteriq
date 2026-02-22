function ResourcePanel({ count }) {
  const resources = [
    { label: "Water", needed: count * 3, unit: "L", available: 500 },
    { label: "Meals", needed: count * 3, unit: "", available: 400 },
    { label: "Blankets", needed: count, unit: "", available: 60 },
    { label: "Medical Kits", needed: Math.floor(count / 10), unit: "", available: 12 },
    { label: "Volunteers", needed: Math.ceil(count / 15), unit: "", available: 3 },
  ];

  return (
    <div className="bg-[#1e293b] rounded-xl p-5">
      <h3 className="font-semibold text-white mb-3">Resource Status</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-xs uppercase">
            <th className="text-left pb-2">Resource</th>
            <th className="text-right pb-2">Needed</th>
            <th className="text-right pb-2">Available</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => {
            const deficit = r.available < r.needed;
            return (
              <tr key={r.label} className={deficit ? "text-red-400" : "text-slate-300"}>
                <td className="py-1">{r.label}</td>
                <td className="text-right">{r.needed}{r.unit}</td>
                <td className="text-right">{r.available}{r.unit}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ResourcePanel;