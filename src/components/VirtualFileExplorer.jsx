import React from 'react';
import { FileText, Database, Trash2, HardDrive } from 'lucide-react';

const VirtualFileExplorer = ({ files, onRemove }) => {
  const getFileIcon = (filename) => {
    if (filename.endsWith('.csv')) return <Database size={16} className="text-[#4edea3]" />;
    return <FileText size={16} className="text-[#00d1ff]" />;
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="file-explorer-container">
      <div className="explorer-header">
        <HardDrive size={14} className="text-slate-500" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Virtual File System (MEMFS)</span>
      </div>
      
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4 px-8 text-center mt-20">
          <Database size={48} strokeWidth={1} />
          <p className="text-sm font-medium">No files uploaded to the virtual environment yet.</p>
        </div>
      ) : (
        <div className="file-list custom-scroll">
          {files.map((file, index) => (
            <div key={index} className="file-item group">
              <div className="flex items-center gap-4 flex-1">
                <div className="file-icon-wrapper">
                  {getFileIcon(file.name)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold truncate max-w-[180px] text-slate-300 group-hover:text-[#00d1ff] transition-colors">{file.name}</span>
                  <span className="text-[10px] text-slate-600 font-mono tracking-tight">{formatSize(file.size || 0)}</span>
                </div>
              </div>
              <button 
                onClick={() => onRemove(file.name)}
                className="p-2 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VirtualFileExplorer;
