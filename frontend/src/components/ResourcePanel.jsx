function ResourcePanel({ resources }) { // Make sure 'resources' is inside these braces
  
  // This is why it says "Loading..." - we need to make sure 'resources' exists
  if (!resources || Object.keys(resources).length === 0) {
    return <div className="text-slate-400 p-5 italic">Connecting to Resource Data...</div>;
  }

  const resourceList = [
    { label: "Water", needed: resources.water, unit: "L", available: 500 },
    { label: "Meals", needed: resources.meals, unit: "", available: 400 },
    { label: "Blankets", needed: resources.blankets, unit: "", available: 60 },
    { label: "Medical Kits", needed: resources.medical, unit: "", available: 12 },
    { label: "Volunteers", needed: resources.volunteers, unit: "", available: 3 },
  ];
  
  // ... rest of her table code ...

  return (
    <div className="bg-[#1e293b] rounded-xl p-5">
      <h3 className="font-semibold text-white mb-3 text-xs uppercase tracking-widest text-slate-400">Resource Status</h3>
      <table className="w-full text-sm">
        {/* ... table header stays same ... */}
        <tbody>
          {resourceList.map((r) => {
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