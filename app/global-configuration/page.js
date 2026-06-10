'use client';

import TradeToPhaseCodeDivisionAssociation from './components/TradeToPhaseCodeDivisionAssociation';

const TABS = ['Trade To Phase Codes Division Association'];

export default function GlobalConfigurationPage() {
  return (
    <>
      {/* Sub-nav */}
      <div style={{ background: '#2c3340', borderBottom: '1px solid #3a4252' }}>
        <div className="flex items-center" style={{ paddingLeft: '20px' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              style={{
                padding: '10px 20px', fontSize: '13px',
                fontWeight: 600,
                color: '#f0b429',
                background: 'none', border: 'none',
                borderBottom: '2px solid #f0b429',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Page content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#f1f5f9' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>Global Configuration</h2>
        <div style={{ background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px', padding: '20px' }}>
          <TradeToPhaseCodeDivisionAssociation />
        </div>
      </div>
    </>
  );
}
