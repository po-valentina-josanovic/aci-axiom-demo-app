'use client';

import { useState, useMemo } from 'react';

// ─── Month helpers ────────────────────────────────────────────────────────────

const MONTH_NAMES_DF = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthsDF(fromStr, toStr) {
  const [fm, fy] = fromStr.split('-').map(Number);
  const [tm, ty] = toStr.split('-').map(Number);
  const months = [];
  let y = fy, m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    months.push({ key: `${y}-${m}`, year: y, label: MONTH_NAMES_DF[m - 1] });
    if (++m > 12) { m = 1; y++; }
  }
  return months;
}

function yearGroupsDF(months) {
  return months.reduce((acc, m) => {
    const last = acc[acc.length - 1];
    if (last && last.year === m.year) last.count++;
    else acc.push({ year: m.year, count: 1 });
    return acc;
  }, []);
}

const fmtDF = (n) => n == null ? '' : Number(n).toLocaleString();

// ─── Sample data ──────────────────────────────────────────────────────────────

const UNDER_CONTRACT_DF = [
  { jobNum: '08-3370', jobName: 'CANTERBURY:HIRAM DAVIS SM',   revBacklog: 3849,  gmPct: 14.8,  proGmPct: 23.09,  gmDollar: 568,  lastRF: 'N/A' },
  { jobNum: '08-3334', jobName: 'SKOOKUM:8 8402 MNS SYSTEM',   revBacklog: 30988, gmPct: 11.9,  proGmPct: -7.53,  gmDollar: 3688, lastRF: 'N/A' },
  { jobNum: '08-3322', jobName: 'BUNGE:INSTALL INBOUND OIL',    revBacklog: 26595, gmPct: 34.8,  proGmPct: 36.09,  gmDollar: 9258, lastRF: 'N/A' },
  { jobNum: '08-3299', jobName: 'CHIPPENHAM: SHOWER PANS A',    revBacklog: 30620, gmPct: 19.5,  proGmPct: 5.29,   gmDollar: 5965, lastRF: 'N/A' },
  { jobNum: '08-3241', jobName: 'MARUCHAN:REPLACE 2 FLOUR',     revBacklog: 16514, gmPct: 31.1,  proGmPct: 31.05,  gmDollar: 5128, lastRF: 'N/A' },
  { jobNum: '08-3222', jobName: 'BARTONMALOW:DOMINION HVL',     revBacklog: 0,     gmPct: 25.1,  proGmPct: 47.30,  gmDollar: 0,    lastRF: 'N/A' },
  { jobNum: '08-3118', jobName: 'SKOOKUM:88401 MNS SYSTEM',     revBacklog: 0,     gmPct: -0.2,  proGmPct: -2.27,  gmDollar: 0,    lastRF: 'N/A' },
  { jobNum: '08-3021', jobName: 'JAPANESECLASSICS:PAINT BO',    revBacklog: 0,     gmPct: 1.4,   proGmPct: -29.77, gmDollar: 0,    lastRF: 'N/A' },
  { jobNum: '08-2951', jobName: 'BONSECOURS:RCH REPLACE GR',    revBacklog: 0,     gmPct: 21.1,  proGmPct: 21.05,  gmDollar: 0,    lastRF: 'N/A' },
  { jobNum: '08-2900', jobName: 'GENERAL DYNAMICS: BLDG 502',   revBacklog: 18410, gmPct: 22.4,  proGmPct: 22.40,  gmDollar: 4124, lastRF: 'N/A' },
];

const PRECON_DF = [
  { jobName: 'Richmond Convention Center Expansion', type: 'precon',  totalValue: 0, confidence: 75.0,  adjRevBacklog: 0, gmPct: 0.0, gmDollar: 0 },
  { jobName: 'Norfolk Naval Station HVAC Upgrade',   type: 'precon',  totalValue: 0, confidence: 40.0,  adjRevBacklog: 0, gmPct: 0.0, gmDollar: 0 },
  { jobName: 'Daleville MOB',                        type: 'regular', totalValue: 0, confidence: 100.0, adjRevBacklog: 0, gmPct: 0.0, gmDollar: 0 },
  { jobName: 'VT Chiller Plant',                     type: 'regular', totalValue: 0, confidence: 85.0,  adjRevBacklog: 0, gmPct: 0.0, gmDollar: 0 },
];

// ─── Shared table primitives ──────────────────────────────────────────────────

const thSortDF  = { padding: '7px 10px', fontSize: '12px', fontWeight: 600, color: '#1e293b', background: '#eeeeee', border: '1px solid #d1dce7', whiteSpace: 'nowrap', cursor: 'pointer', textAlign: 'center', userSelect: 'none' };
const tdDF      = { padding: '6px 10px', fontSize: '12px', border: '1px solid #e2e8f0', textAlign: 'center', whiteSpace: 'nowrap', color: '#1e293b' };

function SortIconDF({ dir }) {
  if (!dir) return <span style={{ color: '#b0bec5', marginLeft: 3, fontSize: 10 }}>⇅</span>;
  return <span style={{ marginLeft: 3, fontSize: 10 }}>{dir === 'asc' ? '↑' : '↓'}</span>;
}

function PaginationDF({ total, page, perPage, onPage }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const from  = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to    = Math.min(page * perPage, total);
  const nums  = Array.from({ length: Math.min(pages, 14) }, (_, i) => i + 1);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: '#5a6577' }}>
      <span>Showing {from} to {to} of {total} entries</span>
      <div style={{ display: 'flex', gap: '3px' }}>
        <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
          style={{ padding: '3px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '4px', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#c8d1dc' : '#1e293b' }}>Previous</button>
        {nums.map(n => (
          <button key={n} onClick={() => onPage(n)}
            style={{ padding: '3px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '4px', background: n === page ? '#2979ff' : '#fff', color: n === page ? '#fff' : '#1e293b', cursor: 'pointer', fontWeight: n === page ? 600 : 400 }}>{n}</button>
        ))}
        <button onClick={() => onPage(Math.min(pages, page + 1))} disabled={page === pages}
          style={{ padding: '3px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '4px', background: '#fff', cursor: page === pages ? 'not-allowed' : 'pointer', color: page === pages ? '#c8d1dc' : '#1e293b' }}>Next</button>
      </div>
    </div>
  );
}

// Returns cumulative left offsets for sticky positioning
function calcStickyLefts(cols) {
  let left = 0;
  return cols.map(col => { const l = left; left += (col.minWidth || 0); return l; });
}

// Render data cells for timeline columns (all zeroes for demo)
function MonthCells({ months, layout }) {
  const showRev = layout !== 'Margin Only';
  const showMar = layout !== 'Revenue Only';
  if (layout === 'Revenue & Margin Grouped') {
    return (
      <>
        {months.map(m => <td key={`r-${m.key}`} style={tdDF}>0</td>)}
        {months.map(m => <td key={`a-${m.key}`} style={tdDF}>0</td>)}
      </>
    );
  }
  return months.flatMap(m => {
    const cells = [];
    if (showRev) cells.push(<td key={`r-${m.key}`} style={tdDF}>0</td>);
    if (showMar) cells.push(<td key={`a-${m.key}`} style={tdDF}>0</td>);
    return cells;
  });
}

// ─── Shared 3-row table header ────────────────────────────────────────────────
// cols: [{ label, minWidth, align?, sortKey? }]
// sortState: { key, dir } — optional, only for sortable tables
// onSort: (key) => void — optional

function TableHeaderDF({ cols, months, layout, sortState, onSort }) {
  const isGrouped = layout === 'Revenue & Margin Grouped';
  const showRev = layout !== 'Margin Only';
  const showMar = layout !== 'Revenue Only';
  const colsPerMonth = isGrouped ? 1 : (showRev && showMar ? 2 : 1);
  const groups = yearGroupsDF(months);
  const fixedCount = cols.length;
  const fixedRowSpan = isGrouped ? 1 : 2;
  const lefts = calcStickyLefts(cols);
  const totalFixedWidth = lefts[lefts.length - 1] + (cols[cols.length - 1]?.minWidth || 0);

  const gTh = { background: '#eeeeee', border: '1px solid #d1dce7', padding: '5px 8px', fontSize: '11px', fontWeight: 600, color: '#1e293b', textAlign: 'center', whiteSpace: 'nowrap' };
  const wTh = { ...thSortDF, background: '#fff', verticalAlign: 'middle' };
  const stickyRight = { boxShadow: '2px 0 4px rgba(0,0,0,0.08)' }; // shadow on last fixed col

  const fixedCells = cols.map((col, i) => (
    <th key={i} rowSpan={fixedRowSpan}
      onClick={col.sortKey && onSort ? () => onSort(col.sortKey) : undefined}
      style={{
        ...wTh,
        textAlign: col.align || 'center',
        minWidth: col.minWidth,
        cursor: col.sortKey && onSort ? 'pointer' : 'default',
        position: 'sticky', left: lefts[i], zIndex: 3, background: '#fff',
        ...(i === cols.length - 1 ? stickyRight : {}),
      }}>
      {col.label}
      {col.sortKey && onSort && <SortIconDF dir={sortState?.key === col.sortKey ? sortState?.dir : null} />}
    </th>
  ));

  const row1FixedCell = (
    <th colSpan={fixedCount} style={{ ...gTh, position: 'sticky', left: 0, zIndex: 3, minWidth: totalFixedWidth }}></th>
  );

  if (isGrouped) {
    return (
      <>
        <tr>
          {row1FixedCell}
          <th colSpan={months.length} style={gTh}>Revenue</th>
          <th colSpan={months.length} style={gTh}>Margin</th>
        </tr>
        <tr>
          {fixedCells}
          {months.map(m => <th key={`rv-${m.key}`} style={{ ...gTh, minWidth: 46 }}>{m.label}</th>)}
          {months.map(m => <th key={`mr-${m.key}`} style={{ ...gTh, minWidth: 46 }}>{m.label}</th>)}
        </tr>
      </>
    );
  }

  return (
    <>
      <tr>
        {row1FixedCell}
        {groups.map((g, gi) => (
          <th key={g.year} colSpan={g.count * colsPerMonth} style={{ ...gTh, background: gi % 2 === 0 ? '#eeeeee' : '#e0e0e0' }}>
            {g.year}
          </th>
        ))}
      </tr>
      <tr>
        {fixedCells}
        {months.map(m => <th key={m.key} colSpan={colsPerMonth} style={{ ...gTh, minWidth: 46 }}>{m.label}</th>)}
      </tr>
      <tr>
        {months.flatMap(m => {
          const cells = [];
          if (showRev) cells.push(<th key={`rv-${m.key}`} style={{ ...gTh, fontSize: '10px', minWidth: 46 }}>Revenue</th>);
          if (showMar) cells.push(<th key={`mr-${m.key}`} style={{ ...gTh, fontSize: '10px', minWidth: 46 }}>Margin</th>);
          return cells;
        })}
      </tr>
    </>
  );
}

// ─── Section: Total ───────────────────────────────────────────────────────────

function TotalSectionDF({ months, layout }) {
  const totRev = UNDER_CONTRACT_DF.reduce((s, r) => s + r.revBacklog, 0);
  const totGm  = UNDER_CONTRACT_DF.reduce((s, r) => s + r.gmDollar, 0);
  const totPct = totRev > 0 ? ((totGm / totRev) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Total</div>
      {(() => {
        const COLS = [
          { label: '', minWidth: 200, align: 'left' },
          { label: 'Revenue Backlog', minWidth: 120 },
          { label: 'GM%', minWidth: 65 },
          { label: 'GM $$', minWidth: 80 },
          { label: 'Last RF Submit', minWidth: 110 },
        ];
        const sl = calcStickyLefts(COLS);
        const bg = '#f5f5f5';
        const sTd = (i, extra = {}) => ({ ...tdDF, position: 'sticky', left: sl[i], zIndex: 1, background: bg, ...(i === COLS.length - 1 ? { boxShadow: '2px 0 4px rgba(0,0,0,0.08)' } : {}), ...extra });
        return (
          <div style={{ overflowX: 'auto', border: '1px solid #d1dce7', borderRadius: '6px' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, fontSize: '12px', width: '100%' }}>
              <thead><TableHeaderDF cols={COLS} months={months} layout={layout} /></thead>
              <tbody>
                <tr style={{ fontWeight: 700, background: bg }}>
                  <td style={sTd(0, { textAlign: 'left', fontWeight: 700 })}>TOTALS</td>
                  <td style={sTd(1)}>{fmtDF(totRev)}</td>
                  <td style={sTd(2)}>{totPct}%</td>
                  <td style={sTd(3)}>{fmtDF(totGm)}</td>
                  <td style={sTd(4)}></td>
                  <MonthCells months={months} layout={layout} />
                </tr>
              </tbody>
            </table>
          </div>
        );
      })()}
      <PaginationDF total={1} page={1} perPage={10} onPage={() => {}} />
    </div>
  );
}

// ─── Section: Under Contract ──────────────────────────────────────────────────

function UnderContractDF({ months, layout }) {
  const [page, setPage]     = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const TOTAL_ENTRIES = 140;

  function handleSort(k) {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return UNDER_CONTRACT_DF;
    return [...UNDER_CONTRACT_DF].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [sortKey, sortDir]);

  const totRev = UNDER_CONTRACT_DF.reduce((s, r) => s + r.revBacklog, 0);
  const totGm  = UNDER_CONTRACT_DF.reduce((s, r) => s + r.gmDollar, 0);
  const totPct = totRev > 0 ? ((totGm / totRev) * 100).toFixed(1) : '0.0';


  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Under Contract</span>
        <input type="checkbox" defaultChecked style={{ accentColor: '#2979ff' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', color: '#5a6577' }}>
        Show
        <select defaultValue={10} style={{ padding: '2px 6px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '4px', color: '#1e293b' }}>
          {[10,25,50,100].map(n => <option key={n}>{n}</option>)}
        </select>
        entries
      </div>
      {(() => {
        const COLS = [
          { label: 'Job Name',        minWidth: 200, align: 'left', sortKey: 'jobName' },
          { label: 'Revenue Backlog', minWidth: 120, sortKey: 'revBacklog' },
          { label: 'GM%',             minWidth: 65,  sortKey: 'gmPct' },
          { label: 'Pro. GM%',        minWidth: 75,  sortKey: 'proGmPct' },
          { label: 'GM $$',           minWidth: 80,  sortKey: 'gmDollar' },
          { label: 'Last RF Submit',  minWidth: 110, sortKey: 'lastRF' },
        ];
        const sl = calcStickyLefts(COLS);
        const shadow = { boxShadow: '2px 0 4px rgba(0,0,0,0.08)' };
        const sTd = (i, bg, extra = {}) => ({ ...tdDF, position: 'sticky', left: sl[i], zIndex: 1, background: bg, ...(i === COLS.length - 1 ? shadow : {}), ...extra });
        return (
          <div style={{ overflowX: 'auto', border: '1px solid #d1dce7', borderRadius: '6px' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, fontSize: '12px' }}>
              <thead>
                <TableHeaderDF cols={COLS} months={months} layout={layout} sortState={{ key: sortKey, dir: sortDir }} onSort={handleSort} />
              </thead>
              <tbody>
                {sorted.map((row, idx) => {
                  const bg = idx % 2 === 0 ? '#fff' : '#f5f5f5';
                  return (
                    <tr key={row.jobNum} style={{ background: bg }}>
                      <td style={sTd(0, bg, { textAlign: 'left', color: '#2979ff', overflow: 'hidden', textOverflow: 'ellipsis' })}>{row.jobName}</td>
                      <td style={tdDF}>{fmtDF(row.revBacklog)}</td>
                      <td style={{ ...tdDF, color: row.gmPct < 0 ? '#ef4444' : '#1e293b' }}>{row.gmPct}%</td>
                      <td style={{ ...tdDF, color: row.proGmPct < 0 ? '#ef4444' : '#1e293b' }}>{row.proGmPct}%</td>
                      <td style={tdDF}>{fmtDF(row.gmDollar)}</td>
                      <td style={tdDF}>{row.lastRF}</td>
                      <MonthCells months={months} layout={layout} />
                    </tr>
                  );
                })}
                <tr style={{ background: '#f5f5f5' }}>
                  <td style={sTd(0, '#f5f5f5', { textAlign: 'left', color: '#5a6577', fontStyle: 'italic' })}>The Rest</td>
                  <td style={tdDF}>0</td><td style={tdDF}>0.0%</td><td style={tdDF}></td>
                  <td style={tdDF}>0</td><td style={tdDF}></td>
                  <MonthCells months={months} layout={layout} />
                </tr>
                <tr style={{ background: '#f0f0f0', fontWeight: 700 }}>
                  <td style={sTd(0, '#f0f0f0', { textAlign: 'left', fontWeight: 700 })}>Total</td>
                  <td style={{ ...tdDF, fontWeight: 700 }}>{fmtDF(totRev)}</td>
                  <td style={{ ...tdDF, fontWeight: 700 }}>{totPct}%</td>
                  <td style={tdDF}></td>
                  <td style={{ ...tdDF, fontWeight: 700 }}>{fmtDF(totGm)}</td>
                  <td style={tdDF}></td>
                  <MonthCells months={months} layout={layout} />
                </tr>
              </tbody>
            </table>
          </div>
        );
      })()}
      <PaginationDF total={TOTAL_ENTRIES} page={page} perPage={10} onPage={setPage} />
      <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 600, color: '#d97706' }}>
        No POC - {fmtDF(6545580)}
      </div>
    </div>
  );
}

// ─── Section: PreCon ─────────────────────────────────────────────────────────

function PreConSectionDF({ months, layout }) {
  const [page, setPage] = useState(1);
  const [confidences, setConfidences] = useState(PRECON_DF.map(r => r.confidence));

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>PreCon</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#5a6577' }}>
          Show
          <select defaultValue={10} style={{ padding: '2px 6px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '4px', color: '#1e293b' }}>
            {[10,25,50,100].map(n => <option key={n}>{n}</option>)}
          </select>
          entries
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px' }}>
          <span style={{ color: '#FB601E', fontWeight: 600 }}>Confidence under 50%</span>
          <span style={{ color: '#F5da3F', fontWeight: 600 }}>Confidence between 50% and 99%</span>
          <span style={{ color: '#00a65a', fontWeight: 600 }}>Confidence at 100%</span>
        </div>
      </div>
      {(() => {
        const COLS = [
          { label: 'Job Name',            minWidth: 200, align: 'left' },
          { label: 'Total Value',          minWidth: 100 },
          { label: 'Confidence %',         minWidth: 110 },
          { label: 'Adj Revenue Backlog',  minWidth: 150 },
          { label: 'GM%',                  minWidth: 65 },
          { label: 'GM $$',                minWidth: 80 },
        ];
        const sl = calcStickyLefts(COLS);
        const shadow = { boxShadow: '2px 0 4px rgba(0,0,0,0.08)' };
        const sTd = (i, bg, extra = {}) => ({ ...tdDF, position: 'sticky', left: sl[i], zIndex: 1, background: bg, ...(i === COLS.length - 1 ? shadow : {}), ...extra });
        return (
          <div style={{ overflowX: 'auto', border: '1px solid #d1dce7', borderRadius: '6px' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, fontSize: '12px' }}>
              <thead><TableHeaderDF cols={COLS} months={months} layout={layout} /></thead>
              <tbody>
                {PRECON_DF.map((row, idx) => {
                  const bg = idx % 2 === 0 ? '#fff' : '#f5f5f5';
                  return (
                    <tr key={idx} style={{ background: bg }}>
                      <td style={sTd(0, bg, { textAlign: 'left', fontWeight: 600, borderLeft: row.type === 'regular' ? '4px solid #006298' : tdDF.border })}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ flex: 1 }}>{row.jobName}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            {row.type === 'regular' && (
                              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '10px', background: '#006298', color: '#fff' }}>
                                Manual
                              </span>
                            )}
                            <input type="checkbox" defaultChecked style={{ accentColor: '#2979ff' }} />
                          </div>
                        </div>
                      </td>
                      <td style={sTd(1, bg)}>{fmtDF(row.totalValue)}</td>
                      <td style={sTd(2, bg, { padding: '2px 6px' })}>
                        <input type="text" value={`${confidences[idx]}%`}
                          onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) { const c = [...confidences]; c[idx] = v; setConfidences(c); } }}
                          style={{ width: '70px', padding: '3px 6px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '4px', textAlign: 'center', color: '#1e293b' }} />
                      </td>
                      <td style={sTd(3, bg)}>{fmtDF(row.adjRevBacklog)}</td>
                      <td style={sTd(4, bg)}>{row.gmPct}%</td>
                      <td style={sTd(5, bg)}>{fmtDF(row.gmDollar)}</td>
                      <MonthCells months={months} layout={layout} />
                    </tr>
                  );
                })}
                <tr style={{ background: '#f0f0f0', fontWeight: 700 }}>
                  <td style={sTd(0, '#f0f0f0', { textAlign: 'left', fontWeight: 700 })}>Total</td>
                  <td style={sTd(1, '#f0f0f0', { fontWeight: 700 })}>0</td>
                  <td style={sTd(2, '#f0f0f0', { fontWeight: 700 })}>0</td>
                  <td style={sTd(3, '#f0f0f0', { fontWeight: 700 })}>0</td>
                  <td style={sTd(4, '#f0f0f0', { fontWeight: 700 })}>0.0%</td>
                  <td style={sTd(5, '#f0f0f0', { fontWeight: 700 })}>0</td>
                  <MonthCells months={months} layout={layout} />
                </tr>
              </tbody>
            </table>
          </div>
        );
      })()}
      <PaginationDF total={PRECON_DF.length} page={page} perPage={10} onPage={setPage} />
    </div>
  );
}

// ─── Section: Plug ────────────────────────────────────────────────────────────

function PlugSectionDF({ months, layout }) {

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Plug</div>
      {(() => {
        const COLS = [
          { label: 'Job Name',        minWidth: 200, align: 'left' },
          { label: 'Revenue Backlog', minWidth: 120 },
          { label: 'GM%',             minWidth: 65 },
          { label: 'GM $$',           minWidth: 80 },
          { label: 'Last RF Submit',  minWidth: 110 },
        ];
        const sl = calcStickyLefts(COLS);
        const shadow = { boxShadow: '2px 0 4px rgba(0,0,0,0.08)' };
        const bg = '#f0f0f0';
        const sTd = (i, extra = {}) => ({ ...tdDF, position: 'sticky', left: sl[i], zIndex: 1, background: bg, ...(i === COLS.length - 1 ? shadow : {}), ...extra });
        return (
          <div style={{ overflowX: 'auto', border: '1px solid #d1dce7', borderRadius: '6px' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, fontSize: '12px', width: '100%' }}>
              <thead><TableHeaderDF cols={COLS} months={months} layout={layout} /></thead>
              <tbody>
                <tr style={{ background: bg, fontWeight: 700 }}>
                  <td style={sTd(0, { textAlign: 'left', fontWeight: 700 })}>Total</td>
                  <td style={sTd(1, { fontWeight: 700 })}>0</td>
                  <td style={sTd(2, { fontWeight: 700 })}>0.0%</td>
                  <td style={sTd(3, { fontWeight: 700 })}>0</td>
                  <td style={sTd(4)}></td>
                  <MonthCells months={months} layout={layout} />
                </tr>
              </tbody>
            </table>
          </div>
        );
      })()}
      <PaginationDF total={0} page={1} perPage={10} onPage={() => {}} />
      <button style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#1a5276', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        + Add Job
      </button>
    </div>
  );
}

const DEPARTMENTS = [
  '100 - Roanoke',
  '200 - Richmond',
  '300 - Norfolk',
  '400 - Charlotte',
];

const TABLE_LAYOUTS = ['Original', 'Revenue Only', 'Margin Only', 'Revenue & Margin Grouped'];

const LAYOUT_INFO = {
  'Original': {
    description: 'Revenue and Margin columns are interleaved — each month groups its Revenue and Margin side by side.',
    topHeaders: [
      { label: 'Job Name', rowSpan: 2, colSpan: 1, type: 'label' },
      { label: 'Month 1', colSpan: 2, type: 'month' },
      { label: 'Month 2', colSpan: 2, type: 'month' },
      { label: 'Month 3', colSpan: 2, type: 'month' },
    ],
    subHeaders: ['Revenue', 'Margin', 'Revenue', 'Margin', 'Revenue', 'Margin'],
    subTypes:   ['rev', 'margin', 'rev', 'margin', 'rev', 'margin'],
    rows: [
      ['Job 1', '—', '—', '—', '—', '—', '—'],
      ['Job 2', '—', '—', '—', '—', '—', '—'],
    ],
    cellTypes: ['rev', 'margin', 'rev', 'margin', 'rev', 'margin'],
  },
  'Revenue Only': {
    description: 'Margin columns are hidden — only revenue per month is shown.',
    topHeaders: [
      { label: 'Job Name', rowSpan: 2, colSpan: 1, type: 'label' },
      { label: 'Month 1', colSpan: 1, type: 'month' },
      { label: 'Month 2', colSpan: 1, type: 'month' },
      { label: 'Month 3', colSpan: 1, type: 'month' },
    ],
    subHeaders: ['Revenue', 'Revenue', 'Revenue'],
    subTypes:   ['rev',     'rev',     'rev'],
    rows: [
      ['Job 1', '—', '—', '—'],
      ['Job 2', '—', '—', '—'],
    ],
    cellTypes: ['rev', 'rev', 'rev'],
  },
  'Margin Only': {
    description: 'Revenue columns are hidden — only margin per month is shown.',
    topHeaders: [
      { label: 'Job Name', rowSpan: 2, colSpan: 1, type: 'label' },
      { label: 'Month 1', colSpan: 1, type: 'month' },
      { label: 'Month 2', colSpan: 1, type: 'month' },
      { label: 'Month 3', colSpan: 1, type: 'month' },
    ],
    subHeaders: ['Margin', 'Margin', 'Margin'],
    subTypes:   ['margin', 'margin', 'margin'],
    rows: [
      ['Job 1', '—', '—', '—'],
      ['Job 2', '—', '—', '—'],
    ],
    cellTypes: ['margin', 'margin', 'margin'],
  },
  'Revenue & Margin Grouped': {
    description: 'All Revenue months are grouped together first, then all Margin months — easier to scan each metric across the full date range.',
    topHeaders: [
      { label: 'Job Name', rowSpan: 2, colSpan: 1, type: 'label' },
      { label: 'Revenue', colSpan: 3, type: 'rev' },
      { label: 'Margin',  colSpan: 3, type: 'margin' },
    ],
    subHeaders: ['Month 1', 'Month 2', 'Month 3', 'Month 1', 'Month 2', 'Month 3'],
    subTypes:   ['rev',  'rev',  'rev',  'margin', 'margin', 'margin'],
    rows: [
      ['Job 1', '—', '—', '—', '—', '—', '—'],
      ['Job 2', '—', '—', '—', '—', '—', '—'],
    ],
    cellTypes: ['rev', 'rev', 'rev', 'margin', 'margin', 'margin'],
  },
};

function LayoutInfoModal({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingLeft: '220px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          width: '1100px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px',
          borderBottom: '1px solid #d9dfe7',
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Table Layout Guide</div>
            <div style={{ fontSize: '12px', color: '#5a6577', marginTop: '2px' }}>Each layout arranges the same data differently to suit different workflows.</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6577', fontSize: '20px', lineHeight: 1, padding: '4px' }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '10px 24px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', color: '#5a6577', fontWeight: 600 }}>Legend:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#1e40af' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '2px' }} />
            Revenue
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#166534' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '2px' }} />
            Margin
          </span>
        </div>

        <div style={{ padding: '14px 24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {TABLE_LAYOUTS.map((name) => {
            const info = LAYOUT_INFO[name];
            return (
              <div key={name} style={{ border: '1px solid #d9dfe7', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{
                  padding: '9px 14px',
                  background: '#f5f5f5',
                  borderBottom: '1px solid #d9dfe7',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{
                    padding: '2px 8px', fontSize: '11px', fontWeight: 700,
                    color: '#fff', background: '#2979ff', borderRadius: '4px',
                  }}>{name}</span>
                </div>

                <div style={{ padding: '10px 14px 8px', fontSize: '12px', color: '#3a4a5c', lineHeight: 1.5 }}>
                  {info.description}
                </div>

                <div style={{ padding: '0 14px 14px' }}>
                  <table style={{ borderCollapse: 'collapse', fontSize: '10px', width: '100%', tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        {info.topHeaders.map((h, i) => {
                          const bg = h.type === 'rev' ? '#dbeafe' : h.type === 'margin' ? '#dcfce7' : '#f1f5f9';
                          const color = h.type === 'rev' ? '#1e40af' : h.type === 'margin' ? '#166534' : '#475569';
                          const border = h.type === 'rev' ? '#bfdbfe' : h.type === 'margin' ? '#bbf7d0' : '#e2e8f0';
                          return (
                            <th key={i} colSpan={h.colSpan} rowSpan={h.rowSpan} style={{
                              padding: '3px 4px', background: bg, color, fontWeight: 600,
                              textAlign: i === 0 ? 'left' : 'center',
                              border: '1px solid ' + border, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{h.label}</th>
                          );
                        })}
                      </tr>
                      <tr>
                        {info.subHeaders.map((sub, i) => {
                          const t = info.subTypes[i];
                          const bg = t === 'rev' ? '#dbeafe' : t === 'margin' ? '#dcfce7' : '#f1f5f9';
                          const color = t === 'rev' ? '#1e40af' : t === 'margin' ? '#166534' : '#475569';
                          const border = t === 'rev' ? '#bfdbfe' : t === 'margin' ? '#bbf7d0' : '#e2e8f0';
                          return (
                            <th key={i} style={{
                              padding: '3px 4px', background: bg, color, fontWeight: 600,
                              textAlign: 'center', border: '1px solid ' + border, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{sub}</th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {info.rows.map((row, ri) => (
                        <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#f8fafc' }}>
                          {row.map((cell, ci) => {
                            const t = ci === 0 ? 'label' : info.cellTypes[ci - 1];
                            return (
                              <td key={ci} style={{
                                padding: '3px 4px', border: '1px solid #e2e8f0',
                                textAlign: ci === 0 ? 'left' : 'center',
                                color: t === 'rev' ? '#1e40af' : t === 'margin' ? '#166534' : '#475569',
                                fontWeight: ci === 0 ? 600 : 400,
                                background: t === 'rev' ? '#f0f7ff' : t === 'margin' ? '#f0fdf4' : 'inherit',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>{cell}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DivisionForecastPage() {
  const [snapshot, setSnapshot] = useState('Current');
  const [company, setCompany] = useState('1');
  const [department, setDepartment] = useState('100 - Roanoke');
  const [dateFrom, setDateFrom] = useState('10-2025');
  const [dateTo, setDateTo] = useState('12-2026');
  const [appliedFrom, setAppliedFrom] = useState('10-2025');
  const [appliedTo, setAppliedTo] = useState('12-2026');
  const [layout, setLayout] = useState('Original');
  const [layoutInfoOpen, setLayoutInfoOpen] = useState(false);

  const months = useMemo(() => buildMonthsDF(appliedFrom, appliedTo), [appliedFrom, appliedTo]);

  function handleApply() {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
  }

  return (
    <>
      {/* Page Header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '10px 20px', background: '#fff', borderBottom: '1px solid #d9dfe7' }}
      >
        <div>
          <div style={{ fontSize: '10px', color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '1px' }}>
            Revenue Forecasts
          </div>
          <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Division Forecast</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Snapshot
          </span>
          <select
            value={snapshot}
            onChange={(e) => setSnapshot(e.target.value)}
            style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', color: '#1e293b', cursor: 'pointer' }}
          >
            <option>Current</option>
            <option>January 2026</option>
            <option>February 2026</option>
            <option>March 2026</option>
          </select>
          <button style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#22c55e', border: '1px solid #16a34a', borderRadius: '6px', cursor: 'pointer' }}>
            Submit
          </button>
          <button className="flex items-center gap-1.5" style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: '1px solid #2979ff', borderRadius: '6px', cursor: 'pointer' }}>
            <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '8px 20px', background: '#fff', borderBottom: '1px solid #d9dfe7', gap: '20px' }}
      >
        <div className="flex items-center" style={{ gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</label>
            <select value={company} onChange={(e) => setCompany(e.target.value)}
              style={{ padding: '5px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', color: '#1e293b', cursor: 'pointer', minWidth: '60px' }}>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Departments</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}
              style={{ padding: '5px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', color: '#1e293b', cursor: 'pointer', minWidth: '160px' }}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</label>
            <div className="flex items-center" style={{ gap: '6px' }}>
              <input type="text" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="MM-YYYY"
                style={{ padding: '5px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', width: '80px', color: '#1e293b' }} />
              <span style={{ fontSize: '12px', color: '#5a6577' }}>to</span>
              <input type="text" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="MM-YYYY"
                style={{ padding: '5px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', width: '80px', color: '#1e293b' }} />
              <button onClick={handleApply} style={{ padding: '5px 14px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: '1px solid #2979ff', borderRadius: '6px', cursor: 'pointer' }}>
                Apply
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Table Layout</label>
            <button onClick={() => setLayoutInfoOpen(true)} title="Learn about each layout"
              style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid #94a3b8', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#64748b', lineHeight: 1, padding: 0 }}>
              ?
            </button>
          </div>
          <div style={{ display: 'flex', border: '1px solid #c8d1dc', borderRadius: '6px', overflow: 'hidden' }}>
            {TABLE_LAYOUTS.map((l) => (
              <button key={l} onClick={() => setLayout(l)}
                style={{ padding: '5px 10px', fontSize: '12px', fontWeight: layout === l ? 600 : 400, color: layout === l ? '#fff' : '#3a4a5c', background: layout === l ? '#2979ff' : '#fff', border: 'none', borderRight: '1px solid #c8d1dc', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', background: '#f0f0f0' }}>
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', padding: '16px 20px' }}>
          <TotalSectionDF months={months} layout={layout} />
          <UnderContractDF months={months} layout={layout} />
          <PreConSectionDF months={months} layout={layout} />
          <PlugSectionDF months={months} layout={layout} />
        </div>
      </div>

      {layoutInfoOpen && <LayoutInfoModal onClose={() => setLayoutInfoOpen(false)} />}
    </>
  );
}
