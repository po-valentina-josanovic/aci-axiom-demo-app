'use client';

// ─────────────────────────────────────────────────────────────────────────────
// AvailabilityTree — the card: toolbar, one shared column header, and a panel
// per scope (Job / System / Admin).
//
// The card fills the viewport and never scrolls itself. The three bands are
// always visible; the panels behave as an accordion, so opening one closes the
// others and the open group gets all the height the screen can give it.
//
// Column alignment across the header and the three panels is handled by the
// shared ColGroup — see the note at the top of GroupPanel.jsx.
//
//   columns: [{ key, header, width, align,
//               render(row),        cell for a page row
//               renderGroup(row) }] cell for a group / section / sub-section row
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import GroupPanel, { ColGroup, TABLE_STYLE } from './GroupPanel';

const HEAD_BLUE = '#1a4d8f';

export default function AvailabilityTree({
  groups,
  columns,
  title,
  leftControls,
  actions,
  firstColumnHeader = 'Section / Sub-Section / Page',
  searchPlaceholder = 'Search pages',
  isChanged,
}) {
  // Accordion: at most one group open. Sections collapse independently.
  const [openGroup, setOpenGroup] = useState(groups[0]?.id ?? null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [search, setSearch] = useState('');

  const toggleGroup = (id) => setOpenGroup(cur => (cur === id ? null : id));
  const toggleSection = (id) => setCollapsedSections(p => ({ ...p, [id]: !p[id] }));

  // Per group: drop rows inside collapsed sections, then apply the search.
  const visibleByGroup = useMemo(() => {
    const q = search.trim().toLowerCase();

    return groups.map(group => {
      const out = [];
      let skipSection = false;

      for (const row of group.rows) {
        if (row.level === 'section') {
          skipSection = !!collapsedSections[row.id];
          out.push(row);
          continue;
        }
        if (skipSection) continue;
        out.push(row);
      }

      // Search keeps the structural rows so results stay readable in context.
      const rows = q
        ? out.filter(r => r.level !== 'page' || r.label.toLowerCase().includes(q))
        : out;

      return { group, rows };
    });
  }, [groups, collapsedSections, search]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
      background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px',
      overflow: 'hidden',
    }}>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid #d9dfe7',
        flexWrap: 'wrap', gap: '10px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          {title && (
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
              {title}
            </span>
          )}
          {leftControls}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#94a3b8', pointerEvents: 'none' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={{ padding: '5px 10px 5px 28px', fontSize: '12px', border: '1px solid #c8d1dc', borderRadius: '6px', width: '180px', outline: 'none' }}
            />
          </div>
          {actions}
        </div>
      </div>

      {/* Panels — one shared horizontal scroll keeps every table in step */}
      <div style={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden', padding: '12px' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px',
          height: '100%', minWidth: '820px',
        }}>

          {/* Shared column header */}
          <div style={{ flexShrink: 0 }}>
            <table style={TABLE_STYLE}>
              <ColGroup columns={columns} />
              <thead>
                <tr>
                  <th style={{
                    textAlign: 'left', padding: '9px 14px',
                    fontSize: '12px', fontWeight: 700, color: HEAD_BLUE,
                    whiteSpace: 'nowrap', borderBottom: '2px solid #c8d1dc',
                  }}>
                    {firstColumnHeader}
                  </th>
                  {columns.map(col => (
                    <th key={col.key} style={{
                      padding: '9px 8px', fontSize: '11px', fontWeight: 700,
                      color: HEAD_BLUE, textAlign: col.align ?? 'center',
                      borderBottom: '2px solid #c8d1dc', borderLeft: '1px solid #e2e8f0',
                    }}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          {visibleByGroup.map(({ group, rows }) => (
            <GroupPanel
              key={group.id}
              group={group}
              columns={columns}
              rows={rows}
              expanded={openGroup === group.id}
              onToggle={() => toggleGroup(group.id)}
              collapsedSections={collapsedSections}
              onToggleSection={toggleSection}
              isChanged={isChanged}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
