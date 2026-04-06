import React, { useMemo } from 'react';
import { Database, Download, Table as TableIcon } from 'lucide-react';

const DataPreview = ({ file, insights }) => {
  const data = useMemo(() => {
    if (!file || !file.content) return null;
    
    try {
      const rows = file.content.split('\n').filter(row => row.trim() !== '');
      if (rows.length === 0) return null;
      
      const headers = rows[0].split(',').map(h => h.trim());
      const body = rows.slice(1, 51).map(row => {
        const values = row.split(',');
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i]?.trim();
        });
        return obj;
      });
      
      return { headers, body, totalRows: rows.length - 1 };
    } catch (e) {
      console.error('Failed to parse CSV', e);
      return null;
    }
  }, [file]);

  const statsTable = useMemo(() => {
    if (!insights || Object.keys(insights).length === 0) return null;
    
    // Insights is an object { count: {col: val}, mean: {col: val}, ... }
    const metrics = Object.keys(insights).filter(m => m !== 'undefined');
    if (metrics.length === 0) return null;
    
    const columns = Object.keys(insights[metrics[0]] || {});
    if (columns.length === 0) return null;
    
    return { metrics, columns };
  }, [insights]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-20 gap-6 mt-32">
        <Database size={64} strokeWidth={1} />
        <p className="text-sm font-bold tracking-widest uppercase">No CSV Data Loaded</p>
      </div>
    );
  }

  return (
    <div className="data-preview-container custom-scroll">
      <div className="data-preview-header">
        <div className="flex items-center gap-3">
          <TableIcon size={14} className="text-[#4edea3]" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4edea3]">Dataframe Viewer (Sample)</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          Source: {file.name} | Total Rows: {data.totalRows}
        </div>
      </div>

      {insights && statsTable && (
        <div className="insights-section mb-12">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.6)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Automated Smart Insights</span>
           </div>
           
           <div className="table-wrapper custom-scroll overflow-auto max-h-[400px] rounded-xl border border-white/5">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Stat</th>
                    {statsTable.columns.map((col, i) => (
                        <th key={i}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statsTable.metrics.map((metric, i) => (
                    <tr key={i}>
                      <td className="font-bold text-slate-300 capitalize">{metric}</td>
                      {statsTable.columns.map((col, j) => (
                        <td key={j} className="text-slate-400 font-mono">
                          {typeof insights[metric][col] === 'number' 
                              ? insights[metric][col].toFixed(2) 
                              : insights[metric][col] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-6 mt-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d1ff] shadow-[0_0_8px_rgba(0,209,255,0.6)]" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-300">Raw Data Frame <span className="text-slate-500 font-medium">(First 50 Rows)</span></span>
      </div>

      <div className="table-wrapper custom-scroll border border-white/5 rounded-xl shadow-2xl overflow-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="row-number">#</th>
              {data.headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.body.map((row, i) => (
              <tr key={i}>
                <td className="row-number">{i + 1}</td>
                {data.headers.map((header, j) => (
                  <td key={j}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataPreview;
