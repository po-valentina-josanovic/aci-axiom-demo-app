'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProjectsContext = createContext(null);

// --- Section 4: Project Stages (Status) - Vista values ---
const STAGES = [
  'Preliminary',
  'Lead',
  'Budget',
  'Bid',
  'Pending',
  'Award',
  'Lost',
  'Cancel',
];

// --- Section 2: Project Type Values (from Vista) ---
const PROJECT_TYPES = [
  { code: 'I', name: 'Internal' },
  { code: 'M', name: 'Custom Fab' },
  { code: 'N', name: 'New/Installation' },
  { code: 'NA', name: 'N/A' },
  { code: 'R', name: 'Renovation' },
  { code: 'W', name: 'Warranty' },
];

const DIVISIONS = [
  { code: '01', name: 'Division 01' },
  { code: '02', name: 'Division 02' },
  { code: '03', name: 'Division 03' },
  { code: '04', name: 'Division 04' },
  { code: '05', name: 'Division 05' },
];

const CONTRACT_TYPES = ['Lump Sum', 'GMP', 'T&M', 'Cost Plus', 'Unit Price'];

const END_SECTORS = [
  'Healthcare',
  'Education',
  'Commercial',
  'Industrial',
  'Government',
  'Residential',
  'Mixed-Use',
];

// --- Section 12: Proof To Proceed (from Vista) ---
const PROOF_TYPES = ['Contract', 'Purchase Order', 'Notice to Proceed', 'Other'];

const INSURANCE_PROGRAMS = [
  'ACI Insurance Program',
  'Customer (CCIP) / Owner (OCIP)',
];

const CLIENT_TYPES = [
  'Owner',
  'General Contractor',
  'Construction Manager',
  'Design-Builder',
  'Other',
];

const COMPANY_TYPES = [
  'Client',
  'Owner',
  'Engineer',
  'Architect',
];

const COMPANY_GROUPS = ['ACI', 'API'];

// Always-present address slots on every company
const ADDRESS_TYPES = ['Main', 'Billing', 'Mailing', 'Shipping'];

// Picklist for additional, company-specific offices/locations
const EXTRA_ADDRESS_TYPES = ['Warehouse', 'Headquarters', 'Regional Office', 'Branch Office', 'Job Site', 'Other'];

const LIQUIDATED_DAMAGES_PER = ['Per Day', 'Per Week', 'Per Month', 'Flat'];

// --- Section 12.3: Trades from Vista PC Scope Trades Lookup ---
const TRADES = [
  'CIVIL',
  'ELEC',
  'ELECSHOP',
  'FIREPRO',
  'HVAC',
  'IRONWRK',
  'MILLWRIGHT',
  'PIPESHOP',
  'PIPING',
  'PLUMBING',
  'PLUMBSHOP',
  'SHEETML',
  'SMSHOP',
];

// --- Section 10: Contact Roles ---
const CONTACT_ROLES = [
  'Client',
  'Owner',
  'Engineer',
  'Architect',
  'ACI/API/POC',
  'CommissionedSalesPerson',
  'Competitor',
];

// --- Section 7: Construction Types ---
const CONSTRUCTION_TYPES = [
  'New',
  'Renovation',
  'Addition',
  'Tenant Improvement',
  'Infrastructure',
  'Other',
];

// --- Section 7: Project Size Units of Measure ---
const PROJECT_SIZE_UM = ['SF', 'LF', 'Acres', 'Each', 'Other'];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const CURRENT_USER = {
  name: 'John Doe',
  initials: 'JD',
  division: '01',
  department: '010D - DSM',
};

// Mock estimators for dropdown (Section 12.3)
const ESTIMATORS_LIST = [
  { name: 'Mike Johnson', department: 'EST-01' },
  { name: 'Sarah Williams', department: 'EST-01' },
  { name: 'Tom Brown', department: 'EST-02' },
  { name: 'Lisa Davis', department: 'EST-02' },
  { name: 'James Wilson', department: 'EST-03' },
];

// Mock users for @mention (Section 6)
const USERS_LIST = [
  'John Doe',
  'Mike Johnson',
  'Sarah Williams',
  'Tom Brown',
  'Lisa Davis',
  'James Wilson',
  'Emily Chen',
  'Robert Taylor',
];

function generateProjectNumber(division, projects) {
  const year = new Date().getFullYear().toString().slice(-2);
  const divCode = division.padStart(2, '0');
  const prefix = `${year}-${divCode}`;

  const existing = projects.filter(
    (p) => p.potential_project_number && p.potential_project_number.startsWith(prefix)
  );
  const nextSeq = (existing.length + 1).toString().padStart(2, '0');

  return `${prefix}${nextSeq}-${CURRENT_USER.initials}`;
}

// --- Copy From Existing Project -------------------------------------------
// Lets a user start a new pursuit from a similar past one. Two layers here:
//
//  1. COPY_SECTIONS — mirrors the nine sections of the detail page, in the same
//     order. Every field is its own checkbox and nothing is ever blocked; the
//     risky ones simply start unselected and carry a "review" chip.
//  2. Generated fresh, so not offered: project number, created by, created/updated
//     dates, data source, visited stages and the copy provenance itself.
//
// Each item writes into one of two buckets:
//   `form`   — fields the create modal renders, so the user reviews them before saving
//   `record` — deeper sections merged into the new project on create
const clone = (val) => (val === undefined ? val : JSON.parse(JSON.stringify(val)));

// Local MM-DD-YYYY for item previews (avoids importing the formatters module here).
function formatMDY(val) {
  if (!val || typeof val !== 'string') return '';
  const [y, m, d] = val.split('-');
  return y && m && d ? `${m}-${d}-${y}` : val;
}

const usd = (val) => (val === '' || val === null || val === undefined || isNaN(Number(val))
  ? ''
  : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(val)));

// End sector normally lives on contract_details, but records persisted before it
// was added to the create modal can carry it at the top level.
const readEndSector = (p) => p.contract_details?.end_sector || p.end_sector || '';

// Copies the listed keys from `source` into out.record[sectionKey].
function into(out, sectionKey, source, keys) {
  if (!source) return;
  out.record[sectionKey] = out.record[sectionKey] || {};
  keys.forEach((k) => {
    if (source[k] !== undefined) out.record[sectionKey][k] = clone(source[k]);
  });
}

// Row ids are scoped to a project, so they carry over as-is. That keeps
// cross-references intact — client_data is keyed by client slot id, and
// award_details.awarded_client_id points at one.
const list = (arr) => clone(arr || []);
const count = (arr) => (arr || []).length;
const names = (arr, key = 'company_name') => (arr || []).map((x) => x[key] || x.name || '').filter(Boolean).slice(0, 3).join(', ');

// Every copyable piece of a project, organized by the sections of the detail
// page so the picker reads like the form the user already knows. Each item is
// an independent checkbox — `defaultOn` only sets the starting selection.
const COPY_SECTIONS = [
  {
    key: 'overview',
    label: 'Project Overview',
    items: [
      { key: 'ov_division', label: 'Division', formFields: ['division'], defaultOn: true,
        preview: (p) => (p.division ? `Div ${p.division}` : '') },
      { key: 'ov_description', label: 'Description', formFields: ['description'], defaultOn: true,
        preview: (p) => p.description || '' },
      { key: 'ov_probability', label: 'Probability %', formFields: ['probability_percent'], defaultOn: true,
        preview: (p) => (p.probability_percent === '' || p.probability_percent === undefined ? '' : `${p.probability_percent}%`) },
      { key: 'ov_bid_date', label: 'Bid Date', formFields: ['bid_date'], defaultOn: false, caution: true,
        preview: (p) => formatMDY(p.bid_date) },
      { key: 'ov_start_date', label: 'Est. Project Start', formFields: ['estimated_project_start'], defaultOn: false, caution: true,
        preview: (p) => formatMDY(p.estimated_project_start) },
      { key: 'ov_type', label: 'Project Type', formFields: ['project_type'], defaultOn: true,
        preview: (p) => p.project_type || '' },
      { key: 'ov_nda', label: 'NDA', formFields: ['nda'], defaultOn: true,
        preview: (p) => p.nda || '' },
      { key: 'ov_end_sector', label: 'End Sector', formFields: ['end_sector'], defaultOn: true,
        preview: (p) => readEndSector(p) },
      { key: 'ov_internal_poc', label: 'Internal POC', defaultOn: true,
        hint: 'Otherwise defaults to you',
        preview: (p) => p.internal_poc || p.created_by || '',
        apply: (p, out) => {
          const poc = p.internal_poc || p.created_by || '';
          if (poc) out.record.internal_poc = poc;   // never blank out the default
        } },
      { key: 'ov_stage', label: 'Status / Stage', formFields: ['project_stage'], defaultOn: false,
        hint: 'Otherwise starts at Preliminary',
        preview: (p) => p.project_stage || '' },
    ],
  },
  {
    key: 'site',
    label: 'Site Location',
    items: [
      { key: 'site_street', label: 'Street', defaultOn: true,
        preview: (p) => p.site_location?.street || '',
        apply: (p, out) => into(out, 'site_location', p.site_location, ['street']) },
      { key: 'site_city', label: 'City', defaultOn: true,
        preview: (p) => p.site_location?.city || '',
        apply: (p, out) => into(out, 'site_location', p.site_location, ['city']) },
      { key: 'site_state', label: 'State', defaultOn: true,
        preview: (p) => p.site_location?.state || '',
        apply: (p, out) => into(out, 'site_location', p.site_location, ['state']) },
      { key: 'site_zip', label: 'Zip Code', defaultOn: true,
        preview: (p) => p.site_location?.zip_code || '',
        apply: (p, out) => into(out, 'site_location', p.site_location, ['zip_code']) },
      { key: 'site_country', label: 'Country', defaultOn: true,
        preview: (p) => p.site_location?.country || '',
        apply: (p, out) => into(out, 'site_location', p.site_location, ['country']) },
    ],
  },
  {
    key: 'contract',
    label: 'Contract Details',
    items: [
      { key: 'ct_square_footage', label: 'Square Footage', defaultOn: true,
        preview: (p) => p.contract_details?.square_footage || '',
        apply: (p, out) => into(out, 'contract_details', p.contract_details, ['square_footage']) },
      { key: 'ct_contract_type', label: 'Contract Type', defaultOn: true,
        preview: (p) => p.contract_details?.contract_type || '',
        apply: (p, out) => into(out, 'contract_details', p.contract_details, ['contract_type']) },
      { key: 'ct_client_type', label: 'Client Type', defaultOn: true,
        preview: (p) => p.contract_details?.client_type || '',
        apply: (p, out) => into(out, 'contract_details', p.contract_details, ['client_type']) },
      { key: 'ct_construction_type', label: 'Construction Type', defaultOn: true,
        preview: (p) => p.contract_details?.construction_type || '',
        apply: (p, out) => into(out, 'contract_details', p.contract_details, ['construction_type']) },
      { key: 'ct_sales_tax', label: 'Sales Tax Exempt', defaultOn: true,
        preview: (p) => p.contract_details?.sales_tax_exempt || '',
        apply: (p, out) => into(out, 'contract_details', p.contract_details, ['sales_tax_exempt']) },
      { key: 'ct_insurance', label: 'Insurance Program', defaultOn: true,
        preview: (p) => p.contract_details?.insurance_program || '',
        apply: (p, out) => into(out, 'contract_details', p.contract_details, ['insurance_program']) },
      { key: 'ct_prime_or_sub', label: 'Prime or Sub', defaultOn: true,
        preview: (p) => p.contract_details?.prime_or_sub || '',
        apply: (p, out) => into(out, 'contract_details', p.contract_details, ['prime_or_sub']) },
    ],
  },
  {
    key: 'companies',
    label: 'Companies and Contacts',
    items: [
      { key: 'cc_clients', label: 'Clients', defaultOn: true,
        hint: 'Client companies and their client type',
        count: (p) => count(p.client_slots),
        preview: (p) => names(p.client_slots),
        apply: (p, out) => { out.record.client_slots = list(p.client_slots); } },
      { key: 'cc_owner', label: 'Owner', defaultOn: true,
        preview: (p) => p.owner_slot?.company_name || '',
        apply: (p, out) => { out.record.owner_slot = clone(p.owner_slot || { company_name: '' }); } },
      { key: 'cc_competitors', label: 'Competitors', defaultOn: true,
        count: (p) => count(p.competitor_slots),
        preview: (p) => names(p.competitor_slots),
        apply: (p, out) => { out.record.competitor_slots = list(p.competitor_slots); } },
      { key: 'cc_additional', label: 'Additional Companies', defaultOn: true,
        count: (p) => count(p.additional_companies),
        preview: (p) => names(p.additional_companies),
        apply: (p, out) => { out.record.additional_companies = list(p.additional_companies); } },
      { key: 'cc_contacts', label: 'Contacts', defaultOn: true,
        hint: 'Contacts and internal team assignments, with their roles',
        count: (p) => count(p.contacts),
        preview: (p) => names(p.contacts, 'name'),
        apply: (p, out) => { out.record.contacts = list(p.contacts); } },
    ],
  },
  {
    key: 'notes',
    label: 'Notes',
    note: 'Written about the previous project.',
    items: [
      { key: 'nt_notes', label: 'Notes', defaultOn: false, caution: true,
        hint: 'Carried over with their original author and timestamp',
        count: (p) => count(p.notes),
        preview: (p) => (count(p.notes) ? `${count(p.notes)} note${count(p.notes) !== 1 ? 's' : ''} from the old project` : ''),
        apply: (p, out) => { out.record.notes = list(p.notes); } },
    ],
  },
  {
    key: 'budget',
    label: 'Budget Details',
    note: 'Tied to the previous pursuit.',
    items: [
      { key: 'bg_estimation_number', label: 'Estimation Number', defaultOn: false, caution: true,
        preview: (p) => p.estimation_number || '',
        apply: (p, out) => { out.record.estimation_number = p.estimation_number || ''; } },
      { key: 'bg_client_data', label: 'Per-Client Estimation Numbers', defaultOn: false, caution: true,
        hint: 'Only applies when the client list is copied too',
        count: (p) => Object.keys(p.client_data || {}).length,
        preview: (p) => (Object.keys(p.client_data || {}).length ? 'Per-client estimation numbers' : ''),
        apply: (p, out) => { out.record.client_data = clone(p.client_data || {}); } },
      { key: 'bg_revisions', label: 'Budget Revisions', defaultOn: false, caution: true,
        hint: 'The revision history of the old budget',
        count: (p) => count(p.budget_revisions),
        preview: (p) => (count(p.budget_revisions) ? `${count(p.budget_revisions)} revision${count(p.budget_revisions) !== 1 ? 's' : ''}` : ''),
        apply: (p, out) => { out.record.budget_revisions = list(p.budget_revisions); } },
    ],
  },
  {
    key: 'bid',
    label: 'Bid Details',
    items: [
      { key: 'bid_pricing', label: 'Cost of Work / Margin / Total Price', defaultOn: false, caution: true,
        hint: 'Copied together so Total Price stays consistent',
        preview: (p) => [usd(p.bid_details?.cost_of_work),
          p.bid_details?.gross_margin_percent && `${p.bid_details.gross_margin_percent}% GM`].filter(Boolean).join(' · '),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['cost_of_work', 'gross_margin_percent', 'total_price']) },
      { key: 'bid_total_bid_cost', label: 'Total Bid Cost', defaultOn: false, caution: true,
        preview: (p) => usd(p.bid_details?.total_bid_cost),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['total_bid_cost']) },
      { key: 'bid_end_date', label: 'Project End Date', defaultOn: false, caution: true,
        preview: (p) => formatMDY(p.bid_details?.project_end_date),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['project_end_date']) },
      { key: 'bid_cost_breakdown', label: 'Cost Breakdown', defaultOn: false, caution: true,
        hint: 'Labor, hours, material, equipment, subcontract, other',
        preview: (p) => {
          const cb = p.bid_details?.cost_breakdown || {};
          const filled = Object.values(cb).filter((v) => v !== '' && v !== null && v !== undefined).length;
          return filled ? `${filled} line${filled !== 1 ? 's' : ''} filled` : '';
        },
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['cost_breakdown']) },
      { key: 'bid_trades', label: 'Estimators & Trades', defaultOn: true,
        hint: 'Each row carries its estimator, trade, dates, hours and cost',
        count: (p) => count(p.bid_details?.trades),
        preview: (p) => (p.bid_details?.trades || []).map((t) => t.name || t.estimator).filter(Boolean).slice(0, 3).join(', '),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['trades']) },
      { key: 'bid_year_burns', label: 'Year Burns', defaultOn: false, caution: true,
        hint: 'Must total 100% — recheck against the new schedule',
        count: (p) => count(p.bid_details?.year_burns),
        preview: (p) => (count(p.bid_details?.year_burns) ? 'Yearly burn percentages' : ''),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['year_burns']) },
    ],
  },
  {
    // Its own accordion on the detail page, between Bid Details and Award Details.
    key: 'contract_summary',
    label: 'Contract Summary Data',
    items: [
      { key: 'cs_toggles', label: 'Compliance Toggles', defaultOn: true,
        hint: 'Sales tax exempt, sub-tier lien waivers, certified payroll, prevailing wage, bid bond, bonded',
        preview: (p) => `${['sales_tax_exempt', 'sub_tier_lien_waivers', 'certified_payroll', 'prevailing_wage_scale', 'bid_bond_req', 'bonded']
          .filter((k) => p.bid_details?.[k] === 'Yes').length} of 6 set to Yes`,
        apply: (p, out) => into(out, 'bid_details', p.bid_details,
          ['sales_tax_exempt', 'sub_tier_lien_waivers', 'certified_payroll', 'prevailing_wage_scale', 'bid_bond_req', 'bonded']) },
      { key: 'cs_liquidated', label: 'Liquidated Damages', defaultOn: false, caution: true,
        preview: (p) => (p.bid_details?.liquidated_damages_required
          ? [usd(p.bid_details?.liquidated_damages_amount), p.bid_details?.liquidated_damages_per].filter(Boolean).join(' ') || 'Required'
          : ''),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['liquidated_damages_required', 'liquidated_damages_amount', 'liquidated_damages_per']) },
      { key: 'cs_proof', label: 'Proof / Document to Proceed', defaultOn: true,
        preview: (p) => [p.bid_details?.proof_to_proceed, p.bid_details?.document_to_proceed].filter(Boolean).join(' · '),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['proof_to_proceed', 'document_to_proceed']) },
      { key: 'cs_document_id', label: 'Document ID', defaultOn: false, caution: true,
        hint: 'PO or reference number from the old job',
        preview: (p) => p.bid_details?.document_id || '',
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['document_id']) },
      { key: 'cs_retainage', label: 'Retainage %', defaultOn: true,
        preview: (p) => (p.bid_details?.retainage_required
          ? (p.bid_details?.retainage_pct ? `${p.bid_details.retainage_pct}%` : 'Required')
          : ''),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['retainage_required', 'retainage_pct']) },
      { key: 'cs_warranty', label: 'Warranty (months)', defaultOn: true,
        preview: (p) => (p.bid_details?.warranty_months ? `${p.bid_details.warranty_months} months` : ''),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['warranty_months']) },
      { key: 'cs_gc_bill_day', label: 'GC Bill Day', defaultOn: true,
        preview: (p) => (p.bid_details?.gc_bill_day ? `Day ${p.bid_details.gc_bill_day}` : ''),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['gc_bill_day']) },
      { key: 'cs_suggested_job_no', label: 'Suggested Job No', defaultOn: false, caution: true,
        preview: (p) => p.bid_details?.suggested_job_no || '',
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['suggested_job_no']) },
      { key: 'cs_documents', label: 'Documents', defaultOn: false, caution: true,
        hint: 'File references attached to the old bid',
        count: (p) => count(p.bid_details?.documents),
        preview: (p) => (count(p.bid_details?.documents) ? `${count(p.bid_details.documents)} document${count(p.bid_details.documents) !== 1 ? 's' : ''}` : ''),
        apply: (p, out) => into(out, 'bid_details', p.bid_details, ['documents']) },
    ],
  },
  {
    key: 'award',
    label: 'Award Details',
    note: 'The previous pursuit’s outcome.',
    items: [
      { key: 'aw_client', label: 'Awarded Client', defaultOn: false, caution: true,
        preview: (p) => (p.award_details?.awarded_client_id ? 'Selected client' : ''),
        apply: (p, out) => into(out, 'award_details', p.award_details, ['awarded_client_id']) },
      { key: 'aw_date', label: 'Awarded Date', defaultOn: false, caution: true,
        preview: (p) => formatMDY(p.award_details?.awarded_date),
        apply: (p, out) => into(out, 'award_details', p.award_details, ['awarded_date']) },
      { key: 'aw_amount', label: 'Awarded Amount', defaultOn: false, caution: true,
        preview: (p) => usd(p.award_details?.awarded_amount),
        apply: (p, out) => into(out, 'award_details', p.award_details, ['awarded_amount']) },
      { key: 'aw_cost', label: 'Awarded Cost', defaultOn: false, caution: true,
        preview: (p) => usd(p.award_details?.awarded_cost),
        apply: (p, out) => into(out, 'award_details', p.award_details, ['awarded_cost']) },
      { key: 'aw_margin', label: 'Awarded Margin %', defaultOn: false, caution: true,
        preview: (p) => (p.award_details?.awarded_margin_percent ? `${p.award_details.awarded_margin_percent}%` : ''),
        apply: (p, out) => into(out, 'award_details', p.award_details, ['awarded_margin_percent']) },
      { key: 'aw_pm', label: 'Project Manager', defaultOn: false,
        preview: (p) => p.award_details?.project_manager || '',
        apply: (p, out) => into(out, 'award_details', p.award_details, ['project_manager']) },
      { key: 'aw_super', label: 'Superintendent', defaultOn: false,
        preview: (p) => p.award_details?.superintendent || '',
        apply: (p, out) => into(out, 'award_details', p.award_details, ['superintendent']) },
      { key: 'aw_sales', label: 'Commissioned Sales Person', defaultOn: false,
        preview: (p) => p.award_details?.commissioned_sales_person || '',
        apply: (p, out) => into(out, 'award_details', p.award_details, ['commissioned_sales_person']) },
      { key: 'aw_job_no', label: 'Suggested Job No', defaultOn: false, caution: true,
        preview: (p) => p.award_details?.suggested_job_no || '',
        apply: (p, out) => into(out, 'award_details', p.award_details, ['suggested_job_no']) },
    ],
  },
  {
    key: 'loss',
    label: 'Loss Details',
    note: 'The previous pursuit’s outcome.',
    items: [
      { key: 'ls_feedback', label: 'Lost Feedback', defaultOn: false, caution: true,
        preview: (p) => p.loss_details?.feedback || '',
        apply: (p, out) => into(out, 'loss_details', p.loss_details, ['feedback']) },
      { key: 'ls_notice', label: 'Date of Notice', defaultOn: false, caution: true,
        preview: (p) => formatMDY(p.loss_details?.date_of_notice),
        apply: (p, out) => into(out, 'loss_details', p.loss_details, ['date_of_notice']) },
      { key: 'ls_competitors', label: 'Competitors', defaultOn: false, caution: true,
        hint: 'Competitor names and their bid amounts',
        count: (p) => count(p.loss_details?.competitors),
        preview: (p) => names(p.loss_details?.competitors, 'name'),
        apply: (p, out) => into(out, 'loss_details', p.loss_details, ['competitors']) },
    ],
  },
];

// Flat list of every copyable item, used to build payloads.
const COPY_GROUPS = COPY_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({ ...item, sectionKey: section.key, sectionLabel: section.label }))
);

// Items that map straight onto a create-modal field get a generic `apply` so the
// value lands in the `form` bucket and the user reviews it before saving.
const FORM_FIELD_SOURCES = {
  division: (p) => p.division || '',
  project_type: (p) => p.project_type || '',
  end_sector: (p) => readEndSector(p),
  nda: (p) => p.nda || '',
  description: (p) => p.description || '',
  probability_percent: (p) => (p.probability_percent ?? ''),
  project_stage: (p) => p.project_stage || '',
  bid_date: (p) => p.bid_date || '',
  estimated_project_start: (p) => p.estimated_project_start || '',
};

COPY_GROUPS.forEach((item) => {
  if (item.apply || !item.formFields) return;
  item.apply = (p, out) => {
    item.formFields.forEach((field) => {
      const read = FORM_FIELD_SOURCES[field];
      if (read) out.form[field] = read(p);
    });
  };
});

// Form fields each item owns, so the modal can prefill and clear them as
// items are toggled on and off.
const COPY_GROUP_FORM_FIELDS = COPY_GROUPS.reduce((acc, item) => {
  if (item.formFields) acc[item.key] = item.formFields;
  return acc;
}, {});

// Builds the copy payload for a source project and a set of enabled group keys.
// Returns { form, record } — never includes identity, notes or outcome data.
function buildCopyPayload(source, enabledKeys) {
  const out = { form: {}, record: {} };
  if (!source) return out;
  COPY_GROUPS.forEach((g) => {
    if (enabledKeys.includes(g.key)) g.apply(source, out);
  });
  return out;
}

function deepMergeCopied(base, patch) {
  const result = { ...base };
  Object.keys(patch).forEach((key) => {
    const val = patch[key];
    const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);
    result[key] = isPlainObject(val) && isPlainObject(base[key])
      ? deepMergeCopied(base[key], val)
      : clone(val);
  });
  return result;
}

const SEED_PROJECTS = [
  {
    id: 'seed-001',

    project_name: 'Metro Health HQ HVAC Renovation',
    description: 'Full HVAC system replacement for the Metro Health headquarters building, 6 floors.',
    division: '01',
    project_stage: 'Bid',
    probability_percent: 75,
    bid_date: '2026-05-15',
    estimated_project_start: '2026-07-01',
    project_type: 'R',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0101-JD',
    created_by: 'John Doe',
    created_at: '2026-03-10T09:00:00.000Z',

    site_location: { street: '400 Medical Pkwy', city: 'Columbus', state: 'OH', zip_code: '43215', country: 'United States', region: 'Midwest' },
    contract_details: { contract_type: 'GMP', end_sector: 'Healthcare', square_footage: '185000', construction_type: 'Renovation', prime_or_sub: 'Prime' },
    contacts: [{ id: 'c1', name: 'Dr. Alan Reed', contact_role: 'Client', company_name: 'Metro Health', email: 'areed@metrohealth.org' }],
    estimation_number: 'EST-2026-0044',
    bid_details: {
      total_bid_cost: '4250000.00',
      project_end_date: '2027-03-15',
      cost_of_work: '3400000.00',
      gross_margin_percent: '20.00',
      total_price: '4250000.00',
      cost_breakdown: { labor_cost: '1800000.00', labor_hours: '22500', material_cost: '1500000.00', equipment_cost: '350000.00', subcontract_cost: '450000.00', other_cost: '150000.00' },
      estimators: ['Mike Johnson (EST-01)', 'Sarah Williams (EST-01)'],
      trades: [
        { id: 't1', name: 'HVAC', hours: '12000', cost: '960000.00' },
        { id: 't2', name: 'PIPING', hours: '5500', cost: '440000.00' },
        { id: 't3', name: 'SHEETML', hours: '3000', cost: '240000.00' },
        { id: 't4', name: 'ELEC', hours: '2000', cost: '160000.00' },
      ],
      year_burns: [
        { id: 'yb1', year: 1, percentage: '70' },
        { id: 'yb2', year: 2, percentage: '30' },
      ],
    },
    budget_revisions: [
      { id: 'rev-seed-1-1', revision_number: 1, date: '2026-03-18T10:00:00.000Z', cost_of_work: '3200000.00', gross_margin_percent: '18.00', total_price: '3902439.02' },
      { id: 'rev-seed-1-2', revision_number: 2, date: '2026-04-05T13:45:00.000Z', cost_of_work: '3400000.00', gross_margin_percent: '20.00', total_price: '4250000.00' },
    ],
    notes: [],
    clients: [{ id: 'cl1', name: 'Metro Health Systems' }],
  },
  {
    id: 'seed-002',

    project_name: 'Lakeview School District — New Natatorium',
    description: 'Ground-up indoor pool facility with plumbing, mechanical, and fire protection scope.',
    division: '02',
    project_stage: 'Budget',
    probability_percent: 50,
    bid_date: '2026-06-20',
    estimated_project_start: '2026-09-01',
    project_type: 'N',
    nda: 'Yes',
    data_source: 'Axiom',
    potential_project_number: '26-0201-JD',
    created_by: 'John Doe',
    created_at: '2026-03-22T14:30:00.000Z',

    site_location: { street: '1200 Lakeshore Dr', city: 'Cleveland', state: 'OH', zip_code: '44114', country: 'United States', region: 'Northeast' },
    contract_details: { contract_type: 'Lump Sum', end_sector: 'Education', square_footage: '42000', construction_type: 'New', prime_or_sub: 'Sub' },
    contacts: [
      { id: 'c2', name: 'Maria Torres', contact_role: 'Client', company_name: 'Lakeview ISD', email: 'mtorres@lakeviewisd.edu' },
      { id: 'c3', name: 'Jeff Conlin', contact_role: 'Architect', company_name: 'Conlin Architects', email: 'jconlin@conlinarch.com' },
    ],
    estimation_number: 'EST-2026-0051',
    bid_details: { total_bid_cost: '2100000.00' },
    notes: [{ id: 'n1', author: 'John Doe', body: 'Waiting on updated mechanical drawings from the architect.', created_at: '2026-03-25T10:15:00.000Z' }],
    clients: [{ id: 'cl2', name: 'Lakeview ISD' }],
  },
  {
    id: 'seed-003',

    project_name: 'Apex Manufacturing — Boiler Plant Expansion',
    description: 'Expand existing boiler plant with two additional units, piping tie-ins, and controls upgrade.',
    division: '03',
    project_stage: 'Award',
    probability_percent: 95,
    bid_date: '2026-02-28',
    estimated_project_start: '2026-04-15',
    project_type: 'N',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0301-JD',
    created_by: 'John Doe',
    created_at: '2026-01-15T08:45:00.000Z',

    site_location: { street: '8900 Industrial Blvd', city: 'Akron', state: 'OH', zip_code: '44301', country: 'United States', region: 'Northeast' },
    contract_details: { contract_type: 'Cost Plus', end_sector: 'Industrial', square_footage: '15000', construction_type: 'Addition', prime_or_sub: 'Prime' },
    contacts: [{ id: 'c4', name: 'Bill Hargrove', contact_role: 'Client', company_name: 'Apex Manufacturing', email: 'bhargrove@apexmfg.com' }],
    estimation_number: 'EST-2026-0029',
    bid_details: {
      total_bid_cost: '6800000.00',
      project_end_date: '2027-06-30',
      cost_breakdown: { labor_cost: '2900000.00', labor_hours: '36250', material_cost: '2400000.00', equipment_cost: '700000.00', subcontract_cost: '500000.00', other_cost: '300000.00' },
      estimators: ['Tom Brown (EST-02)', 'Lisa Davis (EST-02)'],
      trades: [
        { id: 't5', name: 'PIPING', hours: '18000', cost: '1440000.00' },
        { id: 't6', name: 'ELEC', hours: '6000', cost: '480000.00' },
        { id: 't7', name: 'IRONWRK', hours: '4000', cost: '320000.00' },
        { id: 't8', name: 'PIPESHOP', hours: '5000', cost: '400000.00' },
        { id: 't9', name: 'MILLWRIGHT', hours: '3250', cost: '260000.00' },
      ],
      year_burns: [
        { id: 'yb3', year: 1, percentage: '40' },
        { id: 'yb4', year: 2, percentage: '45' },
        { id: 'yb5', year: 3, percentage: '15' },
      ],
    },
    award_details: { awarded_date: '2026-03-10', awarded_amount: '6800000.00', awarded_cost: '5780000.00', awarded_margin_percent: '15', project_manager: 'Robert Taylor', superintendent: 'James Wilson' },
    notes: [],
    clients: [{ id: 'cl3', name: 'Apex Manufacturing Inc.' }],
    awarded_client_id: 'cl3',
  },
  {
    id: 'seed-004',

    project_name: 'Riverfront Mixed-Use — Plumbing Package',
    description: 'Plumbing scope for a 12-story mixed-use development on the riverfront. Residential floors 3-12, retail/commercial 1-2.',
    division: '01',
    project_stage: 'Lead',
    probability_percent: 30,
    bid_date: '2026-08-01',
    estimated_project_start: '2027-01-15',
    project_type: 'N',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0102-JD',
    created_by: 'John Doe',
    created_at: '2026-04-02T11:20:00.000Z',

    site_location: { street: '55 River Rd', city: 'Cincinnati', state: 'OH', zip_code: '45202', country: 'United States', region: 'Southwest' },
    contacts: [{ id: 'c5', name: 'Karen Walsh', contact_role: 'Client', company_name: 'Riverfront Dev LLC', email: 'kwalsh@riverfrontdev.com' }],
    notes: [],
    clients: [],
  },
  {
    id: 'seed-005',

    project_name: 'St. Paul Federal Courthouse — Fire Protection Upgrade',
    description: 'Fire protection system modernization across all 4 wings of the federal courthouse complex.',
    division: '04',
    project_stage: 'Bid',
    probability_percent: 60,
    bid_date: '2026-05-30',
    estimated_project_start: '2026-08-15',
    project_type: 'R',
    nda: 'Yes',
    data_source: 'Axiom',
    potential_project_number: '26-0401-JD',
    created_by: 'John Doe',
    created_at: '2026-02-18T16:00:00.000Z',

    site_location: { street: '316 N Robert St', city: 'St. Paul', state: 'MN', zip_code: '55101', country: 'United States', region: 'Midwest' },
    contract_details: { contract_type: 'Lump Sum', end_sector: 'Government', square_footage: '290000', construction_type: 'Renovation', prime_or_sub: 'Sub', sales_tax_exempt: 'Yes' },
    contacts: [
      { id: 'c6', name: 'Thomas Nguyen', contact_role: 'Client', company_name: 'GSA Region 5', email: 'tnguyen@gsa.gov' },
      { id: 'c7', name: 'Patricia Holmes', contact_role: 'Engineer', company_name: 'Holmes Fire Engineering', email: 'pholmes@holmesfe.com' },
    ],
    estimation_number: 'EST-2026-0038',
    bid_details: {
      total_bid_cost: '3150000.00',
      project_end_date: '2027-04-30',
      cost_breakdown: { labor_cost: '1350000.00', labor_hours: '16875', material_cost: '1100000.00', equipment_cost: '250000.00', subcontract_cost: '300000.00', other_cost: '150000.00' },
      estimators: ['James Wilson (EST-03)'],
      trades: [
        { id: 't10', name: 'FIREPRO', hours: '10000', cost: '800000.00' },
        { id: 't11', name: 'PIPING', hours: '4000', cost: '320000.00' },
        { id: 't12', name: 'ELEC', hours: '2875', cost: '230000.00' },
      ],
      year_burns: [
        { id: 'yb6', year: 1, percentage: '60' },
        { id: 'yb7', year: 2, percentage: '40' },
      ],
      certified_payroll: 'Yes',
      prevailing_wage_scale: 'Yes',
    },
    notes: [{ id: 'n2', author: 'John Doe', body: '@James Wilson — prevailing wage confirmed, updated bid numbers accordingly.', created_at: '2026-03-01T09:30:00.000Z' }],
    clients: [{ id: 'cl4', name: 'GSA Region 5' }, { id: 'cl5', name: 'US Courts' }],
  },
  // --- Bid Tracer projects (read-only) ---
  {
    id: 'seed-bt-001',

    project_name: 'Grandview Towers — Chiller Replacement',
    description: 'Replace two 500-ton centrifugal chillers and associated piping at Grandview Towers office complex.',
    division: '01',
    project_stage: 'Bid',
    probability_percent: 65,
    bid_date: '2026-05-01',
    estimated_project_start: '2026-06-15',
    project_type: 'R',
    nda: 'No',
    data_source: 'Bid Tracer',
    potential_project_number: 'BT-2026-0112',
    created_by: 'John Doe',
    created_at: '2026-02-20T08:00:00.000Z',

    site_location: { street: '1500 Grandview Ave', city: 'Columbus', state: 'OH', zip_code: '43212', country: 'United States', region: 'Midwest' },
    contract_details: { contract_type: 'Lump Sum', end_sector: 'Commercial', square_footage: '320000', construction_type: 'Renovation', prime_or_sub: 'Sub' },
    contacts: [{ id: 'c-bt1', name: 'Steve Morton', contact_role: 'Client', company_name: 'Grandview Properties', email: 'smorton@grandviewprop.com' }],
    estimation_number: 'BT-EST-0112',
    bid_details: {
      total_bid_cost: '1850000.00',
      project_end_date: '2026-12-20',
      cost_breakdown: { labor_cost: '780000.00', labor_hours: '9750', material_cost: '720000.00', equipment_cost: '180000.00', subcontract_cost: '100000.00', other_cost: '70000.00' },
      estimators: ['Mike Johnson (EST-01)'],
      trades: [
        { id: 'bt-t1', name: 'HVAC', hours: '5200', cost: '416000.00' },
        { id: 'bt-t2', name: 'PIPING', hours: '3000', cost: '240000.00' },
        { id: 'bt-t3', name: 'ELEC', hours: '1550', cost: '124000.00' },
      ],
    },
    notes: [],
    clients: [{ id: 'bt-cl1', name: 'Grandview Properties LLC' }],
  },
  {
    id: 'seed-bt-002',

    project_name: 'Mercy Hospital — Medical Gas System',
    description: 'New medical gas distribution system for the Mercy Hospital south wing expansion.',
    division: '02',
    project_stage: 'Award',
    probability_percent: 100,
    bid_date: '2026-01-15',
    estimated_project_start: '2026-03-01',
    project_type: 'N',
    nda: 'Yes',
    data_source: 'Bid Tracer',
    potential_project_number: 'BT-2026-0098',
    created_by: 'John Doe',
    created_at: '2025-12-10T09:30:00.000Z',

    site_location: { street: '2200 Mercy Dr', city: 'Toledo', state: 'OH', zip_code: '43604', country: 'United States', region: 'Northwest' },
    contract_details: { contract_type: 'GMP', end_sector: 'Healthcare', square_footage: '48000', construction_type: 'Addition', prime_or_sub: 'Prime' },
    contacts: [
      { id: 'c-bt2', name: 'Dr. Linda Park', contact_role: 'Client', company_name: 'Mercy Health System', email: 'lpark@mercyhealth.org' },
      { id: 'c-bt3', name: 'Ryan Schultz', contact_role: 'Engineer', company_name: 'Schultz MEP', email: 'rschultz@schultzmep.com' },
    ],
    estimation_number: 'BT-EST-0098',
    bid_details: {
      total_bid_cost: '980000.00',
      project_end_date: '2026-09-30',
      cost_breakdown: { labor_cost: '420000.00', labor_hours: '5250', material_cost: '380000.00', equipment_cost: '85000.00', subcontract_cost: '60000.00', other_cost: '35000.00' },
      estimators: ['Sarah Williams (EST-01)'],
      trades: [
        { id: 'bt-t4', name: 'PIPING', hours: '2800', cost: '224000.00' },
        { id: 'bt-t5', name: 'PLUMBING', hours: '1500', cost: '120000.00' },
        { id: 'bt-t6', name: 'ELEC', hours: '950', cost: '76000.00' },
      ],
    },
    award_details: { awarded_date: '2026-02-01', awarded_amount: '980000.00', awarded_cost: '833000.00', awarded_margin_percent: '15', project_manager: 'Emily Chen', superintendent: 'Robert Taylor' },
    notes: [],
    clients: [{ id: 'bt-cl2', name: 'Mercy Health System' }],
    awarded_client_id: 'bt-cl2',
  },
  {
    id: 'seed-mas-hvac-test',

    // Merge-companies test fixture: this project already has BOTH duplicate
    // company names on it — one as a client_slot/contact pair, the other as a
    // second client_slot/contact pair that also happens to be the awarded client.
    // Merging "MAS HVAC, LLC" into "MAS HVAC" should collapse the two client slots
    // into one, remap award_details.awarded_client_id onto the surviving slot, and
    // drop the duplicate Tom Larson contact (same email on both).
    project_name: 'Maple Grove Distribution Center — HVAC Retrofit',
    description: 'Full HVAC retrofit for the Maple Grove distribution facility, replacing rooftop units and controls.',
    division: '02',
    project_stage: 'Award',
    probability_percent: 100,
    bid_date: '2026-05-01',
    estimated_project_start: '2026-07-01',
    project_type: 'R',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0205-JD',
    created_by: 'John Doe',
    created_at: '2026-04-10T09:00:00.000Z',

    site_location: { street: '8400 Zachary Lane', city: 'Maple Grove', state: 'MN', zip_code: '55369', country: 'United States', region: 'Midwest' },
    contract_details: { contract_type: 'Lump Sum', end_sector: 'Industrial', square_footage: '42000', construction_type: 'Renovation', prime_or_sub: 'Prime' },
    contacts: [
      { id: 'pc-mas-1', source_contact_id: 'c-mas1', name: 'Tom Larson', contact_role: 'Client', company_name: 'MAS HVAC', company_city: 'Maple Grove', company_state: 'MN', email: 'tlarson@mashvac.com', phone: '(763) 555-0110', slot_id: 'slot-mas-1', is_primary: true },
      { id: 'pc-mas-2', source_contact_id: 'c-mas3', name: 'Tom Larson', contact_role: 'Client', company_name: 'MAS HVAC, LLC', company_city: 'Maple Grove', company_state: 'MN', email: 'tlarson@mashvac.com', phone: '(763) 555-0110', slot_id: 'slot-mas-2' },
    ],
    client_slots: [
      { id: 'slot-mas-1', company_name: 'MAS HVAC', client_type: 'Owner' },
      { id: 'slot-mas-2', company_name: 'MAS HVAC, LLC', client_type: 'Owner' },
    ],
    owner_slot: { company_name: 'MAS HVAC' },
    competitor_slots: [],
    additional_companies: [],
    estimation_number: 'EST-2026-0071',
    bid_details: { total_bid_cost: '540000.00' },
    award_details: {
      awarded_date: '2026-04-01', awarded_amount: '540000.00', awarded_cost: '452000.00', awarded_margin_percent: '16.3',
      project_manager: 'Angela Brooks', superintendent: 'Marcus Hale', awarded_client_id: 'slot-mas-2',
    },
    notes: [],
    clients: [],
  },
  {
    id: 'seed-mas-hvac-test-2',

    // Legacy schema on purpose — no client_slots/owner_slot at all, just a plain
    // contacts[] entry, the way any project looks before it's been opened once in
    // the detail view. Merge should still rename this contact's company_name with
    // no dedup needed (Denise Foss is unique).
    project_name: 'Maple Grove Cold Storage — Preliminary Assessment',
    description: 'Early-stage assessment for a cold storage addition adjacent to the existing distribution center.',
    division: '02',
    project_stage: 'Lead',
    probability_percent: 25,
    bid_date: '2026-09-01',
    estimated_project_start: '2027-01-01',
    project_type: 'N',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0206-JD',
    created_by: 'John Doe',
    created_at: '2026-04-11T09:00:00.000Z',

    site_location: { street: '8420 Zachary Lane', city: 'Maple Grove', state: 'MN', zip_code: '55369', country: 'United States', region: 'Midwest' },
    contacts: [
      { id: 'pc-mas-3', source_contact_id: 'c-mas2', name: 'Denise Foss', contact_role: 'Client', company_name: 'MAS HVAC, LLC', company_city: 'Maple Grove', company_state: 'MN', email: 'dfoss@mashvacllc.com' },
    ],
    notes: [],
    clients: [],
  },
  {
    id: 'seed-mas-hvac-test-3',

    // MAS Heating & Cooling (the contact-only "company") shows up here as the
    // Owner, via owner_slot — a different repoint path than client_slots. The
    // Client on this one is a different, unrelated company so the merge only
    // needs to touch the owner side.
    project_name: 'Northwind Business Park — Rooftop Unit Replacement',
    description: 'Replace six rooftop HVAC units across three buildings in the Northwind Business Park.',
    division: '02',
    project_stage: 'Bid',
    probability_percent: 55,
    bid_date: '2026-06-15',
    estimated_project_start: '2026-09-01',
    project_type: 'R',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0207-JD',
    created_by: 'John Doe',
    created_at: '2026-04-12T09:00:00.000Z',

    site_location: { street: '14200 County Road 30', city: 'Plymouth', state: 'MN', zip_code: '55447', country: 'United States', region: 'Midwest' },
    contract_details: { contract_type: 'Lump Sum', end_sector: 'Commercial', square_footage: '68000', construction_type: 'Renovation', prime_or_sub: 'Prime' },
    contacts: [
      { id: 'pc-nw-1', source_contact_id: 'c-bt1', name: 'Steve Morton', contact_role: 'Client', company_name: 'Grandview Properties', slot_id: 'slot-nw-1' },
      { id: 'pc-nw-2', source_contact_id: 'c-mas4', name: 'Priya Anand', contact_role: 'Owner', company_name: 'MAS Heating & Cooling', slot_id: 'owner' },
    ],
    client_slots: [{ id: 'slot-nw-1', company_name: 'Grandview Properties', client_type: '' }],
    owner_slot: { company_name: 'MAS Heating & Cooling' },
    competitor_slots: [],
    additional_companies: [],
    estimation_number: 'EST-2026-0072',
    bid_details: { total_bid_cost: '310000.00' },
    notes: [],
    clients: [],
  },
  {
    id: 'seed-mas-hvac-test-4',

    // MAS HVAC and MAS HVAC, LLC both show up as Competitor slots here (bidding
    // against ACI on this one, not a client) — exercises competitor_slots
    // rename + dedupe, the one slot array the other test projects don't touch.
    project_name: 'Elm Ridge Medical Office — Bid Package',
    description: 'MEP bid package for a new 3-story medical office building.',
    division: '01',
    project_stage: 'Bid',
    probability_percent: 40,
    bid_date: '2026-07-10',
    estimated_project_start: '2026-10-01',
    project_type: 'N',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0108-JD',
    created_by: 'John Doe',
    created_at: '2026-04-13T09:00:00.000Z',

    site_location: { street: '900 Elm Ridge Pkwy', city: 'Cincinnati', state: 'OH', zip_code: '45202', country: 'United States', region: 'Southwest' },
    contacts: [
      { id: 'pc-elm-1', source_contact_id: 'c5', name: 'Karen Walsh', contact_role: 'Client', company_name: 'Riverfront Dev LLC', slot_id: 'slot-elm-1' },
      { id: 'pc-elm-2', source_contact_id: 'c-mas1', name: 'Tom Larson', contact_role: 'Competitor', company_name: 'MAS HVAC', slot_id: 'comp-elm-1' },
      { id: 'pc-elm-3', source_contact_id: 'c-mas3', name: 'Tom Larson', contact_role: 'Competitor', company_name: 'MAS HVAC, LLC', slot_id: 'comp-elm-2' },
    ],
    client_slots: [{ id: 'slot-elm-1', company_name: 'Riverfront Dev LLC', client_type: '' }],
    owner_slot: { company_name: '' },
    competitor_slots: [
      { id: 'comp-elm-1', company_name: 'MAS HVAC' },
      { id: 'comp-elm-2', company_name: 'MAS HVAC, LLC' },
    ],
    additional_companies: [],
    notes: [],
    clients: [],
  },
  {
    id: 'seed-mas-hvac-test-5',

    // A project that only ever referenced MAS HVAC (the merge destination) —
    // a control case. It shouldn't change at all when the other two companies
    // are merged in, other than continuing to count toward MAS HVAC's total.
    project_name: 'MAS HVAC Corporate Office — Interior Fit-Out',
    description: 'Interior build-out for the MAS HVAC corporate office suite.',
    division: '02',
    project_stage: 'Preliminary',
    probability_percent: 10,
    bid_date: '2026-10-01',
    estimated_project_start: '2027-02-01',
    project_type: 'N',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0209-JD',
    created_by: 'John Doe',
    created_at: '2026-04-14T09:00:00.000Z',

    contacts: [
      { id: 'pc-mas-6', source_contact_id: 'c-mas1', name: 'Tom Larson', contact_role: 'Client', company_name: 'MAS HVAC', company_city: 'Maple Grove', company_state: 'MN', email: 'tlarson@mashvac.com' },
    ],
    notes: [],
    clients: [],
  },
  {
    id: 'seed-abilene-test-1',

    project_name: 'North Chesterfield Distribution Yard — Paving',
    description: 'Truck yard paving and drainage work, tracked under the "Inc" (no period) name variant.',
    division: '02',
    project_stage: 'Bid',
    probability_percent: 60,
    bid_date: '2026-05-15',
    estimated_project_start: '2026-08-01',
    project_type: 'N',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0215-JD',
    created_by: 'John Doe',
    created_at: '2026-01-28T09:00:00.000Z',

    contacts: [
      { id: 'pc-abl-1', source_contact_id: 'c-abilene1', name: 'Frank Mercer', contact_role: 'Client', company_name: 'Abilene Motor Express, Inc', slot_id: 'slot-abl-1' },
    ],
    client_slots: [{ id: 'slot-abl-1', company_name: 'Abilene Motor Express, Inc', client_type: '' }],
    notes: [],
    clients: [],
  },
  {
    id: 'seed-abilene-test-2',

    project_name: 'Richmond Terminal — Dock Door Replacement',
    description: 'Replace 12 dock doors and levelers, tracked under the "Inc." (with period) name variant.',
    division: '02',
    project_stage: 'Lead',
    probability_percent: 30,
    bid_date: '2026-09-01',
    estimated_project_start: '2026-11-15',
    project_type: 'R',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0216-JD',
    created_by: 'John Doe',
    created_at: '2026-01-29T09:00:00.000Z',

    contacts: [
      { id: 'pc-abl-2', source_contact_id: 'c-abilene3', name: 'Donna Pruitt', contact_role: 'Client', company_name: 'Abilene Motor Express, Inc.', slot_id: 'slot-abl-2' },
    ],
    client_slots: [{ id: 'slot-abl-2', company_name: 'Abilene Motor Express, Inc.', client_type: '' }],
    notes: [],
    clients: [],
  },
  {
    id: 'seed-abilene-test-3',

    // Both name variants as separate client slots, and the same contact
    // (Frank Mercer, same email) added twice under each — exercises slot
    // dedup, contact dedup, and the awarded_client_id remap all at once.
    project_name: 'Chesterfield County Cross-Dock Facility',
    description: 'New cross-dock facility; entered under both company name variants at different points.',
    division: '02',
    project_stage: 'Award',
    probability_percent: 100,
    bid_date: '2025-12-01',
    estimated_project_start: '2026-02-15',
    project_type: 'N',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '25-0217-JD',
    created_by: 'John Doe',
    created_at: '2025-12-05T09:00:00.000Z',

    contacts: [
      { id: 'pc-abl-3', source_contact_id: 'c-abilene1', name: 'Frank Mercer', contact_role: 'Client', company_name: 'Abilene Motor Express, Inc', slot_id: 'slot-abl-3' },
      { id: 'pc-abl-4', source_contact_id: 'c-abilene2', name: 'Frank Mercer', contact_role: 'Client', company_name: 'Abilene Motor Express, Inc.', slot_id: 'slot-abl-4' },
    ],
    client_slots: [
      { id: 'slot-abl-3', company_name: 'Abilene Motor Express, Inc', client_type: '' },
      { id: 'slot-abl-4', company_name: 'Abilene Motor Express, Inc.', client_type: '' },
    ],
    award_details: {
      awarded_date: '2026-01-20', awarded_amount: '890000.00', awarded_cost: '745000.00', awarded_margin_percent: '16.3',
      project_manager: 'Diane Ross', superintendent: 'Kevin Marsh', awarded_client_id: 'slot-abl-4',
    },
    notes: [],
    clients: [],
  },
  {
    id: 'seed-ruritan-test-1',

    project_name: 'Abingdon Ruritan Club — Pavilion Roof Replacement',
    description: 'Replace the roof on the community pavilion, tracked under the misspelled club name.',
    division: '04',
    project_stage: 'Preliminary',
    probability_percent: 20,
    bid_date: '2026-06-01',
    estimated_project_start: '2026-08-15',
    project_type: 'R',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0418-JD',
    created_by: 'John Doe',
    created_at: '2026-01-30T09:00:00.000Z',

    contacts: [
      { id: 'pc-rur-1', source_contact_id: 'c-ruritan1', name: 'Betty Sue Combs', contact_role: 'Client', company_name: 'Abingdon Ruritan Club', slot_id: 'slot-rur-1' },
    ],
    client_slots: [{ id: 'slot-rur-1', company_name: 'Abingdon Ruritan Club', client_type: '' }],
    notes: [],
    clients: [],
  },
  {
    id: 'seed-ruritan-test-2',

    project_name: 'Bena Community Center — HVAC Replacement',
    description: 'Replace aging rooftop units at the community center, tracked under the correctly-spelled club name.',
    division: '04',
    project_stage: 'Lead',
    probability_percent: 35,
    bid_date: '2026-07-01',
    estimated_project_start: '2026-09-15',
    project_type: 'R',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0419-JD',
    created_by: 'John Doe',
    created_at: '2026-01-31T09:00:00.000Z',

    contacts: [
      { id: 'pc-rur-2', source_contact_id: 'c-ruritan2', name: 'Betty Sue Combs', contact_role: 'Client', company_name: 'Abington Ruritan Club', slot_id: 'slot-rur-2' },
    ],
    client_slots: [{ id: 'slot-rur-2', company_name: 'Abington Ruritan Club', client_type: '' }],
    notes: [],
    clients: [],
  },
  {
    id: 'seed-english-test-1',

    // Tracked only under the full legal name — a plain contact string with no
    // source_contact_id (never added through the CRM selector), which is why
    // "English Construction Company, Inc." shows projects but 0 CRM contacts.
    project_name: 'Lynchburg General Hospital — Site Utilities',
    description: 'Site utility work for a hospital expansion, tracked under the full legal company name.',
    division: '01',
    project_stage: 'Award',
    probability_percent: 100,
    bid_date: '2025-11-01',
    estimated_project_start: '2026-01-15',
    project_type: 'N',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '25-0110-JD',
    created_by: 'John Doe',
    created_at: '2025-11-05T09:00:00.000Z',

    contacts: [
      { id: 'pc-eng-1', name: 'Field Office', contact_role: 'Client', company_name: 'English Construction Company, Inc.', slot_id: 'slot-eng-1' },
    ],
    client_slots: [{ id: 'slot-eng-1', company_name: 'English Construction Company, Inc.', client_type: '' }],
    notes: [],
    clients: [],
  },
  {
    id: 'seed-english-test-2',

    // Tracked under the shorthand name, with a real CRM-linked contact.
    project_name: 'Amherst County School Renovation',
    description: 'Renovation package tracked under the shorthand company name used more recently in the CRM.',
    division: '01',
    project_stage: 'Bid',
    probability_percent: 50,
    bid_date: '2026-06-01',
    estimated_project_start: '2026-09-01',
    project_type: 'R',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0111-JD',
    created_by: 'John Doe',
    created_at: '2026-01-30T09:00:00.000Z',

    contacts: [
      { id: 'pc-eng-2', source_contact_id: 'c-english1', name: 'Walter Ingram', contact_role: 'Client', company_name: 'English', slot_id: 'slot-eng-2' },
    ],
    client_slots: [{ id: 'slot-eng-2', company_name: 'English', client_type: '' }],
    notes: [],
    clients: [],
  },
  {
    id: 'seed-english-test-3',

    // Double-booked under both name variants as separate client slots — the
    // awarded client points at the "English" slot, which gets merged away.
    project_name: 'Bedford Water Treatment Facility — Upgrade',
    description: 'Water treatment upgrade where the same contractor got entered under both company name variants.',
    division: '03',
    project_stage: 'Award',
    probability_percent: 100,
    bid_date: '2026-02-01',
    estimated_project_start: '2026-04-01',
    project_type: 'R',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0312-JD',
    created_by: 'John Doe',
    created_at: '2026-02-05T09:00:00.000Z',

    contacts: [
      { id: 'pc-eng-3', name: 'Field Office', contact_role: 'Client', company_name: 'English Construction Company, Inc.', slot_id: 'slot-eng-3' },
      { id: 'pc-eng-4', source_contact_id: 'c-english1', name: 'Walter Ingram', contact_role: 'Client', company_name: 'English', slot_id: 'slot-eng-4' },
    ],
    client_slots: [
      { id: 'slot-eng-3', company_name: 'English Construction Company, Inc.', client_type: '' },
      { id: 'slot-eng-4', company_name: 'English', client_type: '' },
    ],
    award_details: {
      awarded_date: '2026-03-01', awarded_amount: '410000.00', awarded_cost: '340000.00', awarded_margin_percent: '17',
      project_manager: 'Nina Ford', superintendent: 'Owen Blake', awarded_client_id: 'slot-eng-4',
    },
    notes: [],
    clients: [],
  },
  {
    id: 'seed-mondelez-test-1',

    // Both company-name variants sit on this job as separate client slots, so
    // both rows count it — mirrors "same project count on both duplicates."
    project_name: 'East Hanover Distribution Hub — Racking Install',
    description: 'Warehouse racking install; both the international parent and the US operating entity are listed as client slots on this one.',
    division: '02',
    project_stage: 'Award',
    probability_percent: 100,
    bid_date: '2026-01-10',
    estimated_project_start: '2026-03-01',
    project_type: 'N',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0213-JD',
    created_by: 'John Doe',
    created_at: '2026-01-15T09:00:00.000Z',

    contacts: [
      { id: 'pc-mdz-1', source_contact_id: 'c-mondelez1', name: 'Sandra Kessler', contact_role: 'Client', company_name: 'Mondelez International Inc.', slot_id: 'slot-mdz-1' },
    ],
    client_slots: [
      { id: 'slot-mdz-1', company_name: 'Mondelez International Inc.', client_type: '' },
      { id: 'slot-mdz-2', company_name: 'Mondelez Global LLC', client_type: '' },
    ],
    award_details: {
      awarded_date: '2026-02-10', awarded_amount: '265000.00', awarded_cost: '221000.00', awarded_margin_percent: '16.6',
      project_manager: 'Chris Boyd', superintendent: 'Alan Reyes', awarded_client_id: 'slot-mdz-2',
    },
    notes: [],
    clients: [],
  },
  {
    id: 'seed-mondelez-test-2',

    // Second shared job — same double-booked pattern, still in Bid so no award
    // remap on this one, just plain client_slots dedup.
    project_name: 'East Hanover Plant — Ammonia Refrigeration Retrofit',
    description: 'Refrigeration system retrofit, also double-booked under both company name variants.',
    division: '02',
    project_stage: 'Bid',
    probability_percent: 45,
    bid_date: '2026-08-01',
    estimated_project_start: '2026-11-01',
    project_type: 'R',
    nda: 'No',
    data_source: 'Axiom',
    potential_project_number: '26-0214-JD',
    created_by: 'John Doe',
    created_at: '2026-02-20T09:00:00.000Z',

    contacts: [
      { id: 'pc-mdz-2', source_contact_id: 'c-mondelez1', name: 'Sandra Kessler', contact_role: 'Client', company_name: 'Mondelez International Inc.', slot_id: 'slot-mdz-3' },
    ],
    client_slots: [
      { id: 'slot-mdz-3', company_name: 'Mondelez International Inc.', client_type: '' },
      { id: 'slot-mdz-4', company_name: 'Mondelez Global LLC', client_type: '' },
    ],
    notes: [],
    clients: [],
  },
];

function loadProjects() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('potential_projects');
    const existing = stored ? JSON.parse(stored) : [];
    // Merge: add missing seeds, replace stale seeds with fresh data
    const seedIds = new Set(SEED_PROJECTS.map((s) => s.id));
    const userProjects = existing.filter((p) => !seedIds.has(p.id));
    return [...userProjects, ...SEED_PROJECTS];
  } catch {
    return [...SEED_PROJECTS];
  }
}

function saveProjects(projects) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('potential_projects', JSON.stringify(projects));
}

// --- Master Companies (Section 8) ---
function loadCompanies() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('master_companies');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCompanies(companies) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('master_companies', JSON.stringify(companies));
}

// --- Master Competitors (Section 9) ---
function loadCompetitors() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('master_competitors');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCompetitors(competitors) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('master_competitors', JSON.stringify(competitors));
}

// --- Client Companies (CRM) ---
const SEED_CLIENT_COMPANIES = [
  {
    id: 'co-apex',
    company_name: 'Apex Manufacturing',
    company_city: 'Akron',
    company_state: 'OH',
    company_group: ['ACI', 'API'],
    company_type: ['Client', 'Owner'],
    addresses: [
      { id: 'apex-addr-main', type: 'Main', street: '4820 Bridgeport Drive', city: 'Akron', state: 'OH', zip: '44311', country: 'US' },
      { id: 'apex-addr-billing', type: 'Billing', street: '4820 Bridgeport Drive', city: 'Akron', state: 'OH', zip: '44311', country: 'US' },
      { id: 'apex-addr-mailing', type: 'Mailing', street: 'PO Box 2290', city: 'Akron', state: 'OH', zip: '44309', country: 'US' },
      { id: 'apex-addr-shipping', type: 'Shipping', street: '150 Industrial Parkway', city: 'Akron', state: 'OH', zip: '44312', country: 'US' },
      { id: 'apex-addr-warehouse', type: 'Warehouse', street: '2210 Manufacturing Row', city: 'Canton', state: 'OH', zip: '44705', country: 'US' },
    ],
    vendor_enrollment: null,
    created_at: '2026-01-10T08:00:00.000Z',
  },
  // --- Duplicate-company test data for the Merge Companies feature ---
  // Same real-world vendor entered three different ways: a clean record, a
  // near-duplicate with an overlapping Main address plus one unique address, and a
  // contact-only "company" with no clientCompanies record at all. Open MAS HVAC's
  // detail page and use Merge Companies to fold the other two into it.
  {
    id: 'co-mashvac',
    company_name: 'MAS HVAC',
    company_city: 'Maple Grove',
    company_state: 'MN',
    company_group: ['ACI'],
    company_type: ['Client'],
    addresses: [
      { id: 'mas-addr-main', type: 'Main', street: '8400 Zachary Lane', city: 'Maple Grove', state: 'MN', zip: '55369', country: 'US' },
    ],
    vendor_enrollment: null,
    created_at: '2026-01-05T08:00:00.000Z',
  },
  {
    id: 'co-mashvacllc',
    company_name: 'MAS HVAC, LLC',
    company_city: 'Maple Grove',
    company_state: 'MN',
    company_group: ['API'],
    company_type: ['Owner'],
    addresses: [
      { id: 'mashvacllc-addr-main', type: 'Main', street: '8400 Zachary Lane', city: 'Maple Grove', state: 'MN', zip: '55369', country: 'US' },
      { id: 'mashvacllc-addr-shipping', type: 'Shipping', street: '1200 Weston Lane N', city: 'Maple Grove', state: 'MN', zip: '55369', country: 'US' },
    ],
    vendor_enrollment: 'pending',
    created_at: '2026-02-01T08:00:00.000Z',
  },
  // --- More duplicate-company patterns (punctuation-only, misspelling, blank
  // city/state, legal-suffix variants) — same idea as the MAS HVAC set above,
  // pulled from real-world dedup examples. No contacts/projects on these two
  // pairs on purpose (Section 18: an empty-vs-empty merge is its own edge case).
  {
    id: 'co-abilene-1', company_name: 'Abilene Motor Express, Inc', company_city: 'North Chesterfield', company_state: 'VA',
    company_group: ['ACI'], company_type: ['Client'],
    addresses: [{ id: 'abilene1-addr-main', type: 'Main', street: '4100 Cogbill Rd', city: 'North Chesterfield', state: 'VA', zip: '23234', country: 'US' }],
    vendor_enrollment: null, created_at: '2026-01-20T08:00:00.000Z',
  },
  {
    id: 'co-abilene-2', company_name: 'Abilene Motor Express, Inc.', company_city: 'Richmond', company_state: 'VA',
    company_group: ['ACI'], company_type: ['Client'],
    addresses: [{ id: 'abilene2-addr-main', type: 'Main', street: '2901 Hermitage Rd', city: 'Richmond', state: 'VA', zip: '23220', country: 'US' }],
    vendor_enrollment: null, created_at: '2026-01-21T08:00:00.000Z',
  },
  {
    id: 'co-ruritan-1', company_name: 'Abingdon Ruritan Club', company_city: '', company_state: '',
    company_group: ['ACI'], company_type: ['Client'], addresses: [], vendor_enrollment: null, created_at: '2026-01-22T08:00:00.000Z',
  },
  {
    id: 'co-ruritan-2', company_name: 'Abington Ruritan Club', company_city: 'Bena', company_state: 'VA',
    company_group: ['ACI'], company_type: ['Client'],
    addresses: [{ id: 'ruritan2-addr-main', type: 'Main', street: '7200 Guinea Rd', city: 'Bena', state: 'VA', zip: '23018', country: 'US' }],
    vendor_enrollment: null, created_at: '2026-01-23T08:00:00.000Z',
  },
  // English pair: full legal name has projects but zero CRM contacts (contacts
  // were entered as plain strings on the job, never added through the CRM
  // selector); the shorthand name has 1 contact, is vendor-enrollment pending,
  // and shares one project with the other name via two client slots.
  {
    id: 'co-english-1', company_name: 'English Construction Company, Inc.', company_city: 'Lynchburg', company_state: 'VA',
    company_group: ['ACI'], company_type: ['Client'],
    addresses: [{ id: 'english1-addr-main', type: 'Main', street: '2130 Langhorne Rd', city: 'Lynchburg', state: 'VA', zip: '24501', country: 'US' }],
    vendor_enrollment: null, created_at: '2026-01-24T08:00:00.000Z',
  },
  {
    id: 'co-english-2', company_name: 'English', company_city: '', company_state: '',
    company_group: ['ACI'], company_type: ['Client'], addresses: [], vendor_enrollment: 'pending', created_at: '2026-01-25T08:00:00.000Z',
  },
  // Mondelez pair: legal-suffix variant (International Inc. vs Global LLC) where
  // both names sit on the same jobs as separate client slots, so both rows show
  // the same project count until merged.
  {
    id: 'co-mondelez-1', company_name: 'Mondelez International Inc.', company_city: '', company_state: '',
    company_group: ['ACI'], company_type: ['Client'], addresses: [], vendor_enrollment: 'pending', created_at: '2026-01-26T08:00:00.000Z',
  },
  {
    id: 'co-mondelez-2', company_name: 'Mondelez Global LLC', company_city: 'East Hanover', company_state: 'NJ',
    company_group: ['ACI'], company_type: ['Client'],
    addresses: [{ id: 'mondelez2-addr-main', type: 'Main', street: '905 W Main St', city: 'East Hanover', state: 'NJ', zip: '07936', country: 'US' }],
    vendor_enrollment: null, created_at: '2026-01-27T08:00:00.000Z',
  },
];

function loadClientCompanies() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('master_client_companies');
    const existing = stored ? JSON.parse(stored) : [];
    // Merge: add missing seeds, replace stale seeds with fresh data.
    // Company records are looked up by company_name elsewhere in the app
    // (names are the real identity here), so dedupe on that instead of id —
    // otherwise a pre-existing record with the same name shadows the seed.
    const seedNames = new Set(SEED_CLIENT_COMPANIES.map((s) => s.company_name));
    const userCompanies = existing.filter((c) => !seedNames.has(c.company_name));
    return [...userCompanies, ...SEED_CLIENT_COMPANIES];
  } catch {
    return [...SEED_CLIENT_COMPANIES];
  }
}

function saveClientCompanies(companies) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('master_client_companies', JSON.stringify(companies));
}

// --- Master Client Contacts (CRM) ---
const SEED_CLIENT_CONTACTS = [
  { id: 'c1', name: 'Dr. Alan Reed', contact_role: 'Client', company_name: 'Metro Health', company_city: 'Columbus', company_state: 'OH', email: 'areed@metrohealth.org', phone: '(614) 555-0120', created_at: '2026-03-08T10:00:00.000Z' },
  { id: 'c2', name: 'Maria Torres', contact_role: 'Client', company_name: 'Lakeview ISD', company_city: 'Cleveland', company_state: 'OH', email: 'mtorres@lakeviewisd.edu', phone: '(216) 555-0340', created_at: '2026-03-20T09:00:00.000Z' },
  { id: 'c3', name: 'Jeff Conlin', contact_role: 'Architect', company_name: 'Conlin Architects', company_city: 'Cleveland', company_state: 'OH', email: 'jconlin@conlinarch.com', phone: '(216) 555-0188', created_at: '2026-03-20T09:05:00.000Z' },
  { id: 'c4', name: 'Bill Hargrove', contact_role: 'Client', roles: ['Client', 'Owner'], company_name: 'Apex Manufacturing', company_city: 'Akron', company_state: 'OH', email: 'bhargrove@apexmfg.com', phone: '(330) 555-0275', address_id: 'apex-addr-main', is_primary: true, created_at: '2026-01-12T08:00:00.000Z' },
  { id: 'c4b', name: 'Rachel Kim', contact_role: 'Client', roles: ['Client'], company_name: 'Apex Manufacturing', company_city: 'Akron', company_state: 'OH', email: 'rkim@apexmfg.com', phone: '(330) 555-0298', address_id: 'apex-addr-warehouse', created_at: '2026-01-15T09:30:00.000Z' },
  { id: 'c5', name: 'Karen Walsh', contact_role: 'Client', company_name: 'Riverfront Dev LLC', company_city: 'Cincinnati', company_state: 'OH', email: 'kwalsh@riverfrontdev.com', phone: '(513) 555-0410', is_primary: true, created_at: '2026-04-01T11:00:00.000Z' },
  { id: 'c5b', name: 'Derek Holloway', contact_role: 'Client', company_name: 'Riverfront Dev LLC', company_city: 'Cincinnati', company_state: 'OH', email: 'dholloway@riverfrontdev.com', phone: '(513) 555-0421', created_at: '2026-04-01T11:05:00.000Z' },
  { id: 'c5c', name: 'Samantha Price', contact_role: 'Client', company_name: 'Riverfront Dev LLC', company_city: 'Cincinnati', company_state: 'OH', email: 'sprice@riverfrontdev.com', phone: '(513) 555-0433', created_at: '2026-04-02T08:30:00.000Z' },
  { id: 'c5d', name: 'Marcus Elliot', contact_role: 'Client', company_name: 'Riverfront Dev LLC', company_city: 'Cincinnati', company_state: 'OH', email: 'melliot@riverfrontdev.com', phone: '(513) 555-0447', created_at: '2026-04-02T09:00:00.000Z' },
  { id: 'c5e', name: 'Jillian Tran', contact_role: 'Client', company_name: 'Riverfront Dev LLC', company_city: 'Cincinnati', company_state: 'OH', email: 'jtran@riverfrontdev.com', phone: '(513) 555-0458', created_at: '2026-04-03T10:15:00.000Z' },
  { id: 'c6', name: 'Thomas Nguyen', contact_role: 'Client', company_name: 'GSA Region 5', company_city: 'St. Paul', company_state: 'MN', email: 'tnguyen@gsa.gov', phone: '(651) 555-0190', created_at: '2026-02-15T14:00:00.000Z' },
  { id: 'c7', name: 'Patricia Holmes', contact_role: 'Engineer', company_name: 'Holmes Fire Engineering', company_city: 'St. Paul', company_state: 'MN', email: 'pholmes@holmesfe.com', phone: '(651) 555-0233', created_at: '2026-02-15T14:10:00.000Z' },
  { id: 'c-bt1', name: 'Steve Morton', contact_role: 'Client', company_name: 'Grandview Properties', company_city: 'Columbus', company_state: 'OH', email: 'smorton@grandviewprop.com', phone: '(614) 555-0455', created_at: '2026-02-18T08:00:00.000Z' },
  { id: 'c-bt2', name: 'Dr. Linda Park', contact_role: 'Client', company_name: 'Mercy Health System', company_city: 'Toledo', company_state: 'OH', email: 'lpark@mercyhealth.org', phone: '(419) 555-0312', created_at: '2025-12-08T09:00:00.000Z' },
  { id: 'c-bt3', name: 'Ryan Schultz', contact_role: 'Engineer', company_name: 'Schultz MEP', company_city: 'Toledo', company_state: 'OH', email: 'rschultz@schultzmep.com', phone: '(419) 555-0198', created_at: '2025-12-08T09:10:00.000Z' },
  // --- Duplicate-company test data (see SEED_CLIENT_COMPANIES above) ---
  // c-mas1 and c-mas3 are the exact same person/email under the two company name
  // variants — merging should drop c-mas3 and keep c-mas1. c-mas2 and c-mas4 are
  // unique contacts on the duplicate companies and should survive the merge,
  // repointed onto MAS HVAC.
  { id: 'c-mas1', name: 'Tom Larson', contact_role: 'Client', roles: ['Client'], company_name: 'MAS HVAC', company_city: 'Maple Grove', company_state: 'MN', email: 'tlarson@mashvac.com', phone: '(763) 555-0110', address_id: 'mas-addr-main', is_primary: true, created_at: '2026-01-06T08:00:00.000Z' },
  { id: 'c-mas2', name: 'Denise Foss', contact_role: 'Client', roles: ['Client'], company_name: 'MAS HVAC, LLC', company_city: 'Maple Grove', company_state: 'MN', email: 'dfoss@mashvacllc.com', phone: '(763) 555-0199', address_id: 'mashvacllc-addr-shipping', is_primary: true, created_at: '2026-02-02T09:00:00.000Z' },
  { id: 'c-mas3', name: 'Tom Larson', contact_role: 'Client', roles: ['Client'], company_name: 'MAS HVAC, LLC', company_city: 'Maple Grove', company_state: 'MN', email: 'tlarson@mashvac.com', phone: '(763) 555-0110', address_id: 'mashvacllc-addr-main', created_at: '2026-02-03T09:00:00.000Z' },
  { id: 'c-mas4', name: 'Priya Anand', contact_role: 'Client', roles: ['Client'], company_name: 'MAS Heating & Cooling', company_city: 'Maple Grove', company_state: 'MN', email: 'panand@masheatcool.com', phone: '(763) 555-0142', created_at: '2026-02-10T09:00:00.000Z' },
  // Same contact, same email, entered under both name variants — should dedupe
  // down to one contact on merge.
  { id: 'c-abilene1', name: 'Frank Mercer', contact_role: 'Client', roles: ['Client'], company_name: 'Abilene Motor Express, Inc', company_city: 'North Chesterfield', company_state: 'VA', email: 'fmercer@abilenemotor.com', phone: '(804) 555-0117', address_id: 'abilene1-addr-main', is_primary: true, created_at: '2026-01-20T09:00:00.000Z' },
  { id: 'c-abilene2', name: 'Frank Mercer', contact_role: 'Client', roles: ['Client'], company_name: 'Abilene Motor Express, Inc.', company_city: 'Richmond', company_state: 'VA', email: 'fmercer@abilenemotor.com', phone: '(804) 555-0117', address_id: 'abilene2-addr-main', created_at: '2026-01-21T09:05:00.000Z' },
  { id: 'c-abilene3', name: 'Donna Pruitt', contact_role: 'Client', roles: ['Client'], company_name: 'Abilene Motor Express, Inc.', company_city: 'Richmond', company_state: 'VA', email: 'dpruitt@abilenemotor.com', phone: '(804) 555-0163', address_id: 'abilene2-addr-main', created_at: '2026-01-21T09:10:00.000Z' },
  { id: 'c-ruritan1', name: 'Betty Sue Combs', contact_role: 'Client', roles: ['Client'], company_name: 'Abingdon Ruritan Club', company_city: '', company_state: '', email: 'bscombs@ruritan.org', phone: '(276) 555-0129', is_primary: true, created_at: '2026-01-22T09:00:00.000Z' },
  { id: 'c-ruritan2', name: 'Betty Sue Combs', contact_role: 'Client', roles: ['Client'], company_name: 'Abington Ruritan Club', company_city: 'Bena', company_state: 'VA', email: 'bscombs@ruritan.org', phone: '(276) 555-0129', address_id: 'ruritan2-addr-main', created_at: '2026-01-23T09:05:00.000Z' },
  { id: 'c-english1', name: 'Walter Ingram', contact_role: 'Client', roles: ['Client'], company_name: 'English', company_city: '', company_state: '', email: 'wingram@englishconst.com', phone: '(434) 555-0166', is_primary: true, created_at: '2026-01-25T09:00:00.000Z' },
  { id: 'c-mondelez1', name: 'Sandra Kessler', contact_role: 'Client', roles: ['Client'], company_name: 'Mondelez International Inc.', company_city: '', company_state: '', email: 'skessler@mondelezintl.com', phone: '(973) 555-0188', is_primary: true, created_at: '2026-01-26T09:00:00.000Z' },
];

function loadClientContacts() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('master_client_contacts');
    const existing = stored ? JSON.parse(stored) : [];
    // Merge: add missing seeds, replace stale seeds with fresh data
    const seedIds = new Set(SEED_CLIENT_CONTACTS.map((s) => s.id));
    const userContacts = existing.filter((c) => !seedIds.has(c.id));
    return [...userContacts, ...SEED_CLIENT_CONTACTS];
  } catch {
    return [...SEED_CLIENT_CONTACTS];
  }
}

function saveClientContacts(contacts) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('master_client_contacts', JSON.stringify(contacts));
}

// --- Merge Client Companies helpers ---
// Two addresses are "the same" for merge purposes if every line matches once
// trimmed/case-folded — that's how we avoid piling up duplicate address rows.
function normalizeAddressKey(a) {
  return [a.street, a.city, a.state, a.zip, a.country].map((v) => (v || '').trim().toLowerCase()).join('|');
}

function slotDedupeKey(slot, extraFields) {
  const base = (slot.company_name || '').trim().toLowerCase();
  return extraFields.length ? `${base}|${extraFields.map((f) => slot[f]).join('|')}` : base;
}

// Renames any slot (client/competitor/additional-company) whose company_name is
// being merged away, then collapses slots that now collide (e.g. destination and
// source were both already added as separate slots on the same project). Returns
// the deduped slot list plus a map of dropped-slot-id -> surviving-slot-id so the
// caller can repoint everything that referenced the dropped slot (contacts'
// slot_id, award_details.awarded_client_id, client_data).
function renameAndDedupeSlots(slots, sourceSet, destinationName, extraFields = []) {
  const idMap = new Map();
  if (!slots || slots.length === 0) return { slots: slots || [], idMap, changed: false };
  let renameOccurred = false;
  const renamed = slots.map((s) => {
    if (s.company_name && sourceSet.has(s.company_name)) {
      renameOccurred = true;
      return { ...s, company_name: destinationName };
    }
    return s;
  });
  const seen = new Map();
  const result = [];
  renamed.forEach((s) => {
    if (!s.company_name) { result.push(s); return; }
    const key = slotDedupeKey(s, extraFields);
    const existing = seen.get(key);
    if (existing) {
      idMap.set(s.id, existing.id);
    } else {
      seen.set(key, s);
      result.push(s);
    }
  });
  return { slots: result, idMap, changed: renameOccurred || idMap.size > 0 };
}

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [clientContacts, setClientContacts] = useState([]);
  const [clientCompanies, setClientCompanies] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProjects(loadProjects());
    setCompanies(loadCompanies());
    setCompetitors(loadCompetitors());
    setClientContacts(loadClientContacts());
    setClientCompanies(loadClientCompanies());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveProjects(projects);
  }, [projects, loaded]);

  useEffect(() => {
    if (loaded) saveCompanies(companies);
  }, [companies, loaded]);

  useEffect(() => {
    if (loaded) saveCompetitors(competitors);
  }, [competitors, loaded]);

  useEffect(() => {
    if (loaded) saveClientContacts(clientContacts);
  }, [clientContacts, loaded]);

  useEffect(() => {
    if (loaded) saveClientCompanies(clientCompanies);
  }, [clientCompanies, loaded]);

  // --- Project CRUD ---
  // `copied` is the { record } half of buildCopyPayload — deeper sections pulled
  // from an existing project. Merged over the blank defaults below so anything
  // the copy doesn't carry still starts empty.
  const createProject = useCallback((data, copied = null) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const projectNumber = generateProjectNumber(data.division, projects);

    const newProject = {
      id,
      potential_project_number: projectNumber,
      created_by: CURRENT_USER.name,
      created_at: now,
      updated_at: now,

      // Required initial fields
      division: data.division,
      project_name: data.project_name,
      description: data.description,
      probability_percent: data.probability_percent,
      bid_date: data.bid_date,
      estimated_project_start: data.estimated_project_start,
      project_stage: data.project_stage,
      project_type: data.project_type,

      // NDA as Yes/No string
      nda: data.nda || 'No',

      // Data source / origin
      data_source: data.data_source || 'Axiom',

      // Internal POC — autofills from created_by; user may override.
      internal_poc: data.internal_poc || CURRENT_USER.name,

      // Site Location (Section 5)
      site_location: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'United States',
        region: '',
      },

      // Contacts (Section 10)
      contacts: [],

      // Contract Details (Section 7)
      contract_details: {
        square_footage: '',
        project_size_um: '',
        prime_or_sub: '',
        contract_type: '',
        end_sector: data.end_sector || '',
        construction_type: '',
        sales_tax_exempt: '',
        insurance_program: '',
        client_type: '',
      },

      // Notes (Section 6)
      notes: [],

      // Budget (Section 11)
      estimation_number: '',

      // Bid Details (Section 12)
      bid_details: {
        total_bid_cost: '',
        project_end_date: '',
        cost_breakdown: {
          labor_cost: '',
          labor_hours: '',
          material_cost: '',
          equipment_cost: '',
          subcontract_cost: '',
          other_cost: '',
        },
        estimators: [],
        trades: [],
        year_burns: [],
        // RequestLinkData fields (Section 12.2)
        sales_tax_exempt: 'No',
        sub_tier_lien_waivers: 'No',
        certified_payroll: 'No',
        prevailing_wage_scale: 'No',
        liquidated_damages_amount: '',
        liquidated_damages_per: '',
        proof_to_proceed: '',
        document_to_proceed: '',
        document_id: '',
        bid_bond_req: 'No',
        retainage_pct: '',
        warranty_months: '',
        insurance_program: '',
        gc_bill_day: '',
        suggested_job_no: '',
        bonded: 'No',
        ocip_payroll: 'No',
        bureau_capital_outlay_mgmt: 'No',
        rebate_spend_program: 'No',
        service_agreement: false,
      },

      // Award Details (Section 13)
      award_details: {
        awarded_date: '',
        awarded_amount: '',
        awarded_cost: '',
        awarded_margin_percent: '',
        project_manager: '',
        superintendent: '',
        commissioned_sales_person: '',
        suggested_job_no: '',
      },

      // Loss Details (Section 14)
      loss_details: {
        feedback: '',
        primary_competitor: '',
        competitor_bid_amount: '',
        date_of_notice: '',
      },

      // Multiple clients (Section 15)
      clients: [],
      awarded_client_id: '',

      // Track which stages have been visited
      visited_stages: [data.project_stage],

      // Provenance when this project was started from an existing one (Section 4.c)
      copied_from: data.copied_from || null,
    };

    const finalProject = copied ? deepMergeCopied(newProject, copied) : newProject;

    setProjects((prev) => [finalProject, ...prev]);
    return finalProject;
  }, [projects]);

  const updateProject = useCallback((id, updates) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates, updated_at: new Date().toISOString() };
        if (updates.project_stage && !p.visited_stages?.includes(updates.project_stage)) {
          updated.visited_stages = [...(p.visited_stages || []), updates.project_stage];
        }
        return updated;
      })
    );
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProject = useCallback(
    (id) => projects.find((p) => p.id === id) || null,
    [projects]
  );

  // --- Company CRUD (Section 8) ---
  const createCompany = useCallback((data) => {
    const company = {
      id: crypto.randomUUID(),
      company_name: data.company_name,
      city: data.city || '',
      state: data.state || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      people: data.people || [],
      created_at: new Date().toISOString(),
    };
    setCompanies((prev) => [company, ...prev]);
    return company;
  }, []);

  const updateCompany = useCallback((id, updates) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCompany = useCallback((id) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // --- Competitor CRUD (Section 9) ---
  const createCompetitor = useCallback((data) => {
    const competitor = {
      id: crypto.randomUUID(),
      company_name: data.company_name,
      contact_info: data.contact_info || '',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    };
    setCompetitors((prev) => [competitor, ...prev]);
    return competitor;
  }, []);

  const updateCompetitor = useCallback((id, updates) => {
    setCompetitors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCompetitor = useCallback((id) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // --- Client Companies CRUD (CRM) ---
  const createClientCompany = useCallback((data) => {
    const company = {
      id: crypto.randomUUID(),
      company_name: data.company_name || '',
      sort_name: data.sort_name || '',
      company_city: data.company_city || '',
      company_state: data.company_state || '',
      company_group: data.company_group || [],
      company_type: data.company_type || [],
      addresses: data.addresses || [],
      vendor_enrollment: data.vendor_enrollment || null,
      created_at: new Date().toISOString(),
    };
    setClientCompanies((prev) => [company, ...prev]);
    return company;
  }, []);

  const updateClientCompany = useCallback((id, updates) => {
    setClientCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  // Consolidates one or more source companies into a destination company: contacts,
  // addresses, and every project reference (client/owner/competitor/additional-company
  // slots, and CRM contact links) are repointed to the destination. Anything that would
  // become a duplicate on the destination (same contact, same address, same company
  // already on a job) is dropped rather than copied, so the destination becomes the
  // single source of truth and the source companies disappear.
  const mergeClientCompanies = useCallback((destinationName, sourceNames) => {
    const sources = Array.from(new Set((sourceNames || []).filter((n) => n && n !== destinationName)));
    if (!destinationName || sources.length === 0) return;
    const sourceSet = new Set(sources);

    // --- Companies: union addresses (deduped by physical location), group/type, enrollment ---
    const destCompany = clientCompanies.find((c) => c.company_name === destinationName);
    const sourceCompanies = clientCompanies.filter((c) => sourceSet.has(c.company_name));

    const mergedAddresses = [...(destCompany?.addresses || [])];
    const addrByKey = new Map(mergedAddresses.map((a) => [normalizeAddressKey(a), a]));
    const addressIdMap = new Map();
    sourceCompanies.forEach((sc) => {
      (sc.addresses || []).forEach((a) => {
        const key = normalizeAddressKey(a);
        const existing = addrByKey.get(key);
        if (existing) {
          addressIdMap.set(a.id, existing.id);
        } else {
          const copy = { ...a, id: crypto.randomUUID() };
          mergedAddresses.push(copy);
          addrByKey.set(key, copy);
          addressIdMap.set(a.id, copy.id);
        }
      });
    });

    const mergedGroup = Array.from(new Set([...(destCompany?.company_group || []), ...sourceCompanies.flatMap((c) => c.company_group || [])]));
    const mergedType = Array.from(new Set([...(destCompany?.company_type || []), ...sourceCompanies.flatMap((c) => c.company_type || [])]));
    const mergedEnrollment = destCompany?.vendor_enrollment || sourceCompanies.find((c) => c.vendor_enrollment)?.vendor_enrollment || null;
    const mergedCity = destCompany?.company_city || sourceCompanies.find((c) => c.company_city)?.company_city || '';
    const mergedState = destCompany?.company_state || sourceCompanies.find((c) => c.company_state)?.company_state || '';

    let nextClientCompanies;
    if (destCompany) {
      nextClientCompanies = clientCompanies
        .filter((c) => !sourceSet.has(c.company_name))
        .map((c) => (c.id === destCompany.id
          ? { ...c, addresses: mergedAddresses, company_group: mergedGroup, company_type: mergedType, vendor_enrollment: mergedEnrollment, company_city: mergedCity, company_state: mergedState }
          : c));
    } else {
      const shell = {
        id: crypto.randomUUID(), company_name: destinationName, company_city: mergedCity, company_state: mergedState,
        company_group: mergedGroup, company_type: mergedType, addresses: mergedAddresses, vendor_enrollment: mergedEnrollment,
        created_at: new Date().toISOString(),
      };
      nextClientCompanies = [shell, ...clientCompanies.filter((c) => !sourceSet.has(c.company_name))];
    }

    // --- CRM Contacts: repoint to destination, dedupe by email (else name) ---
    const contactKey = (c) => ((c.email || '').trim().toLowerCase()
      ? `email:${c.email.trim().toLowerCase()}`
      : `name:${(c.name || '').trim().toLowerCase()}`);
    const keptByKey = new Map();
    clientContacts.filter((c) => c.company_name === destinationName).forEach((c) => keptByKey.set(contactKey(c), c));
    let destHasPrimary = clientContacts.some((c) => c.company_name === destinationName && c.is_primary);

    const contactIdMap = new Map(); // every merged-away CRM contact id -> the id it now resolves to
    const nextClientContacts = [];
    clientContacts.forEach((c) => {
      if (!sourceSet.has(c.company_name)) { nextClientContacts.push(c); return; }
      const key = contactKey(c);
      const existing = keptByKey.get(key);
      if (existing) {
        contactIdMap.set(c.id, existing.id);
        return; // duplicate of a contact already on the destination — drop it
      }
      const migrated = {
        ...c,
        company_name: destinationName,
        company_city: mergedCity || c.company_city,
        company_state: mergedState || c.company_state,
        address_id: c.address_id ? (addressIdMap.get(c.address_id) || c.address_id) : c.address_id,
        is_primary: c.is_primary && !destHasPrimary,
      };
      if (migrated.is_primary) destHasPrimary = true;
      keptByKey.set(key, migrated);
      contactIdMap.set(c.id, migrated.id);
      nextClientContacts.push(migrated);
    });

    // --- Projects: repoint every reference to the merged-away company names ---
    const nextProjects = projects.map((p) => {
      let changed = false;
      const next = { ...p };

      if (next.client_company && sourceSet.has(next.client_company)) { next.client_company = destinationName; changed = true; }
      if (next.owner_company && sourceSet.has(next.owner_company)) { next.owner_company = destinationName; changed = true; }
      if (next.owner_slot?.company_name && sourceSet.has(next.owner_slot.company_name)) {
        next.owner_slot = { ...next.owner_slot, company_name: destinationName };
        changed = true;
      }

      const { slots: clientSlots, idMap: clientSlotMap, changed: clientSlotsChanged } = renameAndDedupeSlots(p.client_slots, sourceSet, destinationName);
      if (clientSlotsChanged) { next.client_slots = clientSlots; changed = true; }

      const { slots: competitorSlots, idMap: competitorSlotMap, changed: competitorSlotsChanged } = renameAndDedupeSlots(p.competitor_slots, sourceSet, destinationName);
      if (competitorSlotsChanged) { next.competitor_slots = competitorSlots; changed = true; }

      const { slots: additionalCompanies, idMap: additionalMap, changed: additionalChanged } = renameAndDedupeSlots(p.additional_companies, sourceSet, destinationName, ['type']);
      if (additionalChanged) { next.additional_companies = additionalCompanies; changed = true; }

      const slotIdMap = new Map([...clientSlotMap, ...competitorSlotMap, ...additionalMap]);

      if (slotIdMap.size > 0 && next.award_details?.awarded_client_id && slotIdMap.has(next.award_details.awarded_client_id)) {
        next.award_details = { ...next.award_details, awarded_client_id: slotIdMap.get(next.award_details.awarded_client_id) };
        changed = true;
      }

      if (next.client_data && slotIdMap.size > 0) {
        const cd = { ...next.client_data };
        let cdChanged = false;
        Object.keys(cd).forEach((oldId) => {
          if (!slotIdMap.has(oldId)) return;
          const keptId = slotIdMap.get(oldId);
          cd[keptId] = { ...(cd[oldId] || {}), ...(cd[keptId] || {}) };
          delete cd[oldId];
          cdChanged = true;
        });
        if (cdChanged) { next.client_data = cd; changed = true; }
      }

      // Contacts on the project: rename company, repoint CRM link + slot_id, then drop duplicates
      if ((p.contacts || []).length > 0) {
        const renamedContacts = p.contacts.map((c) => {
          let rc = c;
          if (c.company_name && sourceSet.has(c.company_name)) {
            rc = { ...rc, company_name: destinationName, company_city: mergedCity || rc.company_city, company_state: mergedState || rc.company_state };
          }
          if (rc.source_contact_id && contactIdMap.has(rc.source_contact_id)) {
            rc = { ...rc, source_contact_id: contactIdMap.get(rc.source_contact_id) };
          }
          if (rc.slot_id && slotIdMap.has(rc.slot_id)) {
            rc = { ...rc, slot_id: slotIdMap.get(rc.slot_id) };
          }
          return rc;
        });

        const seenContact = new Map();
        const dedupedContacts = [];
        renamedContacts.forEach((c) => {
          const key = c.source_contact_id
            ? `id:${c.source_contact_id}`
            : `flat:${(c.name || '').trim().toLowerCase()}|${(c.company_name || '').trim().toLowerCase()}|${c.contact_role}`;
          const kept = seenContact.get(key);
          if (kept) {
            // A duplicate contact ended up on the job (e.g. it was added under both
            // the source and destination company) — keep one copy, but don't lose
            // primary/slot info the surviving copy didn't have.
            if ((c.is_primary && !kept.is_primary) || (c.slot_id && !kept.slot_id)) {
              const idx = dedupedContacts.indexOf(kept);
              const merged = { ...kept, is_primary: kept.is_primary || c.is_primary, slot_id: kept.slot_id || c.slot_id };
              dedupedContacts[idx] = merged;
              seenContact.set(key, merged);
            }
            return;
          }
          seenContact.set(key, c);
          dedupedContacts.push(c);
        });

        if (dedupedContacts.length !== p.contacts.length || dedupedContacts.some((c, i) => c !== p.contacts[i])) {
          next.contacts = dedupedContacts;
          changed = true;
        }
      }

      return changed ? next : p;
    });

    setClientCompanies(nextClientCompanies);
    setClientContacts(nextClientContacts);
    setProjects(nextProjects);
  }, [clientCompanies, clientContacts, projects]);

  // --- Client Contacts CRUD (CRM) ---
  const createClientContact = useCallback((data) => {
    const now = new Date().toISOString();
    const contact = {
      id: crypto.randomUUID(),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      company_name: data.company_name || '',
      company_city: data.company_city || '',
      company_state: data.company_state || '',
      contact_role: data.contact_role || 'Client',
      address_id: data.address_id || null,
      created_at: now,
      updated_at: now,
    };
    setClientContacts((prev) => [contact, ...prev]);
    return contact;
  }, []);

  const updateClientContact = useCallback((id, updates) => {
    setClientContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
  }, []);

  const deleteClientContact = useCallback((id) => {
    setClientContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Sets one CRM contact as primary for its company; clears is_primary on all others in same company.
  const setContactAsPrimary = useCallback((id) => {
    setClientContacts((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      return prev.map((c) => {
        if (c.company_name !== target.company_name) return c;
        return { ...c, is_primary: c.id === id, updated_at: new Date().toISOString() };
      });
    });
  }, []);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        loaded,
        createProject,
        updateProject,
        deleteProject,
        getProject,
        // Master data
        companies,
        createCompany,
        updateCompany,
        deleteCompany,
        competitors,
        createCompetitor,
        updateCompetitor,
        deleteCompetitor,
        clientContacts,
        createClientContact,
        updateClientContact,
        deleteClientContact,
        setContactAsPrimary,
        clientCompanies,
        createClientCompany,
        updateClientCompany,
        mergeClientCompanies,
        // Constants
        STAGES,
        PROJECT_TYPES,
        DIVISIONS,
        CONTRACT_TYPES,
        END_SECTORS,
        US_STATES,
        CURRENT_USER,
        PROOF_TYPES,
        INSURANCE_PROGRAMS,
        CLIENT_TYPES,
        COMPANY_TYPES,
        COMPANY_GROUPS,
        ADDRESS_TYPES,
        EXTRA_ADDRESS_TYPES,
        LIQUIDATED_DAMAGES_PER,
        TRADES,
        CONTACT_ROLES,
        CONSTRUCTION_TYPES,
        PROJECT_SIZE_UM,
        ESTIMATORS_LIST,
        USERS_LIST,
        // Copy-from-existing-project helpers (Section 4.c)
        COPY_SECTIONS,
        COPY_GROUPS,
        COPY_GROUP_FORM_FIELDS,
        buildCopyPayload,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider');
  return ctx;
}
