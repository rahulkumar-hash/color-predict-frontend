import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistoryTable({ history, limit = null }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const historyList = Array.isArray(history)
    ? history
    : Array.isArray(history?.history)
    ? history.history
    : [];

  const validHistory = historyList.filter(h => h.result);

  if (validHistory.length === 0) {
    return <div className="glass-card text-center text-xs text-slate-400 py-6">No game records found.</div>;
  }

  // If limit is specified (e.g. 10 on home page), display strictly latest `limit` records
  const isHomepageLimit = limit !== null && limit > 0;
  const displayRecords = isHomepageLimit ? validHistory.slice(0, limit) : validHistory;

  const totalPages = Math.ceil(displayRecords.length / pageSize) || 1;
  const currentPageClamped = Math.min(currentPage, totalPages);
  const paginatedItems = isHomepageLimit
    ? displayRecords
    : displayRecords.slice((currentPageClamped - 1) * pageSize, currentPageClamped * pageSize);

  const renderColorChips = (colors = []) => {
    return colors.map((col, idx) => {
      let bg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      if (col === 'Red') bg = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      if (col === 'Violet') bg = 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      return (
        <span key={idx} className={`mr-1 px-2 py-0.5 rounded text-[10px] font-black uppercase border ${bg}`}>
          {col}
        </span>
      );
    });
  };

  return (
    <div className="glass-card space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">GAME RECORD LOGS</h3>
        <span className="text-[10px] text-slate-400 font-mono font-bold">
          {isHomepageLimit ? `Latest ${limit} Records` : `Page ${currentPageClamped} of ${totalPages}`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <th className="py-2.5 px-3">Period</th>
              <th className="py-2.5 px-3">Number</th>
              <th className="py-2.5 px-3">Color Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {paginatedItems.map((item) => (
              <tr key={item.periodId} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2.5 px-3 font-mono text-white font-bold">{item.periodId}</td>
                <td className="py-2.5 px-3 font-mono font-black text-white text-sm">
                  {item.result?.number ?? '?'}
                </td>
                <td className="py-2.5 px-3 font-mono">
                  {renderColorChips(item.result?.colors || [])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isHomepageLimit && totalPages > 1 && (
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <button
            disabled={currentPageClamped === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <span className="text-[10px] text-slate-400 font-mono">
            {currentPageClamped} / {totalPages}
          </span>

          <button
            disabled={currentPageClamped === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
