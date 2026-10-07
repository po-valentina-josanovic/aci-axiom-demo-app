'use client';

import { useRef, useState } from 'react';
import { useProjects } from '../../potential-projects/components/ProjectsStore';
import AddressFields from './AddressFields';
import { MAIN_BILLING_TYPES, showsMainBilling, showsMailingShipping, needsClientOwnerSplit } from './addressUtils';

const BLANK_ADDR = { street: '', city: '', state: '', zip: '', country: '' };
const labelStyle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };
const selectStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };
const groupLabelStyle = { fontSize: '10px', fontWeight: 700, color: '#8694a7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' };

function SplitToggle({ value, onChange, label }) {
  return (
    <div onClick={() => onChange(!value)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px', userSelect: 'none' }}>
      <div style={{ width: '32px', height: '18px', borderRadius: '9px', flexShrink: 0, position: 'relative', background: value ? '#2979ff' : '#c8d1dc', transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: '2px', left: value ? '16px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.15s' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 500, color: '#3a4a5c' }}>{label}</span>
    </div>
  );
}

// Fully-controlled: `value` is the flat addresses array (Main/Billing/Mailing/
// Shipping + any extras). Which pairs render depends on `companyType`: Client
// and Owner share Main+Billing, Engineer and Architect share Mailing+Shipping.
// When a company is both Client and Owner, a toggle lets the two share one
// Main+Billing pair or use two separate role-tagged pairs.
export default function AddressBook({ value, onChange, companyType = [] }) {
  const { ADDRESS_TYPES, EXTRA_ADDRESS_TYPES } = useProjects();
  const blankIds = useRef({});

  function blankId(type, role) {
    const key = `${type}|${role || ''}`;
    if (!blankIds.current[key]) blankIds.current[key] = crypto.randomUUID();
    return blankIds.current[key];
  }

  const showMainBilling = showsMainBilling(companyType);
  const showMailingShipping = showsMailingShipping(companyType);
  const canSplit = needsClientOwnerSplit(companyType);

  const [splitByRole, setSplitByRole] = useState(() => value.some((a) => MAIN_BILLING_TYPES.includes(a.type) && a.for_role));

  function getDefault(type, role) {
    const exact = value.find((a) => a.type === type && (role ? a.for_role === role : !a.for_role));
    if (exact) return exact;
    // Fall back to any entry of this type so data isn't hidden if the split
    // state and the stored data briefly disagree (e.g. right after a toggle).
    if (!role) {
      const any = value.find((a) => a.type === type);
      if (any) return any;
    }
    return { id: blankId(type, role), type, for_role: role || undefined, ...BLANK_ADDR };
  }

  function updateDefault(type, role, fields) {
    const updated = { ...getDefault(type, role), ...fields, type, for_role: role || undefined };
    onChange([...value.filter((a) => !(a.type === type && (role ? a.for_role === role : !a.for_role))), updated]);
  }

  function handleToggleSplit(next) {
    if (next) {
      const seeded = MAIN_BILLING_TYPES.flatMap((type) => {
        const shared = value.find((a) => a.type === type && !a.for_role);
        return ['Client', 'Owner'].map((role) => {
          const existing = value.find((a) => a.type === type && a.for_role === role);
          if (existing) return existing;
          return { id: crypto.randomUUID(), type, for_role: role, ...(shared || BLANK_ADDR) };
        });
      });
      onChange([...value.filter((a) => !MAIN_BILLING_TYPES.includes(a.type)), ...seeded]);
    } else {
      const merged = MAIN_BILLING_TYPES.map((type) => {
        const base = value.find((a) => a.type === type && a.for_role === 'Client') || value.find((a) => a.type === type && a.for_role === 'Owner');
        return { id: base?.id || crypto.randomUUID(), type, ...(base || BLANK_ADDR) };
      });
      onChange([...value.filter((a) => !MAIN_BILLING_TYPES.includes(a.type)), ...merged]);
    }
    setSplitByRole(next);
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
      {/* Client/Owner: Main + Billing */}
      {showMainBilling && (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>Customer Address & Customer Billing Address</div>
          {canSplit && (
            <SplitToggle
              value={splitByRole}
              onChange={handleToggleSplit}
              label={splitByRole ? 'Using separate addresses for Client and Owner — click to share one' : 'Use the same Main/Billing address for Client and Owner'}
            />
          )}
          {!canSplit || !splitByRole ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={groupLabelStyle}>Main</div>
                <AddressFields value={getDefault('Main', null)} onChange={(v) => updateDefault('Main', null, v)} />
              </div>
              <div>
                <div style={groupLabelStyle}>Billing</div>
                <AddressFields value={getDefault('Billing', null)} onChange={(v) => updateDefault('Billing', null, v)} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {['Client', 'Owner'].map((role) => (
                <div key={role} style={{ border: '1px solid #e8ecf1', borderRadius: '8px', padding: '14px', background: '#fafbfc' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#2979ff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>{role}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <div style={groupLabelStyle}>Main</div>
                      <AddressFields value={getDefault('Main', role)} onChange={(v) => updateDefault('Main', role, v)} />
                    </div>
                    <div>
                      <div style={groupLabelStyle}>Billing</div>
                      <AddressFields value={getDefault('Billing', role)} onChange={(v) => updateDefault('Billing', role, v)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Engineer/Architect: Mailing + Shipping, always shared */}
      {showMailingShipping && (
        <div style={{ borderTop: showMainBilling ? '1px solid #e8ecf1' : 'none', paddingTop: showMainBilling ? '16px' : 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>Vendor Address and Vendor Shipping Address</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={groupLabelStyle}>Mailing</div>
              <AddressFields value={getDefault('Mailing', null)} onChange={(v) => updateDefault('Mailing', null, v)} />
            </div>
            <div>
              <div style={groupLabelStyle}>Shipping</div>
              <AddressFields value={getDefault('Shipping', null)} onChange={(v) => updateDefault('Shipping', null, v)} />
            </div>
          </div>
        </div>
      )}

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
