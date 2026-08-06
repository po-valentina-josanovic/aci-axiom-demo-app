'use client';

import { useState, useEffect } from 'react';
import AddressBook from './AddressBook';

export default function ManageAddressesModal({ open, onClose, company, onSave }) {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (open) setAddresses((company?.addresses || []).map((a) => ({ ...a })));
  }, [open, company]);

  if (!open) return null;

  function handleSave() {
    onSave(addresses);
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.3)', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', margin: '16px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Manage Addresses</h2>
          <button onClick={onClose} style={{ color: '#8694a7', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <AddressBook value={addresses} onChange={setAddresses} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '14px 24px', borderTop: '1px solid #d9dfe7' }}>
          <button onClick={onClose} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 500, color: '#3a4a5c', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Addresses</button>
        </div>
      </div>
    </div>
  );
}
