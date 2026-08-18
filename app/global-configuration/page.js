'use client';

// Global Configuration shell — sub-nav + the active tab's component.
// The tab list lives in ./tabs.js; see ./README.md for the section layout.

import { useState } from 'react';
import { TABS } from './tabs';

export default function GlobalConfigurationPage() {
  const [activeId, setActiveId] = useState(TABS[0].id);

  const active = TABS.find(t => t.id === activeId) ?? TABS[0];
  const ActiveComponent = active.Component;

  return (
    <>
      {/* Sub-nav */}
      <div style={{ background: '#2c3340', borderBottom: '1px solid #3a4252' }}>
        <div className="flex items-center" style={{ paddingLeft: '20px' }}>
          {TABS.map(tab => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveId(tab.id)}
                style={{
                  padding: '10px 20px', fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#f0b429' : '#a0aec0',
                  background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid #f0b429' : '2px solid transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page content — `fills` tabs own their height and scroll internally */}
      <div style={{
        flex: 1, minHeight: 0, padding: '20px', background: '#f1f5f9',
        overflow: active.fills ? 'hidden' : 'auto',
        ...(active.fills && { display: 'flex', flexDirection: 'column' }),
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0', flexShrink: 0 }}>
          Global Configuration
        </h2>
        <ActiveComponent />
      </div>
    </>
  );
}
