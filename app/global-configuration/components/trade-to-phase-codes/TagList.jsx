'use client';

import { useState } from 'react';

/** Editable list of std craft codes (Daily Production / Master Manpower cells). */
export default function TagList({ tags, onAdd, onRemove }) {
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
