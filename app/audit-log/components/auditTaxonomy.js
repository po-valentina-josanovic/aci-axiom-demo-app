// Mirrors the real constants in ProfitOptics.Framework.Web.Areas.AuditLog.Models
// (AuditTrackerHelper / AuditTrackerMessageHelper). Area filtering there is an
// exact match against either a Source or an Application column (OR'd), so the
// dropdown offers both page-level values (e.g. "Potential Projects") and
// section-level values (e.g. "Project Overview") side by side — picking the
// page catches every row under it; picking a section narrows to just that.
// Event filtering is an exact match against the Message column, drawn from
// the same fixed action-name list regardless of which Area is selected —
// there is no Area -> Event dependency server-side.

export const AREA_STRUCTURE = [
  {
    page: 'Jobs',
    sections: [
      'Job Setup', 'Manpower Baseline', 'Unused Cost Codes',
      'Weekly Units', 'Qty Adjust Units', 'Change Order Units', 'Manpower', 'Daily Production Report', 'Fabrication Manpower', 'Fabrication Baseline',
      'Dashboard', 'Overall Review', 'Level Breakdown',
      'Presentation', 'Forecast', 'CO Log',
      'Job Cost', 'Weekly vs Daily',
    ],
  },
  { page: 'Bid Summary Warehouse', sections: ['Bid Summary', 'Manage Bid Summaries'] },
  { page: 'Master Manpower', sections: ['PreCon', 'Awarded Manpower'] },
  { page: 'User Management', sections: ['User List', 'User Role Matrix'] },
  { page: 'Global Configuration', sections: ['Trade to Phase Code Division Association', 'PM Automation', 'Job Departments'] },
  { page: 'Company and Contact Management', sections: ['Company', 'Contact'] },
  {
    page: 'Potential Projects',
    sections: [
      'Project Overview', 'Contract Details', 'Site Location', 'Bid Details', 'Cost Breakdown',
      'Estimator Trades', 'Yearly Burns', 'Contract Summary', 'Award Details', 'Loss Details',
      'Companies', 'Contacts', 'Internal Team', 'Notes',
    ],
  },
];

// Grouped for the Area multi-select — each group's first entry is the page
// itself (a broader, page-level match), followed by its sections.
export const AREA_GROUPS = AREA_STRUCTURE.map(({ page, sections }) => ({
  label: page,
  options: [page, ...sections],
}));

export const AREA_OPTIONS = AREA_GROUPS.flatMap((g) => g.options);

// Grouped for the Event multi-select — grouping follows the section comments
// in AuditTrackerMessageHelper so it reads the same as the source of truth.
export const EVENT_GROUPS = [
  { label: 'Jobs', options: ['Add Job', 'Edit Job', 'Delete Job', 'Add Job Team Role', 'Delete Job Team Role', 'Update Job Levels', 'Update Job Team'] },
  { label: 'Users', options: ['Add New User', 'Edit User'] },
  { label: 'Job Inputs', options: ['Update Parameters', 'Update POC', 'Update Qty Adjust Units', 'Add Cost Code', 'Update Cost Code', 'Update Unused Cost Codes', 'Update Weekly Units'] },
  { label: 'Manpower', options: ['Add Manpower', 'Update Manpower', 'Add Manpower Productivity', 'Update Manpower Productivity', 'Remove Manpower Productivity', 'Update Pending Change Order', 'Update Cost To Complete', 'Add Manpower Goals', 'Update Manpower Goals', 'Add Manpower Shared Resources', 'Update Manpower Shared Resources', 'Activate Manual Entry', 'Update Manual Entry', 'Reset Trade Manpower', 'Update Capacity Temp Labor'] },
  { label: 'PM Automation & Trades', options: ['Edit PM Automation', 'Add Trades to Phase Code Division Association', 'Add Shop Phase Code', 'Add Field Phase Code', 'Inactivate Trade', 'Activate Trade', 'Edit Trades to Phase Code Division Association', 'Edit Shop Phase Code', 'Edit Field Phase Code'] },
  { label: 'Bid Summary Warehouse', options: ['Add Bid Summary', 'Remove Bid Summary', 'Edit Bid Summary'] },
  { label: 'Daily Production', options: ['Add Daily Production Report', 'Submit Daily Production Report', 'Add Daily Production Labor', 'Edit Daily Production Labor', 'Remove Daily Production Labor'] },
  { label: 'Distribution & Manpower Planning', options: ['Add Distribution', 'Update Distribution', 'Generate Distribution Manpower', 'Add Borrowed Manpower', 'Update Borrowed Manpower'] },
  { label: 'Global Configuration', options: ['Edit Job Departments', 'Add Baseline', 'Update Baseline', 'Edit Std Craft Daily Production', 'Edit Std Craft Master Manpower'] },
  { label: 'Company and Contact Management', options: ['Create Company', 'Update Company', 'Create Contact', 'Update Contact', 'Delete Contact', 'Delete Company'] },
  { label: 'Potential Projects', options: ['Create Potential Project', 'Save Potential Project', 'Update Project Stage', 'Add Note', 'Edit Note', 'Delete Note'] },
];

export const EVENT_OPTIONS = EVENT_GROUPS.flatMap((g) => g.options);

// The real backend has no Area -> Event dependency (see note above), but
// narrowing the Event list once an Area is picked is still a useful UI
// convenience. Each individual event is scoped to the single section it
// actually fires from (e.g. "Add Daily Production Report" -> "Daily
// Production Report"), or — for events that genuinely apply across an
// entire page regardless of which section you're on (e.g. "Save Potential
// Project" fires from every Potential Projects tab) — to that page itself.
// This is purely a client-side "show me what's relevant" filter; it never
// changes what the applied Area/Event filters actually match on.
const EVENT_SCOPE = {
  'Add Job': 'Job Setup',
  'Edit Job': 'Job Setup',
  'Delete Job': 'Job Setup',
  'Add Job Team Role': 'Job Setup',
  'Delete Job Team Role': 'Job Setup',
  'Update Job Levels': 'Level Breakdown',
  'Update Job Team': 'Job Setup',

  'Add New User': 'User List',
  'Edit User': 'User List',

  'Update Parameters': 'Job Setup',
  'Update POC': 'Presentation',
  'Update Qty Adjust Units': 'Qty Adjust Units',
  'Add Cost Code': 'Unused Cost Codes',
  'Update Cost Code': 'Unused Cost Codes',
  'Update Unused Cost Codes': 'Unused Cost Codes',
  'Update Weekly Units': 'Weekly Units',

  'Add Manpower': 'Manpower',
  'Update Manpower': 'Manpower',
  'Add Manpower Productivity': 'Manpower',
  'Update Manpower Productivity': 'Manpower',
  'Remove Manpower Productivity': 'Manpower',
  'Update Pending Change Order': 'Change Order Units',
  'Update Cost To Complete': 'Job Cost',
  'Add Manpower Goals': 'Manpower Baseline',
  'Update Manpower Goals': 'Manpower Baseline',
  'Add Manpower Shared Resources': 'Manpower',
  'Update Manpower Shared Resources': 'Manpower',
  'Activate Manual Entry': 'Daily Production Report',
  'Update Manual Entry': 'Daily Production Report',
  'Reset Trade Manpower': 'Manpower',
  'Update Capacity Temp Labor': 'Manpower',

  'Edit PM Automation': 'PM Automation',
  'Add Trades to Phase Code Division Association': 'Trade to Phase Code Division Association',
  'Add Shop Phase Code': 'Trade to Phase Code Division Association',
  'Add Field Phase Code': 'Trade to Phase Code Division Association',
  'Inactivate Trade': 'Trade to Phase Code Division Association',
  'Activate Trade': 'Trade to Phase Code Division Association',
  'Edit Trades to Phase Code Division Association': 'Trade to Phase Code Division Association',
  'Edit Shop Phase Code': 'Trade to Phase Code Division Association',
  'Edit Field Phase Code': 'Trade to Phase Code Division Association',

  'Add Bid Summary': 'Bid Summary',
  'Remove Bid Summary': 'Bid Summary',
  'Edit Bid Summary': 'Bid Summary',

  'Add Daily Production Report': 'Daily Production Report',
  'Submit Daily Production Report': 'Daily Production Report',
  'Add Daily Production Labor': 'Daily Production Report',
  'Edit Daily Production Labor': 'Daily Production Report',
  'Remove Daily Production Labor': 'Daily Production Report',

  'Add Distribution': 'Master Manpower',
  'Update Distribution': 'Master Manpower',
  'Generate Distribution Manpower': 'Master Manpower',
  'Add Borrowed Manpower': 'Master Manpower',
  'Update Borrowed Manpower': 'Master Manpower',

  'Edit Job Departments': 'Job Departments',
  'Add Baseline': 'Manpower Baseline',
  'Update Baseline': 'Manpower Baseline',
  'Edit Std Craft Daily Production': 'Global Configuration',
  'Edit Std Craft Master Manpower': 'Master Manpower',

  'Create Company': 'Company',
  'Update Company': 'Company',
  'Delete Company': 'Company',
  'Create Contact': 'Contact',
  'Update Contact': 'Contact',
  'Delete Contact': 'Contact',

  'Create Potential Project': 'Potential Projects',
  'Save Potential Project': 'Potential Projects',
  'Update Project Stage': 'Project Overview',
  'Add Note': 'Notes',
  'Edit Note': 'Notes',
  'Delete Note': 'Notes',
};

export function pageForAreaValue(value) {
  const group = AREA_STRUCTURE.find((g) => g.page === value || g.sections.includes(value));
  return group ? group.page : null;
}

// scope is either a page (e.g. "Potential Projects") or a section (e.g.
// "Daily Production Report"). A page-scoped event matches any selected
// value under that page — page or section. A section-scoped event only
// matches that exact section, or the whole page being picked broadly.
function eventMatchesAreas(scope, areas) {
  const scopePage = pageForAreaValue(scope);
  const scopeIsPage = scope === scopePage;
  return areas.some((a) => {
    if (a === scope) return true;
    const aPage = pageForAreaValue(a);
    const aIsPage = a === aPage;
    if (scopeIsPage) return aPage === scope;
    if (aIsPage) return aPage === scopePage;
    return false;
  });
}

export function getEventGroupsForAreas(areas) {
  if (!areas.length) return EVENT_GROUPS;
  return EVENT_GROUPS
    .map((g) => ({ ...g, options: g.options.filter((ev) => eventMatchesAreas(EVENT_SCOPE[ev], areas)) }))
    .filter((g) => g.options.length);
}
