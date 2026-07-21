import React, { useEffect, useState } from 'react';
import { HistoryItem, getHistory, removeHistory, clearHistory } from '../lib/history';
import { Trash2, Copy, Download, History as HistoryIcon, AlertCircle } from 'lucide-react';
import { AdSpace } from './AdSpace';

export function HistoryTools() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());

    const handleUpdate = () => {
      setHistory(getHistory());
    };

    window.addEventListener('history_updated', handleUpdate);
    return () => window.removeEventListener('history_updated', handleUpdate);
  }, []);

  const handleAction = async (item: HistoryItem) => {
    if (item.actionType === 'copy' && item.actionData) {
      navigator.clipboard.writeText(item.actionData);
      alert('Copied to clipboard!');
    } else if (item.actionType === 'download' && item.actionData) {
      const a = document.createElement('a');
      a.href = item.actionData;
      a.download = item.details.split(' (')[0] || 'download';
      a.click();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format(new Date(timestamp));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-400">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Activity History</h2>
              <p className="text-slate-400 text-sm">Review your recent tool usage and outputs.</p>
            </div>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={() => {
                if(window.confirm('Are you sure you want to clear all history?')) {
                  clearHistory();
                }
              }}
              className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 font-bold rounded-lg border border-rose-500/20 transition-all text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All History
            </button>
          )}
        </div>

        <div className="p-0 sm:p-6">
          {history.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-500 mb-4 border border-slate-700">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-2">No recent history found</h3>
              <p className="text-slate-500 text-sm">Your activities will automatically appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-800/40">
                  <tr>
                    <th scope="col" className="px-6 py-4 rounded-tl-lg">Date & Time</th>
                    <th scope="col" className="px-6 py-4">Tool Name</th>
                    <th scope="col" className="px-6 py-4">Details</th>
                    <th scope="col" className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                        {formatDate(item.timestamp)}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-300">
                        {item.toolName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="truncate block max-w-xs text-slate-400" title={item.details}>
                          {item.details}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                        {item.actionType !== 'none' && (
                          <button
                            onClick={() => handleAction(item)}
                            className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-colors inline-flex items-center gap-1 border border-indigo-500/20 text-xs font-bold"
                            title={item.actionType === 'copy' ? 'Copy Data' : 'Download Result'}
                          >
                            {item.actionType === 'copy' ? (
                              <><Copy className="w-3.5 h-3.5" /> Copy</>
                            ) : (
                              <><Download className="w-3.5 h-3.5" /> Download</>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => removeHistory(item.id)}
                          className="p-2 bg-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <AdSpace type="native" />
    </div>
  );
}
