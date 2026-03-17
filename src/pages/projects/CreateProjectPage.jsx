import { useState } from 'react';
import './CreateProjectPage.css';

const CreateProjectPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Simulate API delay, then ideally route to the actual project or AI Plan page
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="create-project-wrapper">
      <header className="create-header">
        <div className="breadcrumb">
          <span>Projects</span> / <strong>Create New AI Project</strong>
        </div>
      </header>

      <div className="creation-container">
        <div className="creation-card">
          <div className="icon-header">
            <span className="brain-icon">🧠</span>
          </div>
          
          <h1 className="creation-title">Describe Your Project Idea</h1>
          <p className="creation-desc">
            Our AI will analyze your prompt to generate a full project structure, including milestones, specific tasks, and suggested team roles.
          </p>

          <div className="prompt-area">
            <textarea 
              className="prompt-input"
              placeholder="Example: I want to build a task management web app for students that includes gamification features and calendar integration..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="action-row">
            <button 
              className={`btn-generate ${isGenerating ? 'generating' : ''}`}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span>
                  AI is generating milestones and tasks...
                </>
              ) : (
                'Generate AI Plan...'
              )}
            </button>
            <button className="btn-cancel" disabled={isGenerating}>Cancel</button>
          </div>

          <div className="quick-templates">
            <span className="templates-label">QUICK TEMPLATES</span>
            <div className="templates-row">
              <button className="template-btn" disabled={isGenerating}>💻 Web App</button>
              <button className="template-btn" disabled={isGenerating}>📱 Mobile App</button>
              <button className="template-btn" disabled={isGenerating}>🔬 Research Project</button>
              <button className="template-btn" disabled={isGenerating}>🛒 E-commerce</button>
            </div>
          </div>
        </div>

        <div className="trust-badges">
          <div className="badge-item">
            <div className="badge-icon">🛡️</div>
            <div>
              <strong>Secure Data</strong>
              <p>Your project ideas are private and protected.</p>
            </div>
          </div>
          <div className="badge-item">
            <div className="badge-icon">⚡</div>
            <div>
              <strong>Fast Generation</strong>
              <p>Get a complete roadmap in under 30 seconds.</p>
            </div>
          </div>
          <div className="badge-item">
            <div className="badge-icon">🧩</div>
            <div>
              <strong>Smart Integration</strong>
              <p>Syncs automatically with your team calendar.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
