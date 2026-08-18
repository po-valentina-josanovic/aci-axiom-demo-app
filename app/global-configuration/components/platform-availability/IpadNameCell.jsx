'use client';

// ─────────────────────────────────────────────────────────────────────────────
// IpadNameCell — the iPad name(s) for one row.
//
// A web page is not always one iPad screen: "Job Hub" is a single web page but
// two tablet screens. So this renders a LIST — one input per iPad screen, with
// "+ Split into another screen" to add and × to remove. A single blank entry is
// the ordinary case and means "use the web page name".
//
// Each input spans the full width of the column: the remove button is overlaid
// on the right edge rather than sitting beside the field and stealing width.
// ─────────────────────────────────────────────────────────────────────────────

const FIELD_BORDER = 'inset 0 0 0 1px #cbd5e1';

export default function IpadNameCell({
  names,
  placeholder,
  editable,
  onChange,
  onAdd,
  onRemove,
  hint,
  splittable = true,
}) {
  const split = names.length > 1;
  const showRemove = editable && split;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {names.map((name, i) => (
        <div key={i} style={{ position: 'relative', display: 'flex' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={editable ? placeholder : (name ? '' : '—')}
            disabled={!editable}
            title={editable ? hint : undefined}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '6px 10px',
              paddingLeft: split ? '22px' : '10px',
              paddingRight: showRemove ? '26px' : '10px',
              fontSize: '12px', color: '#1e293b',
              border: 'none', borderRadius: 0, outline: 'none',
              background: editable ? '#fff' : 'transparent',
              boxShadow: editable ? FIELD_BORDER : 'none',
              cursor: editable ? 'text' : 'default',
            }}
          />

          {/* Screen number, once this page is split */}
          {split && (
            <span
              title={`iPad screen ${i + 1} of ${names.length}`}
              style={{
                position: 'absolute', left: '7px', top: 0, bottom: 0,
                display: 'inline-flex', alignItems: 'center',
                fontSize: '10px', fontWeight: 700, color: '#8694a7',
                pointerEvents: 'none',
              }}
            >
              {i + 1}
            </span>
          )}

          {showRemove && (
            <button
              onClick={() => onRemove(i)}
              title="Remove this iPad screen"
              style={{
                position: 'absolute', right: '2px', top: 0, bottom: 0,
                width: '22px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', background: 'none', cursor: 'pointer',
                color: '#ef4444', fontSize: '18px', fontWeight: 500,
                lineHeight: 1, padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}

      {editable && splittable && (
        <button
          onClick={onAdd}
          title="This web page appears as more than one screen on the iPad"
          style={{
            alignSelf: 'flex-start',
            margin: '3px 0 4px', padding: '2px 8px',
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '11.5px', fontWeight: 700, color: '#1a4d8f',
            whiteSpace: 'nowrap',
          }}
        >
          + Split into another screen
        </button>
      )}
    </div>
  );
}
