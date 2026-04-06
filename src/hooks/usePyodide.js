import { useState, useEffect, useRef, useCallback } from 'react';

export function usePyodide() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState([]);
  const [plots, setPlots] = useState([]);
  const [status, setStatus] = useState('Booting IDE...');
  const [dataInsights, setDataInsights] = useState(null);
  const [engineStats, setEngineStats] = useState({ mem: '—' });
  
  const workerRef = useRef(null);

  // Extracted message handler factory — reused for init & restart
  const createAndMountWorker = useCallback(() => {
    const worker = new Worker(new URL('../worker/pyodide.worker.js', import.meta.url));

    worker.onmessage = (event) => {
      const { type, content, message } = event.data;

      switch (type) {
        case 'status':
          setStatus(message);
          break;
        case 'ready':
          setIsInitializing(false);
          setIsRunning(false);
          setStatus('Ready');
          break;
        case 'stdout':
          if (content && content.includes('Matplotlib is currently using agg')) break;
          setOutput(prev => [...prev, { type: 'stdout', text: content }]);
          break;
        case 'stderr':
          if (content && content.includes('Matplotlib is currently using agg')) break;
          setOutput(prev => [...prev, { type: 'stderr', text: content }]);
          break;
        case 'plots':
          setPlots(content);
          break;
        case 'insights_result':
          setDataInsights(content);
          break;
        case 'engine_stats':
          setEngineStats({ mem: content.mem });
          break;
        case 'done':
          setIsRunning(false);
          break;
        default:
          break;
      }
    };

    worker.onerror = (err) => {
      console.error('[Worker] Uncaught Error:', err);
      setOutput(prev => [...prev, { type: 'stderr', text: `[Worker Error] ${err.message}` }]);
      setIsRunning(false);
    };

    return worker;
  }, []);

  useEffect(() => {
    const worker = createAndMountWorker();
    workerRef.current = worker;
    worker.postMessage({ type: 'init' });

    return () => {
      worker.terminate();
    };
  }, [createAndMountWorker]);

  const runCode = useCallback((code, files) => {
    if (!workerRef.current || isInitializing || isRunning) return;
    setIsRunning(true);
    setPlots([]);
    setOutput([]);
    workerRef.current.postMessage({ type: 'run', code, files });
  }, [isInitializing, isRunning]);

  const getInsights = useCallback((filename, content) => {
    if (!workerRef.current || isInitializing) return;
    setDataInsights(null);
    workerRef.current.postMessage({ type: 'insights', filename, content });
  }, [isInitializing]);

  const clearOutput = useCallback(() => {
    setOutput([]);
    setPlots([]);
  }, []);

  const restartWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    setPlots([]);
    setIsRunning(false);
    setIsInitializing(true);
    setStatus('Restarting...');
    setDataInsights(null);
    setEngineStats({ mem: '—' });
    setOutput([
      { type: 'stdout', text: '⚡ Restarting Pyodide Engine...' },
      { type: 'stdout', text: '   Terminating existing WASM context.' },
      { type: 'stdout', text: '   Spawning fresh Web Worker instance...' },
    ]);

    const worker = createAndMountWorker();
    workerRef.current = worker;
    worker.postMessage({ type: 'init' });
  }, [createAndMountWorker]);

  return {
    isInitializing,
    isRunning,
    output,
    plots,
    dataInsights,
    status,
    engineStats,
    runCode,
    getInsights,
    clearOutput,
    restartWorker,
  };
}
