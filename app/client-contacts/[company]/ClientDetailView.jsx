'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useProjects } from '../../potential-projects/components/ProjectsStore';

const inputStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };
const labelStyle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };
const thStyle = { padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: '10px', color: '#5a6577', background: '#f1f5f9', borderBottom: '1px solid #e8ecf1' };
const tdStyle = { padding: '8px 12px', fontSize: '12px', color: '#3a4a5c', borderBottom: '1px solid #f1f5f9' };

export default function ClientDetailView({ companyName }) {
  const { clientContacts, createClientContact, updateClientContact, deleteClientContact, CONTACT_ROLES, US_STATES, projects } = useProjects();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company_name: companyName, company_city: '', company_state: '', contact_role: 'Client' });
  const [enrollmentAlert, setEnrollmentAlert] = useState(null); // contact name that just triggered alert

  // Contacts for this company
  const companyContacts = useMemo(() =>
    clientContacts.filter((c) => (c.company_name || '') === companyName),
  [clientContacts, companyName]);

  // Company info from first contact
  const companyCity = companyContacts[0]?.company_city || '';
  const companyState = companyContacts[0]?.company_state || '';

  // Map contact id -> projects
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

  // All unique projects for this company
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

  function openAddModal() {
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', company_name: companyName, company_city: companyCity, company_state: companyState, contact_role: 'Client' });
    setModalOpen(true);
  }

  function openEditModal(contact) {
    setEditingId(contact.id);
    setForm({
      name: contact.name, email: contact.email || '', phone: contact.phone || '',
      company_name: contact.company_name || companyName, company_city: contact.company_city || '',
      company_state: contact.company_state || '', contact_role: contact.contact_role || 'Client',
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editingId) {
      updateClientContact(editingId, form);
    } else {
      const isClient = form.contact_role === 'Client';
      createClientContact({ ...form, vendor_enrollment: isClient ? 'pending' : null });
      if (isClient) setEnrollmentAlert(form.name.trim());
    }
    setModalOpen(false);
    setEditingId(null);
  }

  function markEnrollmentComplete(contactId) {
    updateClientContact(contactId, { vendor_enrollment: 'completed' });
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
              <button
                onClick={() => setEnrollmentAlert(null)}
                style={{ padding: '7px 18px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#f9a825', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
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
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{companyContacts.length}</div>
              <div style={{ fontSize: '11px', color: '#8694a7', fontWeight: 500 }}>Contacts</div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', padding: '14px 18px' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{companyProjects.length}</div>
              <div style={{ fontSize: '11px', color: '#8694a7', fontWeight: 500 }}>Linked Projects</div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', padding: '14px 18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{companyCity || '—'}</div>
              <div style={{ fontSize: '11px', color: '#8694a7', fontWeight: 500 }}>City</div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', padding: '14px 18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{companyState || '—'}</div>
              <div style={{ fontSize: '11px', color: '#8694a7', fontWeight: 500 }}>State</div>
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
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Vendor Enrollment</th>
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
                    companyContacts.map((c, idx) => (
                      <tr key={c.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                        <td style={{ ...tdStyle, fontWeight: 500, color: '#1e293b' }}>{c.name}</td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '10px', background: '#dbe4f0', color: '#2979ff' }}>{c.contact_role}</span>
                        </td>
                        <td style={{ ...tdStyle, color: '#5a6577' }}>{c.email}</td>
                        <td style={{ ...tdStyle, color: '#5a6577' }}>{c.phone}</td>
                        <td style={tdStyle}>
                          {c.contact_role === 'Client' && (
                            c.vendor_enrollment === 'completed' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                                <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                Completed
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, color: '#b45309', background: '#fffbeb', border: '1px solid #f9a825', padding: '2px 7px', borderRadius: '10px' }}>
                                  <svg style={{ width: '9px', height: '9px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Pending
                                </span>
                                <button
                                  onClick={() => markEnrollmentComplete(c.id)}
                                  title="Mark enrollment as completed"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8694a7', padding: '1px', display: 'flex' }}
                                >
                                  <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                              </span>
                            )
                          )}
                        </td>
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

      {/* Add/Edit Contact Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '480px', margin: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{editingId ? 'Edit Contact' : 'Add Contact'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ color: '#8694a7', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Full name" />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select value={form.contact_role} onChange={(e) => setForm((f) => ({ ...f, contact_role: e.target.value }))} style={inputStyle}>
                  {CONTACT_ROLES.filter((r) => r !== 'ACI/API/POC' && r !== 'CommissionedSalesPerson').map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="email@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="(555) 555-5555" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '14px 24px', borderTop: '1px solid #d9dfe7' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 500, color: '#3a4a5c', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim()} style={{
                padding: '7px 14px', fontSize: '12px', fontWeight: 600, color: '#fff',
                background: form.name.trim() ? '#2979ff' : '#c8d1dc',
                border: 'none', borderRadius: '6px', cursor: form.name.trim() ? 'pointer' : 'not-allowed',
              }}>
                {editingId ? 'Update' : 'Add'} Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
