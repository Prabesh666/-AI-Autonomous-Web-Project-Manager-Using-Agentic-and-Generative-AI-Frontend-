import React, { useState } from 'react';

const HITLApprovalModal = ({ job, onApprove, onReject, isProcessing }) => {
  const [reason, setReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!job || job.status !== 'pending_approval') return null;

  const { pendingResults } = job;
  const taskCount = pendingResults?.tasks?.tasks?.length || 0;
  const riskCount = pendingResults?.risks?.risks?.length || 0;

  const handleRejectClick = () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
    } else {
      onReject(job._id, reason);
      setShowRejectInput(false);
      setReason('');
    }
  };

  return (
    <div className="hitl-overlay" style={styles.overlay}>
      <div className="hitl-modal" style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>🤖 Strategic Plan Approval</h2>
          <p style={styles.subtitle}>The AI has architected a roadmap. Please review and authorize the data persistence.</p>
        </div>
        
        <div style={styles.content}>
          <div style={styles.stats}>
            <div className="hitl-stat" style={styles.statBox}>
              <span style={styles.statLabel}>Tasks</span>
              <span style={styles.statValue}>{taskCount}</span>
            </div>
            <div className="hitl-stat" style={styles.statBox}>
              <span style={styles.statLabel}>Risks</span>
              <span style={styles.statValue}>{riskCount}</span>
            </div>
            <div className="hitl-stat" style={styles.statBox}>
              <span style={styles.statLabel}>Engine</span>
              <span style={styles.statValue} style={{...styles.statValue, fontSize: '14px'}}>{pendingResults?.tier || 'L0'}</span>
            </div>
          </div>
          
          {pendingResults?.planner?.plan && !showRejectInput && (
            <div className="hitl-preview" style={styles.planPreview}>
              <h3 style={styles.previewTitle}>Executive Summary</h3>
              <p style={styles.previewText}>{pendingResults.planner.plan.slice(0, 400)}...</p>
            </div>
          )}

          {showRejectInput && (
            <div style={styles.rejectContainer}>
              <h3 style={{...styles.previewTitle, color: '#f43f5e'}}>Rejection Rationale</h3>
              <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px'}}>Your feedback helps the AI model adapt to your specific project needs.</p>
              <textarea 
                style={styles.textarea}
                placeholder="Why is this plan not suitable? (e.g., 'Missing the authentication layer')"
                value={reason}
                onChange={e => setReason(e.target.value)}
                disabled={isProcessing}
                rows={3}
              />
            </div>
          )}
        </div>

        <div style={styles.actions}>
          {showRejectInput && (
            <button 
              style={styles.btnSecondary} 
              onClick={() => { setShowRejectInput(false); setReason(''); }}
              disabled={isProcessing}
            >
              Cancel
            </button>
          )}
          <button 
            style={{...styles.btn, ...styles.rejectBtn}} 
            onClick={handleRejectClick}
            disabled={isProcessing || (showRejectInput && !reason.trim())}
          >
            {isProcessing ? 'Processing...' : (showRejectInput ? 'Confirm & Teach AI' : 'Reject Plan')}
          </button>
          {!showRejectInput && (
            <button 
              style={{...styles.btn, ...styles.approveBtn}} 
              onClick={() => onApprove(job._id)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Saving...' : 'Approve & Commit'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .hitl-modal {
          background: var(--bg-main);
          border: 1px solid var(--input-border);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .hitl-stat {
          background: var(--input-bg);
          border: 1px solid var(--input-border);
        }
        .hitl-preview {
          background: var(--input-bg);
          border: 1px solid var(--input-border);
        }
        [data-theme="dark"] .hitl-modal { background: #1e293b; border-color: #334155; }
        [data-theme="dark"] .hitl-stat { background: #0f172a; border-color: #334155; }
        [data-theme="dark"] .hitl-preview { background: #0f172a; border-color: #334155; }
      `}</style>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 9999, backdropFilter: 'blur(8px)'
  },
  modal: {
    borderRadius: '16px', padding: '32px',
    width: '90%', maxWidth: '550px',
    transition: 'all 0.3s ease'
  },
  header: { marginBottom: '24px', borderBottom: '1px solid var(--input-border)', paddingBottom: '16px' },
  title: { fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' },
  subtitle: { fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' },
  content: { marginBottom: '32px' },
  stats: { display: 'flex', gap: '16px', marginBottom: '20px' },
  statBox: {
    flex: 1, padding: '16px',
    borderRadius: '12px', display: 'flex', flexDirection: 'column',
    alignItems: 'center'
  },
  statLabel: { fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' },
  statValue: { fontSize: '22px', fontWeight: '900', color: 'var(--btn-primary)', marginTop: '4px' },
  planPreview: {
    padding: '20px', borderRadius: '12px',
    fontSize: '14px', lineHeight: '1.6'
  },
  previewTitle: { fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', marginTop: 0 },
  previewText: { margin: 0, color: 'var(--text-primary)', opacity: 0.9 },
  rejectContainer: {
    padding: '20px', borderRadius: '12px',
    border: '1px solid #f43f5e', background: 'rgba(244, 63, 94, 0.05)'
  },
  textarea: {
    width: '100%', padding: '12px', borderRadius: '8px',
    background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--input-border)',
    fontFamily: 'inherit', marginTop: '8px', resize: 'none', outline: 'none'
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  btn: {
    padding: '12px 20px', borderRadius: '10px', border: 'none',
    fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
  },
  btnSecondary: {
    background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: '600'
  },
  approveBtn: { background: 'var(--btn-primary)', color: 'white' },
  rejectBtn: { background: 'transparent', color: '#f43f5e', border: '1.5px solid #f43f5e' }
};

export default HITLApprovalModal;
