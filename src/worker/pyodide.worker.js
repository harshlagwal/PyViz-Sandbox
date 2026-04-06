importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide = null;

const setupPyodide = async () => {
    try {
        console.log('[Worker] Starting Pyodide setup...');
        self.postMessage({ type: 'status', message: 'Worker Started...' });
        
        pyodide = await loadPyodide();
        self.postMessage({ type: 'status', message: 'WASM Runtime Loaded.' });
        
        // Install common DS packages (Plotly requires micropip later)
        self.postMessage({ type: 'status', message: 'Loading core packages (pandas, matplotlib, numpy)...' });
        await pyodide.loadPackage(['pandas', 'matplotlib', 'numpy', 'micropip']);
        
        // Set standard stdout/stderr
        pyodide.setStdout({
            batched: (text) => {
                console.log('Worker Stdout:', text);
                self.postMessage({ type: 'stdout', content: text });
            }
        });
        
        pyodide.setStderr({
            batched: (text) => {
                console.error('Worker Stderr:', text);
                self.postMessage({ type: 'stderr', content: text });
            }
        });

        // Configure Matplotlib Agg backend (clean white output)
        await pyodide.runPythonAsync(`
import os
os.environ['MPLBACKEND'] = 'AGG'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
import sys

# Crucial: Monkey-patch plt.show() so it doesn't clear figures before we extract them via get_outputs()
_original_show = plt.show
def _patched_show(*args, **kwargs):
    pass
plt.show = _patched_show

# Clean default theme - crisp white output
plt.rcParams.update({
    'figure.facecolor': '#0E1117',
    'axes.facecolor': '#ffffff',

    'savefig.facecolor': '#0E1117',
    'savefig.edgecolor': 'none',
    'figure.dpi': 120,
    'font.size': 11,
    'axes.labelsize': 11,
    'axes.titlesize': 13,
    'axes.titleweight': 'bold',
    'grid.alpha': 0.3,
    'grid.linestyle': '--',
})

def get_outputs():
    outputs = []
    try:
        # 1. Matplotlib static captures
        fignums = plt.get_fignums()
        for num in fignums:
            fig = plt.figure(num)
            buf = io.BytesIO()
            fig.savefig(buf, format='png', facecolor='#0E1117', edgecolor='none', transparent=False, bbox_inches='tight', pad_inches=0.15, dpi=120)
            buf.seek(0)
            img_str = base64.b64encode(buf.read()).decode('utf-8')
            outputs.append({'type': 'image', 'data': img_str})
            plt.close(fig)
        
        # 2. Plotly interactive detection
        if 'OUTPUT_HTML' in globals() and globals()['OUTPUT_HTML']:
            val = globals()['OUTPUT_HTML']
            import plotly.io as pio
            # If it's a figure object, re-render with responsive config and no modebar
            if hasattr(val, 'to_html'):
                # Ensure titles have breathing room (t=50) if not set by user
                val.update_layout(margin=dict(t=50))
                val = pio.to_html(val, include_plotlyjs='cdn', full_html=False, config={'responsive': True, 'staticPlot': True, 'displayModeBar': False, 'scrollZoom': False, 'editable': False})
            outputs.append({'type': 'html', 'data': str(val)})
            # We don't pop it here to allow persistent view, but we'll clear it in the run loop if needed
    except Exception as e:
        print(f"Output Fetch Error: {e}", file=sys.stderr)
    return outputs
`);

        self.postMessage({ type: 'ready' });
        reportMemory(); // Initial memory report
        console.log('[Worker] READY');
    } catch (err) {
        console.error('[Worker] Fatal Setup Error:', err);
        self.postMessage({ type: 'stderr', content: `CRITICAL SETUP ERROR: ${err.message}` });
        self.postMessage({ type: 'status', message: 'Setup Failed.' });
    }
};

const reportMemory = () => {
    if (!pyodide) return;
    try {
        const bytes = pyodide._module.HEAP8.buffer.byteLength;
        const mb = (bytes / (1024 * 1024)).toFixed(2);
        self.postMessage({ type: 'engine_stats', content: { mem: `${mb}MB` } });
    } catch (e) {
        console.error("Memory Report Error:", e);
    }
};

self.onmessage = async (event) => {
    const { type, code, files } = event.data;

    if (type === 'init') {
        if (!pyodide) {
            await setupPyodide();
        } else {
            self.postMessage({ type: 'ready' });
            reportMemory();
        }
        return;
    }

    if (type === 'insights') {
        if (!pyodide) return;
        const { filename } = event.data;
        try {
            // Ensure CSV is in VFS if content is provided
            if (event.data.content) {
                pyodide.FS.writeFile(filename, event.data.content);
            }
            
            const statsJson = await pyodide.runPythonAsync(`
import pandas as pd
import json

df = pd.read_csv("${filename}")
summary = df.describe(include='all').to_json()
json.dumps(json.loads(summary)) # sanitize
            `);
            self.postMessage({ type: 'insights_result', content: JSON.parse(statsJson), filename });
            reportMemory();
        } catch (error) {
            console.error("Insights Error:", error);
            self.postMessage({ type: 'insights_error', message: error.message });
        }
    }

    if (type === 'run') {
        if (!pyodide) return;

        try {
            // 1. VFS Preparation
            if (files && files.length > 0) {
                for (const file of files) {
                    try {
                        pyodide.FS.writeFile(file.name, file.content);
                    } catch (fsErr) {
                        console.error(`VFS Error (${file.name}):`, fsErr);
                    }
                }
            }

            // 2. Pre-flight Package Interceptor (Asynchronous)
            if (code.includes('plotly') || code.includes('plotly.express')) {
                self.postMessage({ type: 'stdout', content: ' [SYS] Intercepted external dependency. Initializing micropip...' });
                await pyodide.loadPackage('micropip');
                self.postMessage({ type: 'stdout', content: ' [PKG] Installing Plotly via micropip (This may take 10-15s)...' });
                await pyodide.runPythonAsync("import micropip\nawait micropip.install('plotly')");
                
                // Crucial: Monkey-patch Plotly's show() so standard Plotly scripts render on our visual canvas
                await pyodide.runPythonAsync(`
import sys
try:
    import plotly.graph_objs as go
    import plotly.io as pio

    def _patched_plotly_show(fig, *args, **kwargs):
        # We store the latest figure explicitly to the global namespace that Pyodide reads
        sys.modules['__main__'].OUTPUT_HTML = fig

    go.Figure.show = _patched_plotly_show
    pio.show = lambda fig, *args, **kwargs: _patched_plotly_show(fig, *args, **kwargs)
except ImportError:
    pass
                `);

                self.postMessage({ type: 'stdout', content: ' [PKG] Plotly installed successfully.' });
            }

            // 3. Robust Asynchronous Execution
            const result = await pyodide.runPythonAsync(code);

            // 4. Output Collection (Exclusive Priority System)
            let finalOutputs = [];

            // 4a. Priority 1: Implicit HTML Return (Plotly expression at end of script)
            if (result && typeof result === 'object' && result.to_html) {
                const html_data = pyodide.runPython(`
import plotly.io as pio
fig = ${result}
fig.update_layout(margin=dict(t=50))
pio.to_html(fig, include_plotlyjs='cdn', full_html=False, config={'responsive': True, 'staticPlot': True, 'displayModeBar': False, 'scrollZoom': False, 'editable': False})
                `);
                finalOutputs.push({ type: 'html', data: html_data });
            } else if (result && typeof result === 'string' && (result.includes('<div') || result.includes('plotly'))) {
                finalOutputs.push({ type: 'html', data: result });
            } 
            // 4b. Priority 2: Explicit OUTPUT_HTML Global or General Output extraction (Matplotlib/Plotly)
            else {
                try {
                    // Update: Force Plotly responsiveness and Hide ModeBar in global capture
                    pyodide.runPython(`
if 'OUTPUT_HTML' in globals() and globals()['OUTPUT_HTML']:
    try:
        import plotly.io as pio
        # If it's a figure object, re-render with responsive config and no modebar
        if hasattr(globals()['OUTPUT_HTML'], 'to_html'):
            globals()['OUTPUT_HTML'] = pio.to_html(globals()['OUTPUT_HTML'], include_plotlyjs='cdn', full_html=False, config={'responsive': True, 'staticPlot': True, 'displayModeBar': False, 'scrollZoom': False, 'editable': False})
    except Exception as innerErr:
        import sys
        print(f"Error handling OUTPUT_HTML: {innerErr}", file=sys.stderr)
                    `);
                    
                    // Safely convert Pyodide lists of dicts to JS Arrays of Objects
                    const capturedProxy = pyodide.runPython("get_outputs()");
                    const captured = capturedProxy.toJs({ dict_converter: Object.fromEntries });
                    capturedProxy.destroy();

                    if (Array.isArray(captured)) {
                        const htmlOutput = captured.find(o => o.type === 'html' || o.get?.('type') === 'html');
                        const imgOutputs = captured.filter(o => o.type === 'image' || o.get?.('type') === 'image');

                        if (htmlOutput) {
                            finalOutputs.push({
                                type: 'html', 
                                data: htmlOutput.data || htmlOutput.get?.('data')
                            });
                        } else if (imgOutputs.length > 0) {
                            // Capture all images if no HTML is present
                            finalOutputs = imgOutputs.map(img => ({
                                type: 'image',
                                data: img.data || img.get?.('data')
                            }));
                        }
                    }
                    
                    // Cleanup
                    pyodide.runPython("globals().update({'OUTPUT_HTML': None})");
                } catch (pErr) {
                    console.error("Output Fetch Error:", pErr);
                    self.postMessage({ type: 'stderr', content: `Extraction Error: ${pErr.message}` });
                }
            }

            // Always send the most high-fidelity result found
            if (finalOutputs.length > 0) {
                self.postMessage({ type: 'plots', content: finalOutputs });
            }

        } catch (error) {
            // Capture all Python/WASM errors and pipe to UI terminal
            self.postMessage({ type: 'stderr', content: error.message });
        } finally {
            // Signal completion to reset button states
            self.postMessage({ type: 'done' });
            reportMemory();
        }
    }
};
