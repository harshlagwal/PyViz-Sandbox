import React from 'react';
import { Menu, Play, RefreshCw } from 'lucide-react';
import Logo from './Logo';

const MobileNavbar = ({ onRun, isRunning, isInitializing, onOpenMenu }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-midnight-blue/80 backdrop-blur-glass border-b border-white/5 z-[100] flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMenu}
          className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        <Logo height={16} />
      </div>

      <button
        onClick={onRun}
        disabled={isRunning || isInitializing}
        className="flex items-center gap-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 px-4 py-1.5 rounded-full transition-all group active:scale-95 disabled:opacity-50"
      >
        {isRunning ? (
          <RefreshCw size={14} className="text-neon-cyan animate-spin" />
        ) : (
          <Play size={14} fill="#00d1ff" className="text-neon-cyan" />
        )}
        <span className="text-[11px] font-black uppercase tracking-widest text-neon-cyan">
          {isRunning ? 'Busy' : 'Run'}
        </span>
      </button>
    </nav>
  );
};

export default MobileNavbar;
