'use client';

import { useState, useRef, useEffect } from 'react';

// Accepts either a flat `options: string[]` or a grouped `groups: [{ label, options }]`.
// Grouped is used for Area/Event — long lists (30-70 entries) taken from the
// real AuditTrackerHelper/MessageHelper constants, split into blue-highlighted
// section headers so they're scannable instead of one long checkbox wall.
export default function MultiSelectDropdown({ options, groups, selected, onChange, placeholder = 'All', style }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const allOptions = groups ? groups.flatMap((g) => g.options) : options;

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(''); }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleOption(option) {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  const q = query.trim().toLowerCase();
  const visibleGroups = groups
    ? groups.map((g) => ({ ...g, options: g.options.filter((o) => o.toLowerCase().includes(q)) })).filter((g) => g.options.length)
    : null;
  const visibleOptions = !groups ? allOptions.filter((o) => o.toLowerCase().includes(q)) : visibleGroups.flatMap((g) => g.options);

  function selectAllVisible() {
    onChange(Array.from(new Set([...selected, ...visibleOptions])));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: '150px', flex: '1 1 170px', ...style }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'stretch', width: '100%', padding: 0,
          border: `1px solid ${open ? '#2979ff' : '#c8d1dc'}`,
          borderRadius: '6px', overflow: 'hidden', background: '#fff', cursor: 'pointer',
          boxShadow: open ? '0 0 0 2px rgba(41,121,255,0.15)' : 'none',
        }}
      >
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: '26px', padding: '0 6px', fontSize: '11px', fontWeight: 700,
          color: '#fff', background: selected.length ? '#2979ff' : '#94a3b8',
        }}>
          {selected.length}
        </span>
        <span style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 10px', fontSize: '12px', color: '#1e293b', gap: '6px',
        }}>
          {placeholder}
          <UnfoldIcon />
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: '100%', width: 'max-content', maxWidth: '360px',
            background: '#fff', border: '1px solid #d9dfe7', borderRadius: '6px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.14)', zIndex: 50,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', borderBottom: '1px solid #eef1f5' }}>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              style={{
                flex: 1, border: '1px solid #d9dfe7', borderRadius: '5px', padding: '6px 8px',
                fontSize: '12px', color: '#1e293b', outline: 'none',
              }}
            />
            <button type="button" onClick={selectAllVisible} style={pillButtonStyle}>All</button>
            <button type="button" onClick={clearAll} style={pillButtonStyle}>None</button>
          </div>

          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {groups ? (
              visibleGroups.length === 0 ? (
                <div style={{ padding: '14px 10px', fontSize: '12px', color: '#8694a7' }}>No matches.</div>
              ) : (
                visibleGroups.map((g) => (
                  <div key={g.label}>
                    <div style={{
                      padding: '6px 10px', fontSize: '10.5px', fontWeight: 700, color: '#fff',
                      background: '#1565c0', textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {g.label}
                    </div>
                    {g.options.map((option) => (
                      <OptionRow key={option} option={option} checked={selected.includes(option)} onToggle={() => toggleOption(option)} />
                    ))}
                  </div>
                ))
              )
            ) : (
              visibleOptions.length === 0 ? (
                <div style={{ padding: '14px 10px', fontSize: '12px', color: '#8694a7' }}>No matches.</div>
              ) : (
                visibleOptions.map((option) => (
                  <OptionRow key={option} option={option} checked={selected.includes(option)} onToggle={() => toggleOption(option)} />
                ))
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const pillButtonStyle = {
  padding: '5px 10px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#2979ff',
  background: '#fff',
  border: '1px solid #c8d1dc',
  borderRadius: '5px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

function OptionRow({ option, checked, onToggle }) {
  return (
    <label
      style={{
        display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 10px',
        fontSize: '12px', color: '#1e293b', cursor: 'pointer', whiteSpace: 'nowrap',
        background: checked ? '#eaf3fc' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = '#f5f8fb'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = checked ? '#eaf3fc' : 'transparent'; }}
    >
      <input type="checkbox" checked={checked} onChange={onToggle} style={{ margin: 0, flexShrink: 0 }} />
      {option}
    </label>
  );
}

function UnfoldIcon() {
  return (
    <svg style={{ width: '11px', height: '11px', flexShrink: 0, color: '#8694a7' }} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 5.5l3 3.2H7l3-3.2zM10 14.5l-3-3.2h6l-3 3.2z" />
    </svg>
  );
}
