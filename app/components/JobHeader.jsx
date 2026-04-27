export default function JobHeader({ jobId = "01-2135", jobDesc = "AVIENT: DSM-FIRMENICH-BLD 50 BATHROOM MODIFICAT..." }) {
  return (
    <div
      className="flex items-center"
      style={{
        border: '2px solid #2979ff',
        borderRadius: '4px',
        background: '#e8f4fd',
        margin: '0',
      }}
    >
      {/* Expand chevron */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: '32px', height: '36px', cursor: 'pointer' }}
      >
        <svg style={{ width: '14px', height: '14px', color: '#2979ff' }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Job number badge */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 10px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#fff',
          background: '#2979ff',
          borderRadius: '3px',
          marginRight: '10px',
          letterSpacing: '0.02em',
        }}
      >
        {jobId}
      </span>

      {/* Job description */}
      <span
        style={{
          flex: 1,
          fontSize: '12px',
          fontWeight: 600,
          color: '#2979ff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          paddingRight: '12px',
        }}
      >
        {jobDesc}
      </span>

      {/* Save changes button */}
      <button
        className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
        style={{
          marginRight: '10px',
          padding: '4px 12px',
          fontSize: '11px',
          fontWeight: 500,
          color: '#5a6577',
          background: '#fff',
          border: '1px solid #c8d1dc',
          borderRadius: '4px',
        }}
      >
        <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Save changes
      </button>
    </div>
  );
}
