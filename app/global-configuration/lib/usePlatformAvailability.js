'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Platform availability store — which pages are published to the iPad app, and
// what they're called there.
//
// Web is implicit: every page in the registry is a web page, always. This store
// only records the mobile side of it.
//
// ── One web page can be several iPad screens ────────────────────────────────
// The tablet layout doesn't always map 1:1. "Job Hub" is a single web page but
// two iPad screens — "Job Hub - Head Count" and "Job Hub - Productivity". So the
// name is a LIST (`mobilePages`), not a string: one entry per iPad screen, and
// an empty entry means "use the web page name". A page with one blank entry is
// the ordinary case; adding entries splits it.
//
// The registry stays the web truth — a split is a platform decision, so it lives
// here rather than inventing web pages that don't exist.
//
// Edits are staged in a DRAFT and only committed on save(), so clicking around
// the table doesn't push an update per click. `changedIds` is what the draft
// changes relative to what's saved, which the table uses to mark dirty rows.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPages, getNameableRows } from './pageRegistry';

const STORAGE_KEY = 'axiom.platformAvailability.v2';

/** Reserved for a future Off / Read-only / Full tri-state. */
export const MODE_FULL = 'full';

/**
 * What ships on the iPad out of the box, and under what name.
 * `names` is one entry per iPad screen; '' means "use the web page name".
 */
const SEED = {
  // Dashboard
  'job.dashboard.job-hub':    { iPad: true, names: ['Job Hub - Head Count', 'Job Hub - Productivity'] },
  'job.dashboard.level-prod': { iPad: true, names: [''] },
  'job.dashboard.job-cost':   { iPad: true, names: [''] },

  // Inputs
  'job.inputs.weekly-units':  { iPad: true, names: [''] },
  'job.inputs.manpower':      { iPad: true, names: ['Input Manpower'] },
  'job.inputs.daily-prod-report':                  { names: ['DPR'] }, // sub-section label
  'job.inputs.daily-prod-report.daily-production': { iPad: true, names: [''] },
  'job.inputs.daily-prod-report.notes':            { iPad: true, names: [''] },

  // POC
  'job.poc.presentation':     { iPad: true, names: ['POC Presentation'] },

  // Weekly vs Daily
  'job.weekly-vs-daily.view': { iPad: true, names: [''] },
};

function makeDefaults() {
  const out = {};
  getNameableRows().forEach(r => {
    const seed = SEED[r.id];
    out[r.id] = {
      iPad: !!seed?.iPad,
      mode: MODE_FULL,
      mobilePages: seed?.names ? [...seed.names] : [''],
      order: null,
    };
  });
  return out;
}

function readStored() {
  const defaults = makeDefaults();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const stored = JSON.parse(raw);
    // Merge over defaults so rows added to the registry since the last save
    // show up with sane values instead of undefined.
    Object.keys(defaults).forEach(id => {
      if (!stored[id]) return;
      const s = stored[id];
      defaults[id] = {
        ...defaults[id],
        ...s,
        mobilePages: Array.isArray(s.mobilePages) && s.mobilePages.length
          ? s.mobilePages
          : defaults[id].mobilePages,
      };
    });
    return defaults;
  } catch {
    return defaults; // Corrupt or unavailable storage.
  }
}

export function usePlatformAvailability() {
  // What's on disk, and what the user is editing.
  const [saved, setSaved] = useState(makeDefaults);
  const [draft, setDraft] = useState(makeDefaults);
  const [loaded, setLoaded] = useState(false);

  // Load once on mount — client only, so SSR and first paint agree.
  useEffect(() => {
    const stored = readStored();
    setSaved(stored);
    setDraft(stored);
    setLoaded(true);
  }, []);

  const isOn = useCallback((id) => !!draft[id]?.iPad, [draft]);

  /** The page's iPad screen names. One entry per screen; '' = use the web name. */
  const namesOf = useCallback(
    (id) => draft[id]?.mobilePages ?? [''],
    [draft]
  );

  const setPage = useCallback((id, on) => {
    setDraft(prev => (
      prev[id] ? { ...prev, [id]: { ...prev[id], iPad: on } } : prev
    ));
  }, []);

  const setMany = useCallback((ids, on) => {
    setDraft(prev => {
      const next = { ...prev };
      ids.forEach(id => {
        if (next[id]) next[id] = { ...next[id], iPad: on };
      });
      return next;
    });
  }, []);

  const setName = useCallback((id, index, value) => {
    setDraft(prev => {
      const entry = prev[id];
      if (!entry) return prev;
      const mobilePages = entry.mobilePages.map((n, i) => (i === index ? value : n));
      return { ...prev, [id]: { ...entry, mobilePages } };
    });
  }, []);

  /** Split this page into one more iPad screen. */
  const addName = useCallback((id) => {
    setDraft(prev => {
      const entry = prev[id];
      if (!entry) return prev;
      return { ...prev, [id]: { ...entry, mobilePages: [...entry.mobilePages, ''] } };
    });
  }, []);

  /** Remove an iPad screen. The last one is never removed — it's the page itself. */
  const removeName = useCallback((id, index) => {
    setDraft(prev => {
      const entry = prev[id];
      if (!entry || entry.mobilePages.length <= 1) return prev;
      return {
        ...prev,
        [id]: { ...entry, mobilePages: entry.mobilePages.filter((_, i) => i !== index) },
      };
    });
  }, []);

  // Row ids whose iPad flag or screen names differ from what's saved.
  const changedIds = useMemo(() => {
    const out = new Set();
    Object.keys(draft).forEach(id => {
      const a = draft[id], b = saved[id];
      if (!!a?.iPad !== !!b?.iPad) return out.add(id);
      const an = JSON.stringify(a?.mobilePages ?? ['']);
      const bn = JSON.stringify(b?.mobilePages ?? ['']);
      if (an !== bn) out.add(id);
    });
    return out;
  }, [draft, saved]);

  const save = useCallback(() => {
    setSaved(draft);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Storage full or blocked — the change still applies for this session.
    }
  }, [draft]);

  const discard = useCallback(() => setDraft(saved), [saved]);

  const resetToDefaults = useCallback(() => setDraft(makeDefaults()), []);

  // Published page count, plus the iPad screen count — they differ wherever a
  // page has been split.
  const { enabledCount, totalCount, screenCount } = useMemo(() => {
    const pages = getPages();
    const published = pages.filter(p => draft[p.id]?.iPad);
    return {
      enabledCount: published.length,
      totalCount: pages.length,
      screenCount: published.reduce(
        (sum, p) => sum + (draft[p.id]?.mobilePages?.length || 1), 0
      ),
    };
  }, [draft]);

  return {
    loaded,
    isOn, setPage, setMany,
    namesOf, setName, addName, removeName,
    changedIds, dirty: changedIds.size > 0,
    save, discard, resetToDefaults,
    enabledCount, totalCount, screenCount,
  };
}
