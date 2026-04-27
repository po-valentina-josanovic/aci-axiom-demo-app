const TRADES = [
  "Pipe",
  "Electrical",
];

const DATE_COLS = ["07/27/25", "08/03/25", "08/10/25", "08/17/25", "08/24/25", "08/31/25"];

const thStyle = {
  padding: '6px 10px',
  textAlign: 'center',
  fontWeight: 600,
  fontSize: '11px',
  color: '#1e293b',
  background: '#dbe4f0',
  border: '1px solid #c8d1dc',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '4px 8px',
  fontSize: '12px',
  color: '#1e293b',
  border: '1px solid #c8d1dc',
  textAlign: 'center',
};

const sectionHeaderStyle = {
  padding: '5px 10px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#1e293b',
  background: '#edf1f7',
  border: '1px solid #c8d1dc',
};

// Sample data matching the PNG
const RESOURCE_DATA = {
  Pipe: { values: ['11 (21)', '32 (21)', '46 (23)', '0 (0)', '53 (0)', '13 (0)'] },
  Electrical: { values: ['53 (0)', '70 (0)', '92 (0)', '0 (0)', '0 (14)', '0 (16)'] },
};

const TOTAL_ROW = { values: ['0 (21)', '0 (21)', '0 (23)', '0 (0)', '0 (14)', '0 (16)'] };

export default function JobTable() {
  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: 'left', minWidth: '140px' }}>Project</th>
            <th style={{ ...thStyle, textAlign: 'left', minWidth: '100px' }}>Trade</th>
            {DATE_COLS.map((d) => (
              <th key={d} style={{ ...thStyle, minWidth: '80px' }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Section: Total Resource Needs */}
          <tr>
            <td colSpan={2 + DATE_COLS.length} style={sectionHeaderStyle}>
              <span className="flex items-center gap-1.5 cursor-pointer">
                <svg style={{ width: '10px', height: '10px', color: '#1e293b' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 8l4 4 4-4" />
                </svg>
                Total Resource Needs
              </span>
            </td>
          </tr>

          {/* Trade rows */}
          {TRADES.map((trade, idx) => (
            <tr key={trade} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
              <td style={{ ...tdStyle, textAlign: 'left', color: '#5a6577' }}></td>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{trade}</td>
              {RESOURCE_DATA[trade].values.map((v, i) => (
                <td key={i} style={tdStyle}>{v}</td>
              ))}
            </tr>
          ))}

          {/* Total row */}
          <tr style={{ fontWeight: 700, background: '#f1f5f9' }}>
            <td style={{ ...tdStyle, textAlign: 'left' }}></td>
            <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 700 }}>Total</td>
            {TOTAL_ROW.values.map((v, i) => (
              <td key={i} style={tdStyle}>{v}</td>
            ))}
          </tr>

          {/* Empty spacer row */}
          <tr><td colSpan={2 + DATE_COLS.length} style={{ height: '4px', border: 'none', padding: 0 }}></td></tr>

          {/* Section: Goals */}
          <tr>
            <td colSpan={2 + DATE_COLS.length} style={sectionHeaderStyle}>
              <span className="flex items-center gap-1.5 cursor-pointer">
                <svg style={{ width: '10px', height: '10px', color: '#1e293b' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 8l4 4 4-4" />
                </svg>
                Goals
              </span>
            </td>
          </tr>
          {['Min Capacity', 'Max Capacity', 'Goal Capacity'].map((label, idx) => (
            <tr key={label} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
              <td style={{ ...tdStyle, textAlign: 'left', color: '#5a6577' }}></td>
              <td style={{ ...tdStyle, textAlign: 'left' }}>{label}</td>
              {DATE_COLS.map((_, i) => (
                <td key={i} style={tdStyle}>0</td>
              ))}
            </tr>
          ))}

          {/* Empty spacer row */}
          <tr><td colSpan={2 + DATE_COLS.length} style={{ height: '4px', border: 'none', padding: 0 }}></td></tr>

          {/* Section: Shop Call-ins */}
          <tr>
            <td colSpan={2 + DATE_COLS.length} style={sectionHeaderStyle}>
              <span className="flex items-center gap-1.5 cursor-pointer">
                <svg style={{ width: '10px', height: '10px', color: '#1e293b' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 8l4 4 4-4" />
                </svg>
                Shop Call-ins
              </span>
            </td>
          </tr>
          <tr style={{ background: '#e8f4fd' }}>
            <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500, color: '#2979ff' }}>Lorem Ipsum</td>
            <td style={tdStyle}></td>
            {DATE_COLS.map((_, i) => (
              <td key={i} style={tdStyle}>{i === 3 ? '10' : '0'}</td>
            ))}
          </tr>

          {/* Empty spacer row */}
          <tr><td colSpan={2 + DATE_COLS.length} style={{ height: '4px', border: 'none', padding: 0 }}></td></tr>

          {/* Section: Borrowed From Another Division */}
          <tr>
            <td colSpan={2 + DATE_COLS.length} style={sectionHeaderStyle}>
              <span className="flex items-center gap-1.5 cursor-pointer">
                <svg style={{ width: '10px', height: '10px', color: '#1e293b' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 8l4 4 4-4" />
                </svg>
                Borrowed From Another Division
              </span>
            </td>
          </tr>
          <tr style={{ background: '#e0f2f1' }}>
            <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500, color: '#00796b' }}>Construction Plumbing</td>
            <td style={tdStyle}></td>
            {DATE_COLS.map((_, i) => (
              <td key={i} style={{ ...tdStyle, color: '#00796b', fontWeight: 500 }}>0</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
