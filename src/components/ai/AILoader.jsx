import { useState, useEffect } from 'react';
import './AILoader.css';

/**
 * Premium Futuristic AI Loading Component
 * Features: Scanning grid, binary streams, and neural pulse.
 */
const AILoader = ({ logs = [] }) => {
  const [binaryStream, setBinaryStream] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      let b = '';
      for(let i=0; i<15; i++) b += Math.round(Math.random());
      setBinaryStream(b);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-loader-container">
      {/* 1. Background Scanning Grid */}
      <div className="ai-scanner-grid">
        <div className="ai-scan-line"></div>
      </div>

      {/* 2. Central Neural Core */}
      <div className="ai-neural-core">
        <div className="core-pulse"></div>
        <div className="core-inner">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" className="core-path" />
            <path d="M50 20 L50 80 M20 50 L80 50 M30 30 L70 70 M70 30 L30 70" className="core-nodes" />
          </svg>
        </div>
      </div>

      {/* 3. Floating Data Bits */}
      <div className="ai-data-stream">
        <span className="binary-text">{binaryStream}</span>
        <span className="status-badge">AI PROCESSING...</span>
      </div>

      {/* 4. The Log Terminal */}
      <div className="ai-log-terminal">
        {logs.map((log, index) => (
          <div key={index} className="log-entry animate-slide-up">
            <span className="log-index">[{String(index + 1).padStart(2, '0')}]</span>
            <span className="log-text">{log}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="log-entry pulse">
             <span className="log-index">[--]</span>
             <span className="log-text">Initializing Neural Pathways...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AILoader;
