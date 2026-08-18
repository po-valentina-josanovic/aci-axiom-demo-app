'use client';

import { useState, useMemo } from 'react';
import { SCOPE_CODES } from './data';

/** Pick the Vista scope codes a phase-code row maps to. Selected float to the top. */
export default function ScopeMappingModal({ current, onSave, onClose }) {
  const [draft, setDraft] = useState(() => new Set(current));
  const [search, setSearch] = useState('');

  const toggle = (code) => setDraft(prev => {
    const next = new Set(prev);
    next.has(code) ? next.delete(code) : next.add(code);
    return next;
  });

  const ACTIVE_CODES = useMemo(() => SCOPE_CODES.filter(s => s.active === 'Y'), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return ACTIVE_CODES;
    return ACTIVE_CODES.filter(s =>
      s.code.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [search, ACTIVE_CODES]);

  const selected   = filtered.filter(s => draft.has(s.code));
  const unselected = filtered.filter(s => !draft.has(s.code));

  function ScopeRow({ item }) {
    const checked = draft.has(item.code);
    return (
      <label
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '7px 16px', cursor: 'pointer',
          background: checked ? '#eff6ff' : 'transparent',
        }}
        onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = '#f8fafc'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = checked ? '#eff6ff' : 'transparent'; }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggle(item.code)}
          style={{ width: '14px', height: '14px', accentColor: '#2563eb', flexShrink: 0 }}
        />
        <span style={{ fontSize: '12px', color: '#1e293b' }}>{item.description}</span>
      </label>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: '10px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        width: '520px', maxWidth: '95vw',
        display: 'flex', flexDirection: 'column', maxHeight: '80vh',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Scope Codes Mapping</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', lineHeight: 1, padding: '2px 4px' }}>×</button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#94a3b8', pointerEvents: 'none' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scope codes…"
              style={{ width: '100%', padding: '6px 10px 6px 30px', fontSize: '12px', border: '1px solid #d9dfe7', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {selected.length > 0 && (
            <>
              {selected.map(s => <ScopeRow key={s.code} item={s} />)}
              {unselected.length > 0 && (
                <div style={{ margin: '4px 16px', borderTop: '2px solid #cbd5e1' }} />
              )}
            </>
          )}

          {unselected.map(s => <ScopeRow key={s.code} item={s} />)}

          {filtered.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No scope codes match your search.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 500, border: '1px solid #d9dfe7', borderRadius: '6px', background: '#fff', cursor: 'pointer', color: '#1e293b' }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave([...draft])}
              style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
