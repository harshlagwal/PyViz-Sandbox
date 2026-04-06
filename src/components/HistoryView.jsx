import React, { useState, useEffect } from 'react';
import { History, Play, Trash2 } from 'lucide-react';

const HistoryView = ({ onSelectCode }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('pyviz_run_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        setHistory([]);
      }
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your execution history?")) {
      localStorage.removeItem('pyviz_run_history');
      setHistory([]);
    }
  };

  return (
    <div className="side-panel history-panel">
      <div className="panel-header justify-between">
        <div className="flex-center gap-2">
          <History size={18} className="text-cyan" />
          <h2>Run History</h2>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="clear-btn"
            title="Clear all history"
          >
            <Trash2 size={12} />
            CLEAR ALL
          </button>
        )}
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-state">
            <History size={48} strokeWidth={1} />
            <p>No execution history yet. Run some code to see snapshot cards here.</p>
          </div>
        ) : (
          history.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => onSelectCode(item.code)}
              className="history-card"
            >
              <div className="card-top">
                <div className="card-timestamp">
                   <Play size={8} className="text-secondary" />
                   <span>{item.time}</span>
                </div>
                <span className="card-action">Restore ↩</span>
              </div>
              <div className="card-preview">
                {item.code}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;
