'use client';

import { useMemo, useState } from 'react';
import { AUDIT_LOG, USERNAME_OPTIONS } from './mockData';
import { AREA_GROUPS, getEventGroupsForAreas } from './auditTaxonomy';
import { controlStyle, dividerStyle, buttonSecondary, buttonPrimary } from './styles';
import { isWithinRange } from './dateUtils';
import MultiSelectDropdown from './MultiSelectDropdown';
import AuditTable from './AuditTable';

const COLUMNS = [
  { key: 'date', label: 'Date/Time', width: '130px' },
  { key: 'username', label: 'Username', width: '130px' },
  { key: 'event', label: 'Event', width: '150px' },
  { key: 'area', label: 'Area', width: '220px' },
  { key: 'jobNumber', label: 'Job Number', width: '90px' },
  { key: 'jobName', label: 'Job Name', width: '150px' },
  { key: 'additionalInfo', label: 'Additional Info', width: '140px' },
  { key: 'field', label: 'Field', width: '160px' },
  { key: 'oldValue', label: 'Old Value', width: '' },
  { key: 'newValue', label: 'New Value', width: '' },
];

const defaultFilters = { search: '', usernames: [], areas: [], events: [], fields: [], jobs: [], from: '', to: '' };

function jobLabel(r) {
  return `${r.jobNumber} — ${r.jobName}`;
}

// Field is free text server-side (production resolves it against a
// friendly-name lookup, not a fixed list), but for this UI we treat it as a
// pickable set — same as Job — scoped to whatever Events are selected.
function fieldOptionsForEvents(events) {
  const source = events.length ? AUDIT_LOG.filter((r) => events.includes(r.event)) : AUDIT_LOG;
  return Array.from(new Set(source.map((r) => r.field))).sort();
}

const JOB_OPTIONS = Array.from(new Set(AUDIT_LOG.filter((r) => r.jobNumber !== 'N/A').map(jobLabel))).sort();

export default function AuditInfoTab() {
  const [draft, setDraft] = useState(defaultFilters);
  const [applied, setApplied] = useState(defaultFilters);

  const hasPendingChanges = JSON.stringify(draft) !== JSON.stringify(applied);
  const hasAppliedFilters = JSON.stringify(applied) !== JSON.stringify(defaultFilters);

  // Narrowing Area narrows which Events are offered, which in turn narrows
  // which Fields are offered — a UI convenience cascade only (see
  // auditTaxonomy.js); the applied filters below still match independently.
  const eventGroups = useMemo(() => getEventGroupsForAreas(draft.areas), [draft.areas]);
  const fieldOptions = useMemo(() => fieldOptionsForEvents(draft.events), [draft.events]);

  function setAreas(areas) {
    const stillAvailableEvents = getEventGroupsForAreas(areas).flatMap((g) => g.options);
    setDraft((d) => {
      const events = d.events.filter((e) => stillAvailableEvents.includes(e));
      const stillAvailableFields = fieldOptionsForEvents(events);
      const fields = d.fields.filter((f) => stillAvailableFields.includes(f));
      return { ...d, areas, events, fields };
    });
  }

  function setEvents(events) {
    const stillAvailableFields = fieldOptionsForEvents(events);
    setDraft((d) => ({ ...d, events, fields: d.fields.filter((f) => stillAvailableFields.includes(f)) }));
  }

  function applyFilters() {
    setApplied({ ...draft });
  }

  function resetFilters() {
    setDraft(defaultFilters);
    setApplied(defaultFilters);
  }

  const rows = useMemo(() => {
    let result = [...AUDIT_LOG];

    // Universal Search mirrors the real backend's "expensive path": a
    // full in-memory scan across every column, rather than a targeted
    // column match — which is exactly why it's gated behind Apply here
    // instead of firing on every keystroke.
    if (applied.search.trim()) {
      const q = applied.search.toLowerCase();
      result = result.filter((r) =>
        [r.username, r.event, r.area, r.jobNumber, r.jobName, r.additionalInfo, r.field, r.oldValue, r.newValue]
          .some((v) => (v || '').toLowerCase().includes(q))
      );
    }
    // Area matches if EITHER the page or the section is in the selected
    // set — same OR-against-Source-or-Application logic as production.
    if (applied.areas.length) {
      result = result.filter((r) => applied.areas.includes(r.page) || applied.areas.includes(r.section));
    }
    if (applied.events.length) result = result.filter((r) => applied.events.includes(r.event));
    if (applied.fields.length) result = result.filter((r) => applied.fields.includes(r.field));
    if (applied.jobs.length) result = result.filter((r) => applied.jobs.includes(jobLabel(r)));
    if (applied.usernames.length) result = result.filter((r) => applied.usernames.includes(r.username));
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
          viewports — iPad Pro and narrower — see .audit-toolbar-row). All
          fields are drafts until Apply is pressed. */}
      <div className="audit-toolbar-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px 14px' }}>
        <MultiSelectDropdown
          options={USERNAME_OPTIONS}
          selected={draft.usernames}
          onChange={(usernames) => setDraft((d) => ({ ...d, usernames }))}
          placeholder="All Users"
          style={{ flex: '1 1 130px', minWidth: '120px' }}
        />
        <input
          type="date"
          value={draft.from}
          onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
          style={{ ...controlStyle, flex: '0 1 130px', minWidth: '120px' }}
        />
        <input
          type="date"
          value={draft.to}
          onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
          style={{ ...controlStyle, flex: '0 1 130px', minWidth: '120px' }}
        />
        <MultiSelectDropdown
          options={JOB_OPTIONS}
          selected={draft.jobs}
          onChange={(jobs) => setDraft((d) => ({ ...d, jobs }))}
          placeholder="All Jobs"
          style={{ flex: '1 1 130px', minWidth: '120px' }}
        />

        <div style={dividerStyle} />

        <MultiSelectDropdown
          groups={AREA_GROUPS}
          selected={draft.areas}
          onChange={setAreas}
          placeholder="All Areas"
          style={{ flex: '1 1 130px', minWidth: '120px' }}
        />
        <MultiSelectDropdown
          key={`events-${draft.areas.join('|')}`}
          groups={eventGroups}
          selected={draft.events}
          onChange={setEvents}
          placeholder="All Events"
          style={{ flex: '1 1 130px', minWidth: '120px' }}
        />
        <MultiSelectDropdown
          key={`fields-${draft.events.join('|')}`}
          options={fieldOptions}
          selected={draft.fields}
          onChange={(fields) => setDraft((d) => ({ ...d, fields }))}
          placeholder="All Fields"
          style={{ flex: '1 1 130px', minWidth: '120px' }}
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
