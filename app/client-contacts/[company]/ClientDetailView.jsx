'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useProjects } from '../../potential-projects/components/ProjectsStore';
import ManageAddressesModal from '../components/ManageAddressesModal';

const inputStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };
const labelStyle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };
const thStyle = { padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: '10px', color: '#5a6577', background: '#f1f5f9', borderBottom: '1px solid #e8ecf1' };
const tdStyle = { padding: '8px 12px', fontSize: '12px', color: '#3a4a5c', borderBottom: '1px solid #f1f5f9' };

// Normalize roles: existing contacts may have contact_role (string) or roles (array)
function getRoles(c) {
  if (Array.isArray(c.roles) && c.roles.length > 0) return c.roles;
  if (c.contact_role) return [c.contact_role];
  return [];
}

// Group addresses that share the same physical location so Main/Billing (or
// Mailing/Shipping) collapse into one row when they were entered identically.
function groupAddresses(addresses) {
  const map = new Map();
  (addresses || []).forEach((a) => {
    const key = [a.street, a.city, a.state, a.zip, a.country].map((v) => (v || '').trim().toLowerCase()).join('|');
    if (!map.has(key)) map.set(key, { ...a, types: [a.type] });
    else map.get(key).types.push(a.type);
  });
  return Array.from(map.values());
}

const ADDRESS_TYPE_ICON_PATHS = {
  Main: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  Billing: 'M9 7h6m-6 4h6m-6 4h4M5 3h14a1 1 0 011 1v16l-3-2-3 2-3-2-3 2-3-2-3 2V4a1 1 0 011-1z',
  Mailing: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  Shipping: 'M3 16V8a1 1 0 011-1h9v9M3 16h10m0 0h4.5a1 1 0 00.9-.55L20 12h-6.5m0-5v5M6.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
};
const DEFAULT_ADDRESS_ICON_PATH = 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';

function AddressTypeIcon({ type }) {
  return (
    <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ADDRESS_TYPE_ICON_PATHS[type] || DEFAULT_ADDRESS_ICON_PATH} />
    </svg>
  );
}

// ── Role multi-select dropdown ──────────────────────────────────────────────
function RoleMultiSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function toggle(role) {
    onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role]);
  }

  const label = value.length === 0 ? 'Select roles...' : value.length === 1 ? value[0] : null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {value.length > 1 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#2979ff', color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
              {value.length}
            </span>
          )}
          <span style={{ color: value.length === 0 ? '#8694a7' : '#1e293b' }}>
            {label ?? 'Multiple roles selected'}
          </span>
        </span>
        <svg style={{ width: '12px', height: '12px', color: '#8694a7', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
        </svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0, zIndex: 100, background: '#fff', border: '1px solid #c8d1dc', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {options.map((role) => (
            <label
              key={role}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', cursor: 'pointer', background: value.includes(role) ? '#eff6ff' : 'transparent', userSelect: 'none' }}
            >
              <input
                type="checkbox"
                checked={value.includes(role)}
                onChange={() => toggle(role)}
                style={{ width: '13px', height: '13px', accentColor: '#2979ff', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: '12px', color: '#1e293b' }}>{role}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Primary toggle ──────────────────────────────────────────────────────────
function PrimaryToggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
        background: value ? '#eff6ff' : '#f8fafc',
        border: `1px solid ${value ? '#93c5fd' : '#e2e8f0'}`,
        borderRadius: '8px', padding: '10px 14px',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: '36px', height: '20px', borderRadius: '10px', flexShrink: 0, position: 'relative',
        background: value ? '#2979ff' : '#c8d1dc',
        transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: '3px',
          left: value ? '19px' : '3px',
          width: '14px', height: '14px', borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.15s',
        }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 500, color: value ? '#1d4ed8' : '#3a4a5c' }}>
        Make primary contact for this company
      </span>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ClientDetailView({ companyName }) {
  const { clientContacts, createClientContact, updateClientContact, deleteClientContact, setContactAsPrimary, clientCompanies, createClientCompany, updateClientCompany, CONTACT_ROLES, projects } = useProjects();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', roles: [], is_primary: false, address_id: '' });
  const [enrollmentAlert, setEnrollmentAlert] = useState(null);
  const [overrideConfirm, setOverrideConfirm] = useState(null); // { pendingSave, currentPrimaryName, newName }
  const [manageAddressesOpen, setManageAddressesOpen] = useState(false);

  // Contacts for this company — primary first, then alphabetical
  const companyContacts = useMemo(() =>
    clientContacts
      .filter((c) => (c.company_name || '') === companyName)
      .sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.name || '').localeCompare(b.name || '');
      }),
  [clientContacts, companyName]);

  const companyRecord = (clientCompanies || []).find((co) => co.company_name === companyName);
  const companyCity = companyRecord?.company_city || companyContacts[0]?.company_city || '';
  const companyState = companyRecord?.company_state || companyContacts[0]?.company_state || '';
  const enrollmentStatus = companyRecord?.vendor_enrollment || null;

  const contactJobsMap = useMemo(() => {
    const map = {};
    (projects || []).forEach((p) => {
      (p.contacts || []).forEach((c) => {
        if (!map[c.id]) map[c.id] = [];
        map[c.id].push({ id: p.id, name: p.project_name, number: p.potential_project_number, stage: p.project_stage });
      });
    });
    return map;
  }, [projects]);

  const companyProjects = useMemo(() => {
    const seen = new Set();
    const result = [];
    companyContacts.forEach((c) => {
      (contactJobsMap[c.id] || []).forEach((j) => {
        if (!seen.has(j.id)) { seen.add(j.id); result.push(j); }
      });
    });
    return result;
  }, [companyContacts, contactJobsMap]);

  const companyAddresses = companyRecord?.addresses || [];
  const addressGroups = useMemo(() => groupAddresses(companyAddresses), [companyAddresses]);

  function addressLabel(addressId) {
    const addr = companyAddresses.find((a) => a.id === addressId);
    if (!addr) return null;
    return `${addr.type} — ${[addr.city, addr.state].filter(Boolean).join(', ')}`;
  }

  function handleSaveAddresses(addresses) {
    const main = addresses.find((a) => a.type === 'Main');
    const updates = { addresses };
    if (main?.city) updates.company_city = main.city;
    if (main?.state) updates.company_state = main.state;
    if (companyRecord) {
      updateClientCompany(companyRecord.id, updates);
    } else {
      createClientCompany({ company_name: companyName, ...updates });
    }
  }

  function openAddModal() {
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', roles: [], is_primary: false, address_id: '' });
    setModalOpen(true);
  }

  function openEditModal(contact) {
    setEditingId(contact.id);
    setForm({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      roles: getRoles(contact),
      is_primary: !!contact.is_primary,
      address_id: contact.address_id || '',
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const firstRole = form.roles[0] || 'Client';
    const isClient = form.roles.includes('Client');
    const existingPrimary = companyContacts.find((c) => c.is_primary && c.id !== editingId);

    // If trying to set primary but someone else is already primary → show override confirm
    if (form.is_primary && existingPrimary) {
      setOverrideConfirm({
        currentPrimaryName: existingPrimary.name,
        newName: form.name.trim(),
        pendingSave: { firstRole, isClient },
      });
      return;
    }

    commitSave({ firstRole, isClient, setPrimary: form.is_primary });
  }

  function commitSave({ firstRole, isClient, setPrimary }) {
    const name = form.name.trim();
    if (editingId) {
      updateClientContact(editingId, { name, email: form.email, phone: form.phone, roles: form.roles, contact_role: firstRole, address_id: form.address_id || null });
      if (setPrimary) setContactAsPrimary(editingId);
    } else {
      const created = createClientContact({
        name, email: form.email, phone: form.phone,
        roles: form.roles, contact_role: firstRole,
        company_name: companyName, company_city: companyCity, company_state: companyState,
        address_id: form.address_id || null,
      });
      if (setPrimary && created?.id) setContactAsPrimary(created.id);
      if (isClient) {
        const hasExistingClient = companyContacts.some((c) => {
          const roles = Array.isArray(c.contact_role) ? c.contact_role : [c.contact_role];
          return roles.includes('Client');
        });
        if (!hasExistingClient) {
          if (companyRecord) {
            updateClientCompany(companyRecord.id, { vendor_enrollment: 'pending' });
          } else {
            createClientCompany({ company_name: companyName, company_city: companyCity, company_state: companyState, vendor_enrollment: 'pending' });
          }
          setEnrollmentAlert(name);
        }
      }
    }
    setModalOpen(false);
    setEditingId(null);
    setOverrideConfirm(null);
  }

  function markCompanyEnrollmentComplete() {
    if (companyRecord) updateClientCompany(companyRecord.id, { vendor_enrollment: 'completed' });
  }

  const STAGE_COLORS = {
    Preliminary: { bg: '#e8ecf1', color: '#1e293b' },
    Lead: { bg: '#dbe4f0', color: '#2979ff' },
    Budget: { bg: '#e0e7ff', color: '#4338ca' },
    Bid: { bg: '#f3e8ff', color: '#7c3aed' },
    Award: { bg: '#dcfce7', color: '#15803d' },
    Lost: { bg: '#ffe2e2', color: '#d32f2f' },
    Pending: { bg: '#fef9c2', color: '#a36100' },
    Cancel: { bg: '#e8ecf1', color: '#5a6577' },
  };

  const roleOptions = (CONTACT_ROLES || []).filter((r) => r !== 'ACI/API/POC' && r !== 'CommissionedSalesPerson');

  return (
    <>
      {/* Header */}
      <div style={{ padding: '10px 20px', background: '#fff', borderBottom: '1px solid #d9dfe7' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/client-contacts" style={{ color: '#8694a7', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <div style={{ fontSize: '10px', color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '1px' }}>
                Contacts Management
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ width: '18px', height: '18px', color: '#5a6577' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{companyName}</h1>
                {companyCity && (
                  <span style={{ fontSize: '12px', color: '#8694a7' }}>
                    {companyCity}{companyState ? `, ${companyState}` : ''}
                  </span>
                )}
                {enrollmentStatus === 'pending' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: '#b45309', background: '#fffbeb', border: '1px solid #f9a825', padding: '2px 8px', borderRadius: '10px' }}>
                      <svg style={{ width: '9px', height: '9px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Vendor Enrollment Pending
                    </span>
                    <button
                      onClick={markCompanyEnrollmentComplete}
                      title="Mark vendor enrollment as completed"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, color: '#15803d', background: '#dcfce7', border: '1px solid #86efac', padding: '2px 8px', borderRadius: '10px', cursor: 'pointer' }}
                    >
                      <svg style={{ width: '9px', height: '9px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Mark Complete
                    </button>
                  </span>
                )}
                {enrollmentStatus === 'completed' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: '#15803d', background: '#dcfce7', border: '1px solid #86efac', padding: '2px 8px', borderRadius: '10px' }}>
                    <svg style={{ width: '9px', height: '9px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Vendor Enrolled
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 cursor-pointer"
            style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: '#fff', background: '#2979ff', border: '1px solid #2979ff', borderRadius: '6px' }}
          >
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Contact
          </button>
        </div>
      </div>

      {/* Vendor Enrollment Popup */}
      {enrollmentAlert && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }} onClick={() => setEnrollmentAlert(null)}>
          <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', margin: '16px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fef3c7', border: '2px solid #f9a825', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg style={{ width: '18px', height: '18px', color: '#b45309' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e' }}>Vendor Enrollment Needed</div>
                <div style={{ fontSize: '11px', color: '#b45309', marginTop: '1px' }}>Action required</div>
              </div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: '#3a4a5c', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                <strong>{enrollmentAlert}</strong> has been added as a Client contact.
              </p>
              <p style={{ fontSize: '12px', color: '#5a6577', margin: 0, lineHeight: 1.5 }}>
                Please initiate the vendor enrollment process for this contact. You can track the enrollment status in the Vendor Enrollment column.
              </p>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e8ecf1', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setEnrollmentAlert(null)} style={{ padding: '7px 18px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#f9a825', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', background: '#f1f5f9' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', padding: '14px 18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                {(companyRecord?.company_group || []).length === 0 ? '—' : companyRecord.company_group.join(' / ')}
              </div>
              <div style={{ fontSize: '11px', color: '#8694a7', fontWeight: 500, marginTop: '4px' }}>Company Group</div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', padding: '14px 18px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(companyRecord?.company_type || []).length === 0 ? (
                  <span style={{ fontSize: '13px', color: '#8694a7' }}>—</span>
                ) : (
                  companyRecord.company_type.map((t) => (
                    <span key={t} style={{ fontSize: '10px', fontWeight: 600, color: '#3a4a5c', border: '1px solid #c8d1dc', borderRadius: '10px', padding: '2px 8px' }}>{t}</span>
                  ))
                )}
              </div>
              <div style={{ fontSize: '11px', color: '#8694a7', fontWeight: 500, marginTop: '4px' }}>Company Roles</div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', padding: '14px 18px' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{companyContacts.length}</div>
              <div style={{ fontSize: '11px', color: '#8694a7', fontWeight: 500 }}>Contacts</div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', padding: '14px 18px' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{companyProjects.length}</div>
              <div style={{ fontSize: '11px', color: '#8694a7', fontWeight: 500 }}>Linked Projects</div>
            </div>
          </div>

          {/* Addresses */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>Addresses</div>
              <button
                onClick={() => setManageAddressesOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Manage Addresses
              </button>
            </div>
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: '70px' }}></th>
                    <th style={thStyle}>Street</th>
                    <th style={thStyle}>City</th>
                    <th style={thStyle}>State</th>
                    <th style={thStyle}>Zip Code</th>
                    <th style={thStyle}>Country</th>
                  </tr>
                </thead>
                <tbody>
                  {addressGroups.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#8694a7', fontSize: '12px' }}>
                        No addresses yet. Click "Manage Addresses" to add one.
                      </td>
                    </tr>
                  ) : (
                    addressGroups.map((addr, idx) => (
                      <tr key={idx} style={{ background: '#fff' }}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '5px', color: '#5a6577' }}>
                            {addr.types.map((t) => <span key={t} title={t}><AddressTypeIcon type={t} /></span>)}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, color: '#1e293b' }}>{addr.street}</td>
                        <td style={tdStyle}>{addr.city}</td>
                        <td style={tdStyle}>{addr.state}</td>
                        <td style={tdStyle}>{addr.zip}</td>
                        <td style={tdStyle}>{addr.country}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contacts Table */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Contacts</div>
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Address</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Projects</th>
                    <th style={{ ...thStyle, width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {companyContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: '#8694a7', fontSize: '12px' }}>
                        No contacts yet. Click "Add Contact" to create one.
                      </td>
                    </tr>
                  ) : (
                    companyContacts.map((c) => (
                      <tr key={c.id} style={{ background: '#fff' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fafbfc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                      >
                        {/* Name + primary indicator */}
                        <td style={{ ...tdStyle, fontWeight: 500, color: '#1e293b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {c.name}
                            {c.is_primary && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', padding: '1px 7px' }}>
                                Primary
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Role badges */}
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {getRoles(c).map((r) => (
                              <span key={r} style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '10px', background: '#dbe4f0', color: '#2979ff' }}>{r}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, color: '#5a6577' }}>
                          {addressLabel(c.address_id) || <span style={{ fontSize: '10px', color: '#c8d1dc' }}>—</span>}
                        </td>
                        <td style={{ ...tdStyle, color: '#5a6577' }}>{c.email}</td>
                        <td style={{ ...tdStyle, color: '#5a6577' }}>{c.phone}</td>
                        <td style={tdStyle}>
                          {(contactJobsMap[c.id] || []).length === 0 ? (
                            <span style={{ fontSize: '10px', color: '#c8d1dc' }}>—</span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {(contactJobsMap[c.id] || []).map((job) => (
                                <Link key={job.id} href={`/potential-projects/${job.id}`}
                                  style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '10px', background: '#e0e7ff', color: '#4338ca', textDecoration: 'none', whiteSpace: 'nowrap' }}
                                  title={`${job.number} — ${job.name} (${job.stage})`}
                                >
                                  {job.number}
                                </Link>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => openEditModal(c)} style={{ color: '#2979ff', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                              <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => deleteClientContact(c.id)} style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                              <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Linked Projects */}
          {companyProjects.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Linked Projects</div>
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Project #</th>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Contacts on Project</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyProjects.map((job, idx) => {
                      const projectContacts = companyContacts.filter((c) =>
                        (contactJobsMap[c.id] || []).some((j) => j.id === job.id)
                      );
                      const sc = STAGE_COLORS[job.stage] || STAGE_COLORS.Preliminary;
                      return (
                        <tr key={job.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                          <td style={tdStyle}>
                            <Link href={`/potential-projects/${job.id}`} style={{ color: '#2979ff', fontWeight: 600, textDecoration: 'none', fontSize: '12px' }}>
                              {job.number}
                            </Link>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 500, color: '#1e293b' }}>{job.name}</td>
                          <td style={tdStyle}>
                            <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: sc.bg, color: sc.color }}>
                              {job.stage}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {projectContacts.map((c) => (
                                <span key={c.id} style={{ fontSize: '10px', fontWeight: 500, padding: '1px 6px', borderRadius: '10px', background: '#f1f5f9', color: '#3a4a5c', border: '1px solid #e8ecf1' }}>
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Override Primary Confirmation */}
      {overrideConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.3)', width: '100%', maxWidth: '480px', margin: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e8ecf1' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Override Primary Contact</h2>
              <button onClick={() => setOverrideConfirm(null)} style={{ color: '#8694a7', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: '#3a4a5c', margin: 0, lineHeight: 1.6 }}>
                Are you sure you want to override{' '}
                <strong style={{ color: '#1e293b' }}>'{overrideConfirm.currentPrimaryName}'</strong>
                {' '}and make{' '}
                <strong style={{ color: '#1e293b' }}>'{overrideConfirm.newName}'</strong>
                {' '}the new primary contact?
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', padding: '14px 20px', borderTop: '1px solid #e8ecf1' }}>
              <button
                onClick={() => commitSave({ ...overrideConfirm.pendingSave, setPrimary: false })}
                style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#4b5563', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Save as regular
              </button>
              <button
                onClick={() => setOverrideConfirm(null)}
                style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 500, color: '#3a4a5c', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => commitSave({ ...overrideConfirm.pendingSave, setPrimary: true })}
                style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#d32f2f', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '540px', margin: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{editingId ? 'Edit Contact' : 'Add Contact'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ color: '#8694a7', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Name <span style={{ color: '#d32f2f', marginLeft: '2px' }}>*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                    placeholder="Full name"
                    autoFocus
                  />
                </div>
                <div>
                  <label style={labelStyle}>Role <span style={{ color: '#d32f2f', marginLeft: '2px' }}>*</span></label>
                  <RoleMultiSelect
                    value={form.roles}
                    onChange={(roles) => setForm((f) => ({ ...f, roles }))}
                    options={roleOptions}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    style={inputStyle}
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Address</label>
                  <select value={form.address_id} onChange={(e) => setForm((f) => ({ ...f, address_id: e.target.value }))} style={inputStyle}>
                    <option value="">Select address...</option>
                    {companyAddresses.map((a) => (
                      <option key={a.id} value={a.id}>{a.type} — {a.street}, {a.city}</option>
                    ))}
                  </select>
                </div>
              </div>
              <PrimaryToggle
                value={form.is_primary}
                onChange={(v) => setForm((f) => ({ ...f, is_primary: v }))}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '14px 24px', borderTop: '1px solid #d9dfe7' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 500, color: '#3a4a5c', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                style={{
                  padding: '7px 16px', fontSize: '12px', fontWeight: 600, color: '#fff',
                  background: form.name.trim() ? '#2979ff' : '#c8d1dc',
                  border: 'none', borderRadius: '6px', cursor: form.name.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {editingId ? 'Save Changes' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ManageAddressesModal
        open={manageAddressesOpen}
        onClose={() => setManageAddressesOpen(false)}
        company={companyRecord}
        onSave={handleSaveAddresses}
      />
    </>
  );
}
