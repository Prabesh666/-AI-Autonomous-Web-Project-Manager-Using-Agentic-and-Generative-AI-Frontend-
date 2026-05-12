import React, { useEffect, useState } from 'react';

/**
 * 🌀 AgentFlowGraph (Module 2)
 * A premium, dependency-free SVG visualization of real-time AI "Neural Pulses".
 */
const AgentFlowGraph = ({ pulses = [] }) => {
  const [activePulse, setActivePulse] = useState(null);

  useEffect(() => {
    if (pulses.length > 0) {
      setActivePulse(pulses[pulses.length - 1]);
      const timer = setTimeout(() => setActivePulse(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [pulses]);

  // Node Positions (Responsive SVG coordinates)
  const nodes = {
    Planner: { x: 100, y: 150, color: '#3b82f6', icon: '🎯' },
    Auditor: { x: 400, y: 150, color: '#8b5cf6', icon: '👁️' },
    SRE: { x: 250, y: 300, color: '#ef4444', icon: '🛡️' },
    Architect: { x: 250, y: 50, color: '#10b981', icon: '🌀' }
  };

  return (
    <div className="agent-flow-graph" style={{ 
      width: '100%', height: '350px', 
      background: 'rgba(0,0,0,0.2)', borderRadius: '16px',
      position: 'relative', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <svg width="100%" height="100%" viewBox="0 0 500 350">
        {/* Connections */}
        <path d="M 100 150 L 400 150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
        <path d="M 100 150 L 250 300" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
        <path d="M 400 150 L 250 300" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
        <path d="M 250 50 L 100 150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
        <path d="M 250 50 L 400 150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="5,5" />

        {/* Pulse Animation */}
        {activePulse && nodes[activePulse.agent] && (
          <circle cx={nodes[activePulse.agent].x} cy={nodes[activePulse.agent].y} r="30" fill={nodes[activePulse.agent].color} opacity="0.3">
            <animate attributeName="r" from="15" to="50" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.3" to="0" dur="1s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Nodes */}
        {Object.entries(nodes).map(([name, pos]) => (
          <g key={name} transform={`translate(${pos.x},${pos.y})`}>
             <circle r="20" fill="#1e293b" stroke={pos.color} strokeWidth="2" />
             <text textAnchor="middle" dy=".3em" fontSize="16px">{pos.icon}</text>
             <text y="35" textAnchor="middle" fontSize="10px" fontWeight="700" fill="#9ca3af" style={{ textTransform: 'uppercase' }}>
               {name}
             </text>
          </g>
        ))}
      </svg>

      {/* Real-time Activity Overlay */}
      {activePulse && (
        <div style={{
          position: 'absolute', bottom: '20px', left: '20px',
          background: 'rgba(0,0,0,0.8)', padding: '10px 15px', borderRadius: '10px',
          borderLeft: `4px solid ${nodes[activePulse.agent]?.color || '#fff'}`,
          animation: 'pulseFadeIn 0.3s ease both'
        }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700 }}>
            {activePulse.agent.toUpperCase()} ACTIVE
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff' }}>{activePulse.step}</p>
        </div>
      )}

      <style>{`
        @keyframes pulseFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AgentFlowGraph;
