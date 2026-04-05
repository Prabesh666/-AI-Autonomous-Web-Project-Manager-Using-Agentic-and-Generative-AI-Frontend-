import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

/**
 * AI MEMORY PAGE (AiMemoryPage)
 * Displays a chronological audit trail of AI-driven decisions and actions.
 */
const AiMemoryPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for events - currently empty to handle non-mock data scenario
  // In a real application, this would be fetched from an API
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="animate-fadeIn space-y-8">
      
      {/* ── Header ────────────────────────────────── */}
      <div className={`
        flex flex-col md:flex-row justify-between items-start md:items-center gap-4
        p-8 rounded-[2rem] 
        ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-400 to-gray-600'} 
        text-white shadow-xl
      `}>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">AI Project Memory</h1>
          <p className="text-white/80 text-sm max-w-lg leading-relaxed">
            A chronological audit trail of all autonomous decisions, strategic pivots, and agent-driven actions within your project ecosystem.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Filter Activity
          </Button>
          <Button variant="primary" size="sm" className="bg-white text-gray-900 hover:bg-white/90">
            Export Audit
          </Button>
        </div>
      </div>

      {/* ── Timeline Section ──────────────────────── */}
      <div className="relative px-4">
        {/* Timeline Line */}
        {events.length > 0 && (
          <div className={`absolute left-10 top-0 bottom-0 w-0.5 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`} />
        )}
        
        {events.length === 0 ? (
          <EmptyState
            title="Memory is Empty"
            description="No autonomous actions or decisions have been logged for this project context yet. Run an AI agent to populate the audit trail."
            actionText="Go to AI Workspace"
            onAction={() => window.location.href = '/ai-planning'}
            icon={
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-12">
            {events.map((event, i) => (
              <div key={event.id} className="relative pl-16 group">
                {/* Timeline Dot */}
                <div className={`
                  absolute left-0 top-1 w-12 h-12 rounded-full z-10
                  flex items-center justify-center text-xl
                  bg-white dark:bg-gray-900 border-2
                  transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg
                `} style={{ borderColor: event.color }}>
                  {event.icon}
                </div>

                <Card 
                  hover 
                  className="!p-6"
                  actions={<span className="text-xs font-medium text-gray-400">{event.time}</span>}
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant={event.status === 'active' ? 'info' : 'success'} glow>
                      {event.status}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-400">
                      Agent: <span className="text-gray-900 dark:text-gray-200">{event.agent}</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{event.desc}</p>
                </Card>
              </div>
            ))}
            
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="md">
                Load More History
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AiMemoryPage;
