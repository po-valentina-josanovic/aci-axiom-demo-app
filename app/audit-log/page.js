'use client';

import { useState } from 'react';
import AuditInfoTab from './components/AuditInfoTab';
import AuditErrorsTab from './components/AuditErrorsTab';

const TABS = ['Info', 'Errors'];

export default function AuditLogPage() {
  const [activeTab, setActiveTab] = useState('Info');

  return (
    <>
      {/* Sub-nav */}
      <div style={{ background: '#2c3340', borderBottom: '1px solid #3a4252' }}>
        <div className="flex items-center" style={{ paddingLeft: '20px' }}>
          {TABS.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px', fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#f0b429' : '#a0aec0',
                  background: 'none', border: 'none',
                  borderBottom: active ? '2px solid #f0b429' : '2px solid transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#f1f5f9' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>Audit Tracker</h1>

        {activeTab === 'Info' ? <AuditInfoTab /> : <AuditErrorsTab />}
      </div>
    </>
  );
}
