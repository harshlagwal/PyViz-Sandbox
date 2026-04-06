import React from 'react';
import { Menu, Play, RefreshCw, Search } from 'lucide-react';
import Logo from './Logo';

const MobileNavbar = ({ onRun, isRunning, isInitializing, onOpenMenu }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-midnight-blue/80 backdrop-blur-glass border-b border-white/5 z-[200] flex items-center justify-between px-4 select-none">
      <div className="flex items-center gap-1">
        <button 
          onClick={onOpenMenu}
          className="p-2 -ml-2 text-slate-400 hover:text-white active:opacity-50 transition-all cursor-pointer"
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <Logo height={16} />
      </div>

      <button
        onClick={onRun}
        disabled={isRunning || isInitializing}
        className="flex items-center gap-2 bg-neon-cyan/10 active:bg-neon-cyan/30 border border-neon-cyan/30 px-4 py-1.5 rounded-full transition-all group active:scale-95 active:opacity-50 disabled:opacity-50 cursor-pointer"
      >
        {isRunning ? (
          <RefreshCw size={14} className="text-neon-cyan animate-spin" />
        ) : (
          <Play size={14} fill="#00d1ff" className="text-neon-cyan" />
        )}
        <span className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">
          {isRunning ? 'Busy' : 'Run'}
        </span>
      </button>
    </nav>
  );
};

export default MobileNavbar;
