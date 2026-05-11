'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjects } from '../potential-projects/components/ProjectsStore';

const inputStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };
const labelStyle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };
const thStyle = { padding: '8px 14px', textAlign: 'left', fontWeight: 600, fontSize: '10px', color: '#1e293b', background: '#dbe4f0', borderBottom: '1px solid #c8d1dc', whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 14px', fontSize: '12px', color: '#3a4a5c', borderBottom: '1px solid #e8ecf1' };

export default function ClientContactsView() {
  const { clientContacts, clientCompanies, createClientCompany, US_STATES, projects } = useProjects();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ company_name: '', company_city: '', company_state: '' });
  const [returnData, setReturnData] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('return_to_project');
      if (stored) setReturnData(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Map CRM contact id -> projects (keyed by source_contact_id so CRM lookups resolve correctly)
  const contactJobsMap = useMemo(() => {
    const map = {};
    (projects || []).forEach((p) => {
      (p.contacts || []).forEach((c) => {
        const key = c.source_contact_id || c.id;
        if (!map[key]) map[key] = [];
        map[key].push({ id: p.id, name: p.project_name, number: p.potential_project_number, stage: p.project_stage });
      });
    });
    return map;
  }, [projects]);

  // Group contacts by company, then merge in companies with no contacts yet
  const companyGroups = useMemo(() => {
    const map = {};
    clientContacts.forEach((c) => {
      const key = c.company_name || '(No Company)';
      if (!map[key]) {
        map[key] = {
          company_name: c.company_name || '(No Company)',
          company_city: c.company_city || '',
          company_state: c.company_state || '',
          contacts: [],
          projectSet: new Set(),
        };
      }
      map[key].contacts.push(c);
      if (!map[key].company_city && c.company_city) map[key].company_city = c.company_city;
      if (!map[key].company_state && c.company_state) map[key].company_state = c.company_state;
      (contactJobsMap[c.id] || []).forEach((j) => map[key].projectSet.add(j.id));
    });
    clientCompanies.forEach((co) => {
      if (!map[co.company_name]) {
        map[co.company_name] = {
          company_name: co.company_name,
          company_city: co.company_city || '',
          company_state: co.company_state || '',
          contacts: [],
          projectSet: new Set(),
        };
      } else {
        if (!map[co.company_name].company_city && co.company_city) map[co.company_name].company_city = co.company_city;
        if (!map[co.company_name].company_state && co.company_state) map[co.company_name].company_state = co.company_state;
      }
    });
    return Object.values(map).sort((a, b) => a.company_name.localeCompare(b.company_name));
  }, [clientContacts, clientCompanies, contactJobsMap]);

  // Filter
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return companyGroups;
    const q = search.toLowerCase();
    return companyGroups.filter((g) =>
      g.company_name.toLowerCase().includes(q) ||
      g.company_city.toLowerCase().includes(q) ||
      g.company_state.toLowerCase().includes(q) ||
      g.contacts.some((c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      )
    );
  }, [companyGroups, search]);

  function handleSave() {
    if (!form.company_name.trim()) return;
    createClientCompany({
      company_name: form.company_name,
      company_city: form.company_city,
      company_state: form.company_state,
    });
    setModalOpen(false);
    setForm({ company_name: '', company_city: '', company_state: '' });
    router.push(`/client-contacts/${encodeURIComponent(form.company_name)}`);
  }

  function handleReturnToProject() {
    if (!returnData) return;
    router.push(`/potential-projects/${returnData.projectId}`);
  }

  function dismissReturn() {
    localStorage.removeItem('return_to_project');
    setReturnData(null);
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ padding: '10px 20px', background: '#fff', borderBottom: '1px solid #d9dfe7' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '1px' }}>
            Business Dev - Inputs
          </div>
          <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Company & Contact Management</h1>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 cursor-pointer"
          style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: '#fff', background: '#2979ff', border: '1px solid #2979ff', borderRadius: '6px' }}
        >
          <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Company
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', paddingBottom: returnData ? '70px' : '16px', background: '#f1f5f9' }}>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <svg style={{ width: '14px', height: '14px', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8694a7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by company, name, city, state..." style={{ ...inputStyle, paddingLeft: '32px' }} />
          </div>
          <span style={{ fontSize: '11px', color: '#8694a7' }}>
            {filteredGroups.length} {filteredGroups.length === 1 ? 'client' : 'clients'}
          </span>
        </div>

        {/* Clients Table */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #d9dfe7', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Company</th>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>State</th>
                  <th style={thStyle}>Contacts</th>
                  <th style={thStyle}>Projects</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#8694a7', fontSize: '13px' }}>
                      {clientContacts.length === 0 ? 'No companies yet. Click "New Company" to add one.' : 'No clients match your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((g) => (
                    <tr
                      key={g.company_name}
                      onClick={() => router.push(`/client-contacts/${encodeURIComponent(g.company_name)}`)}
                      style={{ cursor: 'pointer', background: '#fff' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                    >
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg style={{ width: '15px', height: '15px', color: '#8694a7', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {g.company_name}
                        </div>
                      </td>
                      <td style={tdStyle}>{g.company_city}</td>
                      <td style={tdStyle}>{g.company_state}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: '#dbe4f0', color: '#2979ff' }}>
                          {g.contacts.length}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {g.projectSet.size > 0 ? (
                          <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: '#e0e7ff', color: '#4338ca' }}>
                            {g.projectSet.size}
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', color: '#c8d1dc' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Company Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '480px', margin: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>New Company</h2>
              <button onClick={() => setModalOpen(false)} style={{ color: '#8694a7', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Company Name *</label>
                <input type="text" value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} style={inputStyle} placeholder="Company name" />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input type="text" value={form.company_city} onChange={(e) => setForm((f) => ({ ...f, company_city: e.target.value }))} style={inputStyle} placeholder="City" />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <select value={form.company_state} onChange={(e) => setForm((f) => ({ ...f, company_state: e.target.value }))} style={inputStyle}>
                  <option value="">Select...</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '14px 24px', borderTop: '1px solid #d9dfe7' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 500, color: '#3a4a5c', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={!form.company_name.trim()} style={{
                padding: '7px 14px', fontSize: '12px', fontWeight: 600, color: '#fff',
                background: form.company_name.trim() ? '#2979ff' : '#c8d1dc',
                border: 'none', borderRadius: '6px', cursor: form.company_name.trim() ? 'pointer' : 'not-allowed',
              }}>Create Company</button>
            </div>
          </div>
        </div>
      )}

      {/* Return-to-project bar */}
      {returnData && (
        <div style={{
          position: 'fixed', bottom: 0, left: '220px', right: 0,
          background: '#fff', borderTop: '2px solid #e6a817', zIndex: 50,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg style={{ width: '16px', height: '16px', color: '#e6a817' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
            <span style={{ fontSize: '12px', color: '#3a4a5c' }}>
              You were adding contacts to <strong style={{ color: '#1e293b' }}>{returnData.projectName}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={dismissReturn} style={{ fontSize: '11px', color: '#8694a7', background: 'none', border: 'none', cursor: 'pointer' }}>Dismiss</button>
            <button onClick={handleReturnToProject} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: 'none', background: '#2979ff', color: '#fff', cursor: 'pointer' }}>
              <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Go Back to Project
            </button>
          </div>
        </div>
      )}
    </>
  );
}
