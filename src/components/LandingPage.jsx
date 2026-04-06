import React, { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // Using slim for performance
import { 
  BarChart3, 
  Play, 
  CheckCircle2, 
  XCircle,
  Settings, 
  ArrowRight,
  Code as CodeIcon,
  Upload
} from 'lucide-react';
import Logo from './Logo';

const LoopingTypewriter = () => {
  const [phase, setPhase] = useState('typing'); // typing | hold | reset
  const [activeLine, setActiveLine] = useState(0);

  const codeLines = [
    { 
      id: 1, 
      content: <div><span style={{ color: '#ff7b72' }}>import</span> pandas <span style={{ color: '#ff7b72' }}>as</span> pd</div> 
    },
    { 
      id: 2, 
      content: <div><span style={{ color: '#ff7b72' }}>import</span> matplotlib.pyplot <span style={{ color: '#ff7b72' }}>as</span> plt</div> 
    },
    { 
      id: 3, 
      content: <div className="h-4">&nbsp;</div> 
    },
    { 
      id: 4, 
      content: <div>df = pd.<span style={{ color: '#79c0ff' }}>read_csv</span>(<span style={{ color: '#a5d6ff' }}>'data.csv'</span>)</div> 
    },
    { 
      id: 5, 
      content: <div>plt.<span style={{ color: '#79c0ff' }}>plot</span>(df[<span style={{ color: '#a5d6ff' }}>'growth'</span>], color=<span style={{ color: '#a5d6ff' }}>'#00d1ff'</span>)</div> 
    },
    { 
      id: 6, 
      content: <div>plt.<span style={{ color: '#79c0ff' }}>show</span>()</div> 
    }
  ];

  useEffect(() => {
    let timer;
    if (phase === 'typing') {
      if (activeLine < codeLines.length) {
        // Time to type each line
        timer = setTimeout(() => {
          setActiveLine(prev => prev + 1);
        }, 1200); // Matches duration of line animation
      } else {
        // Typing finished, go to hold
        setPhase('hold');
      }
    } else if (phase === 'hold') {
      timer = setTimeout(() => {
        setPhase('reset');
      }, 3000);
    } else if (phase === 'reset') {
      setActiveLine(0);
      timer = setTimeout(() => {
        setPhase('typing');
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [phase, activeLine, codeLines.length]);

  return (
    <div className="typing-container overflow-x-auto w-full" style={{ fontFamily: 'var(--font-mono)', lineHeight: '1.6', color: '#c9d1d9', fontSize: '14px' }}>
      {codeLines.map((line, idx) => {
        const isTyped = idx < activeLine || phase === 'hold';
        const isCurrent = idx === activeLine && phase === 'typing';
        const isLastLine = idx === codeLines.length - 1;

        return (
          <div key={line.id} className="flex items-center" style={{ minHeight: '1.6em' }}>
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: isTyped || isCurrent ? "100%" : "0%" }}
               transition={{ 
                 duration: isCurrent ? 1.2 : 0, 
                 ease: "linear" 
               }}
               style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              {line.content}
            </motion.div>
            
            {(isCurrent || (phase === 'hold' && isLastLine)) && (
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
                className="ml-1 font-bold text-[#00ffa3]"
              >
                █
              </motion.span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ParticleBackground = () => {
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      className="absolute inset-0 z-0 pointer-events-none"
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: { color: { value: "transparent" } },
        fpsLimit: 120,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            resize: true,
          },
          modes: {
            grab: { distance: 140, links: { opacity: 0.5 } },
          },
        },
        particles: {
          color: { value: "#00d1ff" },
          links: {
            color: "#00d1ff",
            distance: 150,
            enable: true,
            opacity: 0.1,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: { default: "bounce" },
            random: false,
            speed: 1,
            straight: false,
          },
          number: {
            density: { enable: true, area: 800 },
            value: 30,
          },
          opacity: { value: 0.15 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      }}
    />
  );
};

const navItems = [
  { id: 'features', label: 'Features' },
  { id: 'demo', label: 'Demo' },
];

const LandingPage = ({ onLaunch }) => {
  const [activeSection, setActiveSection] = useState('');
  const [hoveredSection, setHoveredSection] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { 
      threshold: 0.3,
      rootMargin: '-150px 0px -50% 0px' 
    });

    navItems.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      // Using native scrollIntoView is more reliable across browsers
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentDisplaySection = hoveredSection || activeSection;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="landing-page selection:bg-cyan-500/30">
      {/* 1. NAVBAR */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="landing-nav"
      >
        <div className="container-standard header-grid">
          <a href="#" className="nav-logo-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <Logo height={32} />
          </a>
          
          <div 
            className="nav-links-center hidden md:flex"
            onMouseLeave={() => setHoveredSection(null)}
          >
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                onMouseEnter={() => setHoveredSection(item.id)}
                className={`nav-item-btn ${activeSection === item.id ? 'active' : ''}`}
              >
                {item.label}
                {currentDisplaySection === item.id && (
                  <motion.div 
                    layoutId="nav-glow-line"
                    className="nav-active-line"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
            <a href="https://github.com/harshlagwal/PyViz-Sandbox" target="_blank" rel="noopener noreferrer" className="nav-item-link">GitHub</a>
          </div>

          <div className="nav-actions">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLaunch} 
              className="btn-nav-launch"
            >
              Launch IDE
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* 2. HERO SECTION */}
      <header className="hero-section px-4 md:px-12 max-w-7xl mx-auto py-12 md:py-24 w-full">
        <ParticleBackground />
        <div className="hero-glow-blob" />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="hero-container"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-[64px]"
            style={{ textAlign: 'center', margin: '0 auto 24px auto' }}
          >
            Your Data. Your Browser.<br/>
            <span className="text-gradient">Zero Latency.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="hero-subtitle"
            style={{ textAlign: 'center', margin: '0 auto 48px auto' }}
          >
            Execute heavy Python data science workloads directly in your browser.<br/>
            No servers, no ingress costs, and 100% local privacy.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            className="hero-actions justify-center"
          >
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0, 209, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onLaunch} 
              className="btn-hero-primary"
            >
              Get Started &rarr;
            </motion.button>
          </motion.div>

          {/* MOCKUP / VISUAL CANVAS */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            className="hero-visual"
          >
             <div className="mockup-frame">
                <div className="mockup-header">
                   <div className="dots"><span /><span /><span /></div>
                   <div className="tab">script.py</div>
                </div>
                <div className="mockup-body overflow-x-auto" style={{ background: '#0E1117', padding: '24px', borderRadius: '0 0 20px 20px', textAlign: 'left' }}>
                   <LoopingTypewriter />
                </div>
                <div className="mockup-glow" />
             </div>
          </motion.div>
        </motion.div>
      </header>

      {/* 3. FEATURES GRID */}
      <section id="features" className="features-section px-4 md:px-12 max-w-7xl mx-auto py-12 md:py-24 w-full">
        <div className="section-header">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            The 3-Step Pipeline
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-desc"
          >
            Traditional environments wait for the cloud. We don't.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto w-full">
          {[
            { 
              icon: <Upload size={32} />, 
              title: "Upload", 
              desc: "Drag and drop your raw CSV datasets directly into the secure browser environment.",
              color: "blue",
              delay: 0.6
            },
            { 
              icon: <CodeIcon size={32} />, 
              title: "Write Logic", 
              desc: "Build transformation pipelines using our Pyodide-powered Python code runner.",
              color: "purple",
              delay: 0.8
            },
            { 
              icon: <BarChart3 size={32} />, 
              title: "Visualize", 
              desc: "Render highly-interactive Plotly graphs with guaranteed zero server latency.",
              color: "green",
              delay: 1.0
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: feature.delay }}
              className="feature-card flex flex-col items-center text-center p-8 md:p-10 w-full md:w-auto"
            >
              <div className={`feature-icon-box ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-[22px] font-extrabold mb-3">{feature.title}</h3>
              <p className="text-base md:text-[15px] text-[#859399] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* 4. DEMO / SPLIT-PANE PREVIEW */}
      <section id="demo" className="demo-section px-4 md:px-12 max-w-7xl mx-auto py-12 md:py-24 w-full">
        <div className="demo-container flex flex-col lg:flex-row items-center gap-12 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="demo-text w-full lg:w-1/2"
          >
            <h2 className="section-title text-left">Write Python. <br/>Visualize Instantly.</h2>
            <p className="section-desc text-left mb-8">
              Leverage the full power of Matplotlib, Pandas, and Numpy in a syntax-highlighted IDE environment.
            </p>
            <div className="demo-features-list">
              {[
                "Integrated Virtual File System",
                "High-Density Plot Rendering (120 DPI)",
                "Interactive WASM Terminal"
              ].map((item, i) => (
                <div key={i} className="demo-feature-item">
                  <div className="dot-cyan" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="demo-window w-full lg:w-1/2"
          >
             <div className="window-pane code-pane">
                <div className="mockup-content overflow-x-auto w-full">
                <div style={{ fontFamily: 'monospace', lineHeight: '1.6', color: '#c9d1d9', fontSize: '14px', minWidth: 'max-content' }}>
                  <div><span style={{ color: '#ff7b72' }}>import</span> pandas <span style={{ color: '#ff7b72' }}>as</span> pd</div>
                  <div><span style={{ color: '#ff7b72' }}>import</span> matplotlib.pyplot <span style={{ color: '#ff7b72' }}>as</span> plt</div>
                  <br />
                  <div>df = pd.<span style={{ color: '#79c0ff' }}>read_csv</span>(<span style={{ color: '#a5d6ff' }}>'data.csv'</span>)</div>
                  <div>plt.<span style={{ color: '#79c0ff' }}>plot</span>(df[<span style={{ color: '#a5d6ff' }}>'growth'</span>], color=<span style={{ color: '#a5d6ff' }}>'#00d1ff'</span>)</div>
                  <div>plt.<span style={{ color: '#79c0ff' }}>show</span>()</div>
                </div>
              </div>
             </div>
             <div className="window-pane preview-pane">
                <div className="pane-header">VISUAL CANVAS</div>
                <div className="preview-placeholder">
                   <svg viewBox="0 0 400 200" className="w-full h-full opacity-80">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{stopColor:'#00d1ff', stopOpacity:0.4}} />
                          <stop offset="100%" style={{stopColor:'#00d1ff', stopOpacity:0}} />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M0,100 Q50,20 100,100 T200,100 T300,100 T400,100" 
                        fill="none" 
                        stroke="#00d1ff" 
                        strokeWidth="3"
                        className="chart-path"
                      />
                      <path 
                        d="M0,100 Q50,20 100,100 T200,100 T300,100 T400,100 V200 H0 Z" 
                        fill="url(#chartGradient)"
                      />
                   </svg>
                </div>
             </div>
          </motion.div>
        </div>
      </section>


      {/* 4.1 WHY WE ARE DIFFERENT SECTION (US VS THEM) */}
      <section className="comparison-section px-4 md:px-12 max-w-7xl mx-auto py-12 md:py-24 w-full">
        <div className="section-header text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Why We Are Different
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-desc"
          >
            Leave the cloud behind. Experience true local power.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1000px] mx-auto w-full">
          {/* TRADITIONAL CLOUD (Left / Inferior) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 md:p-10 border border-white/5 bg-white/[0.01] opacity-60 w-full"
            style={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
          >
            <h3 className="text-lg font-bold text-slate-500 mb-8 text-center uppercase tracking-widest">Traditional Cloud IDEs</h3>
            <div className="space-y-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { title: "Latency", text: "High network latency, waiting for kernel restarts" },
                { title: "Privacy", text: "Data uploaded to external servers" },
                { title: "Setup/Config", text: "Complex Docker setups, pip install hell, environment breaking" },
                { title: "Cost", text: "Expensive hourly compute billing" }
              ].map((ft, i) => (
                <div key={i} className="flex items-start gap-4" style={{ display: 'flex', gap: '16px' }}>
                  <XCircle className="text-slate-600 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-400 mb-1">{ft.title}</h4>
                    <p className="text-[14px] text-slate-500 leading-relaxed m-0">{ft.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* PYVIZ SANDBOX (Right / Superior) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 md:p-10 relative overflow-hidden shadow-2xl w-full"
            style={{ borderRadius: '24px', border: '1px solid rgba(0, 209, 255, 0.3)', background: 'rgba(0, 209, 255, 0.03)', boxShadow: '0 0 40px rgba(0, 209, 255, 0.1)' }}
          >
            {/* Glow blobs inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d1ff] opacity-10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00ffa3] opacity-10 blur-[80px] rounded-full pointer-events-none" />
            
            <h3 className="text-xl font-black text-white mb-8 text-center uppercase tracking-widest" style={{ textShadow: '0 0 20px rgba(0,209,255,0.6)' }}>PyViz Sandbox</h3>
            <div className="space-y-8 relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { title: "Latency", text: "0ms, Instant execution via WASM" },
                { title: "Privacy", text: "100% Local, Data never leaves the browser, SOC2/HIPAA friendly" },
                { title: "Setup/Config", text: "Zero config, runs instantly" },
                { title: "Cost", text: "100% Free, Zero server egress costs" }
              ].map((ft, i) => (
                <div key={i} className="flex items-start gap-4" style={{ display: 'flex', gap: '16px' }}>
                  <CheckCircle2 className="text-[#00ffa3] mt-1 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,163,0.8))' }} size={24} />
                  <div>
                    <h4 className="text-[15px] font-bold text-white mb-1">{ft.title}</h4>
                    <p className="text-[14px] text-[#a4e6ff] leading-relaxed m-0">{ft.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4.5 FINAL CTA SECTION (ELITE CENTERED) */}
      <section className="final-cta-v2 px-4 md:px-12 max-w-7xl mx-auto py-12 md:py-24 w-full">
        <div className="hero-glow-blob" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.15 }} />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="final-cta-v2-inner"
        >
          <h2 className="final-cta-heading">
            Stop waiting for servers.<br/>
            Start building.
          </h2>
          <p className="final-cta-sub">
            Join the new era of localized data engineering. Deployment<br/>
            is one click away.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168, 225, 255, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onLaunch} 
            className="btn-final-blue-elite"
          >
            Launch IDE
          </motion.button>
        </motion.div>
      </section>

      {/* 5. FOOTER (SIMPLE - MATCH IMAGE 1) */}
      <footer className="footer-simple">
        <div className="footer-simple-inner">
          <Logo height={24} />
          <p className="footer-simple-copy">© 2026 PyViz Sandbox. Built by Harsh lagwal</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
