'use client';

import { useState } from 'react';

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
        {/* Modal header */}
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

        {/* Legend */}
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

        {/* Layout cards */}
        <div style={{ padding: '14px 24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {TABLE_LAYOUTS.map((name) => {
            const info = LAYOUT_INFO[name];
            return (
              <div key={name} style={{ border: '1px solid #d9dfe7', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Card header */}
                <div style={{
                  padding: '9px 14px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #d9dfe7',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{
                    padding: '2px 8px', fontSize: '11px', fontWeight: 700,
                    color: '#fff', background: '#2979ff', borderRadius: '4px',
                  }}>{name}</span>
                </div>

                {/* Description */}
                <div style={{ padding: '10px 14px 8px', fontSize: '12px', color: '#3a4a5c', lineHeight: 1.5 }}>
                  {info.description}
                </div>

                {/* Mini table preview */}
                <div style={{ padding: '0 14px 14px' }}>
                  <table style={{ borderCollapse: 'collapse', fontSize: '10px', width: '100%', tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        {info.topHeaders.map((h, i) => {
                          const bg = h.type === 'rev' ? '#dbeafe' : h.type === 'margin' ? '#dcfce7' : h.type === 'month' ? '#f1f5f9' : '#f1f5f9';
                          const color = h.type === 'rev' ? '#1e40af' : h.type === 'margin' ? '#166534' : '#475569';
                          const border = h.type === 'rev' ? '#bfdbfe' : h.type === 'margin' ? '#bbf7d0' : '#e2e8f0';
                          return (
                            <th key={i}
                              colSpan={h.colSpan}
                              rowSpan={h.rowSpan}
                              style={{
                                padding: '3px 4px', background: bg, color, fontWeight: 600,
                                textAlign: i === 0 ? 'left' : 'center',
                                border: '1px solid ' + border, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}
                            >{h.label}</th>
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
  const [dateFrom, setDateFrom] = useState('01-2026');
  const [dateTo, setDateTo] = useState('04-2026');
  const [layout, setLayout] = useState('Original');
  const [layoutInfoOpen, setLayoutInfoOpen] = useState(false);

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
        {/* Left controls */}
        <div className="flex items-center" style={{ gap: '16px', alignItems: 'flex-end' }}>
          {/* Company */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{ padding: '5px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', color: '#1e293b', cursor: 'pointer', minWidth: '60px' }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>

          {/* Departments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Departments</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ padding: '5px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', color: '#1e293b', cursor: 'pointer', minWidth: '160px' }}
            >
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</label>
            <div className="flex items-center" style={{ gap: '6px' }}>
              <input
                type="text" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="MM-YYYY"
                style={{ padding: '5px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', width: '80px', color: '#1e293b' }}
              />
              <span style={{ fontSize: '12px', color: '#5a6577' }}>to</span>
              <input
                type="text" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="MM-YYYY"
                style={{ padding: '5px 8px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', width: '80px', color: '#1e293b' }}
              />
              <button style={{ padding: '5px 14px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: '1px solid #2979ff', borderRadius: '6px', cursor: 'pointer' }}>
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Table Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Table Layout
            </label>
            <button
              onClick={() => setLayoutInfoOpen(true)}
              title="Learn about each layout"
              style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '1.5px solid #94a3b8', background: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 700, color: '#64748b', lineHeight: 1, padding: 0,
              }}
            >
              ?
            </button>
          </div>
          <div style={{ display: 'flex', border: '1px solid #c8d1dc', borderRadius: '6px', overflow: 'hidden' }}>
            {TABLE_LAYOUTS.map((l) => (
              <button
                key={l}
                onClick={() => setLayout(l)}
                style={{
                  padding: '5px 10px', fontSize: '12px',
                  fontWeight: layout === l ? 600 : 400,
                  color: layout === l ? '#fff' : '#3a4a5c',
                  background: layout === l ? '#2979ff' : '#fff',
                  border: 'none', borderRight: '1px solid #c8d1dc',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', background: '#f1f5f9' }}>
        <div style={{ background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#8694a7', fontSize: '13px' }}>
          Division Forecast table will appear here.
        </div>
      </div>

      {layoutInfoOpen && <LayoutInfoModal onClose={() => setLayoutInfoOpen(false)} />}
    </>
  );
}
