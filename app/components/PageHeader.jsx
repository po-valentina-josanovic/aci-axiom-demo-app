export default function PageHeader() {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '10px 16px',
        background: '#fff',
        borderBottom: '1px solid #d9dfe7',
      }}
    >
      <div className="flex items-center gap-4">
        <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Awarded Manpower
        </h1>
        <div className="flex items-center gap-3" style={{ fontSize: '12px' }}>
          <span style={{ color: '#5a6577' }}>View:</span>
          <button
            className="flex items-center gap-1 cursor-pointer"
            style={{ color: '#2979ff', fontWeight: 600, fontSize: '12px', background: 'none', border: 'none', padding: 0 }}
          >
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Timeline
          </button>
          <button
            className="flex items-center gap-1 cursor-pointer"
            style={{ color: '#8694a7', fontSize: '12px', background: 'none', border: 'none', padding: 0 }}
          >
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Graph
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-1.5 cursor-pointer"
          style={{
            padding: '5px 14px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#00796b',
            background: '#fff',
            border: '1px solid #80cbc4',
            borderRadius: '4px',
          }}
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Capacity Settings
        </button>
        <button
          className="flex items-center gap-1.5 cursor-pointer"
          style={{
            padding: '5px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#fff',
            background: '#2979ff',
            border: '1px solid #2979ff',
            borderRadius: '4px',
          }}
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Job
        </button>
      </div>
    </div>
  );
}
