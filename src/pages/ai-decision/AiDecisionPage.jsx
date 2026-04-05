import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

/**
 * AI DECISION AGENT (AiDecisionPage)
 * Displays AI-recommended actions and alternative strategies.
 */
const AiDecisionPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for decision alternatives - currently empty to handle non-mock data scenario
  const [alternatives, setAlternatives] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  return (
    <div className="animate-fadeIn space-y-10 pb-16">
      
      {/* ── Recommendation Hero ✨ ────────────────── */}
      {recommendation ? (
        <div className={`
          relative overflow-hidden p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl
          ${isDark ? 'bg-gradient-to-br from-blue-900 to-indigo-900' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} 
          flex flex-col md:flex-row items-center gap-8 md:gap-12 transition-all duration-500 hover:scale-[1.01]
        `}>
          <div className="flex-1 space-y-6">
            <div className="flex gap-3 items-center">
              <Badge variant="indigo" glow className="bg-white/20 text-white border-white/30">
                ✨ AI Recommended Action
              </Badge>
              <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                Updated just now
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              {recommendation.title}
            </h1>
            
            <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
              {recommendation.description}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-xl shadow-black/10">
                Accept Recommendation
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md">
                Explain Logic
              </Button>
            </div>
          </div>

          {/* Confidence Circle */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-56 h-56 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-float">
            <div className="absolute inset-0 rounded-full border-8 border-white/10 border-t-white animate-spin-slow" />
            <div className="text-center">
              <div className="text-5xl font-black text-white">{recommendation.confidence}%</div>
              <div className="text-xs font-bold text-white/60 uppercase tracking-widest mt-1">Confidence</div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`
          p-12 rounded-[2.5rem] text-center border-2 border-dashed
          ${isDark ? 'bg-gray-800/20 border-gray-700/60' : 'bg-gray-50 border-gray-200'}
        `}>
          <div className="p-4 bg-blue-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">No Active Recommendations</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
            The decision engine needs more data to generate strategic optimizations. Execute more tasks or trigger the analysis pipeline to get started.
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/ai-planning'}>
            Execute AI Pipeline
          </Button>
        </div>
      )}

      {/* ── Alternatives Section ──────────────────── */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <span className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">⌥</span>
          Alternative Strategies
        </h2>
        
        {alternatives.length === 0 ? (
          <EmptyState 
            title="None available"
            description="The AI engine is currently only exploring the primary path based on the current project constraints."
            className="!p-16"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {alternatives.map(alt => (
              <Card key={alt.id} hover className="!p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-[14px]">
                      {alt.icon}
                    </div>
                    <Badge variant={alt.risk === 'LOW' ? 'success' : 'warning'} glow outline>
                      {alt.risk} Risk
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
                    {alt.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                    {alt.description}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-400">Success Propensity</span>
                  <span className={`font-black text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{alt.probability}%</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AiDecisionPage;
