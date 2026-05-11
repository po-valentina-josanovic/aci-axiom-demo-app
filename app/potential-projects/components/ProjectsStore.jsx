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
];

function loadProjects() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('potential_projects');
    const existing = stored ? JSON.parse(stored) : [];
    const existingIds = new Set(existing.map((p) => p.id));
    const missingSeedProjects = SEED_PROJECTS.filter((s) => !existingIds.has(s.id));
    return [...existing, ...missingSeedProjects];
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
function loadClientCompanies() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('master_client_companies');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveClientCompanies(companies) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('master_client_companies', JSON.stringify(companies));
}

// --- Master Client Contacts (CRM) ---
const SEED_CLIENT_CONTACTS = [
  { id: 'c1', name: 'Dr. Alan Reed', contact_role: ['Client'], company_name: 'Metro Health', company_city: 'Columbus', company_state: 'OH', email: 'areed@metrohealth.org', phone: '(614) 555-0120', created_at: '2026-03-08T10:00:00.000Z' },
  { id: 'c2', name: 'Maria Torres', contact_role: ['Client'], company_name: 'Lakeview ISD', company_city: 'Cleveland', company_state: 'OH', email: 'mtorres@lakeviewisd.edu', phone: '(216) 555-0340', created_at: '2026-03-20T09:00:00.000Z' },
  { id: 'c3', name: 'Jeff Conlin', contact_role: ['Architect'], company_name: 'Conlin Architects', company_city: 'Cleveland', company_state: 'OH', email: 'jconlin@conlinarch.com', phone: '(216) 555-0188', created_at: '2026-03-20T09:05:00.000Z' },
  { id: 'c4', name: 'Bill Hargrove', contact_role: ['Client'], company_name: 'Apex Manufacturing', company_city: 'Akron', company_state: 'OH', email: 'bhargrove@apexmfg.com', phone: '(330) 555-0275', created_at: '2026-01-12T08:00:00.000Z' },
  { id: 'c5', name: 'Karen Walsh', contact_role: ['Client'], company_name: 'Riverfront Dev LLC', company_city: 'Cincinnati', company_state: 'OH', email: 'kwalsh@riverfrontdev.com', phone: '(513) 555-0410', created_at: '2026-04-01T11:00:00.000Z' },
  { id: 'c6', name: 'Thomas Nguyen', contact_role: ['Client'], company_name: 'GSA Region 5', company_city: 'St. Paul', company_state: 'MN', email: 'tnguyen@gsa.gov', phone: '(651) 555-0190', created_at: '2026-02-15T14:00:00.000Z' },
  { id: 'c7', name: 'Patricia Holmes', contact_role: ['Engineer'], company_name: 'Holmes Fire Engineering', company_city: 'St. Paul', company_state: 'MN', email: 'pholmes@holmesfe.com', phone: '(651) 555-0233', created_at: '2026-02-15T14:10:00.000Z' },
  { id: 'c-bt1', name: 'Steve Morton', contact_role: ['Client'], company_name: 'Grandview Properties', company_city: 'Columbus', company_state: 'OH', email: 'smorton@grandviewprop.com', phone: '(614) 555-0455', created_at: '2026-02-18T08:00:00.000Z' },
  { id: 'c-bt2', name: 'Dr. Linda Park', contact_role: ['Client'], company_name: 'Mercy Health System', company_city: 'Toledo', company_state: 'OH', email: 'lpark@mercyhealth.org', phone: '(419) 555-0312', created_at: '2025-12-08T09:00:00.000Z' },
  { id: 'c-bt3', name: 'Ryan Schultz', contact_role: ['Engineer'], company_name: 'Schultz MEP', company_city: 'Toledo', company_state: 'OH', email: 'rschultz@schultzmep.com', phone: '(419) 555-0198', created_at: '2025-12-08T09:10:00.000Z' },
];

function loadClientContacts() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('master_client_contacts');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    }
    return [...SEED_CLIENT_CONTACTS];
  } catch {
    return [...SEED_CLIENT_CONTACTS];
  }
}

function saveClientContacts(contacts) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('master_client_contacts', JSON.stringify(contacts));
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
  const createProject = useCallback((data) => {
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
    };

    setProjects((prev) => [newProject, ...prev]);
    return newProject;
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
      company_city: data.company_city || '',
      company_state: data.company_state || '',
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
      contact_role: Array.isArray(data.contact_role) ? data.contact_role : [data.contact_role || 'Client'],
      is_primary: data.is_primary || false,
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
        clientCompanies,
        createClientCompany,
        updateClientCompany,
        clientContacts,
        createClientContact,
        updateClientContact,
        deleteClientContact,
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
        LIQUIDATED_DAMAGES_PER,
        TRADES,
        CONTACT_ROLES,
        CONSTRUCTION_TYPES,
        PROJECT_SIZE_UM,
        ESTIMATORS_LIST,
        USERS_LIST,
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
