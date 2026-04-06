import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ height = 32 }) => {
  const scale = height / 32;
  return (
    <div className="flex items-center gap-3" style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
        <path d="M16 4L26 9.5V20.5L16 26L6 20.5V9.5L16 4Z" stroke="#00d1ff" strokeOpacity="0.5" strokeWidth="1.5" />
        <path d="M16 4V15M16 15L26 9.5M16 15L6 9.5" stroke="#00d1ff" strokeOpacity="0.3" strokeWidth="1.5" />
        <motion.path 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
          d="M10 18L14 14L18 16L22 10" 
          stroke="#00ffa3" 
          strokeWidth="2" 
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px #00ffa3)' }}
        />
      </svg>
      <div className="flex items-baseline font-display">
        <span className="brand-pyviz">PyViz</span>
        <span className="brand-sandbox" style={{ color: '#8b949e', marginLeft: '4px' }}>Sandbox</span>
      </div>
    </div>
  );
};

export default Logo;
