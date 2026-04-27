'use client';

import { useState } from 'react';
import { useProjects } from './ProjectsStore';

const inputStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };

export default function CompanyContactsManager({ open, onClose, fullPage }) {
  const { companies, createCompany, updateCompany, deleteCompany, US_STATES } = useProjects();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ company_name: '', city: '', state: '', phone: '', email: '', address: '' });
  const [personForm, setPersonForm] = useState({ first_name: '', last_name: '', email: '', phone: '', is_primary: false });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [addingPersonTo, setAddingPersonTo] = useState(null);

  if (!open) return null;

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (c.company_name || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.state || '').toLowerCase().includes(q);
  });

  function handleSave() {
    if (!form.company_name.trim()) return;
    // Stub: Vista lookup check
    if (!editingId) {
      alert('Vista Check (Stub): Would check bARCM + bPMFM for existing company before creating.\n\nProceeding with local creation.');
      createCompany(form);
    } else {
      updateCompany(editingId, form);
    }
    setForm({ company_name: '', city: '', state: '', phone: '', email: '', address: '' });
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(company) {
    setForm({ company_name: company.company_name, city: company.city, state: company.state, phone: company.phone, email: company.email, address: company.address || '' });
    setEditingId(company.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (pendingDelete?.type === 'company' && pendingDelete?.id === id) {
      deleteCompany(id);
      setPendingDelete(null);
    } else {
      const company = companies.find((c) => c.id === id);
      setPendingDelete({ type: 'company', id, label: `Delete ${company?.company_name || 'this company'} and all its contacts?` });
    }
  }

  function handleAddPerson(companyId) {
    if (!personForm.first_name.trim() || !personForm.last_name.trim()) return;
    const company = companies.find((c) => c.id === companyId);
    if (!company) return;
    const people = [...(company.people || [])];
    if (personForm.is_primary) {
      people.forEach((p) => { p.is_primary = false; });
    }
    people.push({ id: crypto.randomUUID(), ...personForm });
    updateCompany(companyId, { people });
    setPersonForm({ first_name: '', last_name: '', email: '', phone: '', is_primary: false });
    setAddingPersonTo(null);
  }

  function handleRemovePerson(companyId, personId) {
    if (pendingDelete?.type === 'person' && pendingDelete?.id === personId) {
      const company = companies.find((c) => c.id === companyId);
      if (!company) return;
      updateCompany(companyId, { people: (company.people || []).filter((p) => p.id !== personId) });
      setPendingDelete(null);
    } else {
      const company = companies.find((c) => c.id === companyId);
      const person = (company?.people || []).find((p) => p.id === personId);
      setPendingDelete({ type: 'person', id: personId, companyId, label: `Remove ${person?.first_name} ${person?.last_name}?` });
    }
  }

  const content = (
    <>
        <div style={{ padding: fullPage ? '16px 20px' : '14px 24px' }}>
          {/* Search + Add */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies (name, city, state)..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ company_name: '', city: '', state: '', phone: '', email: '', address: '' }); }} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              + Add Company
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div style={{ border: '1px solid #a8c4e6', borderRadius: '8px', padding: '16px', background: 'rgba(219,228,240,0.15)', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Company Name *</label>
                  <input type="text" value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} style={inputStyle}>
                    <option value="">Select...</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Address</label>
                  <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={handleSave} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  {editingId ? 'Update' : 'Create'} Company
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: '8px 16px', fontSize: '12px', color: '#3a4a5c', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Company List */}
          {filtered.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#8694a7', textAlign: 'center', padding: '32px 0' }}>
              {companies.length === 0 ? 'No companies yet. Click "+ Add Company" to create one.' : 'No companies match your search.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map((company) => (
                <div key={company.id} style={{ border: '1px solid #d9dfe7', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{company.company_name}</span>
                      <span style={{ fontSize: '12px', color: '#5a6577', marginLeft: '8px' }}>
                        {[company.city, company.state].filter(Boolean).join(', ')}
                      </span>
                      {company.email && <span style={{ fontSize: '11px', color: '#8694a7', marginLeft: '8px' }}>{company.email}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setAddingPersonTo(addingPersonTo === company.id ? null : company.id)} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, color: '#2979ff', border: '1px solid #2979ff', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>
                        + Person
                      </button>
                      <button onClick={() => handleEdit(company)} style={{ padding: '4px 10px', fontSize: '11px', color: '#3a4a5c', border: '1px solid #c8d1dc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Edit</button>
                      {pendingDelete?.type === 'company' && pendingDelete?.id === company.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#d32f2f', fontWeight: 500 }}>{pendingDelete.label}</span>
                          <button onClick={() => handleDelete(company.id)} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#fff', background: '#d32f2f', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes</button>
                          <button onClick={() => setPendingDelete(null)} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#5a6577', background: '#e8ecf1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => handleDelete(company.id)} style={{ padding: '4px 10px', fontSize: '11px', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Delete</button>
                      )}
                    </div>
                  </div>
                  {/* People list */}
                  {(company.people || []).length > 0 && (
                    <div style={{ padding: '8px 16px', borderTop: '1px solid #e8ecf1' }}>
                      {(company.people || []).map((p) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                          <div>
                            <span style={{ color: '#1e293b', fontWeight: 500 }}>{p.first_name} {p.last_name}</span>
                            {p.is_primary && <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '12px', marginLeft: '6px', fontWeight: 600 }}>Primary</span>}
                            {p.email && <span style={{ color: '#8694a7', marginLeft: '8px' }}>{p.email}</span>}
                          </div>
                          {pendingDelete?.type === 'person' && pendingDelete?.id === p.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: '#d32f2f', fontWeight: 500 }}>{pendingDelete.label}</span>
                              <button onClick={() => handleRemovePerson(company.id, p.id)} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#fff', background: '#d32f2f', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes</button>
                              <button onClick={() => setPendingDelete(null)} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#5a6577', background: '#e8ecf1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>No</button>
                            </div>
                          ) : (
                            <button onClick={() => handleRemovePerson(company.id, p.id)} style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>&times;</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Add person form */}
                  {addingPersonTo === company.id && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #e8ecf1', background: '#fafbfc' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'flex-end' }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '11px' }}>First Name *</label>
                          <input type="text" value={personForm.first_name} onChange={(e) => setPersonForm((f) => ({ ...f, first_name: e.target.value }))} style={{ ...inputStyle, padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '11px' }}>Last Name *</label>
                          <input type="text" value={personForm.last_name} onChange={(e) => setPersonForm((f) => ({ ...f, last_name: e.target.value }))} style={{ ...inputStyle, padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '11px' }}>Email</label>
                          <input type="email" value={personForm.email} onChange={(e) => setPersonForm((f) => ({ ...f, email: e.target.value }))} style={{ ...inputStyle, padding: '6px 10px', fontSize: '12px' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '4px' }}>
                          <input type="checkbox" checked={personForm.is_primary} onChange={(e) => setPersonForm((f) => ({ ...f, is_primary: e.target.checked }))} style={{ accentColor: '#2979ff' }} />
                          <span style={{ fontSize: '11px', color: '#3a4a5c' }}>Primary</span>
                        </div>
                        <button onClick={() => handleAddPerson(company.id)} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );

  if (fullPage) {
    return (
      <>
        <div className="flex items-center justify-between" style={{ padding: '10px 20px', background: '#fff', borderBottom: '1px solid #d9dfe7' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '1px' }}>Business Dev - Inputs</div>
            <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Companies</h1>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: '#f1f5f9' }}>{content}</div>
      </>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', margin: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Company & Contacts Management</h2>
          <button onClick={onClose} style={{ color: '#8694a7', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {content}
      </div>
    </div>
  );
}
