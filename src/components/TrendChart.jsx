import React from 'react';

export default function TrendChart({ history, limit = null }) {
  const historyList = Array.isArray(history)
    ? history
    : Array.isArray(history?.history)
    ? history.history
    : [];

  const displayItems = limit ? historyList.slice(0, limit) : historyList;

  let greenCount = 0;
  let redCount = 0;
  let violetCount = 0;

  displayItems.forEach(round => {
    if (!round.result) return;
    const { colors = [] } = round.result;
    if (colors.includes('Green')) greenCount++;
    if (colors.includes('Red')) redCount++;
    if (colors.includes('Violet')) violetCount++;
  });

  const total = displayItems.length || 1;
  const greenPct = Math.round((greenCount / total) * 100);
  const redPct = Math.round((redCount / total) * 100);
  const violetPct = Math.round((violetCount / total) * 100);

  const getDotStyle = (colors = []) => {
    if (colors.includes('Red') && colors.includes('Violet')) return 'bg-gradient-to-br from-rose-500 to-purple-600';
    if (colors.includes('Green') && colors.includes('Violet')) return 'bg-gradient-to-br from-emerald-500 to-purple-600';
    if (colors.includes('Red')) return 'bg-rose-500';
    if (colors.includes('Green')) return 'bg-emerald-500';
    return 'bg-purple-600';
  };

  return (
    <div className="glass-card space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">TREND DISTRIBUTION</h3>
        <span className="text-[10px] text-slate-400 font-mono">
          {limit ? `Last ${limit} Rounds` : `All ${displayItems.length} Rounds`}
        </span>
      </div>

      {/* Distribution Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-slate-900 rounded-full flex overflow-hidden p-0.5 border border-slate-800">
          <div style={{ width: `${greenPct}%` }} className="bg-emerald-400 transition-all duration-500 rounded-l-full" />
          <div style={{ width: `${violetPct}%` }} className="bg-purple-500 transition-all duration-500" />
          <div style={{ width: `${redPct}%` }} className="bg-rose-500 transition-all duration-500 rounded-r-full" />
        </div>

        <div className="flex justify-between text-[10px] font-bold font-mono px-1">
          <span className="text-emerald-400">Green: {greenPct}%</span>
          <span className="text-purple-400">Violet: {violetPct}%</span>
          <span className="text-rose-400">Red: {redPct}%</span>
        </div>
      </div>

      {/* Grid Circle Pattern */}
      <div className="pt-2 border-t border-slate-800/80">
        {displayItems.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-4">No trend records available yet.</div>
        ) : (
          <div className="grid grid-cols-10 gap-2 justify-items-center">
            {displayItems.map((item, index) => {
              const colors = item.result?.colors || [];
              const num = item.result?.number ?? '?';
              return (
                <div
                  key={item.periodId || index}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white shadow-md border border-slate-800 ${getDotStyle(colors)}`}
                  title={`Period #${item.periodId}: Number ${num}`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
