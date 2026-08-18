'use client';

// Small presentational controls used by the Platform Availability table.

export function IpadIcon({ color = '#1a4d8f', size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18" />
    </svg>
  );
}

export function MonitorIcon({ color = '#1a4d8f', size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function CheckMark({ color }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * The Web column: checked and locked, because every page is a web page.
 * Reads as a filled checkbox rather than a greyed-out one, so it stays legible
 * next to the live iPad checkboxes.
 */
export function LockedWebCheck({ editing }) {
  return (
    <span
      title={editing ? 'Always on' : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '16px', height: '16px', borderRadius: '3px', boxSizing: 'border-box',
        background: '#8694a7', border: '2px solid #8694a7',
        cursor: editing ? 'not-allowed' : 'default',
        verticalAlign: 'middle',
      }}
    >
      <CheckMark color="#fff" />
    </span>
  );
}

/**
 * The one checkbox used inside the table — page rows and header rows alike.
 *
 * `state` is 'all' | 'some' | 'none'. Only 'all' shows a tick: a partly-filled
 * group reads as unchecked, so the box is ever only ticked or empty. Clicking a
 * partial header therefore turns everything under it on.
 *
 * Drawn rather than native: a disabled native checkbox is faded by the browser,
 * and read-only mode is the default state here, so unchecked boxes need to stay
 * clearly visible with a strong border instead of washing out.
 */
export function Check({ state, onChange, label, dark, disabled }) {
  const checked = state === 'all';

  // Checked is always blue. On the dark bands it keeps a white ring so it stays
  // visible against the band rather than needing a second accent colour.
  const BLUE    = '#1a4d8f';
  const emptyBg = dark ? 'rgba(255,255,255,0.12)' : '#fff';
  const emptyBd = dark ? 'rgba(255,255,255,0.85)' : '#5a6577';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '16px', height: '16px', padding: 0,
        borderRadius: '3px', boxSizing: 'border-box',
        background: checked ? BLUE : emptyBg,
        border: `2px solid ${checked ? (dark ? 'rgba(255,255,255,0.85)' : BLUE) : emptyBd}`,
        cursor: disabled ? 'default' : 'pointer',
        verticalAlign: 'middle',
      }}
    >
      {checked && <CheckMark color="#fff" />}
    </button>
  );
}

/** Pill toggle with a trailing label — used for view filters, not for data. */
export function ToggleSwitch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
      }}
    >
      <span style={{
        position: 'relative', width: '34px', height: '18px',
        borderRadius: '9px', flexShrink: 0,
        background: on ? '#2563eb' : '#c8d1dc',
        transition: 'background 0.15s',
      }}>
        <span style={{
          position: 'absolute', top: '2px', left: on ? '18px' : '2px',
          width: '14px', height: '14px', borderRadius: '50%',
          background: '#fff', transition: 'left 0.15s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }} />
      </span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </button>
  );
}
