import React from 'react';
import { Settings, Cpu, Type, Terminal } from 'lucide-react';

const SettingsView = ({ fontSize, setFontSize, hwAccel, setHwAccel }) => {
  return (
    <div className="side-panel settings-panel">
      <div className="panel-header">
        <Settings size={18} className="text-cyan" />
        <h2>IDE Settings</h2>
      </div>

      <div className="settings-section">
        <div className="section-label">
           <Type size={14} />
           <span>Editor Font Size</span>
        </div>
        <div className="segmented-control">
          {[12, 14, 16].map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={fontSize === size ? 'active' : ''}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section border-top">
        <div className="section-info">
           <div className="section-label">
              <Cpu size={14} />
              <span>Hardware Acceleration</span>
           </div>
           <p className="section-desc">Enables WASM SIMD & TurboFan for 40% faster plots Rendering</p>
        </div>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={hwAccel}
            onChange={(e) => setHwAccel(e.target.checked)}
          />
          <span className="slider" />
        </label>
      </div>

      <div className="settings-section border-top opacity-50">
         <div className="section-label gray">
            <Terminal size={14} />
            <span>Interactive REPL Mode</span>
            <span className="badge">PRO ONLY</span>
         </div>
      </div>

      <div className="build-info-card">
         <div className="flex-column">
           <span className="badge-teal">WASM ENGINE</span>
           <span className="build-ver">Release: v0.28.1 SP1</span>
         </div>
         <div className="status-dot-pulse" title="Engine Status: STABLE" />
      </div>
    </div>
  );
};

export default SettingsView;
