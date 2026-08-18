'use client';

import { useState, useCallback } from 'react';
import Tooltip from './Tooltip';
import TagList from './TagList';
import ScopeMappingModal from './ScopeMappingModal';

const headerStyle = {
  padding: '9px 10px', fontSize: '12px', fontWeight: 600,
  color: '#1e293b', background: '#dbeafe',
  borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1',
  textAlign: 'left', whiteSpace: 'nowrap',
};

const cellStyle = {
  padding: '8px 10px', fontSize: '12px', color: '#1e293b',
  borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0',
  verticalAlign: 'top',
};

const inputStyle = (width) => ({
  width, padding: '5px 7px', fontSize: '12px',
  border: '1px solid #cbd5e1', borderRadius: '4px', color: '#1e293b',
});

/** One phase-code range table (General, Shop, or Field). */
export default function PhaseCodeTable({ rows, setRows }) {
  const [newRow, setNewRow] = useState({ prefixFrom: '', prefixTo: '', trade: '', tradeAbbr: '' });
  const [modalRow, setModalRow] = useState(null); // { id, current: [] }

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, [setRows]);

  const addTag = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: [...r[field], value] } : r));
  }, [setRows]);

  const removeTag = useCallback((id, field, idx) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: r[field].filter((_, i) => i !== idx) } : r));
  }, [setRows]);

  const toggleActive = useCallback((id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  }, [setRows]);

  const saveScopeMappings = useCallback((id, codes) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, scopeMappings: codes } : r));
    setModalRow(null);
  }, [setRows]);

  function handleSaveNew() {
    if (!newRow.prefixFrom && !newRow.trade) return;
    const id = Math.max(0, ...rows.map(r => r.id)) + 1;
    setRows(prev => [...prev, {
      ...newRow, id,
      dailyProduction: [], masterManpower: [],
      nonProductive: false, active: true, scopeMappings: [],
    }]);
    setNewRow({ prefixFrom: '', prefixTo: '', trade: '', tradeAbbr: '' });
  }

  return (
    <>
      {modalRow && (
        <ScopeMappingModal
          current={modalRow.current}
          onSave={(codes) => saveScopeMappings(modalRow.id, codes)}
          onClose={() => setModalRow(null)}
        />
      )}

      <div style={{ marginBottom: '28px' }}>
        <div style={{ background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th style={headerStyle}>PreFix Code From</th>
                  <th style={headerStyle}>PreFix Code To</th>
                  <th style={headerStyle}>Trade</th>
                  <th style={headerStyle}>Trade Abbreviation</th>
                  <th style={headerStyle}>Std Craft Daily Production</th>
                  <th style={headerStyle}>Std Craft Master Manpower</th>
                  <th style={{ ...headerStyle, textAlign: 'center' }}>Scope Codes Mapping</th>
                  <th style={{ ...headerStyle, textAlign: 'center' }}>Non-Productive Field</th>
                  <th style={{ ...headerStyle, textAlign: 'center', borderRight: 'none' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} style={{ opacity: row.active ? 1 : 0.55 }}>
                    <td style={cellStyle}>
                      <input
                        value={row.prefixFrom}
                        onChange={(e) => updateRow(row.id, 'prefixFrom', e.target.value)}
                        disabled={!row.active}
                        style={inputStyle('90px')}
                      />
                    </td>
                    <td style={cellStyle}>
                      <input
                        value={row.prefixTo}
                        onChange={(e) => updateRow(row.id, 'prefixTo', e.target.value)}
                        disabled={!row.active}
                        style={inputStyle('90px')}
                      />
                    </td>
                    <td style={cellStyle}>
                      <input
                        value={row.trade}
                        onChange={(e) => updateRow(row.id, 'trade', e.target.value)}
                        disabled={!row.active}
                        style={inputStyle('160px')}
                      />
                    </td>
                    <td style={cellStyle}>
                      <input
                        value={row.tradeAbbr}
                        onChange={(e) => updateRow(row.id, 'tradeAbbr', e.target.value)}
                        disabled={!row.active}
                        style={inputStyle('100px')}
                      />
                    </td>
                    <td style={cellStyle}>
                      <TagList
                        tags={row.dailyProduction}
                        onAdd={(v) => addTag(row.id, 'dailyProduction', v)}
                        onRemove={(i) => removeTag(row.id, 'dailyProduction', i)}
                      />
                    </td>
                    <td style={cellStyle}>
                      <TagList
                        tags={row.masterManpower}
                        onAdd={(v) => addTag(row.id, 'masterManpower', v)}
                        onRemove={(i) => removeTag(row.id, 'masterManpower', i)}
                      />
                    </td>

                    {/* Scope Codes Mapping */}
                    <td style={{ ...cellStyle, minWidth: '100px', textAlign: 'center' }}>
                      {row.scopeMappings.length > 0 ? (
                        <Tooltip text={`Mapped: ${row.scopeMappings.join(', ')}`}>
                          <button
                            onClick={() => setModalRow({ id: row.id, current: row.scopeMappings })}
                            style={{ padding: '4px 8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>Edit</span>
                          </button>
                        </Tooltip>
                      ) : (
                        <button
                          onClick={() => setModalRow({ id: row.id, current: [] })}
                          style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          + Add
                        </button>
                      )}
                    </td>

                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={row.nonProductive}
                        onChange={(e) => updateRow(row.id, 'nonProductive', e.target.checked)}
                      />
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'center', borderRight: 'none' }}>
                      <button
                        onClick={() => toggleActive(row.id)}
                        style={{
                          padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                          borderRadius: '4px', border: 'none', cursor: 'pointer',
                          background: row.active ? '#ef4444' : '#22c55e',
                          color: '#fff',
                        }}
                      >
                        {row.active ? 'Inactivate' : 'Active'}
                      </button>
                    </td>
                  </tr>
                ))}

                {/* New row entry */}
                <tr style={{ background: '#f8fafc' }}>
                  <td style={cellStyle}>
                    <input value={newRow.prefixFrom} onChange={(e) => setNewRow(r => ({ ...r, prefixFrom: e.target.value }))} style={inputStyle('90px')} />
                  </td>
                  <td style={cellStyle}>
                    <input value={newRow.prefixTo} onChange={(e) => setNewRow(r => ({ ...r, prefixTo: e.target.value }))} style={inputStyle('90px')} />
                  </td>
                  <td style={cellStyle}>
                    <input value={newRow.trade} onChange={(e) => setNewRow(r => ({ ...r, trade: e.target.value }))} style={inputStyle('160px')} />
                  </td>
                  <td style={cellStyle}>
                    <input value={newRow.tradeAbbr} onChange={(e) => setNewRow(r => ({ ...r, tradeAbbr: e.target.value }))} style={inputStyle('100px')} />
                  </td>
                  <td style={cellStyle} />
                  <td style={cellStyle} />
                  <td style={cellStyle} />
                  <td style={cellStyle} />
                  <td style={{ ...cellStyle, textAlign: 'right', borderRight: 'none' }}>
                    <button
                      onClick={handleSaveNew}
                      style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      + Save
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
