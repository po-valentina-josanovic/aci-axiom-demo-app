'use client';

// ─────────────────────────────────────────────────────────────────────────────
// GroupPanel — one scope panel (Job / System / Admin).
//
// The band is always visible. Only one panel is expanded at a time, and the
// expanded one takes all the leftover height and scrolls its own rows, so the
// open group always gets as much room as the screen allows.
//
// ── Alignment ───────────────────────────────────────────────────────────────
// Every table on this screen shares ColGroup. Each column has a fixed pixel
// width EXCEPT the last one, which is left unsized so it absorbs the slack.
// That matters: a scrolling body is ~15px narrower than a band that isn't
// scrolling, and a flexible column soaks that difference up by shifting
// everything after it. Since the flexible column is last, there is nothing
// after it to shift — so the columns line up whether a panel is scrolling or
// not, and the last column still stretches to the full width of the row.
//
// For the same reason the panels carry no border of their own — a 1px border
// would offset a panel's table from the shared column header above it.
// ─────────────────────────────────────────────────────────────────────────────

const HEAD_BLUE  = '#1a4d8f';
const GROUP_BG   = '#0a2a52';
const SECTION_BG = '#15629f';
const SUB_BG     = '#dce6f5';

/** Fixed width of the "Section / Sub-Section / Page" column. */
const FIRST_COL_WIDTH = '340px';

export function ColGroup({ columns }) {
  return (
    <colgroup>
      <col style={{ width: FIRST_COL_WIDTH }} />
      {columns.map(col => <col key={col.key} style={{ width: col.width }} />)}
    </colgroup>
  );
}

export const TABLE_STYLE = {
  width: '100%', minWidth: '820px',
  tableLayout: 'fixed', borderCollapse: 'collapse',
  fontSize: '12px',
};

function Chevron({ open }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {open ? <path d="M6 9l6 6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

export default function GroupPanel({
  group,
  columns,
  rows,
  expanded,
  onToggle,
  collapsedSections,
  onToggleSection,
  isChanged,
}) {
  const pageCount = rows.filter(r => r.level === 'page').length;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      // Expanded takes everything left over; collapsed is just the band.
      flex: expanded ? '1 1 0' : '0 0 auto',
      minHeight: expanded ? '96px' : 'auto',
      overflow: 'hidden',
    }}>

      {/* Scope band */}
      <div style={{ flexShrink: 0, overflow: 'hidden' }}>
        <table style={TABLE_STYLE}>
          <ColGroup columns={columns} />
          <tbody>
            <tr>
              <td
                onClick={onToggle}
                style={{
                  background: GROUP_BG, cursor: 'pointer',
                  padding: '9px 14px', color: '#fff',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.4px',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <span>
                    {group.label}
                    <span style={{ marginLeft: '8px', fontWeight: 600, opacity: 0.6, textTransform: 'none', letterSpacing: 0 }}>
                      {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                    </span>
                  </span>
                  <Chevron open={expanded} />
                </span>
              </td>
              {columns.map(col => (
                <td key={col.key} style={{
                  background: GROUP_BG, padding: '9px 8px',
                  textAlign: col.align ?? 'center',
                  borderLeft: '1px solid rgba(255,255,255,0.12)',
                }}>
                  {col.renderGroup?.(group) ?? null}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Scrolling body */}
      {expanded && (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          <table style={TABLE_STYLE}>
            <ColGroup columns={columns} />
            <tbody>
              {rows.map((row, i) => {

                // ── Section band ──────────────────────────────────────────
                if (row.level === 'section') {
                  return (
                    <tr key={row.id}>
                      <td
                        onClick={() => onToggleSection(row.id)}
                        style={{
                          background: SECTION_BG, cursor: 'pointer',
                          padding: '8px 14px', color: '#fff',
                          fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          {row.label}
                          <Chevron open={!collapsedSections[row.id]} />
                        </span>
                      </td>
                      {columns.map(col => (
                        <td key={col.key} style={{
                          background: SECTION_BG, padding: '8px',
                          textAlign: col.align ?? 'center',
                          borderLeft: '1px solid rgba(255,255,255,0.12)',
                        }}>
                          {col.renderGroup?.(row) ?? null}
                        </td>
                      ))}
                    </tr>
                  );
                }

                // ── Sub-section band ──────────────────────────────────────
                if (row.level === 'subsection') {
                  const band = {
                    background: SUB_BG, fontSize: '12px', fontWeight: 700, color: HEAD_BLUE,
                    borderTop: '2px solid #b8cce4', borderBottom: '1px solid #b8cce4',
                  };
                  return (
                    <tr key={row.id}>
                      <td style={{
                        ...band, padding: '6px 14px 6px 16px',
                        borderLeft: `3px solid ${HEAD_BLUE}`, whiteSpace: 'nowrap',
                      }}>
                        {row.label}
                      </td>
                      {columns.map(col => (
                        <td key={col.key} style={{
                          ...band, padding: '6px 8px',
                          textAlign: col.align ?? 'center',
                          borderLeft: '1px solid #b8cce4',
                          ...(col.renderSubsection && col.cellStyle),
                        }}>
                          {(col.renderSubsection ?? col.renderGroup)?.(row) ?? null}
                        </td>
                      ))}
                    </tr>
                  );
                }

                // ── Page row ──────────────────────────────────────────────
                const changed = isChanged?.(row) ?? false;
                const bg = row.subrow ? '#f4f7fd' : (i % 2 === 0 ? '#fff' : '#f8fafc');
                return (
                  <tr key={row.id}>
                    <td style={{
                      background: bg, padding: '7px 14px', color: '#1e293b',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      borderBottom: '1px solid #e2e8f0',
                      ...(row.subrow && { borderLeft: `3px solid ${HEAD_BLUE}` }),
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={row.subrow ? { paddingLeft: '14px', color: '#3a4a5c' } : undefined}>
                          {row.label}
                        </span>
                        {changed && (
                          <span
                            title="Unsaved change"
                            style={{
                              padding: '1px 6px', borderRadius: '10px',
                              background: '#fef3c7', border: '1px solid #fcd34d',
                              fontSize: '10px', fontWeight: 700, color: '#92400e',
                              whiteSpace: 'nowrap', flexShrink: 0,
                            }}
                          >
                            unsaved
                          </span>
                        )}
                      </span>
                    </td>
                    {columns.map(col => (
                      <td key={col.key} style={{
                        background: bg, padding: '7px 8px',
                        textAlign: col.align ?? 'center',
                        borderBottom: '1px solid #e2e8f0',
                        borderLeft: '1px solid #e2e8f0',
                        ...col.cellStyle,
                      }}>
                        {col.render?.(row) ?? null}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {rows.every(r => r.level !== 'page') && (
                <tr>
                  <td colSpan={columns.length + 1} style={{ padding: '20px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                    No pages match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
