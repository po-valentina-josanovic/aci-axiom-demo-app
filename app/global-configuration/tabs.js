// ─────────────────────────────────────────────────────────────────────────────
// Global Configuration tabs.
//
// One entry per tab, in display order. To add a configuration area:
//   1. create app/global-configuration/components/<your-feature>/
//   2. add a line here pointing at its entry component
// page.js renders whichever is active — it needs no other change.
//
// `fills: true` means the tab manages its own height and scrolling: page.js
// hands it the full remaining viewport and does not scroll. Omit it for ordinary
// tabs that just grow and let the page scroll.
// ─────────────────────────────────────────────────────────────────────────────

import TradeToPhaseCodes from './components/trade-to-phase-codes/TradeToPhaseCodes';
import PlatformAvailability from './components/platform-availability/PlatformAvailability';

export const TABS = [
  {
    id: 'trade-to-phase-codes',
    label: 'Trade To Phase Codes Division Association',
    Component: TradeToPhaseCodes,
  },
  {
    id: 'platform-availability',
    label: 'Platform Availability',
    Component: PlatformAvailability,
    fills: true,
  },
];
