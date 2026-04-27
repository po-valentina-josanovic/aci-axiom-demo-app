'use client';

import { useState, useMemo } from 'react';
import { useProjects } from './ProjectsStore';

const initialForm = {
  division: '',
  project_name: '',
  description: '',
  probability_percent: '',
  bid_date: '',
  estimated_project_start: '',
  project_stage: 'Preliminary',
  project_type: '',
  end_sector: '',
  nda: '',
};

const inputStyle = {
  width: '100%',
  border: '1px solid #c8d1dc',
  borderRadius: '6px',
  padding: '7px 10px',
  fontSize: '12px',
  outline: 'none',
  background: '#fff',
  color: '#1e293b',
};

const inputErrorStyle = {
  ...inputStyle,
  borderColor: '#d32f2f',
  background: '#fef2f2',
};

const inputWarnStyle = {
  ...inputStyle,
  borderColor: '#f9a825',
  background: '#fffde7',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#3a4a5c',
  marginBottom: '4px',
};

function yesNoStyle(value, base = inputStyle) {
  if (value === 'Yes') return { ...base, color: '#15803d', background: '#f0fdf4', borderColor: '#86efac' };
  if (value === 'No') return { ...base, color: '#b91c1c', background: '#fef2f2', borderColor: '#fecaca' };
  return base;
}

export default function CreateProjectModal({ open, onClose, onCreated }) {
  const { createProject, STAGES, PROJECT_TYPES, DIVISIONS, END_SECTORS, CURRENT_USER, projects } = useProjects();
  const [form, setForm] = useState({ ...initialForm, division: CURRENT_USER.division });
  const [touched, setTouched] = useState({});

  // Generate preview project number once all fields are valid
  const previewProjectNumber = useMemo(() => {
    const allFilled =
      form.division &&
      form.project_name.trim() &&
      form.description.trim() &&
      form.probability_percent !== '' &&
      form.probability_percent >= 0 &&
      form.probability_percent <= 100 &&
      form.bid_date &&
      form.estimated_project_start &&
      form.project_stage &&
      form.project_type &&
      form.end_sector &&
      form.nda;

    if (!allFilled) return null;

    const year = new Date().getFullYear().toString().slice(-2);
    const divCode = form.division.padStart(2, '0');
    const prefix = `${year}-${divCode}`;
    const existing = projects.filter(
      (p) => p.potential_project_number && p.potential_project_number.startsWith(prefix)
    );
    const nextSeq = (existing.length + 1).toString().padStart(2, '0');
    return `${prefix}${nextSeq}-${CURRENT_USER.initials}`;
  }, [form, projects, CURRENT_USER]);

  if (!open) return null;

  const errors = {};
  if (!form.division) errors.division = 'Division is required';
  if (!form.project_name.trim()) errors.project_name = 'Project name is required';
  if (!form.description.trim()) errors.description = 'Description is required';
  if (form.probability_percent === '' || form.probability_percent < 0 || form.probability_percent > 100)
    errors.probability_percent = 'Must be 0-100';
  if (!form.bid_date) errors.bid_date = 'Bid date is required';
  if (!form.estimated_project_start) errors.estimated_project_start = 'Start date is required';
  if (!form.project_stage) errors.project_stage = 'Status is required';
  if (!form.project_type) errors.project_type = 'Project type is required';
  if (!form.end_sector) errors.end_sector = 'End sector is required';
  if (!form.nda) errors.nda = 'NDA selection is required';

  const isValid = Object.keys(errors).length === 0;

  const dateWarnings = {};
  if (form.bid_date && new Date(form.bid_date) < new Date(new Date().toDateString())) {
    dateWarnings.bid_date = 'This date is in the past';
  }
  if (form.estimated_project_start && new Date(form.estimated_project_start) < new Date(new Date().toDateString())) {
    dateWarnings.estimated_project_start = 'This date is in the past';
  }
  if (form.bid_date && form.estimated_project_start && form.estimated_project_start < form.bid_date) {
    dateWarnings.estimated_project_start = 'Start date is before bid date';
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) {
      const allTouched = {};
      Object.keys(initialForm).forEach((k) => { allTouched[k] = true; });
      setTouched(allTouched);
      return;
    }
    const project = createProject({ ...form, probability_percent: Number(form.probability_percent) });
    setForm({ ...initialForm, division: CURRENT_USER.division });
    setTouched({});
    onCreated(project);
  }

  function handleClose() {
    setForm({ ...initialForm, division: CURRENT_USER.division });
    setTouched({});
    onClose();
  }

  function getInputStyle(field) {
    if (touched[field] && errors[field]) return inputErrorStyle;
    if (dateWarnings[field]) return inputWarnStyle;
    return inputStyle;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', margin: '16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>New Potential Project</h2>
            {previewProjectNumber && (
              <div style={{ fontSize: '12px', color: '#2979ff', fontFamily: 'monospace', marginTop: '4px', fontWeight: 600 }}>
                {previewProjectNumber}
              </div>
            )}
          </div>
          <button onClick={handleClose} style={{ color: '#8694a7', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Row 1: Division + Project Name + End Sector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Division <span style={{ color: '#d32f2f' }}>*</span></label>
                <select value={form.division} onChange={(e) => handleChange('division', e.target.value)} style={getInputStyle('division')}>
                  <option value="">Select division...</option>
                  {DIVISIONS.map((d) => <option key={d.code} value={d.code}>{d.code} - {d.name}</option>)}
                </select>
                {touched.division && errors.division && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.division}</p>}
              </div>
              <div>
                <label style={labelStyle}>Project Name <span style={{ color: '#d32f2f' }}>*</span></label>
                <input type="text" value={form.project_name} onChange={(e) => handleChange('project_name', e.target.value)} style={getInputStyle('project_name')} placeholder="Enter project name" />
                {touched.project_name && errors.project_name && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.project_name}</p>}
              </div>
              <div>
                <label style={labelStyle}>End Sector <span style={{ color: '#d32f2f' }}>*</span></label>
                <select value={form.end_sector} onChange={(e) => handleChange('end_sector', e.target.value)} style={getInputStyle('end_sector')}>
                  <option value="">Select...</option>
                  {END_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {touched.end_sector && errors.end_sector && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.end_sector}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description <span style={{ color: '#d32f2f' }}>*</span></label>
              <textarea rows={2} value={form.description} onChange={(e) => handleChange('description', e.target.value)} style={getInputStyle('description')} placeholder="Project description" />
              {touched.description && errors.description && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.description}</p>}
            </div>

            {/* Row 2: Probability + Project Type + Project Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Probability % <span style={{ color: '#d32f2f' }}>*</span></label>
                <input type="number" min={0} max={100} value={form.probability_percent} onChange={(e) => handleChange('probability_percent', e.target.value)} style={getInputStyle('probability_percent')} placeholder="0-100" />
                {touched.probability_percent && errors.probability_percent && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.probability_percent}</p>}
              </div>
              <div>
                <label style={labelStyle}>Project Type <span style={{ color: '#d32f2f' }}>*</span></label>
                <select value={form.project_type} onChange={(e) => handleChange('project_type', e.target.value)} style={getInputStyle('project_type')}>
                  <option value="">Select type...</option>
                  {PROJECT_TYPES.map((t) => <option key={t.code} value={t.code}>{t.code} - {t.name}</option>)}
                </select>
                {touched.project_type && errors.project_type && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.project_type}</p>}
              </div>
              <div>
                <label style={labelStyle}>Project Status <span style={{ color: '#d32f2f' }}>*</span></label>
                <select value={form.project_stage} onChange={(e) => handleChange('project_stage', e.target.value)} style={getInputStyle('project_stage')}>
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {touched.project_stage && errors.project_stage && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.project_stage}</p>}
              </div>
            </div>

            {/* Row 3: Bid Date + Est. Start + NDA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Bid Date <span style={{ color: '#d32f2f' }}>*</span></label>
                <input type="date" value={form.bid_date} onChange={(e) => handleChange('bid_date', e.target.value)} style={getInputStyle('bid_date')} />
                {touched.bid_date && errors.bid_date && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.bid_date}</p>}
                {dateWarnings.bid_date && !errors.bid_date && <p style={{ fontSize: '10px', color: '#a36100', marginTop: '2px' }}>{dateWarnings.bid_date}</p>}
              </div>
              <div>
                <label style={labelStyle}>Est. Project Start <span style={{ color: '#d32f2f' }}>*</span></label>
                <input type="date" value={form.estimated_project_start} onChange={(e) => handleChange('estimated_project_start', e.target.value)} style={getInputStyle('estimated_project_start')} />
                {touched.estimated_project_start && errors.estimated_project_start && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.estimated_project_start}</p>}
                {dateWarnings.estimated_project_start && !errors.estimated_project_start && <p style={{ fontSize: '10px', color: '#a36100', marginTop: '2px' }}>{dateWarnings.estimated_project_start}</p>}
              </div>
              <div>
                <label style={labelStyle}>NDA <span style={{ color: '#d32f2f' }}>*</span></label>
                <select value={form.nda} onChange={(e) => handleChange('nda', e.target.value)} style={touched.nda && errors.nda ? inputErrorStyle : yesNoStyle(form.nda)}>
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {touched.nda && errors.nda && <p style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>{errors.nda}</p>}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '14px 24px', borderTop: '1px solid #d9dfe7', background: '#f8fafc' }}>
          <button type="button" onClick={handleClose} style={{ padding: '7px 14px', fontSize: '12px', color: '#3a4a5c', border: '1px solid #c8d1dc', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 500 }}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={!isValid} style={{
            padding: '7px 14px', fontSize: '12px', color: '#fff', border: 'none', borderRadius: '6px',
            background: isValid ? '#2979ff' : '#a0c4ff', cursor: isValid ? 'pointer' : 'not-allowed',
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
