import React from 'react';
import { Play, FileCode, BarChart3, Database, Globe, TrendingUp, Cpu, Layers } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'basic-sine',
    title: 'Aesthetic Sine Wave',
    description: 'Beautiful animated-style sine wave with custom grid and labels. Perfect for signal processing tests.',
    icon: <BarChart3 className="text-[#00d1ff]" size={22} />,
    tags: ['Numpy', 'Matplotlib'],
    code: `import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(10, 6), facecolor='#0E1117')
plt.plot(x, y, label='Sine Wave', color='#00d1ff', linewidth=4)
plt.fill_between(x, y, alpha=0.1, color='#00d1ff')
plt.title('Kinetic Shadow: Waveform Analysis', color='white', fontsize=16, fontweight='bold', pad=20)
plt.grid(True, linestyle='--', alpha=0.3)
plt.legend()
plt.show()`
  },
  {
    id: 'pandas-stats',
    title: 'Data Analysis Basic',
    description: 'Exploratory data analysis using Pandas with mean/std calculations. Ideal for early stage profiling.',
    icon: <Database className="text-[#4edea3]" size={22} />,
    tags: ['Pandas', 'Analytics'],
    code: `import pandas as pd
import numpy as np

# Create synthetic data
data = {
    'Sales': np.random.randint(100, 1000, 20),
    'Growth': np.random.uniform(0.1, 5.0, 20),
    'Region': ['North', 'South', 'East', 'West'] * 5
}
df = pd.DataFrame(data)

print("--- DataFrame Head ---")
print(df.head())
print("\\n--- Statistics ---")
print(df.describe())
print("\\n--- Grouped Sales ---")
print(df.groupby('Region')['Sales'].mean())`
  },
  {
    id: 'crypto-simulator',
    title: 'Crypto Candlestick Simulator',
    description: 'A template that generates random stock/crypto volatility and plots a complex financial trend.',
    icon: <TrendingUp className="text-[#ffd59c]" size={22} />,
    tags: ['Finance', 'Numpy'],
    code: `import matplotlib.pyplot as plt
import numpy as np

# Generate Volatile Price Data
prices = [100]
for i in range(100):
    prices.append(prices[-1] * (1 + np.random.normal(0, 0.02)))

plt.figure(figsize=(10, 6), facecolor='#101319')
plt.plot(prices, color='#ffd59c', linewidth=2.5, label='BTC/USD Simulation')
plt.fill_between(range(len(prices)), prices, color='#ffd59c', alpha=0.05)
plt.title('Crypto Volatility Simulator v1.0', color='white', fontsize=14)
plt.legend()
plt.show()

print(">>> Market Simulation Completed")
print(f">>> Peak Price: {max(prices):.2f}")`
  },
  {
    id: 'ml-cluster',
    title: 'ML Cluster Analysis',
    description: 'Generates fake cluster data and plots a scatter graph with centroids. Useful for ML students.',
    icon: <Layers className="text-[#a4e6ff]" size={22} />,
    tags: ['SciPy', 'Data Science'],
    code: `import matplotlib.pyplot as plt
import numpy as np

# Generate 3 clusters of data
c1 = np.random.randn(50, 2) + [2, 2]
c2 = np.random.randn(50, 2) + [-2, -2]
c3 = np.random.randn(50, 2) + [2, -2]

plt.figure(figsize=(10, 6), facecolor='#0E1117')
plt.scatter(c1[:,0], c1[:,1], color='#00d1ff', alpha=0.6, label='Cluster A')
plt.scatter(c2[:,0], c2[:,1], color='#4edea3', alpha=0.6, label='Cluster B')
plt.scatter(c3[:,0], c3[:,1], color='#ffd59c', alpha=0.6, label='Cluster C')

plt.title('Unsupervised Learning: K-Means Distribution', color='white')
plt.legend()
plt.show()`
  }
];

const TemplatesGallery = ({ onSelect }) => {
  return (
    <div className="templates-gallery custom-scroll p-10">
      <div className="mb-12">
        <h2 className="text-3xl font-black tracking-tight text-white mb-3">Project Blueprints</h2>
        <p className="text-[#8b949e] text-sm max-w-lg leading-relaxed">
           Select a high-performance starter template to kickstart your data visualization. 
           Every blueprint includes optimized plotting for the Kinetic Shadow engine.
        </p>
      </div>

      <div className="template-grid">
        {TEMPLATES.map((tpl) => (
          <div 
            key={tpl.id} 
            className="template-card-hq"
            onClick={() => onSelect(tpl.code)}
          >
            <div className="card-left">
              <div className="template-icon-wrapper">
                {tpl.icon}
              </div>
            </div>
            
            <div className="card-content">
              <div className="card-header">
                <h3 className="template-title">{tpl.title}</h3>
                <span className="load-blueprint-btn">Load Blueprint →</span>
              </div>
              <p className="template-desc">{tpl.description}</p>
              
              <div className="tag-row">
                {tpl.tags.map(tag => (
                  <span key={tag} className="tech-badge">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pro-footer-card">
        <div className="p-4 rounded-2xl bg-[#00d1ff10]">
            <Globe className="text-[#00d1ff]" size={28} />
        </div>
        <div className="flex flex-col gap-1">
            <h4 className="text-slate-200 font-bold text-sm tracking-wide">Enterprise Data Ecosystem</h4>
            <p className="text-xs text-[#8b949e] max-w-lg leading-relaxed">
               All libraries are executed locally via WASM. You can also import any pure python package from PyPi inside your scripts using micropip.
            </p>
        </div>
      </div>
    </div>
  );
};

export default TemplatesGallery;
