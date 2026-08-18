// ─────────────────────────────────────────────────────────────────────────────
// Page Registry — the catalogue of every page in the app.
//
// Platform Availability is driven entirely by this list: adding a page to the
// app means adding ONE entry here, and it becomes togglable for the iPad app.
//
// This is a page inventory, NOT a permission model. Who can access a page is
// owned by User Management (Job Permissions / System Permissions) and lives
// there. The only thing shared with those screens is the vocabulary — pages are
// grouped as "Job" or "System" so the list reads the same way the permission
// screens do.
//
// Only sections, sub-sections and pages live here. Functionalities (the
// individual actions inside a page) are a permissions concept and belong to the
// User Management screens — a functionality is never published to a platform on
// its own, it ships with its page.
//
// Fields
//   id      unique, stable key (also the key used to store the iPad flag)
//   label   display name
//   scope   'system' | 'job'  — which half of the app the page belongs to
//   level   'section' | 'subsection' | 'page'
//   subrow  page belonging to the sub-section above it (renders in a banded group)
//   href    route, when the page is actually built
// ─────────────────────────────────────────────────────────────────────────────

export const SCOPE_SYSTEM = 'system';
export const SCOPE_JOB    = 'job';
export const SCOPE_ADMIN  = 'admin';

/** Display order of the groups in the table. */
export const SCOPES = [SCOPE_JOB, SCOPE_SYSTEM, SCOPE_ADMIN];

export const SCOPE_LABELS = {
  [SCOPE_JOB]:    'Job Pages',
  [SCOPE_SYSTEM]: 'System Pages',
  [SCOPE_ADMIN]:  'Admin Pages',
};

export const PAGE_REGISTRY = [
  // ─── System scope ──────────────────────────────────────────────────────────
  { id: 'dashboard-analytics',             label: 'Dashboard Analytics',          scope: SCOPE_SYSTEM, level: 'section' },
  { id: 'dashboard-analytics.poc',         label: 'POC Analytics',                scope: SCOPE_SYSTEM, level: 'page' },

  { id: 'master-manpower',                 label: 'Master Manpower',              scope: SCOPE_SYSTEM, level: 'section' },
  { id: 'master-manpower.precon',          label: 'PreCon',                       scope: SCOPE_SYSTEM, level: 'page', href: '/pre-con' },
  { id: 'master-manpower.awarded',         label: 'Awarded Manpower',             scope: SCOPE_SYSTEM, level: 'page', href: '/awarded-manpower' },
  { id: 'master-manpower.graph-trade',     label: 'Graph By Trade',               scope: SCOPE_SYSTEM, level: 'page' },
  { id: 'master-manpower.graph-job',       label: 'Graph By Job',                 scope: SCOPE_SYSTEM, level: 'page' },

  { id: 'revenue-forecast',                label: 'Revenue Forecast',             scope: SCOPE_SYSTEM, level: 'section' },
  { id: 'revenue-forecast.company',        label: 'Company Forecasts',            scope: SCOPE_SYSTEM, level: 'page', href: '/revenue-forecasts/company-forecast' },
  { id: 'revenue-forecast.division',       label: 'Division Forecasts',           scope: SCOPE_SYSTEM, level: 'page', href: '/revenue-forecasts/division-forecast' },

  { id: 'business-dev',                    label: 'Business Dev',                 scope: SCOPE_SYSTEM, level: 'section' },
  { id: 'business-dev.bid-summary',        label: 'Bid Summary Warehouse',        scope: SCOPE_SYSTEM, level: 'page' },
  { id: 'business-dev.dashboard',          label: 'Dashboard',                    scope: SCOPE_SYSTEM, level: 'subsection' },
  { id: 'business-dev.inputs',             label: 'Inputs',                       scope: SCOPE_SYSTEM, level: 'subsection' },
  { id: 'business-dev.inputs.flash',       label: 'Flash Monthly Entry',          scope: SCOPE_SYSTEM, level: 'page', subrow: true },
  { id: 'business-dev.inputs.sales-goals', label: 'Div Sales Goals Entry',        scope: SCOPE_SYSTEM, level: 'page', subrow: true },
  { id: 'business-dev.inputs.potential',   label: 'Potential Projects',           scope: SCOPE_SYSTEM, level: 'page', subrow: true, href: '/potential-projects' },
  { id: 'business-dev.inputs.companies',   label: 'Company & Contact Management', scope: SCOPE_SYSTEM, level: 'page', subrow: true, href: '/client-contacts' },
  { id: 'business-dev.reporting',          label: 'Reporting',                    scope: SCOPE_SYSTEM, level: 'subsection' },

  // ─── Job scope ─────────────────────────────────────────────────────────────
  { id: 'job.dashboard',                   label: 'Dashboard',                    scope: SCOPE_JOB, level: 'section' },
  { id: 'job.dashboard.job-hub',           label: 'Job Hub',                      scope: SCOPE_JOB, level: 'page' },
  { id: 'job.dashboard.overall-prod',      label: 'Overall Production Review',    scope: SCOPE_JOB, level: 'page' },
  { id: 'job.dashboard.level-prod',        label: 'Level Production Review',      scope: SCOPE_JOB, level: 'page' },
  { id: 'job.dashboard.field-manpower',    label: 'Field Manpower',               scope: SCOPE_JOB, level: 'page' },
  { id: 'job.dashboard.job-cost',          label: 'Job Cost',                     scope: SCOPE_JOB, level: 'page' },

  { id: 'job.setup',                       label: 'Setup',                        scope: SCOPE_JOB, level: 'section' },
  { id: 'job.setup.job-setup',             label: 'Job Setup',                    scope: SCOPE_JOB, level: 'page' },
  { id: 'job.setup.manpower-baseline',     label: 'Manpower Baseline',            scope: SCOPE_JOB, level: 'page' },
  { id: 'job.setup.unused-phase-codes',    label: 'Unused Phase Codes',           scope: SCOPE_JOB, level: 'page' },
  { id: 'job.setup.fabrication-baseline',  label: 'Fabrication Baseline',         scope: SCOPE_JOB, level: 'page' },

  { id: 'job.inputs',                      label: 'Inputs',                       scope: SCOPE_JOB, level: 'section' },
  { id: 'job.inputs.weekly-units',         label: 'Weekly Units',                 scope: SCOPE_JOB, level: 'page' },
  { id: 'job.inputs.qty-adjust-units',     label: 'QTY Adjust Units',             scope: SCOPE_JOB, level: 'page' },
  { id: 'job.inputs.change-order-units',   label: 'Change Order Units',           scope: SCOPE_JOB, level: 'page' },
  { id: 'job.inputs.manpower',             label: 'Manpower',                     scope: SCOPE_JOB, level: 'page' },
  { id: 'job.inputs.daily-prod-report',    label: 'Daily Production Report',      scope: SCOPE_JOB, level: 'subsection' },
  { id: 'job.inputs.daily-prod-report.daily-production', label: 'Daily Production', scope: SCOPE_JOB, level: 'page', subrow: true },
  { id: 'job.inputs.daily-prod-report.notes',            label: 'Notes',            scope: SCOPE_JOB, level: 'page', subrow: true },
  { id: 'job.inputs.fabrication-manpower', label: 'Fabrication Manpower',         scope: SCOPE_JOB, level: 'page' },

  { id: 'job.poc',                         label: 'POC',                          scope: SCOPE_JOB, level: 'section' },
  { id: 'job.poc.presentation',            label: 'Presentation',                 scope: SCOPE_JOB, level: 'page' },
  { id: 'job.poc.forecast',                label: 'Forecast',                     scope: SCOPE_JOB, level: 'page' },
  { id: 'job.poc.co-log',                  label: 'CO Log',                       scope: SCOPE_JOB, level: 'page' },
  { id: 'job.poc.revenue-projection',      label: 'Revenue Projection',           scope: SCOPE_JOB, level: 'page' },

  { id: 'job.weekly-vs-daily',             label: 'Weekly vs Daily',              scope: SCOPE_JOB, level: 'section' },
  { id: 'job.weekly-vs-daily.view',        label: 'Weekly vs Daily',              scope: SCOPE_JOB, level: 'page' },

  // ─── Admin scope ───────────────────────────────────────────────────────────
  // Its own group, not a section of the system pages — these are the
  // administration screens themselves.
  { id: 'admin.user-mgmt',                 label: 'User Management',              scope: SCOPE_ADMIN, level: 'page', href: '/user-management' },
  { id: 'admin.global-config',             label: 'Global Configuration',         scope: SCOPE_ADMIN, level: 'page', href: '/global-configuration' },
  { id: 'admin.audit',                     label: 'Audit Tracker',                scope: SCOPE_ADMIN, level: 'page', href: '/audit-log' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Registry rows for a scope (or all rows), in display order. */
export function getRows(scope) {
  return scope ? PAGE_REGISTRY.filter(r => r.scope === scope) : PAGE_REGISTRY;
}

/** Only the togglable pages — excludes section and sub-section headers. */
export function getPages(scope) {
  return PAGE_REGISTRY.filter(
    r => r.level === 'page' && (!scope || r.scope === scope)
  );
}

/**
 * Rows that can carry an iPad name. Pages, plus sub-sections — a sub-section is
 * a nav grouping that shows up on the tablet too, and can be labelled
 * differently there (e.g. "Daily Production Report" → "DPR").
 */
export function getNameableRows(scope) {
  return PAGE_REGISTRY.filter(
    r => (r.level === 'page' || r.level === 'subsection') && (!scope || r.scope === scope)
  );
}

/**
 * The page ids a section/subsection header cascades to.
 *
 * A section owns every page until the next section. A subsection owns only the
 * `subrow` pages immediately beneath it.
 */
export function getDescendantPageIds(headerId) {
  const start = PAGE_REGISTRY.findIndex(r => r.id === headerId);
  if (start === -1) return [];

  const header = PAGE_REGISTRY[start];
  const ids = [];

  for (let i = start + 1; i < PAGE_REGISTRY.length; i++) {
    const row = PAGE_REGISTRY[i];

    if (header.level === 'section') {
      if (row.level === 'section') break;
      if (row.level === 'page') ids.push(row.id);
    } else if (header.level === 'subsection') {
      if (row.level !== 'page' || !row.subrow) break;
      ids.push(row.id);
    }
  }

  return ids;
}

/** id -> registry row, for quick lookups. */
export const PAGE_BY_ID = PAGE_REGISTRY.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {});
