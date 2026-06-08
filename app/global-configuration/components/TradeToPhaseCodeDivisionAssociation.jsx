'use client';

import { useState, useCallback, useMemo, useRef } from 'react';

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#212529', color: '#fff',
          fontSize: '11px', lineHeight: 1.5,
          padding: '5px 9px', borderRadius: '4px',
          whiteSpace: 'nowrap', zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}>
          {text}
          {/* Arrow */}
          <div style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #212529',
          }} />
        </div>
      )}
    </div>
  );
}

// ─── Scope codes master list ─────────────────────────────────────────────────

const SCOPE_CODES = [
  { code: 'CIVIL',      description: 'Civil',                        keyId: 36, active: 'Y' },
  { code: 'CV',         description: 'Civil',                        keyId: 30, active: 'N' },
  { code: 'EL',         description: 'Electrical',                   keyId: 21, active: 'N' },
  { code: 'ELEC',       description: 'Electrical',                   keyId: 35, active: 'Y' },
  { code: 'ELECSHOP',   description: 'Electrical Shop',              keyId: 32, active: 'Y' },
  { code: 'FIREPR',     description: 'Fire Protection',              keyId: 43, active: 'Y' },
  { code: 'FP',         description: 'Fire Protection',              keyId: 23, active: 'N' },
  { code: 'HV',         description: 'HVAC (including Sheetmetal)',  keyId: 24, active: 'N' },
  { code: 'HVAC',       description: 'HVAC (including Sheetmetal)',  keyId: 39, active: 'Y' },
  { code: 'IRONWRK',    description: 'Ironworkers',                  keyId: 41, active: 'Y' },
  { code: 'IW',         description: 'Ironworkers',                  keyId: 25, active: 'N' },
  { code: 'MILLWRIGHT', description: 'Millwright / Rigging',         keyId: 42, active: 'Y' },
  { code: 'MW',         description: 'Millwright / Rigging',         keyId: 26, active: 'N' },
  { code: 'PI',         description: 'Piping',                       keyId: 27, active: 'N' },
  { code: 'PIPESHOP',   description: 'Piping Shop',                  keyId: 33, active: 'Y' },
  { code: 'PIPING',     description: 'Piping',                       keyId: 37, active: 'Y' },
  { code: 'PL',         description: 'Plumbing',                     keyId: 28, active: 'N' },
  { code: 'PLUMBING',   description: 'Plumbing',                     keyId: 38, active: 'Y' },
  { code: 'PLUMBSHOP',  description: 'Plumbing Shop',                keyId: 31, active: 'Y' },
  { code: 'SHEETMTL',   description: 'Sheetmetal',                   keyId: 40, active: 'Y' },
  { code: 'SM',         description: 'Sheetmetal',                   keyId: 29, active: 'N' },
  { code: 'SMSHOP',     description: 'Sheet Metal Shop',             keyId: 34, active: 'Y' },
];

// ─── Initial row data ────────────────────────────────────────────────────────

const BLANK_ROW_EXTRA = { dailyProduction: [], masterManpower: [], nonProductive: false, active: true, scopeMappings: [] };

const INITIAL_GENERAL = [
  { id: 1, prefixFrom: '10000', prefixTo: '10999', trade: 'General Conditions', tradeAbbr: 'GC',        ...BLANK_ROW_EXTRA },
  { id: 2, prefixFrom: '40000', prefixTo: '40999', trade: 'Equipment Rented',   tradeAbbr: 'Equip Rent',...BLANK_ROW_EXTRA },
  { id: 3, prefixFrom: '41000', prefixTo: '41999', trade: 'Equipment Owned',    tradeAbbr: 'Equip Owned',...BLANK_ROW_EXTRA },
  { id: 4, prefixFrom: '50000', prefixTo: '50999', trade: 'Materials - Rough',  tradeAbbr: 'MTL RI',    ...BLANK_ROW_EXTRA },
  { id: 5, prefixFrom: '55000', prefixTo: '55999', trade: 'Materials - Equip',  tradeAbbr: 'MTL Equip', ...BLANK_ROW_EXTRA },
  { id: 6, prefixFrom: '60000', prefixTo: '60999', trade: 'Subs',               tradeAbbr: 'SUB',       ...BLANK_ROW_EXTRA },
  { id: 7, prefixFrom: '90000', prefixTo: '90999', trade: 'Contingency and OH', tradeAbbr: 'Cont',      ...BLANK_ROW_EXTRA },
];

const INITIAL_SHOP = [
  { id: 1,  prefixFrom: '11000', prefixTo: '11999', trade: 'VDC',              tradeAbbr: 'VDC',      dailyProduction: [],       masterManpower: ['9905'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 2,  prefixFrom: '12000', prefixTo: '12999', trade: 'Plumbing Shop',    tradeAbbr: 'PL Shop',  dailyProduction: [],       masterManpower: ['9920'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 3,  prefixFrom: '13000', prefixTo: '13999', trade: 'Pipe Shop',        tradeAbbr: 'Pipe Shop',dailyProduction: [],       masterManpower: ['0010,9930'], nonProductive: false, active: true,  scopeMappings: [] },
  { id: 4,  prefixFrom: '14000', prefixTo: '14999', trade: 'Sheet Metal Shop', tradeAbbr: 'SM Shop',  dailyProduction: [],       masterManpower: ['9940'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 5,  prefixFrom: '15000', prefixTo: '15999', trade: 'Steel Shop',       tradeAbbr: 'STL Shop', dailyProduction: [],       masterManpower: ['0028'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 6,  prefixFrom: '16000', prefixTo: '16999', trade: 'Paint/Blast Shop', tradeAbbr: 'PB Shop',  dailyProduction: [],       masterManpower: ['9910'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 7,  prefixFrom: '17000', prefixTo: '17999', trade: '17 OPEN',          tradeAbbr: '',         dailyProduction: [],       masterManpower: [],            nonProductive: false, active: false, scopeMappings: [] },
  { id: 8,  prefixFrom: '18000', prefixTo: '18999', trade: 'Electrical Shop',  tradeAbbr: 'EL Shop',  dailyProduction: [],       masterManpower: ['9980'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 9,  prefixFrom: '19000', prefixTo: '19999', trade: 'Tool deliveries',  tradeAbbr: '',         dailyProduction: [],       masterManpower: [],            nonProductive: false, active: true,  scopeMappings: [] },
];

const INITIAL_FIELD = [
  { id: 1,  prefixFrom: '20000', prefixTo: '20999', trade: 'Field Supervision/Support', tradeAbbr: 'NP',    dailyProduction: ['9910'],                    masterManpower: ['9910'],               nonProductive: true,  active: true, scopeMappings: [] },
  { id: 2,  prefixFrom: '22000', prefixTo: '22999', trade: 'Plumbing',                  tradeAbbr: 'PL',    dailyProduction: ['9920,9930'],               masterManpower: ['9920'],               nonProductive: false, active: true, scopeMappings: [] },
  { id: 3,  prefixFrom: '23000', prefixTo: '23999', trade: 'Pipe',                      tradeAbbr: 'Pipe',  dailyProduction: ['9920,9930'],               masterManpower: ['0005P,0602,9930'],    nonProductive: false, active: true, scopeMappings: [] },
  { id: 4,  prefixFrom: '24000', prefixTo: '24999', trade: 'Sheet Metal',               tradeAbbr: 'SM',    dailyProduction: ['9940'],                    masterManpower: ['9940'],               nonProductive: false, active: true, scopeMappings: [] },
  { id: 5,  prefixFrom: '25000', prefixTo: '25190', trade: 'Ironworkers (Steel)',        tradeAbbr: 'IW',    dailyProduction: ['0005,0028,0079'],          masterManpower: ['0005,0028,0079'],     nonProductive: false, active: true, scopeMappings: [] },
  { id: 6,  prefixFrom: '25300', prefixTo: '25399', trade: 'Millwrights',               tradeAbbr: 'MW',    dailyProduction: ['0715,1402'],               masterManpower: ['0715,1402'],          nonProductive: false, active: true, scopeMappings: [] },
  { id: 7,  prefixFrom: '26000', prefixTo: '26999', trade: '26 OPEN',                   tradeAbbr: '',      dailyProduction: [],                          masterManpower: [],                     nonProductive: false, active: true, scopeMappings: [] },
  { id: 8,  prefixFrom: '27000', prefixTo: '27999', trade: 'Fire Protection',           tradeAbbr: 'FP',    dailyProduction: ['9970'],                    masterManpower: ['9970'],               nonProductive: false, active: true, scopeMappings: [] },
  { id: 9,  prefixFrom: '28000', prefixTo: '28999', trade: 'Electrical',                tradeAbbr: 'EL',    dailyProduction: ['9980'],                    masterManpower: ['9980'],               nonProductive: false, active: true, scopeMappings: [] },
  { id: 10, prefixFrom: '29000', prefixTo: '29999', trade: 'Equipment Setting',         tradeAbbr: 'Equip', dailyProduction: ['9910,9920,9930,9940,9970'], masterManpower: [],                    nonProductive: false, active: true, scopeMappings: [] },
];

// ─── Scope Mapping Modal ─────────────────────────────────────────────────────

function ScopeMappingModal({ current, onSave, onClose }) {
  const [draft, setDraft] = useState(() => new Set(current));
  const [search, setSearch] = useState('');

  const toggle = (code) => setDraft(prev => {
    const next = new Set(prev);
    next.has(code) ? next.delete(code) : next.add(code);
    return next;
  });

  const ACTIVE_CODES = useMemo(() => SCOPE_CODES.filter(s => s.active === 'Y'), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return ACTIVE_CODES;
    return ACTIVE_CODES.filter(s =>
      s.code.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [search, ACTIVE_CODES]);

  const selected   = filtered.filter(s => draft.has(s.code));
  const unselected = filtered.filter(s => !draft.has(s.code));

  function ScopeRow({ item }) {
    const checked = draft.has(item.code);
    return (
      <label
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '7px 16px', cursor: 'pointer',
          background: checked ? '#eff6ff' : 'transparent',
        }}
        onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = '#f8fafc'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = checked ? '#eff6ff' : 'transparent'; }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggle(item.code)}
          style={{ width: '14px', height: '14px', accentColor: '#2563eb', flexShrink: 0 }}
        />
        <span style={{ fontSize: '12px', color: '#1e293b' }}>{item.description}</span>
      </label>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: '10px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        width: '520px', maxWidth: '95vw',
        display: 'flex', flexDirection: 'column', maxHeight: '80vh',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Scope Codes Mapping</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', lineHeight: 1, padding: '2px 4px' }}>×</button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#94a3b8', pointerEvents: 'none' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scope codes…"
              style={{ width: '100%', padding: '6px 10px 6px 30px', fontSize: '12px', border: '1px solid #d9dfe7', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* Selected section */}
          {selected.length > 0 && (
            <>
              {selected.map(s => <ScopeRow key={s.code} item={s} />)}
              {unselected.length > 0 && (
                <div style={{ margin: '4px 16px', borderTop: '2px solid #cbd5e1' }} />
              )}
            </>
          )}

          {/* Unselected section */}
          {unselected.length > 0 && (
            <>
              {unselected.map(s => <ScopeRow key={s.code} item={s} />)}
            </>
          )}

          {filtered.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No scope codes match your search.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 500, border: '1px solid #d9dfe7', borderRadius: '6px', background: '#fff', cursor: 'pointer', color: '#1e293b' }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave([...draft])}
              style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TagList ─────────────────────────────────────────────────────────────────

function TagList({ tags, onAdd, onRemove }) {
  const [inputVal, setInputVal] = useState('');

  function handleAdd() {
    const v = inputVal.trim();
    if (!v) return;
    onAdd(v);
    setInputVal('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '130px' }}>
      {tags.map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            value={t}
            readOnly
            style={{ width: '100%', padding: '4px 7px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', color: '#1e293b' }}
          />
          <button
            onClick={() => onRemove(i)}
            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
          >×</button>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          style={{ width: '100%', padding: '4px 7px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#1e293b' }}
        />
        <button
          onClick={handleAdd}
          style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
        >+ Add</button>
      </div>
    </div>
  );
}

// ─── PhaseCodeTable ───────────────────────────────────────────────────────────

function PhaseCodeTable({ rows, setRows }) {
  const [newRow, setNewRow] = useState({ prefixFrom: '', prefixTo: '', trade: '', tradeAbbr: '' });
  const [modalRow, setModalRow] = useState(null); // { id, tradeName, current: [] }

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
    setRows(prev => [...prev, { ...newRow, id, dailyProduction: [], masterManpower: [], nonProductive: false, active: true, scopeMappings: [] }]);
    setNewRow({ prefixFrom: '', prefixTo: '', trade: '', tradeAbbr: '' });
  }

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
                        style={{ width: '90px', padding: '5px 7px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#1e293b' }}
                      />
                    </td>
                    <td style={cellStyle}>
                      <input
                        value={row.prefixTo}
                        onChange={(e) => updateRow(row.id, 'prefixTo', e.target.value)}
                        disabled={!row.active}
                        style={{ width: '90px', padding: '5px 7px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#1e293b' }}
                      />
                    </td>
                    <td style={cellStyle}>
                      <input
                        value={row.trade}
                        onChange={(e) => updateRow(row.id, 'trade', e.target.value)}
                        disabled={!row.active}
                        style={{ width: '160px', padding: '5px 7px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#1e293b' }}
                      />
                    </td>
                    <td style={cellStyle}>
                      <input
                        value={row.tradeAbbr}
                        onChange={(e) => updateRow(row.id, 'tradeAbbr', e.target.value)}
                        disabled={!row.active}
                        style={{ width: '100px', padding: '5px 7px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#1e293b' }}
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

                    {/* Scope Codes Mapping cell */}
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
                    <input value={newRow.prefixFrom} onChange={(e) => setNewRow(r => ({ ...r, prefixFrom: e.target.value }))}
                      style={{ width: '90px', padding: '5px 7px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#1e293b' }} />
                  </td>
                  <td style={cellStyle}>
                    <input value={newRow.prefixTo} onChange={(e) => setNewRow(r => ({ ...r, prefixTo: e.target.value }))}
                      style={{ width: '90px', padding: '5px 7px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#1e293b' }} />
                  </td>
                  <td style={cellStyle}>
                    <input value={newRow.trade} onChange={(e) => setNewRow(r => ({ ...r, trade: e.target.value }))}
                      style={{ width: '160px', padding: '5px 7px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#1e293b' }} />
                  </td>
                  <td style={cellStyle}>
                    <input value={newRow.tradeAbbr} onChange={(e) => setNewRow(r => ({ ...r, tradeAbbr: e.target.value }))}
                      style={{ width: '100px', padding: '5px 7px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#1e293b' }} />
                  </td>
                  <td style={cellStyle} />
                  <td style={cellStyle} />
                  <td style={cellStyle} />
                  <td style={{ ...cellStyle }} />
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function TradeToPhaseCodeDivisionAssociation() {
  const [generalRows, setGeneralRows] = useState(INITIAL_GENERAL);
  const [shopRows,    setShopRows]    = useState(INITIAL_SHOP);
  const [fieldRows,   setFieldRows]   = useState(INITIAL_FIELD);

  return (
    <>
      <PhaseCodeTable rows={generalRows} setRows={setGeneralRows} />
      <PhaseCodeTable rows={shopRows}    setRows={setShopRows} />
      <PhaseCodeTable rows={fieldRows}   setRows={setFieldRows} />
    </>
  );
}
