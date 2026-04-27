'use client';

export default function UnsavedChangesModal({ open, onSave, onDiscard, onCancel, saveDisabled = false }) {
  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '440px', margin: '16px' }}
      >
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg style={{ width: '20px', height: '20px', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Unsaved changes</h2>
          </div>
          <p style={{ fontSize: '13px', color: '#5a6577', margin: '6px 0 0 0' }}>
            You have changes on this project that haven't been saved. What would you like to do?
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '14px 24px', borderTop: '1px solid #d9dfe7', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '7px 14px', fontSize: '12px', color: '#3a4a5c',
              border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff',
              cursor: 'pointer', fontWeight: 500,
            }}
          >
            Cancel action
          </button>
          <button
            onClick={onDiscard}
            style={{
              padding: '7px 14px', fontSize: '12px', color: '#fff',
              border: 'none', borderRadius: '6px', background: '#d32f2f',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Discard changes
          </button>
          <button
            onClick={onSave}
            disabled={saveDisabled}
            style={{
              padding: '7px 14px', fontSize: '12px', color: '#fff',
              border: 'none', borderRadius: '6px',
              background: saveDisabled ? '#8694a7' : '#2979ff',
              cursor: saveDisabled ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            Save and redirect
          </button>
        </div>
      </div>
    </div>
  );
}
