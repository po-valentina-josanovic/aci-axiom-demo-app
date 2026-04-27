'use client';

import { useState } from 'react';
import { useProjects } from './ProjectsStore';

const inputStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };

export default function CompetitorManager({ open, onClose, fullPage }) {
  const { competitors, createCompetitor, updateCompetitor, deleteCompetitor } = useProjects();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ company_name: '', contact_info: '', notes: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  if (!open) return null;

  const filtered = competitors.filter((c) =>
    (c.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.notes || '').toLowerCase().includes(search.toLowerCase())
  );

  function handleSave() {
    if (!form.company_name.trim()) return;
    if (editingId) {
      updateCompetitor(editingId, form);
    } else {
      createCompetitor(form);
    }
    setForm({ company_name: '', contact_info: '', notes: '' });
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(comp) {
    setForm({ company_name: comp.company_name, contact_info: comp.contact_info, notes: comp.notes });
    setEditingId(comp.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (pendingDelete?.id === id) {
      deleteCompetitor(id);
      setPendingDelete(null);
    } else {
      const comp = competitors.find((c) => c.id === id);
      setPendingDelete({ id, label: `Remove ${comp?.company_name || 'this competitor'} from the list?` });
    }
  }

  const content = (
    <>
        <div style={{ padding: fullPage ? '16px 20px' : '14px 24px' }}>
          {/* Search + Add */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search competitors..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ company_name: '', contact_info: '', notes: '' }); }} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              + Add Competitor
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div style={{ border: '1px solid #a8c4e6', borderRadius: '8px', padding: '16px', background: 'rgba(219,228,240,0.15)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Company Name *</label>
                  <input type="text" value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Contact Info</label>
                  <input type="text" value={form.contact_info} onChange={(e) => setForm((f) => ({ ...f, contact_info: e.target.value }))} style={inputStyle} placeholder="Phone, email, etc." />
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={inputStyle} placeholder="Additional notes..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={handleSave} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  {editingId ? 'Update' : 'Create'} Competitor
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: '8px 16px', fontSize: '12px', color: '#3a4a5c', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Competitor List */}
          {filtered.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#8694a7', textAlign: 'center', padding: '32px 0' }}>
              {competitors.length === 0 ? 'No competitors yet. Click "+ Add Competitor" to create one.' : 'No competitors match your search.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map((comp) => (
                <div key={comp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #d9dfe7', borderRadius: '8px', background: '#f8fafc' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{comp.company_name}</div>
                    {comp.contact_info && <div style={{ fontSize: '12px', color: '#5a6577', marginTop: '2px' }}>{comp.contact_info}</div>}
                    {comp.notes && <div style={{ fontSize: '11px', color: '#8694a7', marginTop: '2px' }}>{comp.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleEdit(comp)} style={{ padding: '4px 10px', fontSize: '11px', color: '#3a4a5c', border: '1px solid #c8d1dc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Edit</button>
                    {pendingDelete?.id === comp.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#d32f2f', fontWeight: 500 }}>{pendingDelete.label}</span>
                        <button onClick={() => handleDelete(comp.id)} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#fff', background: '#d32f2f', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes</button>
                        <button onClick={() => setPendingDelete(null)} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#5a6577', background: '#e8ecf1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>No</button>
                      </div>
                    ) : (
                      <button onClick={() => handleDelete(comp.id)} style={{ padding: '4px 10px', fontSize: '11px', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Delete</button>
                    )}
                  </div>
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
            <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Competitors</h1>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: '#f1f5f9' }}>{content}</div>
      </>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', margin: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Competitor Management</h2>
            <p style={{ fontSize: '11px', color: '#8694a7', margin: '2px 0 0 0' }}>Axiom only — never syncs to Vista</p>
          </div>
          <button onClick={onClose} style={{ color: '#8694a7', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {content}
      </div>
    </div>
  );
}
