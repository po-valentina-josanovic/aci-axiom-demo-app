'use client';

import { useMemo, useState } from 'react';
import { ERROR_LOG, USERNAME_OPTIONS } from './mockData';
import { controlStyle, buttonSecondary, buttonPrimary } from './styles';
import { isWithinRange } from './dateUtils';
import MultiSelectDropdown from './MultiSelectDropdown';
import AuditTable from './AuditTable';

const COLUMNS = [
  { key: 'date', label: 'Date/Time', width: '140px' },
  { key: 'user', label: 'User', width: '220px' },
  { key: 'url', label: 'Url', width: '' },
  { key: 'method', label: 'Method', width: '90px' },
  { key: 'code', label: 'Code', width: '70px' },
  { key: 'type', label: 'Type', width: '140px' },
  { key: 'message', label: 'Message', width: '' },
];

const METHOD_OPTIONS = Array.from(new Set(ERROR_LOG.map((r) => r.method))).sort();
const CODE_OPTIONS = Array.from(new Set(ERROR_LOG.map((r) => String(r.code)))).sort();
const TYPE_OPTIONS = Array.from(new Set(ERROR_LOG.map((r) => r.type))).sort();

const defaultFilters = { search: '', usernames: [], from: '', to: '', methods: [], codes: [], types: [] };

export default function AuditErrorsTab() {
  const [draft, setDraft] = useState(defaultFilters);
  const [applied, setApplied] = useState(defaultFilters);

  const hasPendingChanges = JSON.stringify(draft) !== JSON.stringify(applied);
  const hasAppliedFilters = JSON.stringify(applied) !== JSON.stringify(defaultFilters);

  function applyFilters() {
    setApplied({ ...draft });
  }

  function resetFilters() {
    setDraft(defaultFilters);
    setApplied(defaultFilters);
  }

  const rows = useMemo(() => {
    let result = [...ERROR_LOG];

    if (applied.search.trim()) {
      const q = applied.search.toLowerCase();
      result = result.filter((r) =>
        [r.user, r.url, r.method, r.type, r.message, String(r.code)]
          .some((v) => (v || '').toLowerCase().includes(q))
      );
    }
    if (applied.usernames.length) {
      result = result.filter((r) => applied.usernames.includes(r.user));
    }
    if (applied.methods.length) result = result.filter((r) => applied.methods.includes(r.method));
    if (applied.codes.length) result = result.filter((r) => applied.codes.includes(String(r.code)));
    if (applied.types.length) result = result.filter((r) => applied.types.includes(r.type));
    // From/To also bounds the real Elmah API call itself (defaults to the
    // last 30 days when From isn't set) — not just a post-filter — so this
    // stays behind Apply rather than re-querying on every keystroke.
    if (applied.from || applied.to) {
      result = result.filter((r) => isWithinRange(r.date, applied.from, applied.to));
    }

    return result;
  }, [applied]);

  return (
    <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7' }}>
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ width: '13px', height: '13px', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8694a7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={draft.search}
            onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
            placeholder="Universal Search"
            style={{ ...controlStyle, width: '100%', paddingLeft: '30px' }}
          />
        </div>
      </div>

      {/* Toolbar — every filter plus Apply in one row (wraps below ~1400px
          viewports — iPad Pro and narrower — see .audit-toolbar-row). */}
      <div className="audit-toolbar-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px 14px' }}>
        <MultiSelectDropdown
          options={USERNAME_OPTIONS}
          selected={draft.usernames}
          onChange={(usernames) => setDraft((d) => ({ ...d, usernames }))}
          placeholder="All Users"
          style={{ flex: '1 1 150px', minWidth: '140px' }}
        />
        <input
          type="date"
          value={draft.from}
          onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
          style={{ ...controlStyle, flex: '0 1 145px', minWidth: '135px' }}
        />
        <input
          type="date"
          value={draft.to}
          onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
          style={{ ...controlStyle, flex: '0 1 145px', minWidth: '135px' }}
        />
        <MultiSelectDropdown
          options={METHOD_OPTIONS}
          selected={draft.methods}
          onChange={(methods) => setDraft((d) => ({ ...d, methods }))}
          placeholder="All Methods"
          style={{ flex: '1 1 140px', minWidth: '130px' }}
        />
        <MultiSelectDropdown
          options={CODE_OPTIONS}
          selected={draft.codes}
          onChange={(codes) => setDraft((d) => ({ ...d, codes }))}
          placeholder="All Codes"
          style={{ flex: '1 1 130px', minWidth: '120px' }}
        />
        <MultiSelectDropdown
          options={TYPE_OPTIONS}
          selected={draft.types}
          onChange={(types) => setDraft((d) => ({ ...d, types }))}
          placeholder="All Types"
          style={{ flex: '1 1 140px', minWidth: '130px' }}
        />

        {hasAppliedFilters && (
          <button onClick={resetFilters} style={buttonSecondary}>Reset Filters</button>
        )}
        <button onClick={applyFilters} disabled={!hasPendingChanges} style={buttonPrimary(hasPendingChanges)}>
          Apply Filters
        </button>
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0' }}>
        <AuditTable columns={COLUMNS} rows={rows} linkColumn="date" />
      </div>
    </div>
  );
}
