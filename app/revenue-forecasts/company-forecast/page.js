'use client';

export default function CompanyForecastPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#fff', borderBottom: '1px solid #d9dfe7', flexShrink: 0 }}>
        <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Company Forecast</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 14px', fontSize: '12px', fontWeight: 500, color: '#1e293b', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '4px', cursor: 'pointer' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#f1f5f9' }}>
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
          <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Company Forecast</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Company-level revenue forecast data will appear here.</div>
        </div>
      </div>

    </div>
  );
}
