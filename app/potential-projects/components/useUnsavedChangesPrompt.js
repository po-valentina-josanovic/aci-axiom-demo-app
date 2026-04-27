'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Blocks browser tab close / reload with the native "unsaved changes" dialog when
// `dirty` is true. For in-app navigation (back button, sidebar links), captures
// the intended action and exposes modal state so callers can render a custom
// Save / Discard / Cancel dialog.
//
// Pass a Next.js router (from useRouter()) to keep intercepted anchor clicks
// client-side. Without it we fall back to window.location which causes a full
// page reload.
export default function useUnsavedChangesPrompt(dirty, router) {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  // Suppresses both beforeunload and the anchor interceptor while we run an
  // already-user-approved navigation, so we don't double-prompt.
  const bypassRef = useRef(false);

  const routerRef = useRef(router);
  routerRef.current = router;

  const [pending, setPending] = useState(null);

  useEffect(() => {
    function handleBeforeUnload(e) {
      if (bypassRef.current) return undefined;
      if (!dirtyRef.current) return undefined;
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (bypassRef.current) return;
      if (!dirtyRef.current) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = e.target.closest && e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      let url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      e.preventDefault();
      e.stopPropagation();

      const internalPath = url.pathname + url.search + url.hash;
      const fullHref = anchor.href;
      setPending(() => () => {
        bypassRef.current = true;
        if (routerRef.current) {
          routerRef.current.push(internalPath);
        } else {
          window.location.href = fullHref;
        }
      });
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  const confirmLeave = useCallback((onProceed) => {
    if (!dirtyRef.current) {
      onProceed();
      return true;
    }
    setPending(() => () => {
      bypassRef.current = true;
      onProceed();
    });
    return false;
  }, []);

  const dismiss = useCallback(() => setPending(null), []);

  const proceed = useCallback(() => {
    if (!pending) return;
    const fn = pending;
    setPending(null);
    fn();
  }, [pending]);

  return {
    confirmLeave,
    promptOpen: pending !== null,
    dismiss,
    proceed,
  };
}
