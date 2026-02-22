function SituationReport() {
  const report = `Shelter Alpha: 87/100, HIGH, needs 261L water. Volunteers critically low at 3 of 6 required.
Shelter Beta: 45/120, LOW, stable. Resources adequate.
Shelter Gamma: 110/110, CRITICAL, redirect all incoming evacuees immediately.`;

  return (
    <div className="bg-[#1e293b] rounded-xl p-5 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white">Situation Report</h3>
        <span className="text-slate-500 text-xs">Auto-updates every 60s</span>
      </div>
      <div className="bg-slate-900 rounded-lg p-4">
        <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap leading-relaxed">
          {report}
        </pre>
      </div>
    </div>
  );
}

export default SituationReport;