'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useProjects } from './ProjectsStore';
import { formatDateMDY } from './formatters';

const STAGE_COLORS = {
  Preliminary: { bg: '#e8ecf1', color: '#1e293b' },
  Lead: { bg: '#dbe4f0', color: '#2979ff' },
  Budget: { bg: '#e0e7ff', color: '#4338ca' },
  Bid: { bg: '#f3e8ff', color: '#7c3aed' },
  Award: { bg: '#dcfce7', color: '#15803d' },
  Lost: { bg: '#ffe2e2', color: '#d32f2f' },
  Pending: { bg: '#fef9c2', color: '#a36100' },
  Cancel: { bg: '#e8ecf1', color: '#5a6577' },
};

// Column definitions. `sortKey` is the field we sort by; `sortFn` optionally
// extracts a comparable value for derived columns (e.g. award_details.awarded_date).
const COLUMNS = [
  { key: 'division', label: 'Division', width: '90px' },
  { key: 'potential_project_number', label: 'Project #', width: '110px' },
  { key: 'project_name', label: 'Project Name', width: '' },
  { key: 'project_stage', label: 'Status', width: '100px' },
  { key: 'project_type', label: 'Type', width: '130px' },
  { key: 'end_sector', label: 'End Sector', width: '110px', sortFn: (p) => p.contract_details?.end_sector || '' },
  { key: 'probability_percent', label: 'Prob %', width: '70px' },
  { key: 'bid_date', label: 'Bid Date', width: '100px' },
  { key: 'estimated_project_start', label: 'Est. Start', width: '100px' },
  { key: 'awarded_date', label: 'Award Date', width: '100px', sortFn: (p) => p.award_details?.awarded_date || '' },
  { key: 'created_by', label: 'Created By', width: '100px' },
  { key: 'created_at', label: 'Created', width: '90px' },
];

const selectStyle = {
  border: '1px solid #c8d1dc',
  borderRadius: '6px',
  padding: '5px 8px',
  fontSize: '11px',
  background: '#fff',
  color: '#1e293b',
};

const thStyle = {
  padding: '8px 12px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '10px',
  color: '#1e293b',
  background: '#dbe4f0',
  borderBottom: '1px solid #c8d1dc',
  cursor: 'pointer',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '8px 12px',
  fontSize: '11px',
  color: '#3a4a5c',
  borderBottom: '1px solid #e8ecf1',
};

const CHUNK_SIZE = 50;

export default function ProjectListTable({ onVisibleRowsChange }) {
  const { projects, STAGES, PROJECT_TYPES, DIVISIONS, END_SECTORS, CURRENT_USER } = useProjects();

  // Live filters — update instantly without Apply
  const [search, setSearch] = useState('');
  const [myJobs, setMyJobs] = useState(true);

  // Dropdown filters — require Apply button
  const defaultFilters = { stage: '', division: '', type: '', end_sector: '', company: '' };
  const [applied, setApplied] = useState(defaultFilters);
  const [draft, setDraft] = useState(defaultFilters);

  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const sentinelRef = useRef(null);

  const hasPendingChanges =
    draft.stage !== applied.stage ||
    draft.division !== applied.division ||
    draft.type !== applied.type ||
    draft.end_sector !== applied.end_sector ||
    draft.company !== applied.company;

  function applyFilters() {
    setApplied({ ...draft });
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  // Unique companies for the Company filter — derived from Client contacts across all projects.
  const companyOptions = useMemo(() => {
    const set = new Set();
    for (const p of projects) {
      for (const c of p.contacts || []) {
        if (c.contact_role === 'Client' && c.company_name) set.add(c.company_name);
      }
    }
    return Array.from(set).sort();
  }, [projects]);

  const typeNameByCode = useMemo(() => {
    const map = {};
    for (const t of PROJECT_TYPES) map[t.code] = t.name;
    return map;
  }, [PROJECT_TYPES]);

  const filtered = useMemo(() => {
    let result = [...projects];

    if (myJobs) {
      result = result.filter((p) => p.created_by === CURRENT_USER.name);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.project_name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.potential_project_number || '').toLowerCase().includes(q)
      );
    }
    if (applied.stage) result = result.filter((p) => p.project_stage === applied.stage);
    if (applied.division) result = result.filter((p) => p.division === applied.division);
    if (applied.type) result = result.filter((p) => p.project_type === applied.type);
    if (applied.end_sector) result = result.filter((p) => (p.contract_details?.end_sector || '') === applied.end_sector);
    if (applied.company) {
      result = result.filter((p) => (p.contacts || []).some((c) => c.contact_role === 'Client' && c.company_name === applied.company));
    }

    const activeCol = COLUMNS.find((c) => c.key === sortKey);
    const extract = activeCol?.sortFn || ((p) => p[sortKey] ?? '');

    result.sort((a, b) => {
      let aVal = extract(a);
      let bVal = extract(b);
      if (sortKey === 'probability_percent') { aVal = Number(aVal); bVal = Number(bVal); }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [projects, applied, search, myJobs, sortKey, sortDir, CURRENT_USER.name]);

  // Publish filtered/sorted rows (and column metadata) up to the parent so the
  // page-level Export button can serialize them.
  useEffect(() => {
    if (!onVisibleRowsChange) return;
    onVisibleRowsChange({
      rows: filtered.map((p) => [
        p.division,
        p.potential_project_number,
        p.project_name + (p.nda === 'Yes' || p.nda_project === true ? ' (NDA)' : ''),
        p.project_stage,
        typeNameByCode[p.project_type] || p.project_type || '',
        p.contract_details?.end_sector || '',
        p.probability_percent != null ? `${p.probability_percent}%` : '',
        formatDateMDY(p.bid_date),
        formatDateMDY(p.estimated_project_start),
        formatDateMDY(p.award_details?.awarded_date),
        p.created_by || '',
        formatDateMDY(p.created_at),
      ]),
      headers: COLUMNS.map((c) => c.label),
      count: filtered.length,
    });
  }, [filtered, onVisibleRowsChange, typeNameByCode]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(CHUNK_SIZE);
  }, [applied, search, myJobs, sortKey, sortDir]);

  // Lazy loading with IntersectionObserver
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + CHUNK_SIZE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const visibleProjects = filtered.slice(0, visibleCount);

  return (
    <div>
      {/* Single toolbar row: [My Jobs] | divider | [filters + Apply] | divider | [Search] */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>

        {/* My Jobs toggle — live */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexShrink: 0 }}>
          <button
            onClick={() => setMyJobs(true)}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid',
              borderColor: myJobs ? '#2979ff' : '#c8d1dc',
              borderRadius: '6px 0 0 6px',
              background: myJobs ? '#2979ff' : '#fff',
              color: myJobs ? '#fff' : '#5a6577',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Jobs
          </button>
          <button
            onClick={() => setMyJobs(false)}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid',
              borderLeft: 'none',
              borderColor: !myJobs ? '#2979ff' : '#c8d1dc',
              borderRadius: '0 6px 6px 0',
              background: !myJobs ? '#2979ff' : '#fff',
              color: !myJobs ? '#fff' : '#5a6577',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            All Projects
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', background: '#d9dfe7', flexShrink: 0 }} />

        {/* Dropdown filters + Apply */}
        <select value={draft.division} onChange={(e) => setDraft((d) => ({ ...d, division: e.target.value }))} style={selectStyle}>
          <option value="">All Divisions</option>
          {DIVISIONS.map((d) => <option key={d.code} value={d.code}>{d.code} - {d.name}</option>)}
        </select>

        <select value={draft.stage} onChange={(e) => setDraft((d) => ({ ...d, stage: e.target.value }))} style={selectStyle}>
          <option value="">All Statuses</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))} style={selectStyle}>
          <option value="">All Types</option>
          {PROJECT_TYPES.map((t) => <option key={t.code} value={t.code}>{t.code} - {t.name}</option>)}
        </select>

        <select value={draft.end_sector} onChange={(e) => setDraft((d) => ({ ...d, end_sector: e.target.value }))} style={selectStyle}>
          <option value="">All End Sectors</option>
          {END_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={draft.company} onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))} style={selectStyle}>
          <option value="">All Companies</option>
          {companyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <button
          onClick={applyFilters}
          disabled={!hasPendingChanges}
          style={{
            padding: '5px 12px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#fff',
            background: hasPendingChanges ? '#2979ff' : '#a8b5c4',
            border: 'none',
            borderRadius: '6px',
            cursor: hasPendingChanges ? 'pointer' : 'default',
            opacity: hasPendingChanges ? 1 : 0.6,
            whiteSpace: 'nowrap',
          }}
        >
          Apply
        </button>

        <div style={{ width: '1px', height: '20px', background: '#d9dfe7', flexShrink: 0 }} />

        {/* Live search — right side */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <svg style={{ width: '14px', height: '14px', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8694a7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{ ...selectStyle, width: '100%', paddingLeft: '32px' }}
          />
        </div>

        <span style={{ fontSize: '11px', color: '#8694a7', flexShrink: 0 }}>
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{ ...thStyle, width: col.width || undefined, minWidth: col.key === 'project_name' ? '180px' : undefined }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      {col.label}
                      {sortKey === col.key ? (
                        <span style={{ fontSize: '9px', color: '#2979ff' }}>{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
                      ) : (
                        <span style={{ fontSize: '9px', color: '#c8d1dc' }}>{'\u25B2\u25BC'}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} style={{ padding: '48px 16px', textAlign: 'center', color: '#8694a7', fontSize: '13px' }}>
                    {projects.length === 0
                      ? 'No projects yet. Click "New Potential Project" to create one.'
                      : 'No projects match your filters.'}
                  </td>
                </tr>
              ) : (
                visibleProjects.map((p, idx) => {
                  const isBidTracer = (p.data_source || 'Axiom') === 'Bid Tracer';
                  const typeName = typeNameByCode[p.project_type] || p.project_type || '';
                  return (
                    <tr
                      key={p.id}
                      style={{
                        cursor: 'pointer',
                        background: isBidTracer ? '#fffbeb' : (idx % 2 === 0 ? '#fff' : '#f8fafc'),
                        borderLeft: isBidTracer ? '3px solid #f9a825' : '3px solid transparent',
                      }}
                    >
                      <td style={tdStyle}>{p.division}</td>
                      <td style={tdStyle}>
                        <Link href={`/potential-projects/${p.id}`} style={{ color: '#2979ff', fontWeight: 500, textDecoration: 'none' }}>
                          {p.potential_project_number}
                        </Link>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500, color: '#1e293b' }}>
                        <Link href={`/potential-projects/${p.id}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          {p.project_name}
                          {isBidTracer && (
                            <span style={{ fontSize: '9px', fontWeight: 700, background: '#f9a825', color: '#fff', padding: '1px 5px', borderRadius: '4px', letterSpacing: '0.03em', flexShrink: 0 }}>BT</span>
                          )}
                          {(p.nda === 'Yes' || p.nda_project === true) && (
                            <span style={{ fontSize: '10px', background: '#fef9c2', color: '#a36100', padding: '1px 6px', borderRadius: '12px', fontWeight: 600, flexShrink: 0 }}>NDA</span>
                          )}
                        </Link>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: STAGE_COLORS[p.project_stage]?.bg || '#e8ecf1',
                          color: STAGE_COLORS[p.project_stage]?.color || '#1e293b',
                        }}>
                          {p.project_stage}
                        </span>
                      </td>
                      <td style={tdStyle}>{typeName}</td>
                      <td style={tdStyle}>{p.contract_details?.end_sector || ''}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{p.probability_percent}%</td>
                      <td style={tdStyle}>{formatDateMDY(p.bid_date)}</td>
                      <td style={tdStyle}>{formatDateMDY(p.estimated_project_start)}</td>
                      <td style={tdStyle}>{formatDateMDY(p.award_details?.awarded_date)}</td>
                      <td style={tdStyle}>{p.created_by}</td>
                      <td style={{ ...tdStyle, fontSize: '11px', color: '#5a6577' }}>
                        {formatDateMDY(p.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {/* Lazy loading sentinel */}
          {visibleCount < filtered.length && (
            <div ref={sentinelRef} style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#8694a7' }}>
              Loading more...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
