import React, { useState, useEffect, useRef } from 'react';
import { Folder, Trash2, DownloadCloud, UploadCloud, FileCode2, Clock } from 'lucide-react';
import { getSavedProjects, deleteProject, exportWorkspace, importWorkspace } from '../utils/storage';

const WorkspaceView = ({ onLoadProject, triggerRefresh }) => {
  const [projects, setProjects] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setProjects(getSavedProjects());
  }, [triggerRefresh]);

  const handleDelete = (id) => {
    if (window.confirm('Delete this saved project?')) {
      const updated = deleteProject(id);
      setProjects([...updated]);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = null; // reset
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const result = importWorkspace(event.target.result);
        if (result) {
            setProjects([...result]);
            alert('Workspace imported successfully!');
        } else {
            alert('Failed to import workspace. Invalid JSON format.');
        }
    };
    reader.readAsText(file);
  };

  const formatDate = (isoString) => {
      try {
          const date = new Date(isoString);
          return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
      } catch {
          return 'Unknown date';
      }
  };

  return (
    <div className="workspace-container bg-[#101319] h-full" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', width: '280px' }}>
      <div className="explorer-header flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Folder size={16} className="text-[#00d1ff]" />
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#e1e2eb]">My Workspace</span>
        </div>
      </div>
      
      <div className="workspace-actions">
          <button onClick={exportWorkspace} title="Backup Workspace">
              <DownloadCloud size={14} />
              <span>Export</span>
          </button>
          <button onClick={handleImportClick} title="Restore Workspace">
              <UploadCloud size={14} />
              <span>Import</span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{display: 'none'}} />
          </button>
      </div>

      <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-2">Saved Projects</div>
      
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 opacity-40 gap-4 text-center mt-8">
          <Folder size={40} strokeWidth={1} className="text-slate-400" />
          <p className="text-sm font-medium">No saved projects yet.<br/>Save your current script to see it here.</p>
        </div>
      ) : (
        <div className="projects-list custom-scroll flex-1 overflow-y-auto pr-1">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="project-card"
              onClick={() => onLoadProject(project.code)}
            >
              <div className="project-info">
                  <span className="project-title">{project.title}</span>
                  <span className="project-date">
                      {formatDate(project.date)}
                  </span>
              </div>
              <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                  className="delete-btn"
                  title="Delete Project"
              >
                  <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceView;
