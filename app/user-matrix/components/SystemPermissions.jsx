'use client';

import { useState, useMemo } from 'react';

const W  = 'write';
const R  = 'read';
const DW = 'dept_write';
const DR = 'dept_read';
const X  = 'no_access';

const ROLES = [
  'Admin', 'Business Manager', 'Construction Manager', 'Controller',
  'Department Manager', 'Estimators', 'Foreman', 'PMA', 'President',
  'Project Engineer', 'Project Executive', 'Project Manager', 'Read Only', 'Site Manager',
];

const RAW_ROWS = [
  { name: 'PreCon',                     perms: [W,  W,  W,  R,  W,  R,  R,  DR, R,  R,  W,  W,  R,  R ] },
  { name: 'Awarded Manpower',           perms: [W,  R,  W,  R,  W,  R,  R,  DR, R,  R,  R,  R,  R,  R ] },
  { name: 'Awarded - Shared Resources', perms: [W,  R,  W,  R,  W,  R,  R,  DR, R,  R,  R,  R,  R,  R ], indent: true },
  { name: 'Awarded - Goals',            perms: [W,  R,  W,  R,  W,  R,  R,  DR, R,  R,  R,  R,  R,  R ], indent: true },
  { name: 'Awarded - Temp Labor',       perms: [W,  R,  W,  R,  W,  R,  R,  DR, R,  R,  R,  R,  R,  R ], indent: true },
  { name: 'Graph By Trade',             perms: [W,  R,  W,  R,  W,  R,  R,  DR, R,  R,  W,  W,  R,  R ] },
  { name: 'Graph By Job',               perms: [W,  W,  W,  R,  W,  R,  R,  DR, R,  R,  W,  W,  R,  R ] },
];

const SECTIONS = [
  {
    name: 'Revenue Forecast',
    rows: [
      { name: 'Company Forecasts',  perms: [W,  X,  X,  W,  X,  X,  X,  X,  R,  X,  X,  X,  R,  X ] },
      { name: 'Division Forecasts', perms: [W,  DR, DR, W,  W,  DR, X,  X,  R,  DR, R,  X,  R,  DW] },
    ],
  },
  {
    name: 'Business Dev',
    rows: [
      { name: 'Dashboard',             perms: [W,  R,  R,  R,  W,  R,  X,  X,  R,  X,  R,  W,  R,  R] },
      { name: 'Inputs Entry',          perms: [W,  X,  X,  W,  X,  X,  X,  W,  X,  X,  X,  X,  R,  X] },
      { name: 'Flash Monthly Entry',   perms: [W,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X] },
      { name: 'Div Sales Goals Entry', perms: [W,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X] },
      { name: 'Reporting',             perms: [W,  W,  R,  W,  W,  W,  R,  X,  R,  X,  R,  W,  R,  R] },
      { name: 'Bid Summary Warehouse', perms: [W,  W,  R,  W,  W,  W,  R,  X,  R,  X,  R,  W,  R,  R] },
    ],
  },
];

// ---------- icons ----------
const IC = '#1a4d8f';

function IcoWrite() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={IC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function IcoRead() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={IC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function IcoDeptWrite() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={IC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      <rect x="1" y="1" width="6" height="6" rx="1" fill={IC} stroke="none"/>
    </svg>
  );
}

function IcoDeptRead() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={IC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      <rect x="1" y="1" width="6" height="6" rx="1" fill={IC} stroke="none"/>
    </svg>
  );
}

function IcoNoAccess() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={IC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}

function PermIcon({ type }) {
  switch (type) {
    case W:  return <IcoWrite />;
    case R:  return <IcoRead />;
    case DW: return <IcoDeptWrite />;
    case DR: return <IcoDeptRead />;
    case X:  return <IcoNoAccess />;
    default: return null;
  }
}

function LegendItem({ icon, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#1e293b', whiteSpace: 'nowrap' }}>
      {icon} {label}
    </span>
  );
}

export default function SystemPermissions() {
  const [collapsed, setCollapsed] = useState({});
  const [search, setSearch]       = useState('');

  const toggleSection = (name) => setCollapsed(p => ({ ...p, [name]: !p[name] }));

  const flatRows = useMemo(() => {
    const rows = [];
    RAW_ROWS.forEach(r => rows.push({ ...r, type: 'row' }));
    SECTIONS.forEach(sec => {
      rows.push({ type: 'section', name: sec.name });
      if (!collapsed[sec.name]) {
        sec.rows.forEach(r => rows.push({ ...r, type: 'row' }));
      }
    });
    return rows;
  }, [collapsed]);

  const visible = useMemo(() => {
    if (!search.trim()) return flatRows;
    const q = search.toLowerCase();
    return flatRows.filter(r => r.type === 'section' || r.name.toLowerCase().includes(q));
  }, [flatRows, search]);

  const sticky = { position: 'sticky', left: 0, zIndex: 1 };

  return (
    <div style={{ background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px', overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid #d9dfe7',
        flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
            System Permissions
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <LegendItem icon={<IcoRead />}      label="Read Only" />
            <LegendItem icon={<IcoWrite />}     label="Write" />
            <LegendItem icon={<IcoDeptWrite />} label="Department Write" />
            <LegendItem icon={<IcoDeptRead />}  label="Department Read" />
            <LegendItem icon={<IcoNoAccess />}  label="No Access" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#94a3b8', pointerEvents: 'none' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              style={{ padding: '5px 10px 5px 28px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', width: '180px', outline: 'none' }}
            />
          </div>
          <button style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#1a4d8f', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Add New System Role
          </button>
          <button style={{ padding: '5px 10px', fontSize: '16px', color: '#5a6577', background: 'none', border: '1px solid #d9dfe7', borderRadius: '6px', cursor: 'pointer', lineHeight: 1 }}>
            ⋮
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '12px', width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #c8d1dc' }}>
              <th style={{
                ...sticky,
                textAlign: 'left', padding: '10px 14px',
                fontSize: '12px', fontWeight: 700, color: '#1a4d8f',
                background: '#fff', whiteSpace: 'nowrap', minWidth: '230px',
                borderRight: '1px solid #e2e8f0',
              }}>
                Section / Page / Functionality
              </th>
              {ROLES.map(role => (
                <th key={role} style={{
                  padding: '10px 8px', fontSize: '11px', fontWeight: 700,
                  color: '#1a4d8f', textAlign: 'center',
                  minWidth: '80px', borderLeft: '1px solid #e2e8f0',
                }}>
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => {
              if (row.type === 'section') {
                return (
                  <tr key={row.name} onClick={() => toggleSection(row.name)} style={{ background: '#0d3a6e', cursor: 'pointer' }}>
                    <td colSpan={ROLES.length + 1} style={{ padding: '8px 14px', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {row.name}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          {collapsed[row.name]
                            ? <path d="M9 18l6-6-6-6"/>
                            : <path d="M6 9l6 6 6-6"/>}
                        </svg>
                      </span>
                    </td>
                  </tr>
                );
              }

              const bg = i % 2 === 0 ? '#fff' : '#f8fafc';
              return (
                <tr key={`${row.name}-${i}`} style={{ background: bg, borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ ...sticky, padding: '7px 14px', color: '#1e293b', background: bg, borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                    {row.indent ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2"/>
                          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                        </svg>
                        {row.name}
                      </span>
                    ) : row.name}
                  </td>
                  {(row.perms || []).map((perm, pi) => (
                    <td key={pi} style={{ padding: '7px 8px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PermIcon type={perm} />
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
