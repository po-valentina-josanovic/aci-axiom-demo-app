'use client';

import { useState } from 'react';
import TemplateIcon from './TemplateIcon';
import { TRIGGER_EVENTS, FIELD_TYPES } from './mockData';
import { REPETITIONS, EMPTY_RECURRENCE, describeRecurrence } from './recurrence';
import { RepeatIcon } from '../../components/NotificationBell';

const inputStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };
const sectionLabel = { fontSize: '10px', fontWeight: 700, color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em' };

const TONES = {
  info: { color: '#1e5bb8', background: '#eef4ff', border: '#c7d9f5' },
  muted: { color: '#5a6577', background: '#f8fafc', border: '#e2e8f0' },
  warning: { color: '#92400e', background: '#fffbeb', border: '#fde68a' },
  error: { color: '#b91c1c', background: '#fef2f2', border: '#fecaca' },
};

function segStyle(active, side) {
  return {
    padding: '6px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    color: active ? '#fff' : '#2979ff', background: active ? '#2979ff' : '#fff',
    border: '1px solid #2979ff',
    borderRadius: side === 'left' ? '6px 0 0 6px' : '0 6px 6px 0',
  };
}

function RecurrenceSummary({ summary }) {
  const t = TONES[summary.tone];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '8px', padding: '6px 10px', fontSize: '11px', borderRadius: '6px', color: t.color, background: t.background, border: `1px solid ${t.border}` }}>
      <span style={{ marginTop: '1px' }}><RepeatIcon size={11} /></span>
      <span>{summary.text}</span>
    </div>
  );
}

function DateRangeRepetition({ recurrence, onChange, required }) {
  const req = required ? ' *' : '';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
      <div>
        <label style={labelStyle}>Repeat From{req}</label>
        <input type="date" value={recurrence.start} max={recurrence.end || undefined} onChange={(e) => onChange({ start: e.target.value })} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Repeat Until{req}</label>
        <input type="date" value={recurrence.end} min={recurrence.start || undefined} onChange={(e) => onChange({ end: e.target.value })} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Repetition{req}</label>
        <RepetitionSelect value={recurrence.repetition} onChange={(v) => onChange({ repetition: v })} allowNone={!required} />
      </div>
    </div>
  );
}

function RepetitionSelect({ value, onChange, allowNone }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
      <option value="">{allowNone ? 'Does not repeat' : 'Select repetition...'}</option>
      {REPETITIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
    </select>
  );
}

function AudienceTile({ label, variant, active, checkbox, checked, onClick, joined }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        padding: '10px 8px', background: active ? '#f8fafc' : '#fff', cursor: 'pointer',
        border: active ? '2px solid #1e3a5f' : '1px solid #d9dfe7',
        borderRadius: joined === 'left' ? '8px 0 0 8px' : joined === 'right' ? '0 8px 8px 0' : '8px',
        marginLeft: joined === 'right' ? '-1px' : 0,
      }}
    >
      {checkbox && (
        <span style={{ position: 'absolute', top: '6px', right: '6px', width: '14px', height: '14px', border: '1px solid #8694a7', borderRadius: '3px', background: checked ? '#2979ff' : '#fff', color: '#fff', fontSize: '10px', lineHeight: '12px' }}>
          {checked ? '✓' : ''}
        </span>
      )}
      <TemplateIcon variant={variant} size={40} />
      <span style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{label}</span>
    </button>
  );
}

function Or() {
  return <span style={{ fontSize: '11px', fontWeight: 600, color: '#8694a7', alignSelf: 'center', padding: '0 4px' }}>OR</span>;
}

export default function TemplateBuilderModal({ template, templates, readOnly, onClose, onSave }) {
  const isEdit = !!template;
  const [form, setForm] = useState(() => template
    ? { ...template, recurrence: { ...EMPTY_RECURRENCE, ...template.recurrence } }
    : { type: 'custom', name: '', event: '', audience: 'all', fields: [], recurrence: { ...EMPTY_RECURRENCE } });
  const [showPreview, setShowPreview] = useState(false);

  const usedEvents = templates.filter((t) => t.type === 'auto' && t.id !== template?.id).map((t) => t.event);
  const availableEvents = TRIGGER_EVENTS.filter((e) => !usedEvents.includes(e.key));
  const event = TRIGGER_EVENTS.find((e) => e.key === form.event) || null;
  const summary = describeRecurrence(form.type, form.recurrence, event);
  const canSave = form.name.trim() && (form.type === 'custom' || form.event) && summary.valid;

  function set(patch) { setForm((f) => ({ ...f, ...patch })); }
  function setRecurrence(patch) { setForm((f) => ({ ...f, recurrence: { ...f.recurrence, ...patch } })); }

  function setType(type) {
    if (type === form.type) return;
    set({ type, event: '', recurrence: { ...EMPTY_RECURRENCE } });
  }

  function setEvent(key) {
    const ev = TRIGGER_EVENTS.find((e) => e.key === key);
    set({ event: key, recurrence: { ...EMPTY_RECURRENCE, repetition: ev?.defaultRepetition || '' } });
  }

  function toggleAudience(part) {
    const a = form.audience;
    const users = a === 'users' || a === 'users_groups';
    const groups = a === 'groups' || a === 'users_groups';
    const nu = part === 'users' ? !users : users;
    const ng = part === 'groups' ? !groups : groups;
    set({ audience: nu && ng ? 'users_groups' : nu ? 'users' : ng ? 'groups' : 'all' });
  }

  function handleSave() {
    if (!canSave) return;
    const r = form.recurrence;
    // Auto-trigger without override ignores the duration — drop stale dates.
    const recurrence = form.type === 'auto' && !r.override ? { ...r, start: '', end: '' } : r;
    onSave({ ...form, name: form.name.trim(), recurrence, active: form.active ?? true });
  }

  const a = form.audience;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '860px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', margin: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Announcement Template Builder</h2>
          <button onClick={onClose} style={{ color: '#8694a7', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <fieldset disabled={readOnly} style={{ border: 'none', margin: 0, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
          {/* Announcement type */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Announcement Type</span>
            <div style={{ display: 'flex' }}>
              <button type="button" onClick={() => setType('custom')} disabled={isEdit} style={{ ...segStyle(form.type === 'custom', 'left'), cursor: isEdit ? 'default' : 'pointer' }}>Custom</button>
              <button type="button" onClick={() => setType('auto')} disabled={isEdit} style={{ ...segStyle(form.type === 'auto', 'right'), cursor: isEdit ? 'default' : 'pointer' }}>Auto-Trigger</button>
            </div>
          </div>

          {/* Template name */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label style={labelStyle}>Template Name *</label>
              <button type="button" onClick={() => setShowPreview((p) => !p)} style={{ fontSize: '12px', color: '#2979ff', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
            </div>
            <input type="text" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Enter the announcement heading" style={inputStyle} />
          </div>

          {showPreview && (
            <div style={{ border: '1px dashed #a8c4e6', borderRadius: '8px', padding: '10px 14px', background: 'rgba(219,228,240,0.15)' }}>
              <div style={{ ...sectionLabel, marginBottom: '6px' }}>Bell preview</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                {form.name || 'Untitled notification'}
                {form.recurrence.repetition && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', padding: '1px 6px' }}>
                    <RepeatIcon /> {REPETITIONS.find((r) => r.value === form.recurrence.repetition)?.label}
                  </span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 400, color: '#8694a7' }}>just now</span>
              </div>
            </div>
          )}

          {/* Custom: optional recurring reminder directly under the name */}
          {form.type === 'custom' && (
            <div>
              <div style={{ ...sectionLabel, marginBottom: '8px' }}>Recurring Reminder <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: '#8694a7' }}>(optional)</span></div>
              <DateRangeRepetition recurrence={form.recurrence} onChange={setRecurrence} />
              <RecurrenceSummary summary={summary} />
            </div>
          )}

          {/* Auto-trigger: event + fixed stop condition / override */}
          {form.type === 'auto' && (
            <>
              <div>
                <label style={labelStyle}>Trigger When *</label>
                <select value={form.event} onChange={(e) => setEvent(e.target.value)} style={inputStyle}>
                  {availableEvents.length === 0 ? (
                    <option value="">No trigger events available - all events already have a template.</option>
                  ) : (
                    <>
                      <option value="">Select trigger event...</option>
                      {availableEvents.map((ev) => <option key={ev.key} value={ev.key}>{ev.label}</option>)}
                    </>
                  )}
                </select>
              </div>

              {event && (
                <div>
                  <div style={{ ...sectionLabel, marginBottom: '8px' }}>Recurring Reminder</div>
                  {!form.recurrence.override ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Stop Condition <span style={{ fontWeight: 400, color: '#8694a7' }}>(default)</span></label>
                        <div style={{ ...inputStyle, background: '#f1f5f9', color: '#3a4a5c' }}>Until {event.stopCondition}</div>
                      </div>
                      <div>
                        <label style={labelStyle}>Repetition *</label>
                        <RepetitionSelect value={form.recurrence.repetition} onChange={(v) => setRecurrence({ repetition: v })} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '11px', color: '#8694a7', marginBottom: '8px' }}>
                        Default stop condition <span style={{ textDecoration: 'line-through' }}>until {event.stopCondition}</span> no longer applies.
                      </div>
                      <DateRangeRepetition recurrence={form.recurrence} onChange={setRecurrence} required />
                    </>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: '#1e293b', cursor: 'pointer', width: 'fit-content' }}>
                    <input
                      type="checkbox"
                      checked={form.recurrence.override}
                      onChange={(e) => setRecurrence({ override: e.target.checked, start: '', end: '', repetition: e.target.checked ? '' : event.defaultRepetition })}
                    />
                    Override default stop condition with a custom duration
                  </label>
                  <RecurrenceSummary summary={summary} />
                </div>
              )}
            </>
          )}

          {/* Dynamic content fields */}
          <div style={sectionLabel}>Dynamic Content Fields</div>
          <div style={{ border: '1px solid #d9dfe7', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#2979ff' }}>1.</span>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#d32f2f' }}>User Selection</span>
                  <span style={{ fontSize: '11px', color: '#8694a7', marginLeft: '6px' }}>who receives the announcement</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <AudienceTile label="Select All" variant="all" active={a === 'all'} onClick={() => set({ audience: 'all' })} />
                  <Or />
                  <div style={{ display: 'flex', flex: 2 }}>
                    <AudienceTile label="Specific Users" variant="users" joined="left" checkbox checked={a === 'users' || a === 'users_groups'} active={a === 'users' || a === 'users_groups'} onClick={() => toggleAudience('users')} />
                    <AudienceTile label="User Groups" variant="groups" joined="right" checkbox checked={a === 'groups' || a === 'users_groups'} active={a === 'groups' || a === 'users_groups'} onClick={() => toggleAudience('groups')} />
                  </div>
                  <Or />
                  <AudienceTile label="Job-Specific" variant="job" active={a === 'job'} onClick={() => set({ audience: 'job' })} />
                </div>
              </div>
            </div>

            {form.fields.map((key, i) => {
              const ft = FIELD_TYPES.find((f) => f.key === key);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eef1f5', paddingTop: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#2979ff' }}>{i + 2}.</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: ft.color, width: '160px' }}>{ft.label}</span>
                  <input type="text" disabled placeholder={`${ft.label} content is filled in when publishing`} style={{ ...inputStyle, flex: 1, background: '#f8fafc' }} />
                  <button type="button" onClick={() => set({ fields: form.fields.filter((_, j) => j !== i) })} style={{ padding: '4px 10px', fontSize: '11px', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Remove</button>
                </div>
              );
            })}
          </div>

          <div style={{ border: '1px solid #d9dfe7', borderRadius: '8px', padding: '12px 16px' }}>
            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#1e293b', paddingBottom: '8px', marginBottom: '10px', borderBottom: '1px solid #eef1f5' }}>
              Click on the fields below to add them as additional
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {FIELD_TYPES.map((ft) => (
                <button key={ft.key} type="button" onClick={() => set({ fields: [...form.fields, ft.key] })} style={{ padding: '5px 10px', fontSize: '12px', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '6px', cursor: 'pointer' }}>
                  <span style={{ color: ft.color, fontWeight: 500 }}>{ft.label}</span>
                  <span style={{ color: '#8694a7', fontSize: '11px', marginLeft: '6px' }}>{ft.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </fieldset>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '14px 24px', borderTop: '1px solid #d9dfe7' }}>
          <button onClick={onClose} style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, color: '#3a4a5c', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button onClick={handleSave} disabled={!canSave} style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', background: canSave ? '#2979ff' : '#a8b5c4', border: 'none', borderRadius: '6px', cursor: canSave ? 'pointer' : 'default' }}>
              {isEdit ? 'Save Changes' : 'Create Template'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
