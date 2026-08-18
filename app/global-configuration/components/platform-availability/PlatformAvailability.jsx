'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Platform Availability — which pages are published to the iPad app.
//
// Web is not configurable: every page in the app is a web page by definition,
// so the Web column is shown locked. What's editable is whether a page is ALSO
// published to the iPad app, and the name it carries there.
//
// The screen is read-only until Edit is pressed. Edits are then staged in a
// draft — changed rows are marked "unsaved" — and only committed on Save
// Changes; Cancel throws the draft away. So neither browsing nor clicking
// around sends anything anywhere until the user commits.
//
// This is deliberately not a permission screen. The flag is a property of the
// page — has a tablet version been built and released? — and nobody's role
// changes it. Who can open a page is owned by User Management and stays there.
//
//   ../../lib/pageRegistry            the page catalogue this table lists
//   ../../lib/usePlatformAvailability draft + saved iPad flags and names
//   rows.js                           registry -> groups + rows, filtering
//   AvailabilityTree.jsx              card chrome: toolbar + column header
//   GroupPanel.jsx                    one scope panel, own scrolling body
//   controls.jsx                      checkbox / toggle / icons
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect } from 'react';
import AvailabilityTree from './AvailabilityTree';
import IpadNameCell from './IpadNameCell';
import { buildGroups, buildDescendantMap, filterToIpadOnly } from './rows';
import { LockedWebCheck, Check, ToggleSwitch, IpadIcon, MonitorIcon } from './controls';
import { usePlatformAvailability } from '../../lib/usePlatformAvailability';

export default function PlatformAvailability() {
  const {
    isOn, setPage, setMany,
    namesOf, setName, addName, removeName,
    changedIds, dirty, save, discard,
    enabledCount, totalCount, screenCount,
  } = usePlatformAvailability();

  const [editing, setEditing]   = useState(false);
  const [onlyIpad, setOnlyIpad] = useState(false);

  const allGroups   = useMemo(buildGroups, []);
  const descendants = useMemo(buildDescendantMap, []);

  const groups = useMemo(() => (
    onlyIpad
      ? allGroups.map(g => ({ ...g, rows: filterToIpadOnly(g.rows, isOn) }))
      : allGroups
  ), [allGroups, onlyIpad, isOn]);

  // Don't let unsaved edits disappear on a reload or a closed tab.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function handleSave() {
    save();
    setEditing(false);
  }

  function handleCancel() {
    discard();
    setEditing(false);
  }

  /** 'all' | 'some' | 'none' for a header row's cascade checkbox. */
  function groupState(headerId) {
    const ids = descendants[headerId] ?? [];
    if (!ids.length) return 'none';
    const on = ids.filter(isOn).length;
    if (on === 0) return 'none';
    if (on === ids.length) return 'all';
    return 'some';
  }

  const columns = useMemo(() => [
    {
      key: 'web',
      header: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <MonitorIcon /> Web
        </span>
      ),
      // Web is not configurable — the locked check explains itself on hover.
      width: '90px',
      render: () => <LockedWebCheck editing={editing} />,
    },
    {
      key: 'ipad',
      header: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <IpadIcon /> iPad
        </span>
      ),
      width: '90px',
      render: (row) => (
        <Check
          state={isOn(row.id) ? 'all' : 'none'}
          onChange={(on) => setPage(row.id, on)}
          disabled={!editing}
          label={`Publish ${row.label} to the iPad app`}
        />
      ),
      renderGroup: (row) => {
        const ids = descendants[row.id] ?? [];
        if (!ids.length) return null;
        return (
          <Check
            state={groupState(row.id)}
            onChange={(on) => setMany(ids, on)}
            disabled={!editing}
            label={`Publish all pages under ${row.label} to the iPad app`}
            dark
          />
        );
      },
    },
    {
      key: 'ipad-name',
      header: 'iPad Page Name',
      // No fixed width — as the last column it stretches to fill the row, and
      // absorbs the scrollbar difference where nothing follows it to shift.
      align: 'left',
      // The inputs fill the cell, so the cell itself carries no padding.
      cellStyle: { padding: 0 },
      render: (row) => (
        <IpadNameCell
          names={namesOf(row.id)}
          placeholder={row.label}
          editable={editing && isOn(row.id)}
          hint="Leave blank to use the web page name"
          onChange={(i, v) => setName(row.id, i, v)}
          onAdd={() => addName(row.id)}
          onRemove={(i) => removeName(row.id, i)}
        />
      ),
      // Sub-sections are nav groupings that also appear on the tablet, so they
      // can be renamed too — but they're never split.
      renderSubsection: (row) => (
        <IpadNameCell
          names={[namesOf(row.id)[0] ?? '']}
          placeholder={row.label}
          editable={editing}
          splittable={false}
          hint="Leave blank to use the web name"
          onChange={(i, v) => setName(row.id, i, v)}
        />
      ),
    },
  ], [isOn, setPage, setMany, namesOf, setName, addName, removeName, descendants, editing]);

  const btn = {
    padding: '6px 14px', fontSize: '12px', fontWeight: 600,
    borderRadius: '6px', whiteSpace: 'nowrap', cursor: 'pointer',
  };

  return (
    <AvailabilityTree
      groups={groups}
      columns={columns}
      title="Platform Availability"
      isChanged={(row) => changedIds.has(row.id)}
      leftControls={
        <>
          <ToggleSwitch
            on={onlyIpad}
            onChange={setOnlyIpad}
            label="iPad pages only"
          />
          <span style={{ fontSize: '12px', color: '#5a6577', whiteSpace: 'nowrap' }}>
            <strong style={{ color: '#1e293b' }}>{enabledCount}</strong> of {totalCount} pages on iPad
            {screenCount !== enabledCount && (
              <>
                {' '}→ <strong style={{ color: '#1e293b' }}>{screenCount}</strong> screens
              </>
            )}
          </span>
        </>
      }
      actions={
        editing ? (
          <>
            {dirty && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#92400e', whiteSpace: 'nowrap' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12" y2="16" />
                </svg>
                {changedIds.size} unsaved
              </span>
            )}
            <button
              onClick={handleCancel}
              style={{ ...btn, color: '#1e293b', background: '#fff', border: '1px solid #d9dfe7' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty}
              style={{
                ...btn, padding: '6px 16px', border: 'none', color: '#fff',
                background: dirty ? '#1a4d8f' : '#b9c4d2',
                cursor: dirty ? 'pointer' : 'not-allowed',
              }}
            >
              Save Changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              ...btn, padding: '6px 16px', border: 'none',
              color: '#fff', background: '#1a4d8f',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        )
      }
    />
  );
}
