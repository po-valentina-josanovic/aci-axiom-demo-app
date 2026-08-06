'use client';

import { useProjects } from '../../potential-projects/components/ProjectsStore';

const inputStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };
const labelStyle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };

// Street (full width) + City / State / Zip / Country grid. Shared by the New
// Company modal and the Manage Addresses modal so every address block looks identical.
export default function AddressFields({ value, onChange, disabled }) {
  const { US_STATES } = useProjects();

  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label style={labelStyle}>Street</label>
        <input type="text" value={value.street || ''} onChange={(e) => set('street', e.target.value)} style={inputStyle} placeholder="Enter street address" disabled={disabled} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={labelStyle}>City</label>
          <input type="text" value={value.city || ''} onChange={(e) => set('city', e.target.value)} style={inputStyle} disabled={disabled} />
        </div>
        <div>
          <label style={labelStyle}>State</label>
          <select value={value.state || ''} onChange={(e) => set('state', e.target.value)} style={inputStyle} disabled={disabled}>
            <option value="">Select...</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={labelStyle}>Zip Code</label>
          <input type="text" value={value.zip || ''} onChange={(e) => set('zip', e.target.value)} style={inputStyle} disabled={disabled} />
        </div>
        <div>
          <label style={labelStyle}>Country</label>
          <input type="text" value={value.country || ''} onChange={(e) => set('country', e.target.value)} style={inputStyle} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
