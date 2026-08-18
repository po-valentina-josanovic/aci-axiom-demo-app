// Row assembly for the Platform Availability table.
//
// Turns the flat page registry into the display list (scope group bands +
// section / subsection / page rows) and handles the "iPad pages only" filter.

import {
  getRows, getPages, getDescendantPageIds,
  SCOPES, SCOPE_LABELS,
} from '../../lib/pageRegistry';

/** Header nesting depth — used to work out which pages a header owns. */
const RANK = { group: 0, section: 1, subsection: 2 };

export const groupIdFor = (scope) => `group-${scope}`;

/**
 * One panel per scope — Job, System, Admin. Each is rendered as its own
 * collapsible band with its own scrolling body, so all three headers stay on
 * screen at once instead of scrolling away in a single long table.
 */
export function buildGroups() {
  return SCOPES.map(scope => ({
    id: groupIdFor(scope),
    scope,
    label: SCOPE_LABELS[scope],
    rows: getRows(scope),
  }));
}

/** header id -> the page ids its cascade checkbox applies to. */
export function buildDescendantMap() {
  const map = {};
  getRows().forEach(row => {
    if (row.level === 'section' || row.level === 'subsection') {
      map[row.id] = getDescendantPageIds(row.id);
    }
  });
  SCOPES.forEach(scope => {
    map[groupIdFor(scope)] = getPages(scope).map(p => p.id);
  });
  return map;
}

/** Drop section/subsection/group headers left with no page rows beneath them. */
export function pruneEmptyHeaders(list) {
  const keep = list.map(() => true);

  for (let i = 0; i < list.length; i++) {
    const row = list[i];
    if (row.level === 'page') continue;

    let hasPage = false;
    for (let j = i + 1; j < list.length; j++) {
      const next = list[j];

      if (next.level !== 'page') {
        // Reached a sibling or higher header — this one's run is over.
        if (RANK[next.level] <= RANK[row.level]) break;
        continue;
      }
      // A subsection only owns the subrows directly beneath it.
      if (row.level === 'subsection' && !next.subrow) break;

      hasPage = true;
      break;
    }
    keep[i] = hasPage;
  }

  return list.filter((_, i) => keep[i]);
}

/** Apply the "iPad pages only" filter, keeping the surrounding structure tidy. */
export function filterToIpadOnly(list, isOn) {
  return pruneEmptyHeaders(list.filter(r => r.level !== 'page' || isOn(r.id)));
}
