import JobHeader from "./JobHeader";
import JobTable from "./JobTable";

export default function JobSection({ jobId = "01-2135", jobDesc = "AVIENT: DSM-FIRMENICH-BLD 50 BATHROOM MODIFICAT..." }) {
  const tdStyle = {
    padding: '4px 8px',
    fontSize: '12px',
    color: '#1e293b',
    border: '1px solid #c8d1dc',
    textAlign: 'center',
  };

  const DATE_COLS = ["07/27/25", "08/03/25", "08/10/25", "08/17/25", "08/24/25", "08/31/25"];

  return (
    <div style={{ marginBottom: '6px' }}>
      {/* Job Header Row */}
      <JobHeader jobId={jobId} jobDesc={jobDesc} />

      {/* Expanded content */}
      <div style={{ padding: '8px 12px 8px 32px', background: '#fff', borderLeft: '2px solid #e3ecf7', borderRight: '1px solid #e3ecf7', borderBottom: '1px solid #e3ecf7' }}>
        {/* Update info */}
        <div style={{ fontSize: '11px', color: '#8694a7', marginBottom: '6px' }}>
          <span>Update: 11/06/25</span>
          <span style={{ marginLeft: '16px' }}>End Date: 12/31/25</span>
        </div>

        {/* Job name */}
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#2979ff', marginBottom: '8px' }}>
          DSM-FIRMENICH-BLD 50 BATHROOM MODIFICATIONS
        </div>

        {/* Trade breakdown table */}
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '8px' }}>
            <tbody>
              {['Pipe', 'Sheet Metal', 'Ironworkers (Steel)'].map((trade, idx) => (
                <tr key={trade} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ ...tdStyle, textAlign: 'left', width: '140px', fontWeight: 500 }}></td>
                  <td style={{ ...tdStyle, textAlign: 'left', width: '140px' }}>{trade}</td>
                  {DATE_COLS.map((_, i) => (
                    <td key={i} style={{
                      ...tdStyle,
                      color: i === 2 ? '#d32f2f' : '#1e293b',
                      fontWeight: i === 2 ? 500 : 400,
                    }}>
                      {i === 2 ? '0 (0)' : '0 (0)'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Manual Entry toggle + Total */}
        <div className="flex items-center gap-4" style={{ marginTop: '4px' }}>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '12px', color: '#5a6577' }}>
              <div
                style={{
                  width: '34px',
                  height: '18px',
                  borderRadius: '9px',
                  background: '#00796b',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: '18px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
              Manual Entry
            </label>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
            Total
          </div>
          <button
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              border: '1.5px solid #2979ff',
              background: '#fff',
              color: '#2979ff',
              fontSize: '14px',
              padding: 0,
            }}
          >
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v12m6-6H6" />
            </svg>
          </button>
          <div className="flex items-center gap-2" style={{ flex: 1 }}>
            {DATE_COLS.map((_, i) => (
              <span key={i} style={{ fontSize: '12px', color: '#1e293b', textAlign: 'center', flex: 1 }}>
                0 (0)
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
