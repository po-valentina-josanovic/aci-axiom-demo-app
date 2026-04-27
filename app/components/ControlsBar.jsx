export default function ControlsBar() {
  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 11px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#1e293b',
    background: '#fff',
    border: '1px solid #c8d1dc',
    borderRadius: '4px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const selectStyle = {
    display: 'block',
    border: '1px solid #c8d1dc',
    borderRadius: '4px',
    padding: '5px 10px',
    fontSize: '12px',
    background: '#fff',
    color: '#1e293b',
    cursor: 'pointer',
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: 600,
    color: '#5a6577',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginBottom: '2px',
  };

  return (
    <div
      className="flex items-end gap-3 flex-wrap"
      style={{
        padding: '8px 16px',
        background: '#fff',
        borderBottom: '1px solid #d9dfe7',
      }}
    >
      {/* Action buttons */}
      <button style={btnStyle}>
        <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
        Expand All
      </button>

      <button style={btnStyle}>
        <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        Sort by Job Number
      </button>

      <div style={{ width: '1px', height: '28px', background: '#d9dfe7', margin: '0 4px', alignSelf: 'center' }} />

      {/* Filter dropdowns with labels */}
      <div>
        <div style={labelStyle}>Company</div>
        <select style={{ ...selectStyle, minWidth: '60px' }}>
          <option>1</option>
        </select>
      </div>

      <div>
        <div style={labelStyle}>Departments</div>
        <select style={{ ...selectStyle, minWidth: '120px' }}>
          <option>0100 - DSM</option>
        </select>
      </div>

      <div>
        <div style={labelStyle}>Trades</div>
        <select style={{ ...selectStyle, minWidth: '70px' }}>
          <option>All</option>
        </select>
      </div>

      <div>
        <div style={labelStyle}>Jobs</div>
        <select style={{ ...selectStyle, minWidth: '100px', color: '#8694a7' }}>
          <option>Select Job</option>
        </select>
      </div>

      <div style={{ width: '1px', height: '28px', background: '#d9dfe7', margin: '0 4px', alignSelf: 'center' }} />

      {/* Date Range */}
      <div>
        <div style={labelStyle}>Date Range</div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1" style={{ position: 'relative' }}>
            <svg style={{ width: '13px', height: '13px', color: '#8694a7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              defaultValue="2025-09-09"
              style={{
                ...selectStyle,
                width: '118px',
                padding: '4px 8px',
              }}
            />
          </div>
          <span style={{ fontSize: '11px', color: '#8694a7' }}>to</span>
          <div className="flex items-center gap-1">
            <svg style={{ width: '13px', height: '13px', color: '#8694a7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              defaultValue="2025-09-15"
              style={{
                ...selectStyle,
                width: '118px',
                padding: '4px 8px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Apply Filters */}
      <button
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 14px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#fff',
          background: '#2979ff',
          border: '1px solid #2979ff',
          borderRadius: '4px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Apply Filters
      </button>
    </div>
  );
}
