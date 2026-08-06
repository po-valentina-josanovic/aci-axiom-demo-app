'use client';

import { useRef } from 'react';
import { useProjects } from '../../potential-projects/components/ProjectsStore';
import AddressFields from './AddressFields';

const BLANK_ADDR = { street: '', city: '', state: '', zip: '', country: '' };
const labelStyle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };
const selectStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };

// Fully-controlled: `value` is the flat addresses array (Main/Billing/Mailing/
// Shipping + any extras). Renders the same Main+Billing / Mailing+Shipping
// pairs as the Manage Addresses modal, plus an editable list of extra
// offices — shared so the New Company modal can offer the same editing
// experience when "same address for all" is turned off.
export default function AddressBook({ value, onChange }) {
  const { ADDRESS_TYPES, EXTRA_ADDRESS_TYPES } = useProjects();
  const blankIds = useRef({});
  ADDRESS_TYPES.forEach((type) => {
    if (!blankIds.current[type]) blankIds.current[type] = crypto.randomUUID();
  });

  function getDefault(type) {
    return value.find((a) => a.type === type) || { id: blankIds.current[type], type, ...BLANK_ADDR };
  }

  function updateDefault(type, fields) {
    const updated = { ...getDefault(type), ...fields };
    onChange([...value.filter((a) => a.type !== type), updated]);
  }

  const extras = value.filter((a) => !ADDRESS_TYPES.includes(a.type));

  function addExtra() {
    onChange([...value, { id: crypto.randomUUID(), type: EXTRA_ADDRESS_TYPES[0], ...BLANK_ADDR }]);
  }

  function updateExtra(id, fields) {
    onChange(value.map((a) => (a.id === id ? { ...a, ...fields } : a)));
  }

  function removeExtra(id) {
    onChange(value.filter((a) => a.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Customer Address & Customer Billing Address */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>Customer Address & Customer Billing Address</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#8694a7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Main</div>
            <AddressFields value={getDefault('Main')} onChange={(v) => updateDefault('Main', v)} />
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#8694a7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Billing</div>
            <AddressFields value={getDefault('Billing')} onChange={(v) => updateDefault('Billing', v)} />
          </div>
        </div>
      </div>

      {/* Vendor Address and Vendor Shipping Address */}
      <div style={{ borderTop: '1px solid #e8ecf1', paddingTop: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>Vendor Address and Vendor Shipping Address</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#8694a7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Mailing</div>
            <AddressFields value={getDefault('Mailing')} onChange={(v) => updateDefault('Mailing', v)} />
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#8694a7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Shipping</div>
            <AddressFields value={getDefault('Shipping')} onChange={(v) => updateDefault('Shipping', v)} />
          </div>
        </div>
      </div>

      {/* Additional Addresses */}
      <div style={{ borderTop: '1px solid #e8ecf1', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Additional Addresses</div>
          <button onClick={addExtra} type="button" style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: '#2979ff', background: '#fff', border: '1px solid #2979ff', borderRadius: '6px', cursor: 'pointer' }}>
            + Add Address
          </button>
        </div>
        {extras.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#8694a7', margin: 0 }}>No additional addresses. Click "+ Add Address" for offices like a Warehouse or Regional Office.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {extras.map((addr) => (
              <div key={addr.id} style={{ border: '1px solid #e8ecf1', borderRadius: '8px', padding: '14px', background: '#fafbfc' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Address Type</label>
                    <select value={addr.type} onChange={(e) => updateExtra(addr.id, { type: e.target.value })} style={selectStyle}>
                      {EXTRA_ADDRESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <button onClick={() => removeExtra(addr.id)} type="button" style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', padding: '7px', fontSize: '13px' }} title="Remove address">
                    &times;
                  </button>
                </div>
                <AddressFields value={addr} onChange={(v) => updateExtra(addr.id, v)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
