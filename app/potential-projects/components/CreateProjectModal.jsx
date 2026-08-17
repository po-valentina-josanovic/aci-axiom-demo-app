'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useProjects } from './ProjectsStore';
import { formatDateMDY } from './formatters';

const initialForm = {
  division: '',
  project_name: '',
  description: '',
  probability_percent: '',
  bid_date: '',
  estimated_project_start: '',
  project_stage: 'Preliminary',
  project_type: '',
  end_sector: '',
  nda: '',
};

// Border is longhand on purpose: the error/warn/copied variants below override
// borderColor, and mixing that with a `border` shorthand makes React warn.
const inputStyle = {
  width: '100%',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#c8d1dc',
  borderRadius: '6px',
  padding: '7px 10px',
  fontSize: '12px',
  outline: 'none',
  background: '#fff',
  color: '#1e293b',
};

const inputErrorStyle = {
  ...inputStyle,
  borderColor: '#d32f2f',
  background: '#fef2f2',
};

const inputWarnStyle = {
  ...inputStyle,
  borderColor: '#f9a825',
  background: '#fffde7',
};

// Copied-but-not-yet-reviewed fields get a light blue tint that clears on edit.
const inputCopiedStyle = {
  ...inputStyle,
  borderColor: '#a8ccff',
  background: '#f4f9ff',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#3a4a5c',
  marginBottom: '4px',
};

const labelRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '6px',
  marginBottom: '4px',
};

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

function yesNoStyle(value, base = inputStyle) {
  if (value === 'Yes') return { ...base, color: '#15803d', background: '#f0fdf4', borderColor: '#86efac' };
  if (value === 'No') return { ...base, color: '#b91c1c', background: '#fef2f2', borderColor: '#fecaca' };
  return base;
}

// Field label with an optional "copied" chip on the right.
function FieldLabel({ text, copied, required = true }) {
  return (
    <div style={labelRowStyle}>
      <label style={{ ...labelStyle, marginBottom: 0 }}>
        {text} {required && <span style={{ color: '#d32f2f' }}>*</span>}
      </label>
      {copied && <CopiedTag />}
    </div>
  );
}

// Marks a field whose value came from the copied project and hasn't been touched yet.
function CopiedTag() {
  return (
    <span
      title="Copied from the source project — edit freely"
      style={{
        fontSize: '9px', fontWeight: 700, color: '#2979ff', background: '#e7f1ff',
        border: '1px solid #cfe2ff', padding: '0 5px', borderRadius: '10px',
        letterSpacing: '0.03em', textTransform: 'uppercase', flexShrink: 0, whiteSpace: 'nowrap',
      }}
    >
      copied
    </span>
  );
}

export default function CreateProjectModal({ open, onClose, onCreated, initialCopySourceId = null }) {
  const {
    createProject, STAGES, PROJECT_TYPES, DIVISIONS, END_SECTORS, CURRENT_USER, projects,
    COPY_SECTIONS, COPY_GROUPS, COPY_GROUP_FORM_FIELDS, buildCopyPayload,
  } = useProjects();

  const defaultForm = useMemo(() => ({ ...initialForm, division: CURRENT_USER.division }), [CURRENT_USER]);
  const defaultGroups = useMemo(() => {
    const g = {};
    COPY_GROUPS.forEach((grp) => { g[grp.key] = grp.defaultOn; });
    return g;
  }, [COPY_GROUPS]);

  const [form, setForm] = useState(defaultForm);
  const [touched, setTouched] = useState({});

  // --- Copy-from-existing state ---
  const [copySourceId, setCopySourceId] = useState('');
  const [copyGroups, setCopyGroups] = useState(defaultGroups);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copySearch, setCopySearch] = useState('');
  const [copiedFields, setCopiedFields] = useState({});   // fields currently holding a copied value
  const [userEdited, setUserEdited] = useState({});       // manual edits always win over a copy
  const [copyPanelOpen, setCopyPanelOpen] = useState(true); // "What to copy" collapses once they're happy with it
  const [openSections, setOpenSections] = useState({});     // per-section expand state

  const copySource = useMemo(
    () => (copySourceId ? projects.find((p) => p.id === copySourceId) || null : null),
    [copySourceId, projects]
  );

  // Recomputes the modal-visible fields for a given source + group selection.
  // Pure so it can run both from event handlers and from the open-effect below.
  function computeCopy(baseForm, source, groups, edited) {
    const { form: copiedForm } = buildCopyPayload(source, Object.keys(groups).filter((k) => groups[k]));
    const nextForm = { ...baseForm };
    const copied = {};
    Object.entries(COPY_GROUP_FORM_FIELDS).forEach(([groupKey, fields]) => {
      fields.forEach((field) => {
        if (edited[field]) return; // user typed here — leave it alone
        const val = copiedForm[field];
        if (source && groups[groupKey] && val !== undefined && val !== '') {
          nextForm[field] = val;
          copied[field] = true;
        } else {
          nextForm[field] = defaultForm[field];
        }
      });
    });
    return { form: nextForm, copied };
  }

  // Initialize on open — supports the list page's row-level Duplicate action.
  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) {
      const source = initialCopySourceId ? projects.find((p) => p.id === initialCopySourceId) || null : null;
      const { form: nextForm, copied } = computeCopy(defaultForm, source, defaultGroups, {});
      setForm(nextForm);
      setCopiedFields(copied);
      setCopySourceId(source ? source.id : '');
      setCopyGroups(defaultGroups);
      setPickerOpen(false);
      setCopySearch('');
      setTouched({});
      setUserEdited({});
      setCopyPanelOpen(true);
      setOpenSections({});
    }
    prevOpen.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCopySourceId]);

  // Candidate source projects — most recent first, filtered by the search box.
  const copyCandidates = useMemo(() => {
    const q = copySearch.trim().toLowerCase();
    const matches = projects.filter((p) => {
      if (!q) return true;
      const haystack = [
        p.potential_project_number,
        p.project_name,
        p.description,
        p.site_location?.city,
        p.site_location?.state,
        ...(p.clients || []).map((c) => c.company_name || c.name || ''),
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
    return matches
      .slice()
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 8);
  }, [projects, copySearch]);

  // Generate preview project number once all fields are valid
  const previewProjectNumber = useMemo(() => {
    const allFilled =
      form.division &&
      form.project_name.trim() &&
      form.description.trim() &&
      form.probability_percent !== '' &&
      form.probability_percent >= 0 &&
      form.probability_percent <= 100 &&
      form.bid_date &&
      form.estimated_project_start &&
      form.project_stage &&
      form.project_type &&
      form.end_sector &&
      form.nda;

    if (!allFilled) return null;

    const year = new Date().getFullYear().toString().slice(-2);
    const divCode = form.division.padStart(2, '0');
    const prefix = `${year}-${divCode}`;
    const existing = projects.filter(
      (p) => p.potential_project_number && p.potential_project_number.startsWith(prefix)
    );
    const nextSeq = (existing.length + 1).toString().padStart(2, '0');
    return `${prefix}${nextSeq}-${CURRENT_USER.initials}`;
  }, [form, projects, CURRENT_USER]);

  if (!open) return null;

  const errors = {};
  if (!form.division) errors.division = 'Division is required';
  if (!form.project_name.trim()) errors.project_name = 'Project name is required';
  if (!form.description.trim()) errors.description = 'Description is required';
  if (form.probability_percent === '' || form.probability_percent < 0 || form.probability_percent > 100)
    errors.probability_percent = 'Must be 0-100';
  if (!form.bid_date) errors.bid_date = 'Bid date is required';
  if (!form.estimated_project_start) errors.estimated_project_start = 'Start date is required';
  if (!form.project_stage) errors.project_stage = 'Status is required';
  if (!form.project_type) errors.project_type = 'Project type is required';
  if (!form.end_sector) errors.end_sector = 'End sector is required';
  if (!form.nda) errors.nda = 'NDA selection is required';

  const isValid = Object.keys(errors).length === 0;

  const dateWarnings = {};
  if (form.bid_date && new Date(form.bid_date) < new Date(new Date().toDateString())) {
    dateWarnings.bid_date = 'This date is in the past';
  }
  if (form.estimated_project_start && new Date(form.estimated_project_start) < new Date(new Date().toDateString())) {
    dateWarnings.estimated_project_start = 'This date is in the past';
  }
  if (form.bid_date && form.estimated_project_start && form.estimated_project_start < form.bid_date) {
    dateWarnings.estimated_project_start = 'Start date is before bid date';
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setUserEdited((prev) => ({ ...prev, [field]: true }));
    // Once the user edits a copied field it is theirs — drop the marker.
    setCopiedFields((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSelectSource(id) {
    const source = projects.find((p) => p.id === id) || null;
    const { form: nextForm, copied } = computeCopy(form, source, copyGroups, userEdited);
    setCopySourceId(source ? source.id : '');
    setForm(nextForm);
    setCopiedFields(copied);
    setPickerOpen(false);
    setCopySearch('');
    setCopyPanelOpen(true);   // show what's coming across on a fresh pick
    setOpenSections({});
  }

  // An item is "empty" when the source project has nothing in it. Nothing is ever
  // disabled because of this — it only changes the hint text under the label.
  function isItemEmpty(item) {
    if (!copySource) return true;
    const count = item.count ? item.count(copySource) : null;
    if (count !== null) return count === 0;
    return !(item.preview ? item.preview(copySource) : '');
  }

  // Every selection change funnels through here so the visible fields stay in sync.
  function applyGroups(nextGroups) {
    const { form: nextForm, copied } = computeCopy(form, copySource, nextGroups, userEdited);
    setCopyGroups(nextGroups);
    setForm(nextForm);
    setCopiedFields(copied);
  }

  function handleToggleGroup(key) {
    applyGroups({ ...copyGroups, [key]: !copyGroups[key] });
  }

  function handleToggleSection(section) {
    const allOn = section.items.every((i) => copyGroups[i.key]);
    const next = { ...copyGroups };
    section.items.forEach((i) => { next[i.key] = !allOn; });
    applyGroups(next);
  }

  function handlePreset(mode) {
    const next = {};
    COPY_GROUPS.forEach((item) => {
      next[item.key] = mode === 'all' ? true : mode === 'none' ? false : item.defaultOn;
    });
    applyGroups(next);
  }

  function handleRemoveSource() {
    const { form: nextForm, copied } = computeCopy(form, null, copyGroups, userEdited);
    setCopySourceId('');
    setForm(nextForm);
    setCopiedFields(copied);
    setPickerOpen(false);
    setCopySearch('');
  }

  function resetAll() {
    setForm(defaultForm);
    setTouched({});
    setCopySourceId('');
    setCopyGroups(defaultGroups);
    setPickerOpen(false);
    setCopySearch('');
    setCopiedFields({});
    setUserEdited({});
    setCopyPanelOpen(true);
    setOpenSections({});
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) {
      const allTouched = {};
      Object.keys(initialForm).forEach((k) => { allTouched[k] = true; });
      setTouched(allTouched);
      return;
    }

    // Deeper sections (site, contacts, clients, contract, bid setup, costs) ride
    // along as a separate payload — the modal itself only renders the basics.
    const activeKeys = COPY_GROUPS.filter((i) => copyGroups[i.key]).map((i) => i.key);
    const { record } = buildCopyPayload(copySource, activeKeys);
    const copiedFrom = copySource
      ? {
          id: copySource.id,
          potential_project_number: copySource.potential_project_number,
          project_name: copySource.project_name,
          sections: activeKeys,
          copied_at: new Date().toISOString(),
        }
      : null;

    const project = createProject(
      { ...form, probability_percent: Number(form.probability_percent), copied_from: copiedFrom },
      copySource ? record : null
    );
    resetAll();
    onCreated(project);
  }

  function handleClose() {
    resetAll();
    onClose();
  }

  function getInputStyle(field) {
    if (touched[field] && errors[field]) return inputErrorStyle;
    if (dateWarnings[field]) return inputWarnStyle;
    if (copiedFields[field]) return inputCopiedStyle;
    return inputStyle;
  }

  const copiedCount = Object.keys(copiedFields).length;

  const selectedItemCount = COPY_GROUPS.filter((i) => copyGroups[i.key]).length;

  // Section names with at least one item selected — shown when the panel is collapsed.
  const selectedSectionSummary = COPY_SECTIONS
    .filter((s) => s.items.some((i) => copyGroups[i.key]))
    .map((s) => s.label)
    .join(', ');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
      {/* Flex column so the header and footer stay put while the middle scrolls. */}
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '700px', maxHeight: '90vh', margin: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #d9dfe7', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>New Potential Project</h2>
            {previewProjectNumber && (
              <div style={{ fontSize: '12px', color: '#2979ff', fontFamily: 'monospace', marginTop: '4px', fontWeight: 600 }}>
                {previewProjectNumber}
              </div>
            )}
          </div>
          <button onClick={handleClose} style={{ color: '#8694a7', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable middle — copy panel + form */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

        {/* --- Copy from an existing project (optional) --- */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #e8ecf1', background: '#f8fafc' }}>
          {!copySource ? (
            <>
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px', width: '100%',
                  padding: '7px 10px', fontSize: '12px', fontWeight: 600, color: '#2979ff',
                  background: '#fff', border: '1px dashed #a8ccff', borderRadius: '6px', cursor: 'pointer',
                }}
              >
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Start from an existing project
                <span style={{ fontWeight: 400, color: '#8694a7' }}>(optional)</span>
                <span style={{ marginLeft: 'auto', color: '#8694a7', fontSize: '10px' }}>{pickerOpen ? '▲' : '▼'}</span>
              </button>

              {pickerOpen && (
                <div style={{ marginTop: '8px', background: '#fff', border: '1px solid #d9dfe7', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid #e8ecf1' }}>
                    <input
                      type="text"
                      autoFocus
                      value={copySearch}
                      onChange={(e) => setCopySearch(e.target.value)}
                      placeholder="Search by project #, name, client or city..."
                      style={inputStyle}
                    />
                  </div>
                  {copyCandidates.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: '#8694a7' }}>
                      No projects match that search.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '190px', overflowY: 'auto' }}>
                      {copyCandidates.map((p, idx) => {
                        const stage = STAGE_COLORS[p.project_stage] || STAGE_COLORS.Preliminary;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectSource(p.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left',
                              padding: '7px 10px', fontSize: '11px', background: idx % 2 === 0 ? '#fff' : '#f8fafc',
                              border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', color: '#1e293b',
                            }}
                          >
                            <span style={{ fontFamily: 'monospace', color: '#2979ff', fontWeight: 600, flexShrink: 0, width: '96px' }}>
                              {p.potential_project_number}
                            </span>
                            <span style={{ fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.project_name}
                            </span>
                            <span style={{
                              fontSize: '9px', fontWeight: 600, padding: '1px 6px', borderRadius: '10px',
                              background: stage.bg, color: stage.color, flexShrink: 0,
                            }}>
                              {p.project_stage}
                            </span>
                            <span style={{ color: '#8694a7', flexShrink: 0, width: '78px', textAlign: 'right' }}>
                              {formatDateMDY(p.bid_date)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #cfe2ff', borderRadius: '6px', overflow: 'hidden' }}>
              {/* Source chip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#f4f9ff', borderBottom: '1px solid #e7f1ff' }}>
                <svg style={{ width: '14px', height: '14px', color: '#2979ff', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span style={{ fontSize: '11px', color: '#5a6577', flexShrink: 0 }}>Copying from</span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600, color: '#2979ff', flexShrink: 0 }}>
                  {copySource.potential_project_number}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {copySource.project_name}
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button type="button" onClick={() => setPickerOpen(true)} style={{ fontSize: '11px', color: '#2979ff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                    Change
                  </button>
                  <span style={{ color: '#c8d1dc' }}>|</span>
                  <button type="button" onClick={handleRemoveSource} style={{ fontSize: '11px', color: '#8694a7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                    Remove
                  </button>
                </div>
              </div>

              {pickerOpen && (
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #e8ecf1' }}>
                  <input
                    type="text"
                    autoFocus
                    value={copySearch}
                    onChange={(e) => setCopySearch(e.target.value)}
                    placeholder="Search for a different project..."
                    style={{ ...inputStyle, marginBottom: '6px' }}
                  />
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e8ecf1', borderRadius: '6px' }}>
                    {copyCandidates.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectSource(p.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left',
                          padding: '6px 8px', fontSize: '11px', background: p.id === copySourceId ? '#f4f9ff' : '#fff',
                          border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', color: '#1e293b',
                        }}
                      >
                        <span style={{ fontFamily: 'monospace', color: '#2979ff', fontWeight: 600, width: '96px', flexShrink: 0 }}>
                          {p.potential_project_number}
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.project_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* What to copy — collapses to a summary line once they're happy with it */}
              <div>
                <button
                  type="button"
                  onClick={() => setCopyPanelOpen((v) => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '7px 10px', background: '#fff', border: 'none',
                    borderBottom: copyPanelOpen ? '1px solid #e8ecf1' : 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#3a4a5c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    What to copy
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#2979ff', background: '#e7f1ff', padding: '1px 6px', borderRadius: '10px' }}>
                    {selectedItemCount} of {COPY_GROUPS.length}
                  </span>
                  {!copyPanelOpen && (
                    <span style={{ fontSize: '10px', color: '#8694a7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedSectionSummary || 'Nothing selected'}
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#2979ff', fontWeight: 600, flexShrink: 0 }}>
                    {copyPanelOpen ? 'Collapse ▲' : 'Edit ▼'}
                  </span>
                </button>

                {copyPanelOpen && (
                  <div style={{ padding: '8px 10px' }}>
                    {/* Presets */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
                      <span style={{ fontSize: '10px', color: '#8694a7' }}>Select:</span>
                      {[['recommended', 'Recommended'], ['all', 'Everything'], ['none', 'None']].map(([mode, label]) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handlePreset(mode)}
                          style={{
                            fontSize: '10px', fontWeight: 600, color: '#2979ff', background: '#fff',
                            border: '1px solid #cfe2ff', borderRadius: '10px', padding: '1px 8px', cursor: 'pointer',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* One collapsible block per section of the detail page */}
                    {COPY_SECTIONS.map((section) => {
                      const onCount = section.items.filter((i) => copyGroups[i.key]).length;
                      const allOn = onCount === section.items.length;
                      const someOn = onCount > 0 && !allOn;
                      const expanded = !!openSections[section.key];
                      return (
                        <div key={section.key} style={{ border: '1px solid #e8ecf1', borderRadius: '6px', marginBottom: '5px', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 8px', background: onCount ? '#f8fbff' : '#fbfcfe' }}>
                            <input
                              type="checkbox"
                              checked={allOn}
                              ref={(el) => { if (el) el.indeterminate = someOn; }}
                              onChange={() => handleToggleSection(section)}
                              title={allOn ? `Clear all of ${section.label}` : `Select all of ${section.label}`}
                              style={{ flexShrink: 0, accentColor: '#2979ff', cursor: 'pointer' }}
                            />
                            <button
                              type="button"
                              onClick={() => setOpenSections((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '7px', flex: 1, minWidth: 0,
                                background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
                              }}
                            >
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{section.label}</span>
                              <span style={{ fontSize: '10px', color: onCount ? '#2979ff' : '#8694a7' }}>
                                {onCount} of {section.items.length}
                              </span>
                              {section.note && !expanded && (
                                <span style={{ fontSize: '10px', color: '#a36100', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {section.note}
                                </span>
                              )}
                              <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#8694a7', flexShrink: 0 }}>
                                {expanded ? '▲' : '▼'}
                              </span>
                            </button>
                          </div>

                          {expanded && (
                            <div style={{ padding: '6px 8px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', borderTop: '1px solid #f1f5f9' }}>
                              {section.items.map((item) => {
                                const isEmpty = isItemEmpty(item);
                                const on = !!copyGroups[item.key];
                                const preview = item.preview ? item.preview(copySource) : '';
                                const count = item.count ? item.count(copySource) : null;
                                // Only the critical fields read as muted when unselected —
                                // everything stays clickable either way.
                                const muted = item.caution && !on;
                                return (
                                  <label
                                    key={item.key}
                                    title={item.hint || ''}
                                    style={{
                                      display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '4px 6px',
                                      border: `1px solid ${on ? '#cfe2ff' : '#eef2f7'}`, borderRadius: '6px',
                                      background: on ? '#f8fbff' : (muted ? '#fcfcfd' : '#fff'),
                                      cursor: 'pointer', minWidth: 0,
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={on}
                                      onChange={() => handleToggleGroup(item.key)}
                                      style={{ marginTop: '2px', flexShrink: 0, accentColor: '#2979ff' }}
                                    />
                                    <span style={{ minWidth: 0 }}>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: muted ? '#8694a7' : '#1e293b' }}>{item.label}</span>
                                        {count !== null && count > 0 && (
                                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#5a6577', background: '#eef2f7', padding: '0 5px', borderRadius: '10px' }}>
                                            {count}
                                          </span>
                                        )}
                                        {item.caution && (
                                          <span title="Off by default — copy it if you want, but check the value" style={{ fontSize: '9px', fontWeight: 700, color: '#a36100', background: '#fef9c2', padding: '0 5px', borderRadius: '10px' }}>
                                            review
                                          </span>
                                        )}
                                      </span>
                                      <span style={{
                                        display: 'block', fontSize: '10px', color: '#8694a7', marginTop: '1px',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                      }}>
                                        {isEmpty ? 'Empty on source' : (preview || item.hint || '')}
                                      </span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <p style={{ fontSize: '10px', color: '#8694a7', margin: '8px 0 0', lineHeight: 1.45 }}>
                      Sections match the project detail page. Anything here can be copied — the
                      ones marked <strong style={{ color: '#a36100' }}>review</strong> just start
                      off. Project name is always yours to enter; the project number, created by
                      and data source are generated fresh.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 24px' }}>
          {copySource && copiedCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px',
              padding: '6px 10px', background: '#f4f9ff', border: '1px solid #cfe2ff',
              borderRadius: '6px', fontSize: '11px', color: '#3a4a5c',
            }}>
              <svg style={{ width: '13px', height: '13px', color: '#2979ff', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>{copiedCount}</strong> field{copiedCount !== 1 ? 's' : ''} prefilled from the source project — edit anything.
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Row 1: Division + Project Name + End Sector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <FieldLabel text="Division" copied={!!copiedFields.division} />
                <select value={form.division} onChange={(e) => handleChange('division', e.target.value)} style={getInputStyle('division')}>
                  <option value="">Select division...</option>
                  {DIVISIONS.map((d) => <option key={d.code} value={d.code}>{d.code} - {d.name}</option>)}
                </select>
                {touched.division && errors.division && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.division}</p>}
              </div>
              <div>
                <FieldLabel text="Project Name" copied={!!copiedFields.project_name} />
                <input type="text" value={form.project_name} onChange={(e) => handleChange('project_name', e.target.value)} style={getInputStyle('project_name')} placeholder="Enter project name" />
                {touched.project_name && errors.project_name && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.project_name}</p>}
              </div>
              <div>
                <FieldLabel text="End Sector" copied={!!copiedFields.end_sector} />
                <select value={form.end_sector} onChange={(e) => handleChange('end_sector', e.target.value)} style={getInputStyle('end_sector')}>
                  <option value="">Select...</option>
                  {END_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {touched.end_sector && errors.end_sector && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.end_sector}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <FieldLabel text="Description" copied={!!copiedFields.description} />
              <textarea rows={2} value={form.description} onChange={(e) => handleChange('description', e.target.value)} style={getInputStyle('description')} placeholder="Project description" />
              {touched.description && errors.description && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.description}</p>}
            </div>

            {/* Row 2: Probability + Project Type + Project Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <FieldLabel text="Probability %" copied={!!copiedFields.probability_percent} />
                <input type="number" min={0} max={100} value={form.probability_percent} onChange={(e) => handleChange('probability_percent', e.target.value)} style={getInputStyle('probability_percent')} placeholder="0-100" />
                {touched.probability_percent && errors.probability_percent && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.probability_percent}</p>}
              </div>
              <div>
                <FieldLabel text="Project Type" copied={!!copiedFields.project_type} />
                <select value={form.project_type} onChange={(e) => handleChange('project_type', e.target.value)} style={getInputStyle('project_type')}>
                  <option value="">Select type...</option>
                  {PROJECT_TYPES.map((t) => <option key={t.code} value={t.code}>{t.code} - {t.name}</option>)}
                </select>
                {touched.project_type && errors.project_type && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.project_type}</p>}
              </div>
              <div>
                <FieldLabel text="Project Status" copied={!!copiedFields.project_stage} />
                <select value={form.project_stage} onChange={(e) => handleChange('project_stage', e.target.value)} style={getInputStyle('project_stage')}>
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {touched.project_stage && errors.project_stage && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.project_stage}</p>}
              </div>
            </div>

            {/* Row 3: Bid Date + Est. Start + NDA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <FieldLabel text="Bid Date" copied={!!copiedFields.bid_date} />
                <input type="date" value={form.bid_date} onChange={(e) => handleChange('bid_date', e.target.value)} style={getInputStyle('bid_date')} />
                {touched.bid_date && errors.bid_date && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.bid_date}</p>}
                {dateWarnings.bid_date && !errors.bid_date && <p style={{ fontSize: '10px', color: '#a36100', marginTop: '2px' }}>{dateWarnings.bid_date}</p>}
              </div>
              <div>
                <FieldLabel text="Est. Project Start" copied={!!copiedFields.estimated_project_start} />
                <input type="date" value={form.estimated_project_start} onChange={(e) => handleChange('estimated_project_start', e.target.value)} style={getInputStyle('estimated_project_start')} />
                {touched.estimated_project_start && errors.estimated_project_start && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.estimated_project_start}</p>}
                {dateWarnings.estimated_project_start && !errors.estimated_project_start && <p style={{ fontSize: '10px', color: '#a36100', marginTop: '2px' }}>{dateWarnings.estimated_project_start}</p>}
              </div>
              <div>
                <FieldLabel text="NDA" copied={!!copiedFields.nda} />
                <select value={form.nda} onChange={(e) => handleChange('nda', e.target.value)} style={touched.nda && errors.nda ? inputErrorStyle : yesNoStyle(form.nda)}>
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {touched.nda && errors.nda && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.nda}</p>}
              </div>
            </div>
          </div>
        </form>
        </div>
        {/* /scrollable middle */}

        {/* Footer — pinned, always reachable */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '14px 24px', borderTop: '1px solid #d9dfe7', background: '#f8fafc', flexShrink: 0 }}>
          <button type="button" onClick={handleClose} style={{ padding: '7px 14px', fontSize: '12px', color: '#3a4a5c', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 500 }}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={!isValid} style={{
            padding: '7px 14px', fontSize: '12px', color: '#fff', border: 'none', borderRadius: '6px',
            background: isValid ? '#2979ff' : '#a0c4ff', cursor: isValid ? 'pointer' : 'not-allowed',
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
