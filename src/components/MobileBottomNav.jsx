import React from 'react';
import { Code2, Database, Search, Layout, Bug, Layers } from 'lucide-react';

const MobileBottomNav = ({ activeView, onViewChange }) => {
  const tabs = [
    { id: 'editor', icon: Code2, label: 'Editor' },
    { id: 'files', icon: Database, label: 'Files' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'templates', icon: Layout, label: 'Templates' },
    { id: 'history', icon: Bug, label: 'History' },
    { id: 'settings', icon: Layers, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-midnight-blue/90 backdrop-blur-glass border-t border-white/5 z-[200] flex items-center justify-around px-2 pb-safe select-none">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full active:opacity-50 transition-all cursor-pointer group"
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-neon-cyan/20 text-neon-cyan shadow-[0_0_15px_rgba(0,209,255,0.15)]' : 'text-slate-500 group-active:text-slate-300'}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,209,255,0.5)]' : ''} />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-neon-cyan' : 'text-slate-600'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
