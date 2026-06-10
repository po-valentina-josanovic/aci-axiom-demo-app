'use client';

import { useState } from 'react';
import { useProjects } from '../potential-projects/components/ProjectsStore';

// ─── Constants ───────────────────────────────────────────────────────────────

const SHOPS = ['Plumbing', 'Pipe', 'Sheet Metal', 'Fire Protection', 'Electrical'];

const INITIAL_JOBS = [
  {
    id: 'j3',
    name: 'Richmond Convention Center Expansion',
    type: 'precon',
    cost: '$24,300,000',
    workweekHours: 40,
    shopData: {
      Plumbing:       { hours: 8400,  beginning: '03-2026', end: '08-2027' },
      Pipe:           { hours: 12000, beginning: '03-2026', end: '08-2027' },
      Electrical:     { hours: 11200, beginning: '03-2026', end: '08-2027' },
    },
  },
  {
    id: 'j4',
    name: 'Norfolk Naval Station HVAC Upgrade',
    type: 'precon',
    cost: '$9,750,000',
    workweekHours: 40,
    shopData: {
      'Sheet Metal':  { hours: 5600,  beginning: '07-2026', end: '08-2027' },
      Electrical:     { hours: 3200,  beginning: '07-2026', end: '08-2027' },
    },
  },
  {
    id: 'j1',
    name: 'Daleville MOB',
    type: 'regular',
    cost: '$7,000,000',
    workweekHours: 40,
    shopData: {
      Plumbing:       { hours: 6000,  beginning: '06-2026', end: '06-2027' },
      'Sheet Metal':  { hours: 6000,  beginning: '06-2026', end: '06-2027' },
      Electrical:     { hours: 7500,  beginning: '06-2026', end: '06-2027' },
    },
  },
  {
    id: 'j2',
    name: 'VT Chiller Plant',
    type: 'regular',
    cost: '$18,549,901',
    workweekHours: 40,
    shopData: {
      Pipe:           { hours: 14702, beginning: '06-2026', end: '03-2028' },
      'Sheet Metal':  { hours: 549,   beginning: '06-2026', end: '03-2028' },
      Electrical:     { hours: 15000, beginning: '06-2026', end: '03-2028' },
    },
  },
];

// ─── Timeline helpers ────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const YEAR_COLORS = [
  { main: '#5B9BD5', light: '#d0e4f3' },
  { main: '#D4884A', light: '#f5dfc7' },
  { main: '#C9A84C', light: '#f0e5c7' },
  { main: '#C96B6B', light: '#f5d0d0' },
  { main: '#6AAD6A', light: '#d0ecd0' },
];

function buildTimeline() {
  const months = [];
  let y = 2025, m = 9; // start Oct 2025, run through Dec 2029
  while (y < 2030) {
    months.push({ key: `${y}-${m}`, year: y, label: MONTH_NAMES[m] });
    if (++m > 11) { m = 0; y++; }
  }
  return months;
}

function buildYearGroups(months) {
  return months.reduce((acc, m) => {
    const last = acc[acc.length - 1];
    if (last && last.year === m.year) last.count++;
    else acc.push({ year: m.year, count: 1 });
    return acc;
  }, []);
}

const TIMELINE = buildTimeline();
const YEAR_GROUPS = buildYearGroups(TIMELINE);

// ─── Icons ───────────────────────────────────────────────────────────────────

function PencilIcon({ size = 11, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

// ─── Job Section ─────────────────────────────────────────────────────────────

// Column layout (8 fixed + N timeline):
//  0: Budget radio  → $Cost    → Trade name → "Total" + add btn
//  1: Bid radio     → Hours    → hours      → total hours
//  2-7: ProjectName (colspan 6) → ManDays / Months / Beginning / End / Distribution / (empty actions hdr)
//  8+: Year groups  → Month names → 0s

function calcMonths(beg, end) {
  if (!beg || !end) return null;
  const [bm, by] = beg.split('-').map(Number);
  const [em, ey] = end.split('-').map(Number);
  if (!bm || !by || !em || !ey) return null;
  const n = (ey - by) * 12 + (em - bm) + 1;
  return n > 0 ? n : null;
}

function EditJobModal({ job, onClose, onSave }) {
  const [name, setName] = useState(job.name);
  const [workweekHours, setWorkweekHours] = useState(job.workweekHours ?? 40);

  const fieldStyle = { width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #c8d1dc', borderRadius: '6px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#fff' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: '10px', width: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Edit Job Details</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6577', display: 'flex', alignItems: 'center', padding: '2px' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Job Name</div>
            <input value={name} onChange={e => setName(e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Workweek hours:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {WORKWEEK_OPTIONS.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="radio" name="edit-workweek" checked={workweekHours === opt} onChange={() => setWorkweekHours(opt)}
                    style={{ width: '15px', height: '15px', accentColor: '#2979ff', margin: 0, cursor: 'pointer' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button onClick={onClose} style={{ padding: '8px 22px', fontSize: '13px', fontWeight: 500, color: '#1e293b', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={() => { onSave({ name: name.trim() || job.name, workweekHours }); onClose(); }}
              style={{ padding: '8px 22px', fontSize: '13px', fontWeight: 600, color: '#fff', background: '#1a5276', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreConJobSection({ job: initialJob, onUpdate }) {
  const [job, setJob] = useState(initialJob);
  const [mode, setMode] = useState('budget');
  const [showEdit, setShowEdit] = useState(false);
  const hoursPerDay = (job.workweekHours ?? 40) / 5;

  function handleSaveEdit({ name, workweekHours }) {
    const updated = { ...job, name, workweekHours };
    setJob(updated);
    onUpdate?.(updated);
  }

  const [shopRows, setShopRows] = useState(() =>
    SHOPS.reduce((acc, shop) => {
      const d = job.shopData[shop];
      acc[shop] = d ? { hours: d.hours, beginning: d.beginning, end: d.end } : { hours: '', beginning: '', end: '' };
      return acc;
    }, {})
  );

  function updateRow(shop, field, value) {
    setShopRows(prev => ({ ...prev, [shop]: { ...prev[shop], [field]: value } }));
  }

  function deriveManDays(hours) {
    const h = parseFloat(String(hours).replace(/,/g, ''));
    return h > 0 ? Math.round(h / hoursPerDay) : null;
  }

  const totals = SHOPS.reduce(
    (acc, s) => {
      const row = shopRows[s];
      const h = parseFloat(String(row.hours).replace(/,/g, '')) || 0;
      const md = h > 0 ? Math.round(h / hoursPerDay) : 0;
      const mo = calcMonths(row.beginning, row.end) ?? 0;
      acc.hours += h;
      acc.manDays += md;
      acc.months += mo;
      return acc;
    },
    { hours: 0, manDays: 0, months: 0 },
  );

  const border = '1px solid #c8d1dc';
  const hdrBorder = '1px solid #b8c5d4';

  const thBase = {
    padding: '5px 8px',
    fontSize: '11px',
    fontWeight: 600,
    border: hdrBorder,
    whiteSpace: 'nowrap',
    textAlign: 'center',
    background: '#dbeafe',
    color: '#1e293b',
  };

  const tdBase = {
    padding: '4px 8px',
    fontSize: '12px',
    border,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    color: '#1e293b',
  };

  const tdInput = { ...tdBase, padding: '3px 4px' };

  const inputStyle = {
    display: 'block',
    width: '100%',
    background: '#dbeafe',
    border: '1px solid #93c5fd',
    borderRadius: '3px',
    padding: '3px 6px',
    fontSize: '12px',
    textAlign: 'center',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    minWidth: '0',
  };

  return (
    <div style={{
      borderTop: border, borderRight: border, borderBottom: border,
      borderLeft: job.type === 'regular' ? '4px solid #006298' : border,
      borderRadius: '6px', marginBottom: '10px', background: '#fff', overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '12px' }}>

          <thead>
            {/* ── Row 1: Budget | Bid | Project Name (colspan 6) | Year headers ── */}
            <tr>
              {/* Col 0: Budget radio */}
              <td style={{ ...tdBase, background: '#f8fafc', border: hdrBorder, padding: '7px 10px', minWidth: '78px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer', userSelect: 'none', justifyContent: 'center' }}>
                  <input type="radio" name={`mode-${job.id}`} checked={mode === 'budget'} onChange={() => setMode('budget')} style={{ accentColor: '#ef4444', margin: 0 }} />
                  Budget
                </label>
              </td>
              {/* Col 1: Bid radio */}
              <td style={{ ...tdBase, background: '#f8fafc', border: hdrBorder, padding: '7px 10px', minWidth: '60px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer', userSelect: 'none', justifyContent: 'center' }}>
                  <input type="radio" name={`mode-${job.id}`} checked={mode === 'bid'} onChange={() => setMode('bid')} style={{ accentColor: '#ef4444', margin: 0 }} />
                  Bid
                </label>
              </td>
              {/* Cols 2–7: Project name bar */}
              <td colSpan={6} style={{ background: '#006298', border: '1px solid #004d7a', padding: '0 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', minHeight: '38px', gap: '10px' }}>
                  <span style={{ flex: 1, color: '#fff', fontSize: '13px', fontWeight: 600 }}>{job.name}</span>
                  {job.type === 'regular' && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '2px 9px', borderRadius: '10px', flexShrink: 0,
                      background: '#fff', color: '#006298',
                    }}>
                      Manual
                    </span>
                  )}
                  <button onClick={() => setShowEdit(true)} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '4px', color: '#fff', cursor: 'pointer', padding: '4px 7px', display: 'flex', alignItems: 'center' }}>
                    <PencilIcon size={13} color="#fff" />
                  </button>
                </div>
              </td>
              {/* Year group headers */}
              {YEAR_GROUPS.map((g, gi) => (
                <th key={g.year} colSpan={g.count} style={{ ...thBase, background: YEAR_COLORS[gi]?.main ?? '#5B9BD5', color: '#fff', border: '1px solid rgba(0,0,0,0.12)' }}>
                  {g.year}
                </th>
              ))}
            </tr>

            {/* ── Row 2: $Cost (input) | Hours | ManDays | Months | Beg | End | Distribution | (empty) | Month names ── */}
            <tr>
              {/* Col 0: cost — input cell */}
              <td style={{ ...tdInput, border: hdrBorder }}>
                <input style={inputStyle} defaultValue={job.cost} />
              </td>
              {/* Col 1–7: fixed column headers with #eef1f5 background */}
              <th style={{ ...thBase, background: '#eef1f5', minWidth: '64px' }}>Hours</th>
              <th style={{ ...thBase, background: '#eef1f5', minWidth: '64px' }}>Man Days</th>
              <th style={{ ...thBase, background: '#eef1f5', minWidth: '54px' }}>Months</th>
              <th style={{ ...thBase, background: '#eef1f5', minWidth: '74px' }}>Beginning</th>
              <th style={{ ...thBase, background: '#eef1f5', minWidth: '74px' }}>End</th>
              <th style={{ ...thBase, background: '#eef1f5', minWidth: '88px' }}>Distribution</th>
              <th style={{ ...thBase, background: '#eef1f5', minWidth: '76px' }}></th>
              {/* Month name headers */}
              {TIMELINE.map((m) => {
                const gi = YEAR_GROUPS.findIndex(g => g.year === m.year);
                return (
                  <th key={m.key} style={{ ...thBase, background: YEAR_COLORS[gi]?.light ?? '#d0e4f3', minWidth: '46px' }}>
                    {m.label}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {/* ── Data rows: Trade | values | actions | 0s ── */}
            {SHOPS.map((shop, idx) => {
              const row = shopRows[shop];
              const hasData = !!row.hours || !!row.beginning || !!row.end;
              const manDays = deriveManDays(row.hours);
              const months = calcMonths(row.beginning, row.end);
              const calcCellStyle = { ...tdBase, background: '#f8fafc', color: '#475569', fontStyle: 'italic' };
              return (
                <tr key={shop} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  {/* Col 0: trade name */}
                  <td style={{ ...tdBase, textAlign: 'left', fontWeight: 500 }}>{shop}</td>
                  {hasData ? (
                    <>
                      <td style={tdInput}>
                        <input style={inputStyle} value={row.hours} onChange={e => updateRow(shop, 'hours', e.target.value)} />
                      </td>
                      {/* Man Days — calculated */}
                      <td style={calcCellStyle}>{manDays != null ? manDays.toLocaleString() : ''}</td>
                      {/* Months — calculated */}
                      <td style={calcCellStyle}>{months != null ? months : ''}</td>
                      <td style={tdInput}>
                        <input style={inputStyle} value={row.beginning} onChange={e => updateRow(shop, 'beginning', e.target.value)} />
                      </td>
                      <td style={tdInput}>
                        <input style={inputStyle} value={row.end} onChange={e => updateRow(shop, 'end', e.target.value)} />
                      </td>
                      {/* Col 6: Distribution — edit button */}
                      <td style={{ ...tdBase, padding: '2px 5px' }}>
                        <button style={{ background: '#2979ff', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer', padding: '3px 5px', display: 'flex', alignItems: 'center', margin: '0 auto' }}>
                          <PencilIcon color="#fff" />
                        </button>
                      </td>
                      {/* Col 7: Reset button */}
                      <td style={{ ...tdBase, padding: '2px 5px' }}>
                        <button style={{ background: '#fff', border: '1px solid #e91e63', borderRadius: '3px', color: '#e91e63', cursor: 'pointer', padding: '2px 6px', fontSize: '11px' }}>
                          Reset
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={tdInput}>
                        <input style={inputStyle} value={row.hours} onChange={e => updateRow(shop, 'hours', e.target.value)} />
                      </td>
                      {/* Man Days — calculated, empty until hours entered */}
                      <td style={calcCellStyle}></td>
                      {/* Months — calculated, empty until dates entered */}
                      <td style={calcCellStyle}></td>
                      <td style={tdInput}>
                        <input style={inputStyle} value={row.beginning} onChange={e => updateRow(shop, 'beginning', e.target.value)} />
                      </td>
                      <td style={tdInput}>
                        <input style={inputStyle} value={row.end} onChange={e => updateRow(shop, 'end', e.target.value)} />
                      </td>
                      {/* Col 6: Distribution — + button */}
                      <td style={{ ...tdBase, padding: '2px 5px' }}>
                        <button style={{ background: '#fff', border: '1px solid #c8d1dc', borderRadius: '3px', color: '#5a6577', cursor: 'pointer', padding: '1px 10px', fontSize: '15px', lineHeight: '1.2' }}>
                          +
                        </button>
                      </td>
                      {/* Col 7: empty */}
                      <td style={tdBase}></td>
                    </>
                  )}
                  {TIMELINE.map(m => (
                    <td key={m.key} style={{ ...tdBase, color: '#5a6577' }}>0</td>
                  ))}
                </tr>
              );
            })}

            {/* ── Total row: "Total" + add btn | totals | 0s ── */}
            <tr style={{ background: '#f1f5f9' }}>
              <td style={{ ...tdBase, textAlign: 'left', fontWeight: 700 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Total</span>
                  <button style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #2979ff', background: '#fff', color: '#2979ff', fontSize: '14px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                    +
                  </button>
                </div>
              </td>
              <td style={{ ...tdBase, fontWeight: 700 }}>{totals.hours.toLocaleString()}</td>
              <td style={{ ...tdBase, fontWeight: 700 }}>{totals.manDays.toLocaleString()}</td>
              <td style={{ ...tdBase, fontWeight: 700 }}>{totals.months}</td>
              <td style={tdBase}></td>
              <td style={tdBase}></td>
              <td style={tdBase}></td>
              <td style={tdBase}></td>
              {TIMELINE.map(m => <td key={m.key} style={{ ...tdBase, fontWeight: 700 }}>0</td>)}
            </tr>
          </tbody>

        </table>
      </div>

      {/* ── Footer: Delete + See Notes ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '5px 10px', borderTop: '1px solid #e2e8f0', background: '#fafbfc', gap: '6px' }}>
        <button style={{ background: '#fff', border: '1px solid #fca5a5', borderRadius: '4px', color: '#ef4444', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
          <TrashIcon />
        </button>
        <button style={{ background: '#fff', border: '1px solid #c8d1dc', borderRadius: '4px', color: '#1e293b', cursor: 'pointer', padding: '4px 12px', fontSize: '12px', fontWeight: 500 }}>
          See Notes (0)
        </button>
      </div>
      {showEdit && <EditJobModal job={job} onClose={() => setShowEdit(false)} onSave={handleSaveEdit} />}
    </div>
  );
}

// ─── Shared To Another Department ────────────────────────────────────────────

function SharedToDeptTable() {
  const hdrTd = {
    padding: '7px 14px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
    background: '#1a2d4a',
    border: '1px solid #2c3d52',
    textAlign: 'center',
  };
  const bodyTd = {
    padding: '7px 14px',
    fontSize: '12px',
    border: '1px solid #d1dce7',
    textAlign: 'center',
    color: '#1e293b',
  };
  return (
    <div style={{ border: '1px solid #c8d1dc', borderRadius: '6px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th colSpan={3} style={{ ...hdrTd, textAlign: 'center', padding: '8px 14px' }}>Shared To Another Department</th>
          </tr>
          <tr>
            <th style={hdrTd}>Trade</th>
            <th style={hdrTd}>Department</th>
            <th style={hdrTd}>Shared Hours</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...bodyTd, fontWeight: 700 }}>Total</td>
            <td style={bodyTd}></td>
            <td style={bodyTd}>0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Add Job Modal ────────────────────────────────────────────────────────────

const WORKWEEK_OPTIONS = [40, 50, 60, 72, 84];

function AddJobModal({ onClose, onCreate }) {
  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [selectedJob, setSelectedJob] = useState('');
  const [jobName, setJobName] = useState('');
  const [hours, setHours] = useState(40);
  const { projects } = useProjects();

  const isValid = mode === 'existing' ? !!selectedJob : !!jobName.trim();

  function handleCreate() {
    if (!isValid) return;
    const name = mode === 'existing'
      ? projects.find(p => p.id === selectedJob)?.project_name ?? selectedJob
      : jobName.trim();
    onCreate({ name, hours, type: mode === 'existing' ? 'precon' : 'regular' });
    onClose();
  }

  const optionRadioStyle = { width: '15px', height: '15px', accentColor: '#2979ff', margin: 0, cursor: 'pointer', flexShrink: 0 };
  const fieldStyle = { width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #c8d1dc', borderRadius: '6px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#fff' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: '10px', width: '560px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Add New Job</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6577', display: 'flex', alignItems: 'center', padding: '2px' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '0 24px 24px' }}>

          {/* ── Option 1: Select existing Pre-Con job ── */}
          <div style={{ marginBottom: '16px', padding: '14px 16px', border: `2px solid ${mode === 'existing' ? '#2979ff' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onClick={() => setMode('existing')}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none', marginBottom: mode === 'existing' ? '12px' : 0 }}>
              <input type="radio" name="add-mode" checked={mode === 'existing'} onChange={() => setMode('existing')} style={optionRadioStyle} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Select existing Potential Project</span>
            </label>
            {mode === 'existing' && (
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                style={{ ...fieldStyle, marginTop: '2px' }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">-- Select a project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_name}{p.project_stage ? ` (Status: ${p.project_stage})` : ''}</option>
                ))}
              </select>
            )}
          </div>

          {/* ── Option 2: New job name ── */}
          <div style={{ marginBottom: '20px', padding: '14px 16px', border: `2px solid ${mode === 'new' ? '#2979ff' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onClick={() => setMode('new')}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none', marginBottom: mode === 'new' ? '12px' : 0 }}>
              <input type="radio" name="add-mode" checked={mode === 'new'} onChange={() => setMode('new')} style={optionRadioStyle} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>New job name</span>
            </label>
            {mode === 'new' && (
              <input
                type="text"
                placeholder="Enter job name here..."
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                style={{ ...fieldStyle, marginTop: '2px' }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>

          {/* ── Workweek hours ── */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Workweek hours:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {WORKWEEK_OPTIONS.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="radio"
                    name="workweek"
                    checked={hours === opt}
                    onChange={() => setHours(opt)}
                    style={{ width: '15px', height: '15px', accentColor: '#2979ff', margin: 0, cursor: 'pointer' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '8px 22px', fontSize: '13px', fontWeight: 500, color: '#1e293b', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleCreate} disabled={!isValid} style={{ padding: '8px 22px', fontSize: '13px', fontWeight: 600, color: '#fff', background: isValid ? '#1a5276' : '#93a3b8', border: 'none', borderRadius: '6px', cursor: isValid ? 'pointer' : 'not-allowed' }}>
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

const labelStyle = { fontSize: '10px', fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '2px' };
const selectStyle = { border: '1px solid #c8d1dc', borderRadius: '4px', padding: '5px 10px', fontSize: '12px', background: '#fff', color: '#1e293b', cursor: 'pointer' };

export default function PreConView() {
  const [showAddJob, setShowAddJob] = useState(false);
  const [jobs, setJobs] = useState(INITIAL_JOBS);

  function handleAddJob({ name, hours, type }) {
    setJobs(prev => [{
      id: `job-${Date.now()}`,
      name,
      type,
      cost: '',
      workweekHours: hours,
      shopData: {},
    }, ...prev]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#fff', borderBottom: '1px solid #d9dfe7', flexShrink: 0 }}>
        <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Master Manpower</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          <span style={{ color: '#5a6577' }}>View:</span>
          <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#2979ff', fontWeight: 600, fontSize: '12px', padding: 0 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Timeline
          </button>
          <span style={{ color: '#d9dfe7' }}>|</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8694a7', fontSize: '12px', padding: 0 }}>Graph</button>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #d9dfe7', flexShrink: 0, flexWrap: 'wrap' }}>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 11px', fontSize: '12px', fontWeight: 500, color: '#1e293b', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '4px', cursor: 'pointer' }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Reorder Jobs
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <div>
            <div style={labelStyle}>Company</div>
            <select style={{ ...selectStyle, minWidth: '50px' }}>
              <option>1</option>
            </select>
          </div>

          <div>
            <div style={labelStyle}>Departments</div>
            <select style={{ ...selectStyle, minWidth: '140px' }}>
              <option>100 - Roanoke</option>
              <option>200 - Richmond</option>
            </select>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Download */}
        <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 9px', background: '#2979ff', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        {/* Add Job */}
        <button onClick={() => setShowAddJob(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', background: '#2979ff', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Job
        </button>
      </div>

      {showAddJob && <AddJobModal onClose={() => setShowAddJob(false)} onCreate={handleAddJob} />}

      {/* Job cards + Shared table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', background: '#f1f5f9' }}>
        {jobs.map(job => (
          <PreConJobSection key={job.id} job={job} />
        ))}
        <SharedToDeptTable />
      </div>
    </div>
  );
}
