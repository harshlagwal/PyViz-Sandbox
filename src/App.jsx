import React, { useState, useCallback, useEffect, useRef } from 'react';
import { usePyodide } from './hooks/usePyodide';
import Editor from './components/Editor';
import MenuBar from './components/MenuBar';
import { 
  Play, 
  Download, 
  Database, 
  FileCode, 
  Terminal as TerminalIcon, 
  BarChart3, 
  Upload,
  Cpu,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Layout,
  Settings,
  Search,
  History,
  HardDrive,
  Share2,
  LayoutGrid,
  Maximize2,
  Folder,
  Save,
  Menu
} from 'lucide-react';
import Logo from './components/Logo';
import VirtualFileExplorer from './components/VirtualFileExplorer';
import WorkspaceView from './components/WorkspaceView';
import DataPreview from './components/DataPreview';
import TemplatesGallery from './components/TemplatesGallery';
import Toast from './components/Toast';
import SearchView from './components/SearchView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import MobileNavbar from './components/MobileNavbar';
import MobileBottomNav from './components/MobileBottomNav';
import MobileSidebar from './components/MobileSidebar';

import LandingPage from './components/LandingPage';
import { saveProject } from './utils/storage';

function App() {
  const {
    isInitializing, isRunning, output, plots, dataInsights,
    status, engineStats, runCode, getInsights, clearOutput, restartWorker
  } = usePyodide();
  const [view, setView] = useState('landing'); // Simple router state: landing | app
  const [activeTab, setActiveTab] = useState('script.py');
  const [code, setCode] = useState('');
  const [editorKey, setEditorKey] = useState('default'); // Force re-mount on hydration
  const [workspaceRefreshKey, setWorkspaceRefreshKey] = useState(0);

  // 1. LIFECYCLE: LOAD PERSISTED OR SHARED CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('code');
    
    if (sharedCode || params.get('csv')) {
        try {
            // 1. Handle Code Injection (Strict URL-Safety Wrap)
            if (sharedCode) {
                const decodedCode = decodeURIComponent(escape(atob(decodeURIComponent(sharedCode))));
                setCode(decodedCode);
                setEditorKey(`shared-${Date.now()}`); // Force editor re-mount with new content
            }

            // 2. Handle CSV Data Injection (Strict URL-Safety Wrap)
            const sharedCsv = params.get('csv');
            const sharedCsvName = params.get('csvName') || 'shared_data.csv';
            
            if (sharedCsv) {
                const decodedCsv = decodeURIComponent(escape(atob(decodeURIComponent(sharedCsv))));
                const newFile = {
                    name: sharedCsvName,
                    content: decodedCsv,
                    size: decodedCsv.length
                };
                setFiles([newFile]);
                // Trigger auto-preview and insights
                setActiveTab('data_preview.csv');
                getInsights(sharedCsvName, decodedCsv);
                triggerToast("Shared script and dataset loaded!");
            } else {
                triggerToast("Shared script loaded successfully!");
            }

            setView('app'); // Instant jump to IDE
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        } catch (e) {
            console.error("Failed to hydrate shared state", e);
            triggerToast("Shared link invalid or malformed.");
        }
    }

    const savedCode = localStorage.getItem('pyviz_persistent_code');
    if (savedCode) {
        setCode(savedCode);
    } else {
        // DEFAULT STRIKING VISUAL (Interactive Plotly)
        setCode(`import plotly.graph_objects as go
import numpy as np

# 1. Generate Data
t = np.linspace(0, 10, 200)
y = np.cos(t) * np.exp(-t/5)

# 2. Build Interactive Plotly Figure
fig = go.Figure()
fig.add_trace(go.Scatter(
    x=t, y=y,
    mode='lines+markers',
    line=dict(color='#00d1ff', width=4),
    marker=dict(size=8, color='#ffffff', line=dict(color='#00d1ff', width=2)),
    name='Signal Alpha'
))

# 3. Apply Kinetic Shadow Theme
fig.update_layout(
    title='Interactive Signal Analysis: WASM Optimized',
    template='plotly_dark',
    paper_bgcolor='#0E1117',
    plot_bgcolor='#0E1117',
    font=dict(family="Inter", size=12),
    margin=dict(l=20, r=20, t=60, b=20),
    xaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)'),
    yaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)')
)

# 4. EXPORT TO CANVAS (Auto-renders via fig.show() patch)
fig.show()

print(">>> PyViz WASM Engine: INTERACTIVE_MODE_ACTIVE")
print(">>> Plotly Renderer enabled via <iframe> Matting.")`);
    }
  }, []);
  
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({ mem: '0MB', cpu: '0 Threads' });
  const [activeSidebarView, setActiveSidebarView] = useState('editor');
  const [toast, setToast] = useState(null);
  const [expandedPlot, setExpandedPlot] = useState(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(220);
  
  // Settings State
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('pyviz_font_size')) || 14;
  });
  const [hwAccel, setHwAccel] = useState(() => {
    return localStorage.getItem('pyviz_hw_accel') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('pyviz_font_size', fontSize);
    localStorage.setItem('pyviz_hw_accel', hwAccel);
  }, [fontSize, hwAccel]);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sideWidth, setSideWidth] = useState(() => {
    return parseFloat(localStorage.getItem('pyviz_side_pct')) || 50; 
  });
  const iframeRefs = useRef({}); // Track iframes for resize dispatching
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const terminalRef = useRef(null);
  const editorRef = useRef(null); // Exposes undo/redo/focus from CodeMirror

  // 2. KEYBOARD SHORTCUTS (IDE PARITY)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + Enter: Run Code
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      // Ctrl + S: Download Script
      if (e.ctrlKey && !e.shiftKey && e.key === 's') {
        e.preventDefault();
        handleDownloadScript();
      }
      // Ctrl + Shift + S: Save Project
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveProject();
      }
      // Ctrl + `: Toggle Terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, files, isInitializing, isRunning]); // Dependencies for handlers

  useEffect(() => {
    // Basic hardware stats fetch for CPU (OS level)
    const threads = navigator.hardwareConcurrency || 4;
    setStats(prev => ({ ...prev, cpu: `${threads} Local` }));
  }, []);

  // Update memory from real Engine Stats
  useEffect(() => {
    if (engineStats && engineStats.mem) {
        setStats(prev => ({ ...prev, mem: engineStats.mem }));
    }
  }, [engineStats]);

  // Terminal resizing logic (Delta-based)
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleVerticalMouseDown = (e) => {
    e.preventDefault();
    setIsResizingVertical(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Horizontal Terminal Resize
      if (isResizing) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 100 && newHeight <= window.innerHeight * 0.8) {
          setTerminalHeight(newHeight);
        }
      }
      // Vertical Panel Resize (Percentage-based)
      if (isResizingVertical) {
        const activityBarWidth = 60;
        const availableWidth = window.innerWidth - activityBarWidth;
        const mouseX = e.clientX - activityBarWidth;
        
        let newPct = (mouseX / availableWidth) * 100;
        
        // Logical Constraints: middle min 250px, visuals min 350px
        const minMiddlePct = (250 / availableWidth) * 100;
        const minVisualsPct = (350 / availableWidth) * 100;
        const maxMiddlePct = 100 - minVisualsPct;

        if (newPct < minMiddlePct) newPct = minMiddlePct;
        if (newPct > maxMiddlePct) newPct = maxMiddlePct;
        
        setSideWidth(newPct);
        localStorage.setItem('pyviz_side_pct', newPct);

        // TRIGGER PLOTLY REFLOW: Dispatch resize to host and all active iframes
        window.dispatchEvent(new Event('resize'));
        Object.values(iframeRefs.current).forEach(iframe => {
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.dispatchEvent(new Event('resize'));
            }
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsResizingVertical(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing || isResizingVertical) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizing ? 'ns-resize' : 'col-resize';
      document.body.style.userSelect = 'none'; 
      // Add a class to body to handle iframe focus stealing globally via CSS
      document.body.classList.add('is-resizing-active');
    } else {
      document.body.classList.remove('is-resizing-active');
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isResizingVertical]);

  const triggerToast = (msg) => {
    setToast({ message: msg });
  };

  // 2. PERSISTENCE: AUTO-SAVE TO LOCALSTORAGE
  useEffect(() => {
    if (code) {
        localStorage.setItem('pyviz_persistent_code', code);
    }
  }, [code]);

  const handleShare = () => {
    try {
        const codeEncoded = encodeURIComponent(btoa(unescape(encodeURIComponent(code))));
        let url = `${window.location.origin}${window.location.pathname}?code=${codeEncoded}`;
        
        // Find first CSV to include in share
        const csvFile = files.find(f => f.name.endsWith('.csv'));
        if (csvFile && typeof csvFile.content === 'string') {
            const csvEncoded = encodeURIComponent(btoa(unescape(encodeURIComponent(csvFile.content))));
            url += `&csv=${csvEncoded}&csvName=${encodeURIComponent(csvFile.name)}`;
        }

        if (url.length > 2000) {
            triggerToast("State too large for URL sharing. Try shorter code/data.");
            return;
        }

        navigator.clipboard.writeText(url);
        triggerToast("Full State link (Code + Data) copied!");
    } catch (e) {
        triggerToast("Encoding failed. Check for binary files.");
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleRun = () => {
    setActiveTab('script.py');
    setIsTerminalOpen(true);
    
    // Save to History
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const historyItem = { time: timestamp, code };
    const savedHistory = JSON.parse(localStorage.getItem('pyviz_run_history') || '[]');
    const updatedHistory = [historyItem, ...savedHistory.slice(0, 19)]; // Keep last 20 entries
    localStorage.setItem('pyviz_run_history', JSON.stringify(updatedHistory));

    runCode(code, files);
  };

  // ── MENU: Edit → Undo / Redo
  const handleUndo = () => editorRef.current?.undo();
  const handleRedo = () => editorRef.current?.redo();

  // ── MENU: Terminal → Restart Engine
  const handleRestartEngine = () => {
    restartWorker();
    setIsTerminalOpen(true);
    triggerToast('Pyodide Engine restarting...');
  };

  // ── MENU: File → Download Script
  const handleDownloadScript = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.py';
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('script.py downloaded!');
  };

  const handleSaveProject = () => {
    const filename = window.prompt("Enter a name for this project:", "My Awesome Script");
    if (filename) {
        saveProject(filename, code);
        setWorkspaceRefreshKey(prev => prev + 1);
        triggerToast(`Project "${filename}" saved successfully!`);
        setActiveSidebarView('workspace');
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    uploadedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles(prev => [...prev.filter(f => f.name !== file.name), {
          name: file.name,
          content: event.target.result,
          size: file.size
        }]);
        // Auto-switch to data preview if CSV
        if (file.name.endsWith('.csv')) {
            setActiveTab('data_preview.csv');
            setActiveSidebarView('editor');
            getInsights(file.name, event.target.result);
        }
      };
      if (file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const removeFile = (filename) => {
      setFiles(prev => prev.filter(f => f.name !== filename));
  };


  const downloadPlot = (plot, index) => {
    const link = document.createElement('a');
    if (plot.type === 'html') {
      const blob = new Blob([plot.data], { type: 'text/html' });
      link.href = URL.createObjectURL(blob);
      link.download = `pyviz_interactive_${index + 1}.html`;
    } else {
      link.href = `data:image/png;base64,${plot.data}`;
      link.download = `pyviz_plot_${index + 1}.png`;
    }
    link.click();
  };

  // ── RENDERER ──
  if (view === 'landing') {
    return <LandingPage onLaunch={() => setView('app')} />;
  }

  return (
    <div className="main-app-viewport font-body overflow-hidden h-screen flex flex-col bg-[#0b0f19]">
      {/* 💻 DESKTOP LAYOUT (>=768px) */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        {renderHeader()}
        <main className="ide-layout">
          {renderSidebar()}
          {renderMiddleColumn()}
          {renderVisualsColumn()}
        </main>
      </div>

      {/* 📱 MOBILE LAYOUT (<768px) */}
      <div className="flex md:hidden flex-col flex-1 overflow-x-hidden overflow-y-auto">
        <MobileNavbar 
          onRun={handleRun} 
          isRunning={isRunning} 
          isInitializing={isInitializing} 
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        <MobileSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSaveProject={handleSaveProject}
          onDownloadScript={handleDownloadScript}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          isTerminalOpen={isTerminalOpen}
          onClearLogs={clearOutput}
          onRestartEngine={handleRestartEngine}
          isInitializing={isInitializing}
        />
        
        <div className="flex-1 pt-14 pb-16 px-4 flex flex-col gap-6">
          {activeSidebarView === 'editor' ? (
            <>
              {/* 1. EDITOR: script.py */}
              <div className="bg-[#101319c0] border border-white/5 rounded-2xl overflow-hidden glass-morphism shadow-2xl">
                <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode size={14} className="text-neon-cyan" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">script.py</span>
                  </div>
                </div>
                <div className="h-[300px]">
                  <Editor key={editorKey} value={code} onChange={setCode} ref={editorRef} fontSize={fontSize} />
                </div>
              </div>

              {/* 2. DROPZONE: CSV Widget */}
              <div className="bg-[#101319c0] border border-white/5 rounded-2xl p-6 glass-morphism shadow-2xl">
                 <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8 hover:border-neon-cyan/20 transition-all cursor-pointer" htmlFor="mobile-upload">
                    <Upload size={24} className="text-neon-cyan mb-3 opacity-50" />
                    <span className="text-xs font-bold text-slate-300 text-center">Drop <strong className="text-white">.CSV</strong> here or <strong className="text-neon-cyan">Browse Files</strong></span>
                    <input 
                      id="mobile-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload} 
                      multiple 
                      onClick={(e) => { e.target.value = null; }}
                    />
                 </label>
                 {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                       {files.map(f => (
                         <div key={f.name} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">{f.name}</span>
                            <XCircle size={14} className="text-slate-600 cursor-pointer" onClick={() => removeFile(f.name)} />
                         </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* 3. VISUAL CANVAS: Results */}
              <div className="bg-[#101319c0] border border-white/5 rounded-2xl overflow-hidden glass-morphism shadow-2xl min-h-[400px]">
                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-[#a8e1ff]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#a8e1ff]">Visual Canvas</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded bg-white/5 text-slate-400" onClick={() => setExpandedPlot(plots[0])}>
                       <Maximize2 size={12} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col gap-8 flex-1 overflow-hidden">
                   {plots.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center py-12 opacity-30">
                        <Layout className="mb-4 text-slate-500" size={32} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Awaiting Analysis...</span>
                     </div>
                   ) : (
                     plots.map((plot, i) => (
                       <div key={i} className="flex flex-col gap-2">
                          <div className="bg-[#0b0f19] rounded-xl overflow-hidden border border-white/5 shadow-inner">
                            {plot.type === 'html' ? (
                               <iframe 
                                 srcDoc={plot.data}
                                 className="w-full h-[300px] border-none plotly-view-only"
                                 title={`plot-${i}`}
                               />
                            ) : (
                               <img src={`data:image/png;base64,${plot.data}`} className="w-full h-auto" alt="plot" />
                            )}
                          </div>
                          <button onClick={() => downloadPlot(plot, i)} className="text-[10px] font-bold text-neon-cyan uppercase self-end flex items-center gap-1 mt-1">
                             <Download size={10} /> Save Image
                          </button>
                       </div>
                     ))
                   )}
                </div>
              </div>

              {/* 4. TERMINAL: Logs */}
              <div className="bg-[#0b0c10] border border-white/5 rounded-2xl overflow-hidden mb-8 shadow-2xl">
                 <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-2">
                    <TerminalIcon size={12} className="text-slate-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">WASM Execution Log</span>
                 </div>
                 <div className="p-4 max-h-[200px] overflow-y-auto custom-scroll font-mono text-[11px]">
                    {output.map((line, i) => (
                      <div key={i} className="mb-1 leading-relaxed" style={{ color: line.type === 'stderr' ? '#ffb4ab' : '#b5c0c5' }}>
                        <span className="opacity-30 mr-2">[{i+1}]</span>{line.text}
                      </div>
                    ))}
                    {output.length === 0 && <div className="text-slate-700 italic">Engine Idle...</div>}
                    <div ref={terminalRef} />
                 </div>
              </div>
            </>
          ) : (
            <div className="flex-1 bg-[#101319c0] border border-white/5 rounded-2xl p-4 glass-morphism overflow-y-auto min-h-[500px]">
               {activeSidebarView === 'workspace' ? (
                  <WorkspaceView onLoadProject={(pCode) => { setCode(pCode); setActiveSidebarView('editor'); triggerToast('Project loaded!'); }} triggerRefresh={workspaceRefreshKey} />
              ) : activeSidebarView === 'files' ? (
                  <VirtualFileExplorer files={files} onRemove={removeFile} />
              ) : activeSidebarView === 'templates' ? (
                  <TemplatesGallery onSelect={(templateCode) => { if (window.confirm("Replace current code?")) { setCode(templateCode); setActiveSidebarView('editor'); } }} />
              ) : activeSidebarView === 'search' ? (
                  <SearchView code={code} onSelectResult={() => setActiveSidebarView('editor')} />
              ) : activeSidebarView === 'history' ? (
                  <HistoryView onSelectCode={(hCode) => { setCode(hCode); setActiveSidebarView('editor'); }} />
              ) : activeSidebarView === 'settings' ? (
                  <SettingsView fontSize={fontSize} setFontSize={setFontSize} hwAccel={hwAccel} setHwAccel={setHwAccel} />
              ) : null}
            </div>
          )}
        </div>

        <MobileBottomNav activeView={activeSidebarView} onViewChange={setActiveSidebarView} />
      </div>


      {toast && <Toast message={toast.message} onDismiss={() => setToast(null)} />}
      
      {/* ── SHARED MODALS ── */}
      {expandedPlot && (
        <div className="fixed inset-0 bg-[#0b0f19] z-[1000] flex flex-col" onClick={() => setExpandedPlot(null)}>
           <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-midnight-blue/40 backdrop-blur-md">
              <span className="text-[11px] font-black uppercase tracking-widest text-neon-cyan">Fullscreen View</span>
              <button onClick={() => setExpandedPlot(null)} className="p-2 text-slate-400 hover:text-white transition-colors">
                <XCircle size={22} />
              </button>
           </div>
           <div className="flex-1 overflow-hidden p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {expandedPlot.type === 'html' ? (
                  <iframe srcDoc={expandedPlot.data} className="w-full h-full border-none bg-[#0b0f19] plotly-view-only" />
              ) : (
                  <img src={`data:image/png;base64,${expandedPlot.data}`} className="max-w-full max-h-full object-contain" alt="Expanded Plot" />
              )}
           </div>
        </div>
      )}
    </div>
  );

  // ── SUB-RENDERERS (DESKTOP) ──
  function renderHeader() {
    return (
      <header className="header font-display">
        <div className="logo-block">
          <Menu size={18} className="mobile-menu-icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <Logo height={18} />
        </div>
        <MenuBar 
          className="hidden-mobile"
          onSaveProject={handleSaveProject} onDownloadScript={handleDownloadScript}
          onUndo={handleUndo} onRedo={handleRedo}
          onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          isTerminalOpen={isTerminalOpen} onClearLogs={clearOutput}
          onRestartEngine={handleRestartEngine} isInitializing={isInitializing}
        />
        <div className="header-center hidden-mobile items-center flex">
          <label className="dropzone-pill flex items-center" htmlFor="header-upload">
            <Upload size={14} className="text-[#00d1ff] mr-2" />
            <span className="text-[#c8d4d8]">Drop <strong className="text-[#ffffff]">.CSV</strong> or&nbsp;<strong className="text-[#00d1ff]">Browse</strong></span>
            <input id="header-upload" type="file" className="hidden" onChange={handleFileUpload} multiple onClick={(e) => { e.target.value = null; }} />
          </label>
        </div>
        <div className="header-actions">
           <button className="btn-secondary-pill mr-2 desktop-only" onClick={handleSaveProject} title="Save Workspace Project"><Save size={16} /><span>Save</span></button>
           <button className="btn-cyan-pill app-run-btn" onClick={handleRun} disabled={isInitializing || isRunning}>
            {isRunning ? <RefreshCw size={17} className="animate-spin" /> : <Play size={17} fill="#003543" />}
            <span className="desktop-only">{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </header>
    );
  }

  function renderSidebar() {
    return (
      <aside className="sidebar-icons">
          <div className="icon-group">
            <div data-tooltip="Code Editor" onClick={() => setActiveSidebarView('editor')}>
              <FileCode className={`sidebar-icon ${activeSidebarView === 'editor' ? 'active' : ''}`} />
            </div>
            <div data-tooltip="My Workspace" onClick={() => setActiveSidebarView('workspace')}>
              <Folder className={`sidebar-icon ${activeSidebarView === 'workspace' ? 'active' : ''}`} />
            </div>
            <div data-tooltip="Search Engine" onClick={() => setActiveSidebarView('search')}>
              <Search className={`sidebar-icon ${activeSidebarView === 'search' ? 'active' : ''}`} />
            </div>
            <div data-tooltip="Run History" onClick={() => setActiveSidebarView('history')}>
              <History className={`sidebar-icon ${activeSidebarView === 'history' ? 'active' : ''}`} />
            </div>
            <div data-tooltip="Terminal Toggle" onClick={() => setIsTerminalOpen(!isTerminalOpen)}>
              <TerminalIcon className={`sidebar-icon ${isTerminalOpen ? 'active' : ''}`} />
            </div>
            <div data-tooltip="File Explorer" onClick={() => setActiveSidebarView('files')}>
              <Database className={`sidebar-icon ${activeSidebarView === 'files' ? 'active' : ''}`} />
            </div>
            <div data-tooltip="PyViz Templates" onClick={() => setActiveSidebarView('templates')}>
              <LayoutGrid className={`sidebar-icon ${activeSidebarView === 'templates' ? 'active' : ''}`} />
            </div>
          </div>
          <div className="mt-auto mb-6 flex flex-col gap-6">
            <div data-tooltip="IDE Settings" onClick={() => setActiveSidebarView('settings')}>
              <Settings className={`sidebar-icon ${activeSidebarView === 'settings' ? 'active' : ''}`} />
            </div>
          </div>
      </aside>
    );
  }

  function renderMiddleColumn() {
    return (
      <section className="middle-column" style={{ flex: isCollapsed ? '0 0 0px' : `0 0 ${sideWidth}%`, display: isCollapsed ? 'none' : 'flex' }}>
        {activeSidebarView === 'workspace' ? (
            <WorkspaceView onLoadProject={(pCode) => { setCode(pCode); setActiveSidebarView('editor'); triggerToast('Project loaded!'); }} triggerRefresh={workspaceRefreshKey} />
        ) : activeSidebarView === 'files' ? (
            <VirtualFileExplorer files={files} onRemove={removeFile} />
        ) : activeSidebarView === 'templates' ? (
            <TemplatesGallery onSelect={(templateCode) => { if (window.confirm("Replace current code?")) { setCode(templateCode); setActiveSidebarView('editor'); } }} />
        ) : activeSidebarView === 'search' ? (
            <SearchView code={code} onSelectResult={() => setActiveSidebarView('editor')} />
        ) : activeSidebarView === 'history' ? (
            <HistoryView onSelectCode={(hCode) => { setCode(hCode); setActiveSidebarView('editor'); }} />
        ) : activeSidebarView === 'settings' ? (
            <SettingsView fontSize={fontSize} setFontSize={setFontSize} hwAccel={hwAccel} setHwAccel={setHwAccel} />
        ) : (
          <div className="editor-stage">
            <div className="editor-tabs">
              <div className={`tab ${activeTab === 'script.py' ? 'active' : ''}`} onClick={() => setActiveTab('script.py')}>
                <FileCode size={14} className={activeTab === 'script.py' ? 'text-[#00d1ff]' : ''} />
                <span>script.py</span>
              </div>
              <div className={`tab ${activeTab === 'data_preview.csv' ? 'active' : ''}`} onClick={() => setActiveTab('data_preview.csv')}>
                <Database size={14} className={activeTab === 'data_preview.csv' ? 'text-[#4edea3]' : ''} />
                <span>data_preview.csv</span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
                {activeTab === 'script.py' ? (
                    <Editor key={editorKey} value={code} onChange={setCode} ref={editorRef} fontSize={fontSize} />
                ) : (
                    <DataPreview file={files.find(f => f.name.endsWith('.csv'))} insights={dataInsights} />
                )}
            </div>
          </div>
        )}
        <div className={`bottom-dock ${isTerminalOpen ? 'open' : 'closed'} ${isResizing ? 'no-transition' : ''}`} style={{ height: isTerminalOpen ? `${terminalHeight}px` : '0px', flex: 'none' }}>
          <div className="terminal-resizer" onMouseDown={handleMouseDown} />
          <div className="terminal-header" onClick={() => setIsTerminalOpen(!isTerminalOpen)}>
            <div className="flex items-center"><TerminalIcon size={12} className="mr-3 text-[#4e6570]" /><span>VIRTUAL CONSOLE</span></div>
            <button className="text-[10px] text-[#4e6570] font-bold" onClick={() => setIsTerminalOpen(false)}>Hide</button>
          </div>
          <div className="terminal-scroll custom-scroll" ref={terminalRef}>
              <div className="mb-2 text-[10px] uppercase text-[#3d5260] font-bold">{status ? `System: ${status}` : 'Initializing Pyodide...'}</div>
              {output.map((log, i) => <div key={i} className="log-entry" style={{ color: log.type === 'stderr' ? '#ffb4ab' : '#b5c0c5' }}>{log.text}</div>)}
              {!isRunning && output.length > 0 && <div className="mt-3 text-[#00ffa3] font-bold flex gap-2"><CheckCircle2 size={12} /><span>EXECUTION_COMPLETED</span></div>}
          </div>
        </div>
      </section>
    );
  }

  function renderVisualsColumn() {
    return (
      <>
        <div className={`vertical-resizer ${isResizingVertical ? 'is-dragging' : ''} ${isCollapsed ? 'is-collapsed' : ''}`} onMouseDown={handleVerticalMouseDown}>
          <button className="collapse-toggle" onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}>{isCollapsed ? "»" : "«"}</button>
        </div>
        <section className="visuals-column" style={{ pointerEvents: (isResizing || isResizingVertical) ? 'none' : 'auto' }}>
          <div className="visuals-header">
            <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#00d1ff] shadow-[0_0_8px_rgba(0,209,255,0.8)]" /><span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#A4E6FF]">Output Area</span></div>
            <button className="p-2 rounded bg-slate-900/50 text-slate-500 hover:text-slate-300" onClick={() => setExpandedPlot(plots[0])} disabled={plots.length === 0}><Maximize2 size={14} /></button>
          </div>
          <div className="visuals-canvas-area custom-scroll">
            {plots.length === 0 ? (
              <div className="visual-canvas-placeholder flex flex-col items-center justify-center h-full opacity-20">
                <BarChart3 size={48} className="mb-4" />
                <span className="text-xs font-black tracking-widest uppercase text-neon-cyan text-center">Visual Canvas Ready</span>
              </div>
            ) : (
              <div className="flex flex-col gap-12 w-full p-4">
                {plots.map((plot, i) => (
                  <div key={i} className="relative group w-full">
                    <div className="flex justify-end mb-2"><button onClick={() => downloadPlot(plot, i)} className="btn-secondary-pill py-1"><Download size={13} /><span>Save</span></button></div>
                    <div className="bg-[#0E1117] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                        {plot.type === 'html' ? <iframe ref={el => iframeRefs.current[i] = el} srcDoc={plot.data} className="w-full min-h-[400px] border-none plotly-view-only" /> : <img src={`data:image/png;base64,${plot.data}`} className="w-full h-auto" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </>
    );
  }
}

export default App;
