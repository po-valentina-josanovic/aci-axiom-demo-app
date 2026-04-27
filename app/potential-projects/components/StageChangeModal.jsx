'use client';

const STAGE_BADGE_COLORS = {
  Preliminary: { bg: '#e8ecf1', color: '#5a6577', activeBg: '#5a6577' },
  Lead: { bg: '#dbe4f0', color: '#2979ff', activeBg: '#2979ff' },
  Budget: { bg: '#e0e7ff', color: '#4338ca', activeBg: '#4338ca' },
  Bid: { bg: '#f3e8ff', color: '#7c3aed', activeBg: '#7c3aed' },
  Pending: { bg: '#fef9c2', color: '#a36100', activeBg: '#d97706' },
  Award: { bg: '#dcfce7', color: '#15803d', activeBg: '#15803d' },
  Lost: { bg: '#ffe2e2', color: '#d32f2f', activeBg: '#d32f2f' },
  Cancel: { bg: '#e8ecf1', color: '#5a6577', activeBg: '#64748b' },
};

export default function StageChangeModal({ open, targetStage, missingFields, onConfirm, onCancel }) {
  if (!open || !missingFields || missingFields.length === 0) return null;

  const colors = STAGE_BADGE_COLORS[targetStage] || STAGE_BADGE_COLORS.Preliminary;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '480px', margin: '16px' }}>

        {/* Header */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg style={{ width: '20px', height: '20px', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Missing Required Fields</h2>
          </div>
          <p style={{ fontSize: '13px', color: '#5a6577', marginTop: '6px', margin: '6px 0 0 0' }}>
            The following fields are required for the{' '}
            <span style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 700,
              padding: '1px 8px',
              borderRadius: '4px',
              background: colors.activeBg,
              color: '#fff',
              verticalAlign: 'middle',
            }}>
              {targetStage}
            </span>
            {' '}stage:
          </p>
        </div>

        {/* Missing fields list */}
        <div style={{ padding: '14px 24px', maxHeight: '300px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {missingFields.map((field, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#1e293b',
                padding: '8px 12px',
                background: '#fef2f2',
                borderRadius: '6px',
                border: '1px solid #fecaca',
              }}>
                <svg style={{ width: '14px', height: '14px', color: '#d32f2f', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                </svg>
                {field.label}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '14px 24px', borderTop: '1px solid #d9dfe7', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '7px 14px', fontSize: '12px', color: '#3a4a5c',
              border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff',
              cursor: 'pointer', fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '7px 14px', fontSize: '12px', color: '#fff',
              border: 'none', borderRadius: '6px', background: colors.activeBg,
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Switch Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
