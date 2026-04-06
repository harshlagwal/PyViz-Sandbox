<div align="center">

# PyViz Sandbox
**Your Data. Your Browser. Zero Latency.**

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=WebAssembly&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Plotly](https://img.shields.io/badge/Plotly-%233F4F75.svg?style=for-the-badge&logo=plotly&logoColor=white)

</div>

<br/>

## The Vision
Traditional Data Science workflows rely heavily on remote cloud architectures, bringing high network latency, potential privacy compromises, and expensive server costs. PyViz Sandbox completely eliminates these bottlenecks by running a full CPython data science runtime natively inside your browser. Powered by Pyodide, your datasets are analyzed, manipulated, and visualized with 0ms latency—while strictly ensuring your data never leaves the safety of your local machine.

## Elite Features
- **Zero-Latency WASM Execution:** Experience instant Python code evaluation and data processing powered directly by WebAssembly. No kernel restarts or sluggish network layers.
- **100% Local Privacy:** Full SOC2/HIPAA friendly execution. Your sensitive CSVs and DataFrames remain isolated in the browser instance. Nothing is ever uploaded to a remote server.
- **Persistent LocalStorage Workspace:** Keep all your essential scripts, generated outputs, and customized dashboards ready-to-go without spinning up databases.
- **Glassmorphism Premium UI:** Navigate a highly optimized "Kinetic Shadow" architecture, giving you a sleek, intuitive, premium SaaS aesthetic.

## Architecture Highlights
PyViz Sandbox boasts a strict **0-backend flow**.

1. **User Input:** Enter multi-line code via an immersive editor or drop local raw files into the VFS (Virtual File System).
2. **Synchronous Bridge:** Safely translates DOM events into the sandboxed WebAssembly context seamlessly.
3. **Pyodide Execution:** WebAssembly safely allocates memory and initiates the CPython AST interpretation for instant, heavy dataset mutations.
4. **Plotly Canvas Render:** Visual results are injected natively back into the browser's high-fidelity reactive components.

## Getting Started

Get your zero-latency ecosystem running locally in under 60 seconds:

```bash
# Clone the repository
git clone https://github.com/harshlagwal/PyViz-Sandbox.git

# Navigate into the project directory
cd pyviz-sandbox

# Install the necessary dependencies
npm install

# Launch the development server
npm run dev
```

Visit the provided `localhost` URL to begin crunching data safely locally!
