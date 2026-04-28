'use client';

import { useState } from 'react';
import SystemPermissions from './components/SystemPermissions';

const TABS = ['User List', 'Job Permissions', 'System Permissions'];

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('System Permissions');

  return (
    <>
      {/* Sub-nav */}
      <div style={{ background: '#2c3340', borderBottom: '1px solid #3a4252' }}>
        <div className="flex items-center" style={{ paddingLeft: '20px' }}>
          {TABS.map(tab => {
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
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>User Management</h2>

        {activeTab === 'System Permissions' && <SystemPermissions />}

        {activeTab !== 'System Permissions' && (
          <div style={{ background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#8694a7', fontSize: '13px' }}>
            {activeTab} content will appear here.
          </div>
        )}
      </div>
    </>
  );
}
