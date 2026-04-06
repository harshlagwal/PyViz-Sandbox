import React from 'react';
import { Database, Search, LayoutGrid, Bug, Puzzle } from 'lucide-react';

const MobileBottomNav = ({ activeView, onViewChange }) => {
  const tabs = [
    { id: 'files', icon: Database, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'structure', icon: LayoutGrid, label: 'Structure' },
    { id: 'debug', icon: Bug, label: 'Debug' },
    { id: 'plugins', icon: Puzzle, label: 'Plugins' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-midnight-blue/90 backdrop-blur-glass border-t border-white/5 z-[100] flex items-center justify-around px-2 pb-safe">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className="flex flex-col items-center gap-1 min-w-[64px]"
          >
            <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-slate-500'}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-tight transition-colors ${isActive ? 'text-neon-cyan' : 'text-slate-600'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
