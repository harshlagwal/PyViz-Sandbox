import React from 'react';
import { 
  X, FileText, Edit3, Eye, Terminal, 
  Save, Download, Undo2, Redo2, 
  Trash2, RotateCw, ChevronRight 
} from 'lucide-react';

const MobileSidebar = ({ 
  isOpen, 
  onClose,
  onSaveProject,
  onDownloadScript,
  onUndo,
  onRedo,
  onToggleTerminal,
  isTerminalOpen,
  onClearLogs,
  onRestartEngine,
  isInitializing
}) => {
  const menuSections = [
    {
      title: 'File',
      icon: FileText,
      items: [
        { label: 'Save Project', icon: Save, action: onSaveProject },
        { label: 'Download (.py)', icon: Download, action: onDownloadScript },
      ]
    },
    {
      title: 'Edit',
      icon: Edit3,
      items: [
        { label: 'Undo', icon: Undo2, action: onUndo },
        { label: 'Redo', icon: Redo2, action: onRedo },
      ]
    },
    {
      title: 'View',
      icon: Eye,
      items: [
        { 
          label: isTerminalOpen ? 'Hide Terminal' : 'Show Terminal', 
          icon: Terminal, 
          action: onToggleTerminal 
        },
      ]
    },
    {
      title: 'Terminal',
      icon: Terminal,
      items: [
        { label: 'Clear Logs', icon: Trash2, action: onClearLogs },
        { 
          label: 'Restart Engine', 
          icon: RotateCw, 
          action: onRestartEngine, 
          danger: true,
          disabled: isInitializing 
        },
      ]
    }
  ];

  const handleAction = (action) => {
    if (action) action();
    onClose(); // Auto-close logic
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-[#0b0f19e0] backdrop-blur-xl border-r border-white/10 z-[301] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <span className="text-sm font-black uppercase tracking-widest text-slate-400">Menu</span>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-500 active:text-white active:opacity-50 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuSections.map((section, sIdx) => (
            <div key={section.title} className="mb-6 px-4">
              <div className="flex items-center gap-3 px-2 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-neon-cyan/60">
                <section.icon size={12} className="text-neon-cyan" />
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item, iIdx) => (
                  <button
                    key={item.label}
                    onClick={() => handleAction(item.action)}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all active:scale-[0.98] active:opacity-50 group hover:bg-white/5 ${item.danger ? 'text-rose-400' : 'text-slate-300'} ${item.disabled ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <item.icon size={16} className={item.danger ? 'text-rose-500/50' : 'text-slate-500 group-active:text-neon-cyan'} />
                      {item.label}
                    </div>
                    <ChevronRight size={14} className="text-slate-700 group-active:text-neon-cyan" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center text-[10px] font-black italic">PZ</div>
             <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-white">PyViz Sandbox</div>
                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">v1.0.4 - Premium</div>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
