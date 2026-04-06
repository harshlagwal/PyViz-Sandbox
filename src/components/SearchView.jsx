import React, { useState } from 'react';
import { Search, Code, CornerDownRight } from 'lucide-react';

const SearchView = ({ code, onSelectResult }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (val) => {
    setSearchTerm(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }

    const lines = code.split('\n');
    const matches = lines
      .map((line, index) => ({
        lineContent: line,
        lineNumber: index + 1
      }))
      .filter(item => 
        item.lineContent.toLowerCase().includes(val.toLowerCase())
      );
    
    setResults(matches);
  };

  return (
    <div className="side-panel search-panel">
      <div className="panel-header">
        <Search size={18} className="text-cyan" />
        <h2>Global Search</h2>
      </div>

      <div className="search-input-container">
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search in script.py..."
          className="premium-input"
          autoFocus
        />
      </div>

      <div className="results-container mt-6">
        {searchTerm && results.length === 0 ? (
          <div className="empty-state">
            <p>No matches found for "{searchTerm}"</p>
          </div>
        ) : results.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black text-[#859399] tracking-widest mb-1 uppercase">
              {results.length} Matches Found
            </p>
            {results.map((result, idx) => (
              <div 
                key={idx}
                className="history-card" 
                onClick={onSelectResult}
              >
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                     <Code size={12} className="text-secondary" />
                     <span className="text-[11px] font-bold text-[#859399]">LINE {result.lineNumber}</span>
                   </div>
                   <CornerDownRight size={12} className="text-cyan opacity-40" />
                </div>
                <div className="card-preview !-webkit-line-clamp-1">
                  {result.lineContent.trim() || <span className="opacity-20 italic">Empty line</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel-info-box">
            <p>
              Enter a keyword to parse <strong>script.py</strong>. Results index every line for instant navigation back to the editor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
