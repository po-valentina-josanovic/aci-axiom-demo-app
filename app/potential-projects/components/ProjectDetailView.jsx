'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProjects } from './ProjectsStore';
import CollapsibleSection from './CollapsibleSection';
import StageSelector from './StageSelector';
import CompaniesAndContacts from './CompaniesAndContacts';
import { formatDateMDY, formatDateTimeMDY, formatCurrencyNoCents, formatNumberCommas } from './formatters';
import useUnsavedChangesPrompt from './useUnsavedChangesPrompt';
import UnsavedChangesModal from './UnsavedChangesModal';

// Currency display used across the detail view — commas, no cents.
const formatCurrency = formatCurrencyNoCents;

function parseCurrency(str) {
  return str.replace(/[^0-9]/g, '');
}

// --- Stage field requirements (cumulative, Section 4 / 20) ---
const STAGE_REQUIREMENTS = {
  Preliminary: [],
  Lead: [
    { section: 'site_location', fields: ['street', 'city', 'state', 'zip_code'], label: 'Site Location (street, city, state, zip)' },
    { section: 'contacts', check: 'hasClientCompany', label: 'Client company' },
    { section: 'contacts', check: 'hasOwnerCompany', label: 'Owner company' },
    { section: 'contract_details', fields: ['client_type'], label: 'Client Type' },
  ],
  Budget: [
    { section: 'root', fields: ['estimation_number'], label: 'Estimation Number' },
    { section: 'contract_details', fields: ['contract_type', 'end_sector'], label: 'Contract Details (contract type, end sector)' },
  ],
  Bid: [
    { section: 'bid_details', fields: ['project_end_date'], label: 'Project End Date' },
    { section: 'bid_details', check: 'hasTrades', label: 'At least 1 Estimator or Trade' },
    { section: 'bid_details', check: 'hasYearBurns', label: 'Year Burns (5 rows = 100%)' },
  ],
  Pending: [],
  Award: [
    { section: 'award_details', fields: ['awarded_date', 'awarded_amount', 'awarded_cost'], label: 'Award Details (date, amount, cost)' },
    { section: 'award_details', fields: ['project_manager'], label: 'Project Manager' },
    { section: 'bid_details', check: 'hasTrades', label: 'At least 1 Estimator or Trade' },
  ],
  Lost: [
    { section: 'loss_details', fields: ['feedback', 'date_of_notice'], label: 'Loss Details (feedback, notice date)' },
    { section: 'loss_details', check: 'hasLostCompetitors', label: 'At least 1 Competitor' },
  ],
  Cancel: [],
};

const STAGE_BADGE_COLORS = {
  Preliminary: { bg: '#e8ecf1', color: '#5a6577', activeBg: '#5a6577' },
  Lead: { bg: '#dbe4f0', color: '#2979ff', activeBg: '#2979ff' },
  Budget: { bg: '#e0e7ff', color: '#4338ca', activeBg: '#4338ca' },
  Bid: { bg: '#f3e8ff', color: '#7c3aed', activeBg: '#7c3aed' },
  Pending: { bg: '#fef9c2', color: '#a36100', activeBg: '#d97706' },
  Award: { bg: '#dcfce7', color: '#15803d', activeBg: '#15803d' },
  Lost: { bg: '#ffe2e2', color: '#d32f2f', activeBg: '#d32f2f' },
  Cancel: { bg: '#e8ecf1', color: '#5a6577', activeBg: '#64748b' },
};

const FIELD_STAGE_MAP = {
  'site_location.street': 'Lead',
  'site_location.city': 'Lead',
  'site_location.state': 'Lead',
  'site_location.zip_code': 'Lead',
  'contacts': 'Lead',
  'client_company': 'Lead',
  'owner_company': 'Lead',
  'contract_details.client_type': 'Lead',
  'estimation_number': 'Budget',
  'contract_details.contract_type': 'Budget',
  'contract_details.end_sector': 'Budget',
  'bid_details.project_end_date': 'Bid',
  'bid_details.trades': 'Bid',
  'bid_details.year_burns': 'Bid',
  'award_details.awarded_date': 'Award',
  'award_details.awarded_amount': 'Award',
  'award_details.awarded_cost': 'Award',
  'award_details.project_manager': 'Award',
  'loss_details.feedback': 'Lost',
  'loss_details.competitors': 'Lost',
  'loss_details.date_of_notice': 'Lost',
};

function getRequiredFields(stage) {
  if (['Lost', 'Cancel'].includes(stage)) {
    return [...STAGE_REQUIREMENTS.Preliminary, ...STAGE_REQUIREMENTS[stage]];
  }
  if (stage === 'Pending') return [...STAGE_REQUIREMENTS.Preliminary];
  const pipelineStages = ['Preliminary', 'Lead', 'Budget', 'Bid', 'Award'];
  const reqs = [];
  for (const s of pipelineStages) {
    reqs.push(...STAGE_REQUIREMENTS[s]);
    if (s === stage) break;
  }
  return reqs;
}

function checkRequirement(req, project) {
  // Multi-client awareness: when a project has more than 1 Client contact,
  // certain fields are stored per-client under `client_data[clientId]` instead of at the root.
  const clients = (project.contacts || []).filter((c) => c.contact_role === 'Client');
  const multiClient = clients.length > 1;

  if (req.check === 'hasClientCompany') {
    const slots = project.client_slots || [];
    if (slots.length > 0 && slots.some((s) => s.company_name)) return true;
    // Fallback: legacy single client_company field or Client contacts.
    if (project.client_company && String(project.client_company).trim()) return true;
    return clients.some((c) => c.company_name && String(c.company_name).trim());
  }
  if (req.check === 'hasOwnerCompany') {
    if (project.owner_slot?.company_name && String(project.owner_slot.company_name).trim()) return true;
    // Fallback: legacy owner_company field or Owner contacts.
    if (project.owner_company && String(project.owner_company).trim()) return true;
    return (project.contacts || []).some((c) => c.contact_role === 'Owner' && c.company_name && String(c.company_name).trim());
  }
  if (req.check === 'hasTrades') {
    return (project.bid_details?.trades || []).length > 0;
  }
  if (req.check === 'hasLostCompetitors') {
    return (project.loss_details?.competitors || []).length > 0;
  }
  if (req.check === 'hasYearBurns') {
    const burns = project.bid_details?.year_burns || [];
    if (burns.length !== 5) return false;
    const total = burns.reduce((sum, b) => sum + (parseFloat(b.percentage) || 0), 0);
    return total === 100;
  }
  if (req.fields) {
    // Special case: estimation_number is stored per-client when multi-client.
    if (multiClient && req.section === 'root' && req.fields.length === 1 && req.fields[0] === 'estimation_number') {
      return clients.every((c) => {
        const v = (project.client_data || {})[c.id]?.estimation_number;
        return v !== undefined && v !== null && v !== '';
      });
    }
    const obj = req.section === 'root' ? project : project[req.section];
    if (!obj) return false;
    return req.fields.every((f) => {
      const v = obj[f];
      return v !== undefined && v !== null && v !== '' && v !== 0;
    });
  }
  return true;
}

function getValidationErrors(project, targetStage) {
  const reqs = getRequiredFields(targetStage || project.project_stage);
  return reqs.filter((r) => !checkRequirement(r, project));
}


function getRequiredStages(fieldKey) {
  const fieldStage = FIELD_STAGE_MAP[fieldKey];
  if (!fieldStage) return [];

  // Lost / Cancel fields only apply to their own stage
  if (fieldStage === 'Lost') return ['Lost'];
  if (fieldStage === 'Cancel') return ['Cancel'];

  // Pipeline fields: show every stage from where the field first becomes required through Award
  const pipeline = ['Preliminary', 'Lead', 'Budget', 'Bid', 'Award'];
  const fieldIdx = pipeline.indexOf(fieldStage);
  if (fieldIdx < 0) return [];
  return pipeline.slice(fieldIdx);
}

function RequiredBadge({ fieldKey }) {
  const stages = getRequiredStages(fieldKey);
  if (stages.length === 0) return null;
  return (
    <span style={{ marginLeft: 'auto', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9px', color: '#8694a7' }}>
      Required for
      {stages.map((s) => {
        const c = STAGE_BADGE_COLORS[s] || STAGE_BADGE_COLORS.Preliminary;
        return (
          <span key={s} style={{
            fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
            background: c.activeBg, color: '#fff', lineHeight: '14px',
          }}>
            {s}
          </span>
        );
      })}
    </span>
  );
}

// Shared styles
const inputStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };
const disabledInputStyle = { ...inputStyle, background: '#f5f7fa', color: '#8694a7', borderColor: '#e8ecf1' };
const labelStyle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', paddingTop: '8px' };
const grid4Style = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', paddingTop: '8px' };
const sectionSpacerStyle = { display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px' };

function yesNoStyle(value) {
  if (value === 'Yes') return { ...inputStyle, color: '#15803d', background: '#f0fdf4', borderColor: '#86efac' };
  if (value === 'No') return { ...inputStyle, color: '#b91c1c', background: '#fef2f2', borderColor: '#fecaca' };
  return inputStyle;
}

export default function ProjectDetailView({ projectId }) {
  const {
    getProject, updateProject,
    PROJECT_TYPES, DIVISIONS, CONTRACT_TYPES, END_SECTORS, US_STATES, CURRENT_USER,
    PROOF_TYPES, INSURANCE_PROGRAMS, CLIENT_TYPES, COMPANY_TYPES,
    LIQUIDATED_DAMAGES_PER, TRADES,
    CONSTRUCTION_TYPES, ESTIMATORS_LIST, USERS_LIST,
    clientContacts,
  } = useProjects();
  const router = useRouter();
  const project = getProject(projectId);

  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [arValidationErrors, setArValidationErrors] = useState(null); // null = modal closed, [] = all good
  const [arWorkflowStep, setArWorkflowStep] = useState(null); // null | 'syncing' | 'requesting'

  // Notes
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');

  // Contacts
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [teamRoleToAdd, setTeamRoleToAdd] = useState('ACI/API/POC');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  // Trades
  const [tradeForm, setTradeForm] = useState({ estimator: '', name: '', hours: '', cost: '' });
  const [competitorForm, setCompetitorForm] = useState({ name: '', bid_amount: '' });

  // Year Burns
  const [yearBurnForm, setYearBurnForm] = useState({ year: 1, percentage: '' });
  const [yearBurnError, setYearBurnError] = useState('');

  // Multi-client (Section 15)

  // Delete confirmations
  const [pendingDelete, setPendingDelete] = useState(null); // { type, id, label }

  // Accordion sections
  const [openSections, setOpenSections] = useState(new Set(['overview']));

  function toggleSection(key) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Bottom bar
  const [bottomBarOpen, setBottomBarOpen] = useState(true);

  // Stage transition block modal
  const [stageBlockModal, setStageBlockModal] = useState(null);
  const [docDragOver, setDocDragOver] = useState(false);

  // Auto-sync awarded client — must be declared before any early return
  useEffect(() => {
    if (!form) return;
    const slots = form.client_slots || [];
    const currentId = form.award_details?.awarded_client_id || '';
    if (slots.length === 1 && currentId !== slots[0].id) {
      updateField('award_details.awarded_client_id', slots[0].id);
    } else if (currentId && !slots.some((s) => s.id === currentId)) {
      updateField('award_details.awarded_client_id', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.client_slots?.map((s) => s.id).join(',')]);

  useEffect(() => {
    if (!project) return;
    // Normalize a few fields on load so older seed projects pick up new UI-driven fields.
    const normalized = { ...project };
    if (!normalized.internal_poc) normalized.internal_poc = project.created_by || '';
    // Migrate legacy single client_company → client_slots[]
    if (!normalized.client_slots) {
      const firstClient = (project.contacts || []).find((c) => c.contact_role === 'Client');
      const companyName = project.client_company || firstClient?.company_name || '';
      normalized.client_slots = companyName
        ? [{ id: crypto.randomUUID(), company_name: companyName, client_type: project.contract_details?.client_type || '' }]
        : [];
    }
    // Migrate legacy owner_company → owner_slot
    if (!normalized.owner_slot) {
      const firstOwner = (project.contacts || []).find((c) => c.contact_role === 'Owner');
      normalized.owner_slot = { company_name: project.owner_company || firstOwner?.company_name || '' };
    }
    if (!normalized.competitor_slots) normalized.competitor_slots = [];
    if (!normalized.additional_companies) normalized.additional_companies = [];
    setForm(normalized);
  }, [project]);

  // Unsaved-changes navigation guard — blocks tab close/reload when dirty
  // and opens a custom Save/Discard/Cancel modal for in-app navigation.
  const { confirmLeave, promptOpen, dismiss, proceed } = useUnsavedChangesPrompt(dirty, router);

  // Auto-open contacts accordion when returning from Client Contacts CRM
  useEffect(() => {
    try {
      const stored = localStorage.getItem('return_to_project');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.projectId === projectId) {
          setOpenSections(new Set(['contacts']));
          localStorage.removeItem('return_to_project');
          setTimeout(() => {
            document.getElementById('field-contacts-list')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 200);
        }
      }
    } catch { /* ignore */ }
  }, [projectId]);

  if (!project || !form) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
        <div className="text-center">
          <p style={{ color: '#8694a7', marginBottom: '12px', fontSize: '13px' }}>Project not found</p>
          <Link href="/potential-projects" style={{ color: '#2979ff', fontSize: '13px' }}>Back to Projects</Link>
        </div>
      </div>
    );
  }

  const isBidTracer = (form.data_source || 'Axiom') === 'Bid Tracer';
  const btStyle = isBidTracer ? disabledInputStyle : inputStyle;
  const validationErrors = getValidationErrors(form);
  const allRequirements = getRequiredFields(form.project_stage);
  const fulfilledCount = allRequirements.length - validationErrors.length;
  const stage = form.project_stage;
  const stageColors = STAGE_BADGE_COLORS[stage] || STAGE_BADGE_COLORS.Preliminary;

  function updateField(path, value) {
    if (isBidTracer) return; // Read-only for Bid Tracer
    setDirty(true);
    setSaveSuccess(false);
    setForm((prev) => {
      const updated = { ...prev };
      const parts = path.split('.');
      if (parts.length === 1) {
        updated[parts[0]] = value;
      } else if (parts.length === 2) {
        updated[parts[0]] = { ...updated[parts[0]], [parts[1]]: value };
      } else if (parts.length === 3) {
        updated[parts[0]] = { ...updated[parts[0]], [parts[1]]: { ...(updated[parts[0]]?.[parts[1]] || {}), [parts[2]]: value } };
      }
      return updated;
    });
  }

  function handleStageChange(newStage) {
    if (isBidTracer) return;

    // Check if moving forward in the pipeline — validate the *target* stage requirements against current form data
    const pipeline = ['Preliminary', 'Lead', 'Budget', 'Bid', 'Pending', 'Award'];
    const currentIdx = pipeline.indexOf(form.project_stage);
    const targetIdx = pipeline.indexOf(newStage);
    const isForward = targetIdx > currentIdx && currentIdx >= 0 && targetIdx >= 0;

    if (isForward) {
      const targetErrors = getValidationErrors(form, newStage);
      if (targetErrors.length > 0) {
        setStageBlockModal({ targetStage: newStage, missing: targetErrors });
        return;
      }
    }

    setDirty(true);
    setSaveSuccess(false);
    setForm((prev) => ({
      ...prev,
      project_stage: newStage,
      visited_stages: prev.visited_stages?.includes(newStage)
        ? prev.visited_stages
        : [...(prev.visited_stages || []), newStage],
    }));
  }

  function handleSave() {
    updateProject(projectId, form);
    setDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }

  function handleSendARRequest() {
    // Validate ALL pipeline requirements (Lead through Award)
    const allPipelineReqs = [];
    for (const s of ['Preliminary', 'Lead', 'Budget', 'Bid', 'Award']) {
      allPipelineReqs.push(...STAGE_REQUIREMENTS[s]);
    }
    const missing = allPipelineReqs.filter((r) => !checkRequirement(r, form));
    if (missing.length > 0) {
      setArValidationErrors(missing);
    } else {
      setArValidationErrors([]);
      startARWorkflow();
    }
  }

  function startARWorkflow() {
    setArWorkflowStep('syncing');
    setTimeout(() => {
      setArWorkflowStep('requesting');
      setTimeout(() => {
        const jobNumber = `AR-${Math.floor(100000 + Math.random() * 900000)}`;
        updateField('ar_job_number', jobNumber);
        setArWorkflowStep('done');
        setTimeout(() => {
          setArWorkflowStep(null);
          setArValidationErrors(null);
        }, 3500);
      }, 4000);
    }, 4000);
  }

  // --- Notes ---
  function addNote() {
    if (!noteText.trim()) return;
    const note = {
      id: crypto.randomUUID(),
      author: CURRENT_USER.name,
      created_at: new Date().toISOString(),
      body: noteText.trim(),
    };
    updateField('notes', [note, ...(form.notes || [])]);
    setNoteText('');
    setMentionOpen(false);
  }

  function deleteNote(id) {
    updateField('notes', (form.notes || []).filter((n) => n.id !== id));
  }

  function startEditNote(note) {
    setEditingNoteId(note.id);
    setEditNoteText(note.body);
  }

  function saveEditNote(id) {
    const updated = (form.notes || []).map((n) =>
      n.id === id ? { ...n, body: editNoteText, updated_at: new Date().toISOString() } : n
    );
    updateField('notes', updated);
    setEditingNoteId(null);
    setEditNoteText('');
  }

  function handleNoteInput(val) {
    setNoteText(val);
    const lastAt = val.lastIndexOf('@');
    if (lastAt >= 0 && (lastAt === 0 || val[lastAt - 1] === ' ')) {
      const filter = val.slice(lastAt + 1);
      if (!filter.includes(' ')) {
        setMentionOpen(true);
        setMentionFilter(filter.toLowerCase());
        return;
      }
    }
    setMentionOpen(false);
  }

  function insertMention(userName) {
    const lastAt = noteText.lastIndexOf('@');
    const newText = noteText.slice(0, lastAt) + `@${userName} `;
    setNoteText(newText);
    setMentionOpen(false);
  }

  const filteredUsers = USERS_LIST.filter((u) => u.toLowerCase().includes(mentionFilter));

  // --- Contacts ---
  const MULTI_ROLES = ['Client', 'Competitor'];
  const INTERNAL_ROLES = ['ACI/API/POC', 'CommissionedSalesPerson'];
  function isRoleAtLimit(role) {
    if (MULTI_ROLES.includes(role)) return false;
    return (form.contacts || []).some((c) => c.contact_role === role);
  }

  function markClientEnrolled(contactId) {
    updateField('contacts', (form.contacts || []).map((c) => (
      c.id === contactId
        ? { ...c, needs_vendor_enrollment: false, vendor_enrolled_at: new Date().toISOString() }
        : c
    )));
  }

  function addTeamMember(userName) {
    if (isRoleAtLimit(teamRoleToAdd)) {
      alert(`Only one ${teamRoleToAdd} is allowed per project. Remove the existing one first.`);
      return;
    }
    const contact = {
      id: crypto.randomUUID(),
      contact_role: teamRoleToAdd,
      name: userName,
      is_internal: true,
    };
    updateField('contacts', [...(form.contacts || []), contact]);
    setShowTeamSelector(false);
  }

  function goToCreateContact() {
    // Save current state first
    if (dirty) {
      updateProject(projectId, form);
      setDirty(false);
    }
    localStorage.setItem('return_to_project', JSON.stringify({ projectId, projectName: form.project_name }));
    router.push('/client-contacts');
  }


  function removeContact(id) {
    updateField('contacts', (form.contacts || []).filter((c) => c.id !== id));
  }

  // --- Estimators & Trades ---
  function addTrade() {
    if (!tradeForm.estimator) return;
    const trade = { id: crypto.randomUUID(), ...tradeForm };
    const trades = [...(form.bid_details?.trades || []), trade];
    setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, trades } }));
    setDirty(true);
    setTradeForm({ estimator: '', name: '', hours: '', cost: '' });
  }

  function removeTrade(id) {
    const trades = (form.bid_details?.trades || []).filter((t) => t.id !== id);
    setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, trades } }));
    setDirty(true);
  }

  // --- Lost Competitors ---
  function addLostCompetitor() {
    if (!competitorForm.name) return;
    const entry = { id: crypto.randomUUID(), ...competitorForm };
    const list = [...(form.loss_details?.competitors || []), entry];
    setForm((prev) => ({ ...prev, loss_details: { ...(prev.loss_details || {}), competitors: list } }));
    setDirty(true);
    setCompetitorForm({ name: '', bid_amount: '' });
  }

  function removeLostCompetitor(id) {
    const list = (form.loss_details?.competitors || []).filter((c) => c.id !== id);
    setForm((prev) => ({ ...prev, loss_details: { ...(prev.loss_details || {}), competitors: list } }));
    setDirty(true);
  }

  // --- Year Burns ---
  function addYearBurn() {
    const pct = parseFloat(yearBurnForm.percentage);
    if (!yearBurnForm.percentage || isNaN(pct) || pct <= 0) return;
    const burns = form.bid_details?.year_burns || [];
    if (burns.length >= 5) return;
    const currentTotal = burns.reduce((sum, b) => sum + (parseFloat(b.percentage) || 0), 0);
    const newTotal = currentTotal + pct;
    if (newTotal > 100) {
      setYearBurnError(`Adding ${yearBurnForm.percentage}% would bring the total to ${newTotal}%, which exceeds 100%.`);
      return;
    }
    setYearBurnError('');
    const yr = parseInt(yearBurnForm.year, 10) || (burns.length + 1);
    const newBurns = [...burns, { year: yr, percentage: pct, id: crypto.randomUUID() }];
    setForm((prev) => ({ ...prev, bid_details: { ...(prev.bid_details || {}), year_burns: newBurns } }));
    setDirty(true);
    setYearBurnForm({ year: newBurns.length + 1, percentage: '' });
  }

  function removeYearBurn(id) {
    const burns = (form.bid_details?.year_burns || []).filter((b) => b.id !== id);
    setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, year_burns: burns } }));
    setDirty(true);
  }

  const yearBurnTotal = (form.bid_details?.year_burns || []).reduce(
    (sum, b) => sum + (parseFloat(b.percentage) || 0), 0
  );

  function confirmDelete(type, id, label) {
    setPendingDelete({ type, id, label });
  }
  function executeDelete() {
    if (!pendingDelete) return;
    const { type, id } = pendingDelete;
    if (type === 'contact') removeContact(id);
    else if (type === 'note') deleteNote(id);
    else if (type === 'trade') removeTrade(id);
    else if (type === 'yearBurn') removeYearBurn(id);
    setPendingDelete(null);
  }
  function cancelDelete() { setPendingDelete(null); }

  function DeleteBtn({ type, id, label }) {
    const isActive = pendingDelete?.type === type && pendingDelete?.id === id;
    if (isActive) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#d32f2f', fontWeight: 500 }}>{pendingDelete.label}</span>
          <button onClick={executeDelete} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#fff', background: '#d32f2f', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes</button>
          <button onClick={cancelDelete} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#5a6577', background: '#e8ecf1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>No</button>
        </div>
      );
    }
    return (
      <button onClick={() => confirmDelete(type, id, label)} style={btnDanger}>
        <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    );
  }

  // Client slots drive multi-client budget/bid/award UX.
  const projectClients = form.client_slots || [];
  // Vendor enrollment is tracked on individual CRM contacts, not on slots.
  const pendingEnrollmentClients = (form.contacts || []).filter(
    (c) => c.contact_role === 'Client' && c.needs_vendor_enrollment
  );

  function dateWarning(dateStr) {
    if (!dateStr) return null;
    if (new Date(dateStr) < new Date(new Date().toDateString())) return 'This date is in the past';
    return null;
  }

  // Requirement → section key + scroll target
  const REQ_SECTION_MAP = {
    site_location: 'site-location',
    contacts: 'contacts',
    root: 'budget',
    contract_details: 'contract',
    bid_details: 'bid',
    award_details: 'award',
    loss_details: 'loss',
  };

  function getScrollTargetId(req) {
    if (req.fields && req.fields.length > 0) {
      if (req.section === 'root') return `field-${req.fields[0]}`;
      return `field-${req.section}-${req.fields[0]}`;
    }
    if (req.check === 'hasClientCompany' || req.check === 'hasOwnerCompany') return 'field-contacts-list';
    if (req.check === 'hasCostBreakdown') return 'field-bid_details-cost_breakdown';
    if (req.check === 'hasTrades') return 'field-bid_details-trades';
    if (req.check === 'hasYearBurns') return 'field-bid_details-year_burns';
    if (req.check === 'hasLostCompetitors') return 'field-loss_details-competitors';
    return null;
  }

  function scrollToRequirement(req) {
    const sectionKey = REQ_SECTION_MAP[req.section];
    if (!sectionKey) return;
    setOpenSections(new Set([sectionKey]));
    const targetId = getScrollTargetId(req);
    if (!targetId) return;
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight pulse
        el.classList.remove('field-highlight');
        void el.offsetWidth; // force reflow to restart animation
        el.classList.add('field-highlight');
        el.addEventListener('animationend', () => el.classList.remove('field-highlight'), { once: true });
      }
    }, 80);
  }

  // Shared button styles
  const btnPrimary = { padding: '5px 12px', fontSize: '11px', background: '#2979ff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 };
  const btnSecondary = { padding: '5px 12px', fontSize: '11px', color: '#3a4a5c', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 500 };
  const btnDanger = { color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' };
  const tagStyle = { display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', padding: '2px 6px', borderRadius: '12px', fontWeight: 500 };
  const subTableThStyle = { padding: '6px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#1e293b', background: '#dbe4f0' };

  return (
    <>
      {/* Page Header (Section 3.1) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#fff', borderBottom: '1px solid #d9dfe7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              confirmLeave(() => router.push('/potential-projects'));
            }}
            style={{ color: '#8694a7', textDecoration: 'none', display: 'flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            title="Back to Potential Projects"
          >
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div style={{ fontSize: '11px', color: '#5a6577' }}>Potential Projects</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{form.project_name}</h1>
              <span style={{ fontSize: '12px', color: '#5a6577', fontFamily: 'monospace' }}>{form.potential_project_number}</span>
              {(form.nda === 'Yes' || form.nda_project === true) && (
                <span style={{ fontSize: '10px', background: '#fef9c2', color: '#a36100', padding: '1px 6px', borderRadius: '12px', fontWeight: 600 }}>NDA</span>
              )}
              {isBidTracer && (
                <span style={{ fontSize: '10px', background: '#fff3cd', color: '#856404', padding: '1px 6px', borderRadius: '12px', fontWeight: 600 }}>Bid Tracer (Read-Only)</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {saveSuccess && <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 500 }}>Saved!</span>}
          {/* Send AR Job Creation Request - always visible (Section 3.1) */}
          <button
            onClick={handleSendARRequest}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '6px',
              border: '1px solid #c8d1dc', cursor: 'pointer', background: '#fff', color: '#1e293b',
            }}
          >
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send AR Job Creation Request
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || isBidTracer}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: 'none',
              cursor: dirty && !isBidTracer ? 'pointer' : 'not-allowed',
              background: dirty && !isBidTracer ? '#2979ff' : '#e8ecf1', color: dirty && !isBidTracer ? '#fff' : '#8694a7',
            }}
          >
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', paddingBottom: '120px', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Vendor Enrollment Alert — persists until ETL sync pulls enrolled-vendor info */}
        {pendingEnrollmentClients.length > 0 && (
          <div style={{
            background: '#fffbeb', border: '1px solid #f59e0b', borderLeft: '4px solid #f59e0b',
            borderRadius: '8px', padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg style={{ width: '20px', height: '20px', color: '#b45309', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#78350f' }}>
                  Vendor Enrollment Required — Client saved as placeholder
                </div>
                <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>
                  The client record will remain flagged until vendor enrollment is completed and basic info is pulled via ETL sync.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '30px' }}>
              {pendingEnrollmentClients.map((c) => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px', padding: '6px 10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px', background: '#b45309', color: '#fff', letterSpacing: '0.02em' }}>PLACEHOLDER</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#78350f' }}>{c.name}</span>
                    {c.company_name && <span style={{ fontSize: '11px', color: '#92400e' }}>({c.company_name})</span>}
                    <span style={{ fontSize: '10px', color: '#a16207' }}>— pending ETL sync</span>
                  </div>
                  {!isBidTracer && (
                    <button
                      onClick={() => markClientEnrolled(c.id)}
                      title="Simulate ETL sync completion (dev only)"
                      style={{
                        padding: '4px 10px', fontSize: '10px', fontWeight: 600,
                        background: '#fff', color: '#78350f', border: '1px solid #b45309',
                        borderRadius: '4px', cursor: 'pointer',
                      }}
                    >
                      Mark Enrolled
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Status */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', padding: '14px 20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#5a6577', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project Status</div>
          <StageSelector currentStage={form.project_stage} onStageChange={handleStageChange} disabled={isBidTracer} />
        </div>

        {/* 1. Project Overview */}
        <CollapsibleSection title="Project Overview" isOpen={openSections.has('overview')} onToggle={() => toggleSection('overview')}>
          <div style={grid4Style}>
            <div>
              <label style={labelStyle}>Division *</label>
              <select value={form.division} onChange={(e) => updateField('division', e.target.value)} style={btStyle} disabled={isBidTracer}>
                {DIVISIONS.map((d) => <option key={d.code} value={d.code}>{d.code} - {d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Project Number</label>
              <input type="text" value={form.potential_project_number} disabled style={disabledInputStyle} />
            </div>
            <div>
              <label style={labelStyle}>AR-Job Number</label>
              <input
                type="text"
                value={form.ar_job_number || ''}
                disabled
                placeholder="Not yet requested"
                style={{
                  ...disabledInputStyle,
                  ...(form.ar_job_number ? { color: '#15803d', fontWeight: 600, background: '#f0fdf4', borderColor: '#86efac' } : {}),
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Project Name *</label>
              <input type="text" value={form.project_name} onChange={(e) => updateField('project_name', e.target.value)} style={btStyle} disabled={isBidTracer} />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Description *</label>
              <textarea rows={2} value={form.description} onChange={(e) => updateField('description', e.target.value)} style={btStyle} disabled={isBidTracer} />
            </div>
            <div>
              <label style={labelStyle}>Probability % *</label>
              <input type="number" min={0} max={100} value={form.probability_percent} onChange={(e) => updateField('probability_percent', Number(e.target.value))} style={btStyle} disabled={isBidTracer} />
            </div>
            <div>
              <label style={labelStyle}>Bid Date *</label>
              <input type="date" value={form.bid_date} onChange={(e) => updateField('bid_date', e.target.value)} style={btStyle} disabled={isBidTracer} />
              {dateWarning(form.bid_date) && <p style={{ fontSize: '10px', color: '#a36100', marginTop: '2px' }}>{dateWarning(form.bid_date)}</p>}
            </div>
            <div>
              <label style={labelStyle}>Est. Project Start *</label>
              <input type="date" value={form.estimated_project_start} onChange={(e) => updateField('estimated_project_start', e.target.value)} style={btStyle} disabled={isBidTracer} />
              {dateWarning(form.estimated_project_start) && <p style={{ fontSize: '10px', color: '#a36100', marginTop: '2px' }}>{dateWarning(form.estimated_project_start)}</p>}
              {form.estimated_project_start && form.bid_date && form.estimated_project_start < form.bid_date && (
                <p style={{ fontSize: '10px', color: '#a36100', marginTop: '2px' }}>Start date is before bid date</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Project Type *</label>
              <select value={form.project_type} onChange={(e) => updateField('project_type', e.target.value)} style={btStyle} disabled={isBidTracer}>
                <option value="">Select...</option>
                {PROJECT_TYPES.map((t) => <option key={t.code} value={t.code}>{t.code} - {t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>NDA *</label>
              <select value={form.nda || (form.nda_project ? 'Yes' : '')} onChange={(e) => updateField('nda', e.target.value)} style={isBidTracer ? disabledInputStyle : yesNoStyle(form.nda || (form.nda_project ? 'Yes' : ''))} disabled={isBidTracer}>
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div id="field-contract_details-end_sector">
              <label style={labelStyle}>End Sector <RequiredBadge fieldKey="contract_details.end_sector" /></label>
              <select value={form.contract_details?.end_sector || ''} onChange={(e) => updateField('contract_details.end_sector', e.target.value)} style={btStyle} disabled={isBidTracer}>
                <option value="">Select...</option>
                {END_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Internal POC</label>
              <input
                type="text"
                value={form.internal_poc || ''}
                onChange={(e) => updateField('internal_poc', e.target.value)}
                style={btStyle}
                placeholder={form.created_by || 'Name'}
                disabled={isBidTracer}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Created</label>
              <input
                type="text"
                value={`${formatDateTimeMDY(form.created_at)} by ${form.created_by || ''}`}
                disabled
                style={disabledInputStyle}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* 2. Site Location (Section 5) */}
        <CollapsibleSection title="Site Location" isOpen={openSections.has('site-location')} onToggle={() => toggleSection('site-location')}>
          <div style={{ fontSize: '10px', color: '#8694a7', marginTop: '4px', marginBottom: '2px', fontStyle: 'italic' }}>
            Address autocomplete will be available when connected to Google Places API
          </div>
          <div style={gridStyle}>
            <div id="field-site_location-street" style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Street <RequiredBadge fieldKey="site_location.street" /></label>
              <input type="text" value={form.site_location?.street || ''} onChange={(e) => updateField('site_location.street', e.target.value)} style={btStyle} disabled={isBidTracer} />
            </div>
            <div>
              <label style={labelStyle}>City <RequiredBadge fieldKey="site_location.city" /></label>
              <input type="text" value={form.site_location?.city || ''} onChange={(e) => updateField('site_location.city', e.target.value)} style={btStyle} disabled={isBidTracer} />
            </div>
            <div>
              <label style={labelStyle}>State <RequiredBadge fieldKey="site_location.state" /></label>
              <select value={form.site_location?.state || ''} onChange={(e) => updateField('site_location.state', e.target.value)} style={btStyle} disabled={isBidTracer}>
                <option value="">Select state...</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Zip Code <RequiredBadge fieldKey="site_location.zip_code" /></label>
              <input type="text" value={form.site_location?.zip_code || ''} onChange={(e) => updateField('site_location.zip_code', e.target.value)} style={btStyle} disabled={isBidTracer} />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input type="text" value={form.site_location?.country || 'United States'} onChange={(e) => updateField('site_location.country', e.target.value)} style={btStyle} disabled={isBidTracer} />
            </div>
          </div>
        </CollapsibleSection>

        {/* 3. Contract Details (Section 7) */}
        <CollapsibleSection title="Contract Details" isOpen={openSections.has('contract')} onToggle={() => toggleSection('contract')}>
          <div style={grid4Style}>
            <div>
              <label style={labelStyle}>Square Footage</label>
              <input
                type="text"
                value={form.contract_details?.square_footage ? formatNumberCommas(form.contract_details.square_footage) : ''}
                onChange={(e) => updateField('contract_details.square_footage', e.target.value.replace(/[^0-9]/g, ''))}
                style={btStyle}
                placeholder="0"
                disabled={isBidTracer}
              />
            </div>
            <div id="field-contract_details-contract_type">
              <label style={labelStyle}>Contract Type <RequiredBadge fieldKey="contract_details.contract_type" /></label>
              <select value={form.contract_details?.contract_type || ''} onChange={(e) => updateField('contract_details.contract_type', e.target.value)} style={btStyle} disabled={isBidTracer}>
                <option value="">Select...</option>
                {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div id="field-contract_details-client_type">
              <label style={labelStyle}>Client Type <RequiredBadge fieldKey="contract_details.client_type" /></label>
              <select value={form.contract_details?.client_type || ''} onChange={(e) => updateField('contract_details.client_type', e.target.value)} style={btStyle} disabled={isBidTracer}>
                <option value="">Select...</option>
                {CLIENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Construction Type</label>
              <select value={form.contract_details?.construction_type || ''} onChange={(e) => updateField('contract_details.construction_type', e.target.value)} style={btStyle} disabled={isBidTracer}>
                <option value="">Select...</option>
                {CONSTRUCTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sales Tax Exempt</label>
              <select value={form.contract_details?.sales_tax_exempt || ''} onChange={(e) => updateField('contract_details.sales_tax_exempt', e.target.value)} style={isBidTracer ? disabledInputStyle : yesNoStyle(form.contract_details?.sales_tax_exempt)} disabled={isBidTracer}>
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Insurance Program</label>
              <select value={form.contract_details?.insurance_program || ''} onChange={(e) => updateField('contract_details.insurance_program', e.target.value)} style={btStyle} disabled={isBidTracer}>
                <option value="">Select...</option>
                {INSURANCE_PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                {form.contract_details?.insurance_program && !INSURANCE_PROGRAMS.includes(form.contract_details.insurance_program) && (
                  <option value={form.contract_details.insurance_program} disabled>
                    Unknown: {form.contract_details.insurance_program}
                  </option>
                )}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prime or Sub</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '2px' }}>
                {['Prime', 'Sub'].map((val, i) => {
                  const isActive = form.contract_details?.prime_or_sub === val;
                  return (
                    <button
                      key={val}
                      onClick={() => !isBidTracer && updateField('contract_details.prime_or_sub', val)}
                      style={{
                        padding: '6px 14px', fontSize: '12px', fontWeight: 600,
                        border: '1px solid', borderColor: isActive ? '#2979ff' : '#c8d1dc',
                        borderRadius: i === 0 ? '6px 0 0 6px' : '0 6px 6px 0',
                        borderLeft: i === 1 ? 'none' : undefined,
                        background: isActive ? '#2979ff' : (isBidTracer ? '#f5f7fa' : '#fff'),
                        color: isActive ? '#fff' : (isBidTracer ? '#8694a7' : '#5a6577'),
                        cursor: isBidTracer ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 4. Companies and Contacts (Section 10) */}
        <CollapsibleSection title="Companies and Contacts" badge={(form.client_slots?.length || 0) + (form.owner_slot?.company_name ? 1 : 0) + (form.competitor_slots?.length || 0) + (form.additional_companies?.length || 0)} isOpen={openSections.has('contacts')} onToggle={() => toggleSection('contacts')}>
          <div id="field-contacts-list" style={sectionSpacerStyle}>
            <CompaniesAndContacts
              form={form}
              setForm={setForm}
              setDirty={setDirty}
              setSaveSuccess={setSaveSuccess}
              isBidTracer={isBidTracer}
              clientContacts={clientContacts}
              COMPANY_TYPES={COMPANY_TYPES}
              RequiredBadge={RequiredBadge}
              goToCreateContact={goToCreateContact}
              btnPrimary={btnPrimary}
              btnSecondary={btnSecondary}
              btnDanger={btnDanger}
              inputStyle={inputStyle}
              labelStyle={labelStyle}
              disabledInputStyle={disabledInputStyle}
            />

            {/* Internal Team Assignments */}
            <div style={{ border: '1px solid #15803d33', borderRadius: '8px', overflow: 'hidden', background: '#fafbfc' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', background: '#15803d10', borderBottom: '1px solid #e8ecf1' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Internal Team</span>
                {!isBidTracer && (() => {
                  const allAssigned = INTERNAL_ROLES.every((r) => isRoleAtLimit(r));
                  return (
                  <button
                    onClick={allAssigned ? undefined : () => { setShowTeamSelector(!showTeamSelector); setTeamSearchQuery(''); }}
                    disabled={allAssigned}
                    title={allAssigned ? 'All internal roles (ACI/API/POC, Commissioned Sales Person) have been assigned' : undefined}
                    style={{ fontSize: '11px', fontWeight: 600, color: allAssigned ? '#8694a7' : '#15803d', background: 'none', border: `1px solid ${allAssigned ? '#c8d1dc' : '#15803d66'}`, borderRadius: '5px', padding: '3px 10px', cursor: allAssigned ? 'not-allowed' : 'pointer', opacity: allAssigned ? 0.6 : 1 }}
                  >
                    + Assign Member
                  </button>
                  );
                })()}
              </div>

              {/* Member list */}
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(form.contacts || []).filter((c) => c.is_internal || INTERNAL_ROLES.includes(c.contact_role)).length === 0 ? (
                  <p style={{ fontSize: '11px', color: '#8694a7', margin: 0 }}>No team members assigned.</p>
                ) : (
                  (form.contacts || []).filter((c) => c.is_internal || INTERNAL_ROLES.includes(c.contact_role)).map((c) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e8ecf1', borderRadius: '6px', padding: '6px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ ...tagStyle, background: '#dcfce7', color: '#15803d' }}>{c.contact_role}</span>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{c.name}</span>
                      </div>
                      {!isBidTracer && <DeleteBtn type="contact" id={c.id} label={`Remove ${c.name}?`} />}
                    </div>
                  ))
                )}

                {/* Picker */}
                {!isBidTracer && showTeamSelector && (() => {
                  const availableUsers = USERS_LIST.filter((u) => !(form.contacts || []).some((c) => c.is_internal && c.name === u && c.contact_role === teamRoleToAdd));
                  const q = teamSearchQuery.trim().toLowerCase();
                  const filteredUsers = q ? availableUsers.filter((u) => u.toLowerCase().includes(q)) : availableUsers;
                  return (
                    <div style={{ border: '1px solid #86efac', borderRadius: '6px', padding: '10px', background: 'rgba(220,252,231,0.15)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <svg style={{ width: '13px', height: '13px', position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#8694a7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input type="text" value={teamSearchQuery} onChange={(e) => setTeamSearchQuery(e.target.value)} placeholder="Search team members..." style={{ ...inputStyle, paddingLeft: '28px' }} autoFocus />
                        </div>
                        <select value={teamRoleToAdd} onChange={(e) => setTeamRoleToAdd(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
                          {INTERNAL_ROLES.map((r) => {
                            const atLimit = isRoleAtLimit(r);
                            return <option key={r} value={r} disabled={atLimit}>{r}{atLimit ? ' (assigned)' : ''}</option>;
                          })}
                        </select>
                        <button onClick={() => { setShowTeamSelector(false); setTeamSearchQuery(''); }} style={btnSecondary}>Cancel</button>
                      </div>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e8ecf1', borderRadius: '6px', background: '#fff' }}>
                        {filteredUsers.length === 0 ? (
                          <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#8694a7' }}>
                            {availableUsers.length === 0 ? 'All team members already assigned for this role.' : 'No team members match your search.'}
                          </div>
                        ) : (
                          filteredUsers.map((user) => (
                            <div key={user} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderBottom: '1px solid #f1f5f9' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg style={{ width: '13px', height: '13px', color: '#15803d' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{user}</span>
                              </div>
                              <button onClick={() => { addTeamMember(user); setTeamSearchQuery(''); }} style={{ ...btnPrimary, padding: '3px 10px', fontSize: '10px', background: '#15803d' }}>
                                + Assign
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>
        </CollapsibleSection>

        {/* 5. Notes (Section 6) */}
        <CollapsibleSection title="Notes" badge={form.notes?.length || 0} isOpen={openSections.has('notes')} onToggle={() => toggleSection('notes')}>
          <div style={sectionSpacerStyle}>
            {!isBidTracer && (
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => handleNoteInput(e.target.value)}
                    placeholder="Add a note... Use @name to mention someone"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={addNote} disabled={!noteText.trim()} style={{ ...btnPrimary, alignSelf: 'flex-end', background: noteText.trim() ? '#2979ff' : '#c8d1dc', cursor: noteText.trim() ? 'pointer' : 'not-allowed' }}>
                    Add
                  </button>
                </div>
                {mentionOpen && filteredUsers.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, background: '#fff', border: '1px solid #d9dfe7', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '160px', overflowY: 'auto', width: '200px', marginTop: '4px' }}>
                    {filteredUsers.map((u) => (
                      <button key={u} onClick={() => insertMention(u)} style={{ display: 'block', width: '100%', padding: '8px 12px', fontSize: '12px', color: '#1e293b', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        @{u}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {(form.notes || []).length === 0 ? (
              <p style={{ fontSize: '12px', color: '#8694a7' }}>No notes yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
                {(form.notes || []).map((note) => (
                  <div key={note.id} style={{ background: '#f8fafc', borderRadius: '6px', padding: '10px 12px', border: '1px solid #e8ecf1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{note.author}</span>
                        <span style={{ fontSize: '11px', color: '#8694a7' }}>{new Date(note.created_at).toLocaleString()}</span>
                        {note.updated_at && <span style={{ fontSize: '10px', color: '#8694a7', fontStyle: 'italic' }}>(edited)</span>}
                      </div>
                      {!isBidTracer && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => startEditNote(note)} style={{ ...btnDanger, color: '#2979ff' }}>
                            <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <DeleteBtn type="note" id={note.id} label={`Delete this note by ${note.author}?`} />
                        </div>
                      )}
                    </div>
                    {editingNoteId === note.id ? (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <textarea rows={2} value={editNoteText} onChange={(e) => setEditNoteText(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <button onClick={() => saveEditNote(note.id)} style={{ ...btnPrimary, fontSize: '11px', padding: '4px 10px' }}>Save</button>
                          <button onClick={() => setEditingNoteId(null)} style={{ ...btnSecondary, fontSize: '11px', padding: '4px 10px' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: '#3a4a5c', whiteSpace: 'pre-wrap', margin: 0 }}>{note.body}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* 6. Budget Details (Section 11) */}
        <CollapsibleSection title="Budget Details" isOpen={openSections.has('budget')} onToggle={() => toggleSection('budget')}>
          <div id="field-estimation_number" style={{ paddingTop: '12px' }}>
            {projectClients.length <= 1 ? (
              <>
                <label style={labelStyle}>Estimation Number <RequiredBadge fieldKey="estimation_number" /></label>
                <input type="text" value={form.estimation_number || ''} onChange={(e) => updateField('estimation_number', e.target.value)} style={{ ...btStyle, maxWidth: '300px' }} placeholder="Enter estimation number" disabled={isBidTracer} />
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Estimation Numbers <RequiredBadge fieldKey="estimation_number" /></label>
                {projectClients.map((client) => (
                  <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e8ecf1' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b', minWidth: '140px' }}>{client.company_name || '—'}</span>
                    <input
                      type="text"
                      value={(form.client_data || {})[client.id]?.estimation_number || ''}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          client_data: { ...(prev.client_data || {}), [client.id]: { ...((prev.client_data || {})[client.id] || {}), estimation_number: e.target.value } },
                        }));
                        setDirty(true);
                      }}
                      style={{ ...inputStyle, maxWidth: '240px' }}
                      placeholder="Estimation #"
                      disabled={isBidTracer}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* 7. Bid Details (Section 12) */}
        <CollapsibleSection title="Bid Details" isOpen={openSections.has('bid')} onToggle={() => toggleSection('bid')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>

            {/* Bid Date — read-only reference from Project Overview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e8ecf1', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#5a6577' }}>Bid Date:</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                {formatDateMDY(form.bid_date) || '—'}
              </span>
              <span style={{ fontSize: '10px', color: '#8694a7', fontStyle: 'italic', marginLeft: '6px' }}>
                (set in Project Overview)
              </span>
            </div>

            {/* --- Single client or no clients: show fields directly --- */}
            {projectClients.length <= 1 && (<>
              {/* Total Bid Cost + End Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Total Bid Cost</label>
                  <input type="text" value={formatNumberCommas(form.bid_details?.total_bid_cost)} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, total_bid_cost: parseCurrency(e.target.value) } })); setDirty(true); }} style={btStyle} placeholder="0" disabled={isBidTracer} />
                </div>
                <div id="field-bid_details-project_end_date">
                  <label style={labelStyle}>Project End Date <RequiredBadge fieldKey="bid_details.project_end_date" /></label>
                  <input type="date" value={form.bid_details?.project_end_date || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, project_end_date: e.target.value } })); setDirty(true); }} style={btStyle} disabled={isBidTracer} />
                </div>
              </div>

              {/* Cost Breakdown */}
              <fieldset id="field-bid_details-cost_breakdown" style={{ border: '1px solid #c8d1dc', borderRadius: '8px', padding: '12px 16px', margin: 0 }}>
                <legend style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', padding: '0 4px' }}>
                  Cost Breakdown <RequiredBadge fieldKey="bid_details.cost_breakdown" />
                </legend>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '4px' }}>
                  {[
                    { key: 'labor_cost', label: 'Labor Cost' },
                    { key: 'labor_hours', label: 'Labor Hours', isCurrency: false },
                    { key: 'material_cost', label: 'Material Cost' },
                    { key: 'equipment_cost', label: 'Equipment Cost' },
                    { key: 'subcontract_cost', label: 'Subcontract Cost' },
                    { key: 'other_cost', label: 'Other Cost' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}:</label>
                      <input
                        type="text"
                        value={formatNumberCommas(form.bid_details?.cost_breakdown?.[key])}
                        onChange={(e) => {
                          const val = parseCurrency(e.target.value);
                          const cb = { ...(form.bid_details?.cost_breakdown || {}), [key]: val };
                          setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, cost_breakdown: cb } }));
                          setDirty(true);
                        }}
                        style={inputStyle}
                        placeholder="0"
                        disabled={isBidTracer}
                      />
                    </div>
                  ))}
                </div>
                {(() => {
                  const cb = form.bid_details?.cost_breakdown || {};
                  const totalCost = [cb.labor_cost, cb.material_cost, cb.equipment_cost, cb.subcontract_cost, cb.other_cost]
                    .reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
                  return totalCost > 0 ? (
                    <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Total Cost: {formatCurrency(totalCost)}
                    </div>
                  ) : null;
                })()}
              </fieldset>
            </>)}

            {/* --- Multiple clients: per-client sub-accordions --- */}
            {projectClients.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div id="field-bid_details-project_end_date" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '4px' }}>
                  <div>
                    <label style={labelStyle}>Project End Date <RequiredBadge fieldKey="bid_details.project_end_date" /></label>
                    <input type="date" value={form.bid_details?.project_end_date || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, project_end_date: e.target.value } })); setDirty(true); }} style={btStyle} disabled={isBidTracer} />
                  </div>
                </div>
                {projectClients.map((client) => {
                  const cd = (form.client_data || {})[client.id] || {};
                  const clientBid = cd.bid_details || {};
                  const clientCB = clientBid.cost_breakdown || {};
                  const isClientOpen = openSections.has(`client-bid-${client.id}`);
                  const clientTotal = [clientCB.labor_cost, clientCB.material_cost, clientCB.equipment_cost, clientCB.subcontract_cost, clientCB.other_cost]
                    .reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

                  function updateClientBid(path, value) {
                    setForm((prev) => {
                      const prevCD = (prev.client_data || {})[client.id] || {};
                      const prevBid = prevCD.bid_details || {};
                      let newBid;
                      if (path === 'total_bid_cost') {
                        newBid = { ...prevBid, total_bid_cost: value };
                      } else {
                        newBid = { ...prevBid, cost_breakdown: { ...(prevBid.cost_breakdown || {}), [path]: value } };
                      }
                      return { ...prev, client_data: { ...(prev.client_data || {}), [client.id]: { ...prevCD, bid_details: newBid } } };
                    });
                    setDirty(true);
                  }

                  return (
                    <div key={client.id} style={{ border: '1px solid #c8d1dc', borderRadius: '8px', overflow: 'hidden' }}>
                      <button
                        onClick={() => toggleSection(`client-bid-${client.id}`)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', background: '#f1f5f9', border: 'none', cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{client.company_name || '—'}</span>
                          {client.client_type && <span style={{ fontSize: '10px', color: '#5a6577', marginLeft: '6px' }}>({client.client_type})</span>}
                          {clientBid.total_bid_cost && <span style={{ fontSize: '11px', fontWeight: 600, color: '#4338ca', marginLeft: '6px' }}>{formatCurrency(clientBid.total_bid_cost)}</span>}
                        </div>
                        <svg style={{ width: '14px', height: '14px', color: '#5a6577', transform: isClientOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isClientOpen && (
                        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={labelStyle}>Total Bid Cost</label>
                            <input
                              type="text"
                              value={formatNumberCommas(clientBid.total_bid_cost)}
                              onChange={(e) => updateClientBid('total_bid_cost', parseCurrency(e.target.value))}
                              style={{ ...btStyle, maxWidth: '240px' }} placeholder="0" disabled={isBidTracer}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            {[
                              { key: 'labor_cost', label: 'Labor Cost' },
                              { key: 'labor_hours', label: 'Labor Hours', isCurrency: false },
                              { key: 'material_cost', label: 'Material Cost' },
                              { key: 'equipment_cost', label: 'Equipment Cost' },
                              { key: 'subcontract_cost', label: 'Subcontract Cost' },
                              { key: 'other_cost', label: 'Other Cost' },
                            ].map(({ key, label }) => (
                              <div key={key}>
                                <label style={labelStyle}>{label}:</label>
                                <input
                                  type="text"
                                  value={formatNumberCommas(clientCB[key])}
                                  onChange={(e) => updateClientBid(key, parseCurrency(e.target.value))}
                                  style={inputStyle}
                                  placeholder="0"
                                  disabled={isBidTracer}
                                />
                              </div>
                            ))}
                          </div>
                          {clientTotal > 0 && (
                            <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                              Total Cost: {formatCurrency(clientTotal)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Estimators & Trades */}
            <div id="field-bid_details-trades">
              <label style={labelStyle}>
                Estimators &amp; Trades
                <RequiredBadge fieldKey="bid_details.trades" />
              </label>
              {(form.bid_details?.trades || []).length > 0 && (
                <div style={{ marginBottom: '10px', border: '1px solid #d9dfe7', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={subTableThStyle}>Estimator</th>
                        <th style={subTableThStyle}>Trade</th>
                        <th style={{ ...subTableThStyle, textAlign: 'right' }}>Hours</th>
                        <th style={{ ...subTableThStyle, textAlign: 'right' }}>Cost ($)</th>
                        <th style={{ ...subTableThStyle, width: '36px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(form.bid_details?.trades || []).map((t) => (
                        <tr key={t.id} style={{ borderTop: '1px solid #e8ecf1' }}>
                          <td style={{ padding: '7px 12px', fontWeight: 500, color: '#1e293b' }}>{t.estimator || '—'}</td>
                          <td style={{ padding: '7px 12px', color: t.name ? '#3a4a5c' : '#8694a7' }}>{t.name || '—'}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'right' }}>{t.hours ? formatNumberCommas(t.hours) : ''}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'right' }}>{t.cost ? formatCurrency(t.cost) : ''}</td>
                          <td style={{ padding: '7px 6px' }}>
                            {!isBidTracer && (
                              <DeleteBtn type="trade" id={t.id} label={`Remove ${t.name || t.estimator}?`} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!isBidTracer && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', color: '#8694a7', marginBottom: '2px' }}>Estimator <span style={{ color: '#d32f2f' }}>*</span></label>
                    <select value={tradeForm.estimator} onChange={(e) => setTradeForm((f) => ({ ...f, estimator: e.target.value }))} style={inputStyle}>
                      <option value="">Select estimator...</option>
                      {ESTIMATORS_LIST.map((e) => (
                        <option key={e.name} value={`${e.name} (${e.department})`}>{e.name} - {e.department}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', color: '#8694a7', marginBottom: '2px' }}>Trade <span style={{ color: '#8694a7', fontStyle: 'italic' }}>(optional)</span></label>
                    <select value={tradeForm.name} onChange={(e) => setTradeForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle}>
                      <option value="">Select trade...</option>
                      {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#8694a7', marginBottom: '2px' }}>Hours</label>
                    <input type="number" value={tradeForm.hours} onChange={(e) => setTradeForm((f) => ({ ...f, hours: e.target.value }))} style={{ ...inputStyle, width: '80px' }} placeholder="0" />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#8694a7', marginBottom: '2px' }}>Cost ($)</label>
                    <input type="text" value={tradeForm.cost} onChange={(e) => setTradeForm((f) => ({ ...f, cost: parseCurrency(e.target.value) }))} style={{ ...inputStyle, width: '90px' }} placeholder="0" />
                  </div>
                  <button
                    onClick={addTrade}
                    disabled={!tradeForm.estimator}
                    style={{ ...btnPrimary, opacity: tradeForm.estimator ? 1 : 0.5, cursor: tradeForm.estimator ? 'pointer' : 'not-allowed' }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Year Burns (Section 12 — 5 rows must = 100%) */}
            <div id="field-bid_details-year_burns">
              <label style={labelStyle}>Year Burns (5 Years) <RequiredBadge fieldKey="bid_details.year_burns" /></label>
              {(form.bid_details?.year_burns || []).length > 0 && (
                <div style={{ marginBottom: '10px', border: '1px solid #d9dfe7', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={subTableThStyle}>Year</th>
                        <th style={{ ...subTableThStyle, textAlign: 'right' }}>Percentage</th>
                        <th style={{ ...subTableThStyle, width: '36px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(form.bid_details?.year_burns || []).map((b) => (
                        <tr key={b.id} style={{ borderTop: '1px solid #e8ecf1' }}>
                          <td style={{ padding: '7px 12px' }}>Year {b.year}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'right' }}>{b.percentage}%</td>
                          <td style={{ padding: '7px 6px' }}>
                            {!isBidTracer && (
                              <DeleteBtn type="yearBurn" id={b.id} label={`Remove Year ${b.year} (${b.percentage}%)?`} />
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '1px solid #d9dfe7', fontWeight: 600, background: '#f8fafc' }}>
                        <td style={{ padding: '7px 12px' }}>Total</td>
                        <td style={{ padding: '7px 12px', textAlign: 'right', color: yearBurnTotal !== 100 && (form.bid_details?.year_burns || []).length === 5 ? '#d32f2f' : undefined }}>{yearBurnTotal}%</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                  {(form.bid_details?.year_burns || []).length === 5 && yearBurnTotal !== 100 && (
                    <div style={{ fontSize: '11px', color: '#d32f2f', padding: '8px 12px', background: '#fef2f2', borderTop: '1px solid #fecaca', fontWeight: 500 }}>
                      Year burn total must equal exactly 100%. Currently: {yearBurnTotal}%
                    </div>
                  )}
                </div>
              )}
              {(() => {
                const remaining = 100 - yearBurnTotal;
                const rowsLeft = 5 - (form.bid_details?.year_burns || []).length;
                if (isBidTracer || rowsLeft <= 0) return null;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                      <div><input type="number" min={1} max={5} value={yearBurnForm.year} onChange={(e) => { setYearBurnForm((f) => ({ ...f, year: e.target.value })); setYearBurnError(''); }} style={{ ...inputStyle, width: '100px' }} placeholder="Year" /></div>
                      <div><input type="number" min={0} max={remaining} value={yearBurnForm.percentage} onChange={(e) => { setYearBurnForm((f) => ({ ...f, percentage: e.target.value })); setYearBurnError(''); }} style={{ ...inputStyle, width: '100px' }} placeholder={`% (max ${remaining})`} /></div>
                      <button onClick={addYearBurn} style={btnPrimary}>Add</button>
                      <span style={{ fontSize: '11px', color: '#8694a7' }}>{rowsLeft} remaining &middot; <strong style={{ color: remaining > 0 ? '#2979ff' : '#15803d' }}>{remaining}%</strong> left to allocate</span>
                    </div>
                    {yearBurnError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#d32f2f', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontWeight: 500 }}>
                        <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {yearBurnError}
                        <button onClick={() => setYearBurnError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', padding: '0 2px', fontSize: '14px', lineHeight: 1 }}>&times;</button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Contract Summary Data (was: Request Link Data) */}
            <fieldset style={{ border: '1px solid #c8d1dc', borderRadius: '8px', padding: '12px 16px', margin: 0 }}>
              <legend style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', padding: '0 4px' }}>Contract Summary Data</legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '4px' }}>
                {[
                  { key: 'sales_tax_exempt', label: 'Sales Tax Exempt' },
                  { key: 'sub_tier_lien_waivers', label: 'Sub-Tier Lien Waivers' },
                  { key: 'certified_payroll', label: 'Certified Payroll' },
                  { key: 'prevailing_wage_scale', label: 'Prevailing Wage Scale' },
                  { key: 'bid_bond_req', label: 'Bid Bond Required' },
                  { key: 'bonded', label: 'Bonded' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <select value={form.bid_details?.[key] || 'No'} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, [key]: e.target.value } })); setDirty(true); }} style={isBidTracer ? disabledInputStyle : yesNoStyle(form.bid_details?.[key] || 'No')} disabled={isBidTracer}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <div>
                  <label style={labelStyle}>Liquidated Damages</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="text" value={form.bid_details?.liquidated_damages_amount || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, liquidated_damages_amount: e.target.value } })); setDirty(true); }} style={{ ...btStyle, flex: 1 }} placeholder="Amount" disabled={isBidTracer} />
                    <select value={form.bid_details?.liquidated_damages_per || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, liquidated_damages_per: e.target.value } })); setDirty(true); }} style={{ ...btStyle, width: '110px', flex: 'none' }} disabled={isBidTracer}>
                      <option value="">Per...</option>
                      {LIQUIDATED_DAMAGES_PER.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Proof to Proceed</label>
                  <select value={form.bid_details?.proof_to_proceed || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, proof_to_proceed: e.target.value } })); setDirty(true); }} style={btStyle} disabled={isBidTracer}>
                    <option value="">Select...</option>
                    {PROOF_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Document to Proceed</label>
                  <input type="text" value={form.bid_details?.document_to_proceed || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, document_to_proceed: e.target.value } })); setDirty(true); }} style={btStyle} placeholder="File reference (upload not available)" disabled={isBidTracer} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <div>
                  <label style={labelStyle}>Document ID</label>
                  <input type="text" value={form.bid_details?.document_id || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, document_id: e.target.value } })); setDirty(true); }} style={btStyle} placeholder="PO or reference number" disabled={isBidTracer} />
                </div>
                <div>
                  <label style={labelStyle}>Retainage %</label>
                  <input type="number" min={0} max={100} value={form.bid_details?.retainage_pct || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, retainage_pct: e.target.value } })); setDirty(true); }} style={btStyle} placeholder="0" disabled={isBidTracer} />
                </div>
                <div>
                  <label style={labelStyle}>Warranty (months)</label>
                  <input type="number" min={0} value={form.bid_details?.warranty_months || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, warranty_months: e.target.value } })); setDirty(true); }} style={btStyle} placeholder="12" disabled={isBidTracer} />
                </div>
                <div>
                  <label style={labelStyle}>GC Bill Day</label>
                  <input type="text" value={form.bid_details?.gc_bill_day || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, gc_bill_day: e.target.value } })); setDirty(true); }} style={btStyle} placeholder="e.g. 25" disabled={isBidTracer} />
                </div>
                <div>
                  <label style={labelStyle}>Suggested Job No</label>
                  <input type="text" value={form.bid_details?.suggested_job_no || ''} onChange={(e) => { setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, suggested_job_no: e.target.value } })); setDirty(true); }} style={btStyle} placeholder="Leave blank for sequential" disabled={isBidTracer} />
                </div>
              </div>

              {/* Documents Upload */}
              <div style={{ marginTop: '14px', borderTop: '1px solid #e8ecf1', paddingTop: '12px' }}>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>Documents</label>

                {/* Drag & Drop Zone */}
                {!isBidTracer && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDocDragOver(true); }}
                    onDragLeave={() => setDocDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDocDragOver(false);
                      const files = Array.from(e.dataTransfer.files || []);
                      files.forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const doc = { id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, data: reader.result, uploaded_at: new Date().toISOString() };
                          setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, documents: [...(prev.bid_details?.documents || []), doc] } }));
                          setDirty(true);
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    style={{
                      border: `2px dashed ${docDragOver ? '#2979ff' : '#c8d1dc'}`,
                      borderRadius: '8px', padding: '20px', textAlign: 'center',
                      background: docDragOver ? '#e3ecfa' : '#fafbfc',
                      transition: 'all 0.2s ease', marginBottom: '10px', cursor: 'pointer',
                    }}
                    onClick={() => document.getElementById('doc-file-input')?.click()}
                  >
                    <svg style={{ width: '28px', height: '28px', color: docDragOver ? '#2979ff' : '#8694a7', margin: '0 auto 6px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: docDragOver ? '#2979ff' : '#3a4a5c' }}>
                      {docDragOver ? 'Drop files here' : 'Drag & drop files here'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8694a7', marginTop: '2px' }}>or click to browse</div>
                    <input
                      id="doc-file-input"
                      type="file"
                      multiple
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((file) => {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const doc = { id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, data: reader.result, uploaded_at: new Date().toISOString() };
                            setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, documents: [...(prev.bid_details?.documents || []), doc] } }));
                            setDirty(true);
                          };
                          reader.readAsDataURL(file);
                        });
                        e.target.value = '';
                      }}
                    />
                  </div>
                )}

                {/* File List */}
                {(form.bid_details?.documents || []).length === 0 ? (
                  !isBidTracer ? null : <p style={{ fontSize: '11px', color: '#8694a7', margin: 0 }}>No documents.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(form.bid_details?.documents || []).map((doc) => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e8ecf1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <svg style={{ width: '14px', height: '14px', flexShrink: 0, color: '#5a6577' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <a href={doc.data} download={doc.name}
                            style={{ fontSize: '12px', fontWeight: 500, color: '#2979ff', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={doc.name}
                          >
                            {doc.name}
                          </a>
                          <span style={{ fontSize: '10px', color: '#8694a7', flexShrink: 0 }}>
                            {doc.size < 1024 ? `${doc.size} B` : doc.size < 1048576 ? `${(doc.size / 1024).toFixed(1)} KB` : `${(doc.size / 1048576).toFixed(1)} MB`}
                          </span>
                          <span style={{ fontSize: '10px', color: '#8694a7', flexShrink: 0 }}>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                        {!isBidTracer && (
                          <button
                            onClick={() => {
                              const docs = (form.bid_details?.documents || []).filter((d) => d.id !== doc.id);
                              setForm((prev) => ({ ...prev, bid_details: { ...prev.bid_details, documents: docs } }));
                              setDirty(true);
                            }}
                            style={btnDanger}
                          >
                            <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </fieldset>
          </div>
        </CollapsibleSection>

        {/* 8. Award Details (Section 13) */}
        <CollapsibleSection title="Award Details" isOpen={openSections.has('award')} onToggle={() => toggleSection('award')}>
          <div style={gridStyle}>
            {projectClients.length > 0 && (
              <div style={{ gridColumn: 'span 3' }}>
                <label style={labelStyle}>
                  Awarded Client {projectClients.length > 1 && <span style={{ color: '#d32f2f' }}>*</span>}
                  {projectClients.length > 1 && (
                    <span style={{ fontSize: '10px', fontWeight: 500, color: '#8694a7', marginLeft: '6px' }}>
                      — select the winning client ({projectClients.length} bid)
                    </span>
                  )}
                </label>
                <select
                  value={form.award_details?.awarded_client_id || ''}
                  onChange={(e) => updateField('award_details.awarded_client_id', e.target.value)}
                  style={{ ...btStyle, maxWidth: '480px' }}
                  disabled={isBidTracer || projectClients.length === 1}
                >
                  {projectClients.length > 1 && <option value="">Select winning client…</option>}
                  {projectClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}{c.client_type ? ` (${c.client_type})` : ''}
                    </option>
                  ))}
                </select>
                {projectClients.length === 1 && (
                  <p style={{ fontSize: '10px', color: '#8694a7', marginTop: '3px', fontStyle: 'italic' }}>
                    Only one client on this project — auto-selected.
                  </p>
                )}
              </div>
            )}
            <div id="field-award_details-awarded_date">
              <label style={labelStyle}>Awarded Date <RequiredBadge fieldKey="award_details.awarded_date" /></label>
              <input type="date" value={form.award_details?.awarded_date || ''} onChange={(e) => updateField('award_details.awarded_date', e.target.value)} style={btStyle} disabled={isBidTracer} />
            </div>
            <div>
              <label style={labelStyle}>Awarded Amount ($) <RequiredBadge fieldKey="award_details.awarded_amount" /></label>
              <input type="text" value={formatNumberCommas(form.award_details?.awarded_amount)} onChange={(e) => updateField('award_details.awarded_amount', parseCurrency(e.target.value))} style={btStyle} placeholder="0" disabled={isBidTracer} />
            </div>
            <div>
              <label style={labelStyle}>Awarded Cost ($) <RequiredBadge fieldKey="award_details.awarded_cost" /></label>
              <input type="text" value={formatNumberCommas(form.award_details?.awarded_cost)} onChange={(e) => updateField('award_details.awarded_cost', parseCurrency(e.target.value))} style={btStyle} placeholder="0" disabled={isBidTracer} />
            </div>
            <div>
              <label style={labelStyle}>Awarded Margin %</label>
              <input type="number" min={0} max={100} value={form.award_details?.awarded_margin_percent || ''} onChange={(e) => updateField('award_details.awarded_margin_percent', e.target.value)} style={btStyle} placeholder="0" disabled={isBidTracer} />
            </div>
            <div style={{ gridColumn: 'span 3', borderTop: '1px solid #e8ecf1', paddingTop: '8px', marginTop: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#5a6577', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Team Assignments</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div id="field-award_details-project_manager">
                  <label style={labelStyle}>Project Manager <RequiredBadge fieldKey="award_details.project_manager" /></label>
                  <input type="text" value={form.award_details?.project_manager || ''} onChange={(e) => updateField('award_details.project_manager', e.target.value)} style={btStyle} placeholder="Name" disabled={isBidTracer} />
                </div>
                <div>
                  <label style={labelStyle}>Superintendent</label>
                  <input type="text" value={form.award_details?.superintendent || ''} onChange={(e) => updateField('award_details.superintendent', e.target.value)} style={btStyle} placeholder="Name" disabled={isBidTracer} />
                </div>
                <div>
                  <label style={labelStyle}>Commissioned Sales Person</label>
                  <input type="text" value={form.award_details?.commissioned_sales_person || ''} onChange={(e) => updateField('award_details.commissioned_sales_person', e.target.value)} style={btStyle} placeholder="Name" disabled={isBidTracer} />
                </div>
                <div>
                  <label style={labelStyle}>Suggested Job No</label>
                  <input type="text" value={form.award_details?.suggested_job_no || ''} onChange={(e) => updateField('award_details.suggested_job_no', e.target.value)} style={btStyle} placeholder="Leave blank for sequential" disabled={isBidTracer} />
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 9. Loss Details (Section 14) */}
        <CollapsibleSection title="Loss Details" isOpen={openSections.has('loss')} onToggle={() => toggleSection('loss')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Feedback + Date of Notice */}
            <div style={gridStyle}>
              <div id="field-loss_details-feedback" style={{ gridColumn: 'span 3' }}>
                <label style={labelStyle}>Lost Feedback <RequiredBadge fieldKey="loss_details.feedback" /></label>
                <textarea rows={3} value={form.loss_details?.feedback || ''} onChange={(e) => updateField('loss_details.feedback', e.target.value)} style={btStyle} placeholder="Reason for loss..." disabled={isBidTracer} />
              </div>
              <div>
                <label style={labelStyle}>Date of Notice <RequiredBadge fieldKey="loss_details.date_of_notice" /></label>
                <input type="date" value={form.loss_details?.date_of_notice || ''} onChange={(e) => updateField('loss_details.date_of_notice', e.target.value)} style={btStyle} disabled={isBidTracer} />
              </div>
            </div>

            {/* Competitors — multi-row */}
            <div id="field-loss_details-competitors">
              <label style={labelStyle}>
                Competitors
                <RequiredBadge fieldKey="loss_details.competitors" />
              </label>
              {(form.loss_details?.competitors || []).length > 0 && (
                <div style={{ marginBottom: '10px', border: '1px solid #d9dfe7', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={subTableThStyle}>Competitor</th>
                        <th style={{ ...subTableThStyle, textAlign: 'right' }}>Bid Amount ($)</th>
                        <th style={{ ...subTableThStyle, width: '36px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(form.loss_details?.competitors || []).map((c) => (
                        <tr key={c.id} style={{ borderTop: '1px solid #e8ecf1' }}>
                          <td style={{ padding: '7px 12px', fontWeight: 500, color: '#1e293b' }}>{c.name}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'right' }}>{c.bid_amount ? formatCurrency(c.bid_amount) : '—'}</td>
                          <td style={{ padding: '7px 6px' }}>
                            {!isBidTracer && (
                              <button onClick={() => removeLostCompetitor(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', padding: '2px', display: 'flex' }}>
                                <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!isBidTracer && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', color: '#8694a7', marginBottom: '2px' }}>Competitor <span style={{ color: '#d32f2f' }}>*</span></label>
                    <select value={competitorForm.name} onChange={(e) => setCompetitorForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle}>
                      <option value="">Select competitor...</option>
                      {(form.competitor_slots || []).filter((s) => s.company_name && !(form.loss_details?.competitors || []).some((c) => c.name === s.company_name)).map((s) => (
                        <option key={s.id} value={s.company_name}>{s.company_name}</option>
                      ))}
                    </select>
                    {(form.competitor_slots || []).filter((s) => s.company_name && !(form.loss_details?.competitors || []).some((c) => c.name === s.company_name)).length === 0 && (
                      <p style={{ fontSize: '11px', color: '#8694a7', marginTop: '3px' }}>
                        {(form.competitor_slots || []).filter((s) => s.company_name).length === 0
                          ? 'No competitors added in Companies & Contacts.'
                          : 'All competitors have been added.'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#8694a7', marginBottom: '2px' }}>Bid Amount ($)</label>
                    <input type="text" value={formatNumberCommas(competitorForm.bid_amount)} onChange={(e) => setCompetitorForm((f) => ({ ...f, bid_amount: parseCurrency(e.target.value) }))} style={{ ...inputStyle, width: '120px' }} placeholder="0" />
                  </div>
                  <button
                    onClick={addLostCompetitor}
                    disabled={!competitorForm.name}
                    style={{ ...btnPrimary, opacity: competitorForm.name ? 1 : 0.5, cursor: competitorForm.name ? 'pointer' : 'not-allowed' }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Stage Transition Block Modal */}
      {stageBlockModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }} onClick={() => setStageBlockModal(null)}>
          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '440px', margin: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
              <svg style={{ width: '18px', height: '18px', color: '#d32f2f', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Cannot move to {stageBlockModal.targetStage}
              </h3>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <p style={{ fontSize: '12px', color: '#5a6577', margin: '0 0 12px 0' }}>
                The following requirements must be completed before transitioning to <strong>{stageBlockModal.targetStage}</strong>. Click any item to jump to the field.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                {stageBlockModal.missing.map((req, i) => {
                  const reqStage = Object.entries(STAGE_REQUIREMENTS).find(([, reqs]) => reqs.includes(req))?.[0];
                  const colors = STAGE_BADGE_COLORS[reqStage] || STAGE_BADGE_COLORS.Preliminary;
                  return (
                    <button
                      key={i}
                      onClick={() => { setStageBlockModal(null); scrollToRequirement(req); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                    >
                      <svg style={{ width: '12px', height: '12px', color: '#d32f2f', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500, flex: 1 }}>{req.label}</span>
                      {reqStage && (
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', background: colors.activeBg, color: '#fff', whiteSpace: 'nowrap' }}>{reqStage}</span>
                      )}
                      <svg style={{ width: '12px', height: '12px', color: '#8694a7', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 24px', borderTop: '1px solid #d9dfe7' }}>
              <button
                onClick={() => setStageBlockModal(null)}
                style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AR Job Creation Validation Modal */}
      {arValidationErrors !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }} onClick={() => { if (!arWorkflowStep) setArValidationErrors(null); }}>
          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '480px', margin: '16px' }} onClick={(e) => e.stopPropagation()}>
            {arWorkflowStep ? (
              <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                {arWorkflowStep === 'done' ? (
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', border: '2px solid #15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '22px', height: '22px', color: '#15803d' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <svg className="ar-spinner" style={{ width: '42px', height: '42px', color: '#2979ff' }} fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#e8ecf1" strokeWidth="3" />
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                <div style={{ fontSize: '14px', fontWeight: 600, color: arWorkflowStep === 'done' ? '#15803d' : '#1e293b', textAlign: 'center' }}>
                  {arWorkflowStep === 'syncing' ? 'Syncing data w/ Vista' : arWorkflowStep === 'requesting' ? 'Requesting AR Job Number' : 'AR Job Number Received'}
                </div>
                {arWorkflowStep === 'done' && (
                  <div style={{ fontSize: '12px', color: '#5a6577', textAlign: 'center' }}>
                    The job number has been recorded on this project.
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: arWorkflowStep === 'syncing' ? '#2979ff' : '#15803d' }} />
                    <span style={{ fontSize: '10px', color: arWorkflowStep === 'syncing' ? '#2979ff' : '#15803d', fontWeight: 600 }}>
                      Vista Sync {arWorkflowStep === 'syncing' ? '…' : '✓'}
                    </span>
                  </div>
                  <div style={{ width: '24px', height: '1px', background: '#d9dfe7' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: arWorkflowStep === 'requesting' ? '#2979ff' : arWorkflowStep === 'done' ? '#15803d' : '#d9dfe7' }} />
                    <span style={{ fontSize: '10px', color: arWorkflowStep === 'requesting' ? '#2979ff' : arWorkflowStep === 'done' ? '#15803d' : '#8694a7', fontWeight: 600 }}>
                      AR Request {arWorkflowStep === 'requesting' ? '…' : arWorkflowStep === 'done' ? '✓' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
                  <svg style={{ width: '18px', height: '18px', color: '#d97706', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Cannot Send AR Request</h3>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <p style={{ fontSize: '12px', color: '#5a6577', margin: '0 0 12px 0' }}>
                    The following <strong>{arValidationErrors.length}</strong> requirement{arValidationErrors.length > 1 ? 's' : ''} must be completed before submitting the AR Job Creation Request:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {arValidationErrors.map((req, i) => {
                      const reqStage = Object.entries(STAGE_REQUIREMENTS).find(([, reqs]) => reqs.includes(req))?.[0];
                      const colors = STAGE_BADGE_COLORS[reqStage] || STAGE_BADGE_COLORS.Preliminary;
                      return (
                        <button key={i} onClick={() => { setArValidationErrors(null); scrollToRequirement(req); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                        >
                          <svg style={{ width: '12px', height: '12px', color: '#d32f2f', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500, flex: 1 }}>{req.label}</span>
                          {reqStage && (
                            <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', background: colors.activeBg, color: '#fff', whiteSpace: 'nowrap' }}>{reqStage}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 24px', borderTop: '1px solid #d9dfe7' }}>
                  <button onClick={() => setArValidationErrors(null)} style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Dismiss
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Fixed Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: '220px', right: 0,
        background: '#fff', borderTop: '2px solid #d9dfe7', zIndex: 50,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 20px',
        }}>
          {/* Left: stage info + progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: stageColors.activeBg, color: '#fff' }}>{stage}</span>
            {isBidTracer ? (
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#8694a7', fontStyle: 'italic' }}>Bid Tracer — Read Only</span>
            ) : allRequirements.length > 0 ? (
              <>
                <span style={{ fontSize: '11px', fontWeight: 600, color: validationErrors.length === 0 ? '#15803d' : '#a36100' }}>
                  {fulfilledCount}/{allRequirements.length} complete
                </span>
                <div style={{ width: '80px', height: '4px', background: '#e8ecf1', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${allRequirements.length > 0 ? (fulfilledCount / allRequirements.length) * 100 : 0}%`,
                    height: '100%', background: validationErrors.length === 0 ? '#15803d' : stageColors.activeBg,
                    borderRadius: '2px', transition: 'width 0.3s ease',
                  }} />
                </div>
                <button
                  onClick={() => setBottomBarOpen(!bottomBarOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                >
                  <svg style={{ width: '14px', height: '14px', color: '#5a6577', transform: bottomBarOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </>
            ) : null}
          </div>

          {/* Right: save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saveSuccess && <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 500 }}>Saved!</span>}
            <button
              onClick={handleSave}
              disabled={!dirty || isBidTracer}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: 'none',
                cursor: dirty && !isBidTracer ? 'pointer' : 'not-allowed',
                background: dirty && !isBidTracer ? '#2979ff' : '#e8ecf1',
                color: dirty && !isBidTracer ? '#fff' : '#8694a7',
              }}
            >
              <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
          </div>
        </div>
        {!isBidTracer && bottomBarOpen && allRequirements.length > 0 && (
          <div style={{ padding: '0 20px 8px', maxHeight: '160px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
            {allRequirements.map((req, i) => {
              const met = checkRequirement(req, form);
              return (
                <button
                  key={i}
                  onClick={() => scrollToRequirement(req)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', padding: '3px 8px', minWidth: '200px',
                    background: 'none', border: '1px solid transparent', borderRadius: '4px', cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#d9dfe7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  {met ? (
                    <svg style={{ width: '12px', height: '12px', color: '#15803d', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg style={{ width: '12px', height: '12px', color: '#d32f2f', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /><circle cx="12" cy="12" r="9" strokeWidth={2} /></svg>
                  )}
                  <span style={{ color: met ? '#5a6577' : '#1e293b', fontWeight: met ? 400 : 500, textDecoration: met ? 'line-through' : 'none' }}>{req.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <UnsavedChangesModal
        open={promptOpen}
        saveDisabled={isBidTracer}
        onCancel={dismiss}
        onDiscard={() => { setDirty(false); proceed(); }}
        onSave={() => {
          if (isBidTracer) return;
          handleSave();
          proceed();
        }}
      />
    </>
  );
}
