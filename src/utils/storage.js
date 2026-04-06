const WORKSPACE_KEY = 'pyviz_workspace_projects';

export const getSavedProjects = () => {
    try {
        const data = localStorage.getItem(WORKSPACE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const saveProject = (title, code) => {
    const projects = getSavedProjects();
    const existingIndex = projects.findIndex(p => p.title === title);
    
    const newProject = {
        id: Date.now().toString(),
        title,
        code,
        date: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
        newProject.id = projects[existingIndex].id; // Keep same ID
        projects[existingIndex] = newProject;
    } else {
        projects.push(newProject);
    }
    
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(projects));
    return projects;
};

export const deleteProject = (id) => {
    const projects = getSavedProjects().filter(p => p.id !== id);
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(projects));
    return projects;
};

export const exportWorkspace = () => {
    const projects = getSavedProjects();
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pyviz_workspace.json';
    a.click();
    URL.revokeObjectURL(url);
};

export const importWorkspace = (jsonString) => {
    try {
        const newProjects = JSON.parse(jsonString);
        if (Array.isArray(newProjects)) {
            const current = getSavedProjects();
            const merged = [...current];
            newProjects.forEach(np => {
                if (!np.title || typeof np.code !== 'string') return; // Validate
                const idx = merged.findIndex(p => p.id === np.id || p.title === np.title);
                
                // Ensure there's an ID
                if (!np.id) np.id = Date.now().toString() + Math.random().toString().slice(2,8);
                if (!np.date) np.date = new Date().toISOString();

                if (idx !== -1) merged[idx] = np;
                else merged.push(np);
            });
            localStorage.setItem(WORKSPACE_KEY, JSON.stringify(merged));
            return merged;
        }
        return false;
    } catch {
        return false;
    }
};
