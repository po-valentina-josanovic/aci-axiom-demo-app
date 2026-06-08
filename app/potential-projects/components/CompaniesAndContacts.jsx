'use client';

import { useMemo, useState } from 'react';

// Derive unique company options from the CRM pool (clientContacts).
function companyOptionsFromCRM(clientContacts) {
  const seen = new Map();
  for (const c of clientContacts || []) {
    if (c.company_name && !seen.has(c.company_name)) {
      seen.set(c.company_name, { name: c.company_name, city: c.company_city || '', state: c.company_state || '' });
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Contacts belonging to a given slot, filtered from the flat contacts array.
function contactsForSlot(contacts, slotId, role, companyName) {
  return (contacts || []).filter(
    (c) => c.slot_id === slotId || (c.contact_role === role && c.company_name === companyName && !c.slot_id)
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function CompaniesAndContacts({
  form, setForm, setDirty, setSaveSuccess,
  isBidTracer, clientContacts,
  COMPANY_TYPES,
  RequiredBadge, goToCreateContact,
  btnPrimary, btnSecondary, btnDanger,
  inputStyle, labelStyle, disabledInputStyle,
}) {
  const companies = useMemo(() => companyOptionsFromCRM(clientContacts), [clientContacts]);

  function mutate(fn) {
    if (isBidTracer) return;
    setDirty(true);
    setSaveSuccess(false);
    setForm(fn);
  }

  // ── Client slots ──────────────────────────────────────────────────────────
  function addClientSlot() {
    mutate((prev) => ({
      ...prev,
      client_slots: [...(prev.client_slots || []), { id: crypto.randomUUID(), company_name: '', client_type: '' }],
    }));
  }

  function updateClientSlot(id, patch) {
    mutate((prev) => ({
      ...prev,
      client_slots: (prev.client_slots || []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function removeClientSlot(id) {
    mutate((prev) => {
      const slot = (prev.client_slots || []).find((s) => s.id === id);
      return {
        ...prev,
        client_slots: (prev.client_slots || []).filter((s) => s.id !== id),
        contacts: (prev.contacts || []).filter(
          (c) => !(c.slot_id === id || (c.contact_role === 'Client' && c.company_name === slot?.company_name && !c.slot_id))
        ),
      };
    });
  }

  // ── Owner slot ────────────────────────────────────────────────────────────
  function updateOwnerSlot(patch) {
    mutate((prev) => ({
      ...prev,
      owner_slot: { ...(prev.owner_slot || {}), ...patch },
    }));
  }

  // ── Competitor slots ──────────────────────────────────────────────────────
  function addCompetitorSlot() {
    mutate((prev) => ({
      ...prev,
      competitor_slots: [...(prev.competitor_slots || []), { id: crypto.randomUUID(), company_name: '' }],
    }));
  }

  function updateCompetitorSlot(id, patch) {
    mutate((prev) => ({
      ...prev,
      competitor_slots: (prev.competitor_slots || []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function removeCompetitorSlot(id) {
    mutate((prev) => {
      const slot = (prev.competitor_slots || []).find((s) => s.id === id);
      return {
        ...prev,
        competitor_slots: (prev.competitor_slots || []).filter((s) => s.id !== id),
        contacts: (prev.contacts || []).filter(
          (c) => !(c.slot_id === id || (c.contact_role === 'Competitor' && c.company_name === slot?.company_name && !c.slot_id))
        ),
      };
    });
  }

  // ── Additional company slots ───────────────────────────────────────────────
  function addAdditionalCompany() {
    mutate((prev) => ({
      ...prev,
      additional_companies: [
        ...(prev.additional_companies || []),
        { id: crypto.randomUUID(), type: COMPANY_TYPES.find((t) => t !== 'Client' && t !== 'Owner') || 'Engineer', company_name: '' },
      ],
    }));
  }

  function updateAdditionalCompany(id, patch) {
    mutate((prev) => ({
      ...prev,
      additional_companies: (prev.additional_companies || []).map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  function removeAdditionalCompany(id) {
    mutate((prev) => {
      const entry = (prev.additional_companies || []).find((c) => c.id === id);
      return {
        ...prev,
        additional_companies: (prev.additional_companies || []).filter((c) => c.id !== id),
        contacts: (prev.contacts || []).filter(
          (c) => !(c.slot_id === id || (c.contact_role === entry?.type && c.company_name === entry?.company_name && !c.slot_id))
        ),
      };
    });
  }

  // ── Contact helpers ───────────────────────────────────────────────────────
  function addContactToSlot({ role, company, slotId }) {
    return (crm) => {
      if (isBidTracer) return;
      const contact = {
        id: crypto.randomUUID(),
        source_contact_id: crm.id,
        contact_role: role,
        name: crm.name,
        email: crm.email,
        phone: crm.phone,
        company_name: company,
        company_city: crm.company_city,
        company_state: crm.company_state,
        is_primary: crm.is_primary || false,
        slot_id: slotId,
      };
      setDirty(true);
      setSaveSuccess(false);
      setForm((prev) => ({ ...prev, contacts: [...(prev.contacts || []), contact] }));
    };
  }

  function removeContact(id) {
    if (isBidTracer) return;
    setDirty(true);
    setSaveSuccess(false);
    setForm((prev) => ({ ...prev, contacts: (prev.contacts || []).filter((c) => c.id !== id) }));
  }

  const clientSlots = form.client_slots || [];
  const ownerSlot = form.owner_slot || { company_name: '' };
  const competitorSlots = form.competitor_slots || [];
  const additionalCompanies = form.additional_companies || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* ── Clients ─────────────────────────────────────────────────────── */}
      <SlotGroup
        title="Clients"
        required
        accentColor="#2979ff"
        onAdd={!isBidTracer ? addClientSlot : null}
        addLabel="+ Add Client"
      >
        {clientSlots.length === 0 ? (
          <EmptySlotMsg>No clients added. Click "+ Add Client" to start.</EmptySlotMsg>
        ) : (
          clientSlots.map((slot, idx) => (
            <div key={slot.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid #e8ecf1' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 12px 6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#8694a7', width: '18px', flexShrink: 0, paddingBottom: '10px' }}>
                  #{idx + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>
                    Company <RequiredBadge fieldKey="client_company" />
                  </label>
                  <CompanySelect
                    value={slot.company_name}
                    onChange={(v) => updateClientSlot(slot.id, { company_name: v })}
                    companies={companies}
                    isBidTracer={isBidTracer}
                    inputStyle={inputStyle}
                    disabledInputStyle={disabledInputStyle}
                  />
                </div>
                {!isBidTracer && (
                  <button
                    onClick={() => removeClientSlot(slot.id)}
                    style={{ ...btnDanger, flexShrink: 0, marginBottom: '1px' }}
                    title="Remove client"
                  >
                    <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {slot.company_name && (
                <div style={{ paddingLeft: '30px', paddingRight: '12px', paddingBottom: '10px' }}>
                  <NestedContactList
                    company={slot.company_name}
                    role="Client"
                    contacts={contactsForSlot(form.contacts, slot.id, 'Client', slot.company_name)}
                    crmPool={clientContacts}
                    onAdd={addContactToSlot({ role: 'Client', company: slot.company_name, slotId: slot.id })}
                    onRemove={removeContact}
                    isBidTracer={isBidTracer}
                    btnPrimary={btnPrimary}
                    btnSecondary={btnSecondary}
                    btnDanger={btnDanger}
                    inputStyle={inputStyle}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </SlotGroup>

      {/* ── Owner ────────────────────────────────────────────────────────── */}
      <SlotGroup
        title="Owner"
        required
        accentColor="#15803d"
      >
        <div style={{ padding: '10px 12px' }}>
          <div style={{ marginBottom: '6px' }}>
            <label style={labelStyle}>
              Owner Company <RequiredBadge fieldKey="owner_company" />
            </label>
            <CompanySelect
              value={ownerSlot.company_name || ''}
              onChange={(v) => updateOwnerSlot({ company_name: v })}
              companies={companies}
              isBidTracer={isBidTracer}
              inputStyle={inputStyle}
              disabledInputStyle={disabledInputStyle}
            />
          </div>
          {ownerSlot.company_name && (
            <NestedContactList
              company={ownerSlot.company_name}
              role="Owner"
              contacts={contactsForSlot(form.contacts, 'owner', 'Owner', ownerSlot.company_name)}
              crmPool={clientContacts}
              onAdd={addContactToSlot({ role: 'Owner', company: ownerSlot.company_name, slotId: 'owner' })}
              onRemove={removeContact}
              isBidTracer={isBidTracer}
              btnPrimary={btnPrimary}
              btnSecondary={btnSecondary}
              btnDanger={btnDanger}
              inputStyle={inputStyle}
            />
          )}
        </div>
      </SlotGroup>

      {/* ── Competitors ──────────────────────────────────────────────────── */}
      <SlotGroup
        title="Competitors"
        optional
        accentColor="#d97706"
        onAdd={!isBidTracer ? addCompetitorSlot : null}
        addLabel="+ Add Competitor"
      >
        {competitorSlots.length === 0 ? (
          <EmptySlotMsg>No competitors tracked on this pursuit.</EmptySlotMsg>
        ) : (
          competitorSlots.map((slot, idx) => (
            <div key={slot.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid #e8ecf1' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 12px 6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#8694a7', width: '18px', flexShrink: 0, paddingBottom: '10px' }}>
                  #{idx + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Competitor Company</label>
                  <CompanySelect
                    value={slot.company_name}
                    onChange={(v) => updateCompetitorSlot(slot.id, { company_name: v })}
                    companies={companies}
                    isBidTracer={isBidTracer}
                    inputStyle={inputStyle}
                    disabledInputStyle={disabledInputStyle}
                  />
                </div>
                {!isBidTracer && (
                  <button
                    onClick={() => removeCompetitorSlot(slot.id)}
                    style={{ ...btnDanger, flexShrink: 0, marginBottom: '1px' }}
                    title="Remove competitor"
                  >
                    <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {slot.company_name && (
                <div style={{ paddingLeft: '30px', paddingRight: '12px', paddingBottom: '10px' }}>
                  <NestedContactList
                    company={slot.company_name}
                    role="Competitor"
                    contacts={contactsForSlot(form.contacts, slot.id, 'Competitor', slot.company_name)}
                    crmPool={clientContacts}
                    onAdd={addContactToSlot({ role: 'Competitor', company: slot.company_name, slotId: slot.id })}
                    onRemove={removeContact}
                    isBidTracer={isBidTracer}
                    btnPrimary={btnPrimary}
                    btnSecondary={btnSecondary}
                    btnDanger={btnDanger}
                    inputStyle={inputStyle}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </SlotGroup>

      {/* ── Additional Companies ──────────────────────────────────────────── */}
      {(() => {
        // Engineer and Architect are singletons — only one of each allowed.
        const SINGLETON_TYPES = ['Engineer', 'Architect'];
        const usedSingletons = new Set(
          additionalCompanies.filter((ac) => SINGLETON_TYPES.includes(ac.type)).map((ac) => ac.type)
        );
        // Block adding a new row if all singleton types are taken and nothing else is available.
        const availableTypes = COMPANY_TYPES.filter((t) => t !== 'Client' && t !== 'Owner' && (!SINGLETON_TYPES.includes(t) || !usedSingletons.has(t)));
        return (
      <SlotGroup
        title="Additional Companies"
        optional
        accentColor="#5a6577"
        onAdd={!isBidTracer ? addAdditionalCompany : null}
        addDisabled={!isBidTracer && availableTypes.length === 0}
        addDisabledTitle="All available company types (Engineer, Architect) have already been added"
        addLabel="+ Add Company"
      >
        {additionalCompanies.length === 0 ? (
          <EmptySlotMsg>No additional companies.</EmptySlotMsg>
        ) : (
          additionalCompanies.map((ac, idx) => (
            <div key={ac.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid #e8ecf1' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 12px 6px' }}>
                <div style={{ flex: '0 0 160px' }}>
                  <label style={labelStyle}>Type</label>
                  <select
                    value={ac.type}
                    onChange={(e) => updateAdditionalCompany(ac.id, { type: e.target.value })}
                    style={isBidTracer ? disabledInputStyle : inputStyle}
                    disabled={isBidTracer}
                  >
                    {COMPANY_TYPES.filter((t) => t !== 'Client' && t !== 'Owner').map((t) => {
                      const takenByOther = SINGLETON_TYPES.includes(t) && additionalCompanies.some((other) => other.id !== ac.id && other.type === t);
                      return (
                        <option key={t} value={t} disabled={takenByOther}>
                          {t}{takenByOther ? ' (already added)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Company</label>
                  <CompanySelect
                    value={ac.company_name}
                    onChange={(v) => updateAdditionalCompany(ac.id, { company_name: v })}
                    companies={companies}
                    isBidTracer={isBidTracer}
                    inputStyle={inputStyle}
                    disabledInputStyle={disabledInputStyle}
                  />
                </div>
                {!isBidTracer && (
                  <button
                    onClick={() => removeAdditionalCompany(ac.id)}
                    style={{ ...btnDanger, flexShrink: 0, marginBottom: '1px' }}
                    title="Remove company"
                  >
                    <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {ac.company_name && (
                <div style={{ paddingLeft: '12px', paddingRight: '12px', paddingBottom: '10px' }}>
                  <NestedContactList
                    company={ac.company_name}
                    role={ac.type}
                    contacts={contactsForSlot(form.contacts, ac.id, ac.type, ac.company_name)}
                    crmPool={clientContacts}
                    onAdd={addContactToSlot({ role: ac.type, company: ac.company_name, slotId: ac.id })}
                    onRemove={removeContact}
                    isBidTracer={isBidTracer}
                    btnPrimary={btnPrimary}
                    btnSecondary={btnSecondary}
                    btnDanger={btnDanger}
                    inputStyle={inputStyle}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </SlotGroup>
        );
      })()}

      {/* CRM link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>
        <svg style={{ width: '12px', height: '12px', color: '#8694a7', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span style={{ fontSize: '11px', color: '#8694a7' }}>Don't see a company or contact?</span>
        <button
          onClick={goToCreateContact}
          style={{ fontSize: '11px', color: '#2979ff', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
        >
          Go to Contact Manager →
        </button>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SlotGroup({ title, required, optional, accentColor, onAdd, addLabel, addDisabled, addDisabledTitle, children }) {
  return (
    <div style={{ border: `1px solid ${accentColor}33`, borderRadius: '8px', overflow: 'hidden', background: '#fafbfc' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 12px',
        background: `${accentColor}10`,
        borderBottom: '1px solid #e8ecf1',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          {required && <span style={{ fontSize: '10px', color: '#d32f2f', fontWeight: 700 }}>*</span>}
          {optional && <span style={{ fontSize: '10px', color: '#8694a7', fontStyle: 'italic' }}>(optional)</span>}
        </div>
        {(onAdd || addDisabled) && (
          <button
            onClick={addDisabled ? undefined : onAdd}
            disabled={addDisabled}
            title={addDisabled ? addDisabledTitle : undefined}
            style={{
              fontSize: '11px', fontWeight: 600,
              color: addDisabled ? '#8694a7' : accentColor,
              background: 'none',
              border: `1px solid ${addDisabled ? '#c8d1dc' : `${accentColor}66`}`,
              borderRadius: '5px', padding: '3px 10px',
              cursor: addDisabled ? 'not-allowed' : 'pointer',
              opacity: addDisabled ? 0.6 : 1,
            }}
          >
            {addLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptySlotMsg({ children }) {
  return (
    <p style={{ fontSize: '11px', color: '#8694a7', margin: 0, padding: '10px 12px' }}>
      {children}
    </p>
  );
}

function CompanySelect({ value, onChange, companies, isBidTracer, inputStyle, disabledInputStyle }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={isBidTracer ? disabledInputStyle : inputStyle}
      disabled={isBidTracer}
    >
      <option value="">Select company...</option>
      {companies.map((c) => (
        <option key={c.name} value={c.name}>
          {c.name}{c.city ? ` — ${c.city}${c.state ? `, ${c.state}` : ''}` : ''}
        </option>
      ))}
      {value && !companies.some((c) => c.name === value) && (
        <option value={value} disabled>Unknown: {value}</option>
      )}
    </select>
  );
}

function NestedContactList({ company, role, contacts, crmPool, onAdd, onRemove, isBidTracer, btnPrimary, btnSecondary, btnDanger }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const existingIds = new Set(contacts.map((c) => c.source_contact_id).filter(Boolean));
  const available = (crmPool || []).filter((c) => c.company_name === company && !existingIds.has(c.id));

  const crmById = useMemo(() => {
    const m = {};
    (crmPool || []).forEach((c) => { m[c.id] = c; });
    return m;
  }, [crmPool]);

  const sortedContacts = [...contacts].sort((a, b) => {
    const pa = a.is_primary || crmById[a.source_contact_id]?.is_primary || false;
    const pb = b.is_primary || crmById[b.source_contact_id]?.is_primary || false;
    if (pa && !pb) return -1;
    if (!pa && pb) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div style={{ marginTop: '6px' }}>
      {sortedContacts.length === 0 ? (
        <p style={{ fontSize: '11px', color: '#8694a7', margin: '0 0 6px 0' }}>No contacts selected for this company.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px' }}>
          {sortedContacts.map((c) => (
            <div
              key={c.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e8ecf1', borderRadius: '6px', padding: '5px 10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{c.name}</span>
                {c.is_primary && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '10px', background: '#fef9c2', color: '#a16207', border: '1px solid #fde047' }}>
                    <svg style={{ width: '9px', height: '9px' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    Primary
                  </span>
                )}
                {c.email && <span style={{ fontSize: '11px', color: '#8694a7' }}>{c.email}</span>}
              </div>
              {!isBidTracer && (
                <button onClick={() => onRemove(c.id)} style={btnDanger} title="Remove">
                  <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {!isBidTracer && available.length > 0 && (
        <>
          <button
            onClick={() => setPickerOpen((v) => !v)}
            style={{ ...btnSecondary, fontSize: '11px', padding: '4px 10px' }}
          >
            {pickerOpen ? 'Cancel' : `+ Add ${role} contact`}
          </button>
          {pickerOpen && (
            <div style={{ marginTop: '6px', border: '1px solid #e8ecf1', borderRadius: '6px', background: '#fff', maxHeight: '180px', overflowY: 'auto' }}>
              {available.map((crm) => (
                <div
                  key={crm.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{crm.name}</span>
                    {crm.is_primary && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '10px', background: '#fef9c2', color: '#a16207', border: '1px solid #fde047' }}>
                        <svg style={{ width: '9px', height: '9px' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        Primary
                      </span>
                    )}
                    {crm.email && <span style={{ fontSize: '11px', color: '#8694a7' }}>{crm.email}</span>}
                  </div>
                  <button
                    onClick={() => { onAdd(crm); setPickerOpen(false); }}
                    style={{ ...btnPrimary, padding: '3px 10px', fontSize: '10px' }}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
