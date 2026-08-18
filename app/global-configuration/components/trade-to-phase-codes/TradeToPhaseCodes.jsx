'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Trade To Phase Codes Division Association
//
// Three phase-code range tables — General, Shop, Field — each mapping a phase
// code prefix range to a trade, its std craft codes, and its Vista scope codes.
//
//   data.js             seed rows + the Vista scope code lookup
//   PhaseCodeTable.jsx  one table (row editing, add row, activate/inactivate)
//   ScopeMappingModal   scope code picker launched from a row
//   TagList / Tooltip   small pieces used by the table cells
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import PhaseCodeTable from './PhaseCodeTable';
import { INITIAL_GENERAL, INITIAL_SHOP, INITIAL_FIELD } from './data';

export default function TradeToPhaseCodes() {
  const [generalRows, setGeneralRows] = useState(INITIAL_GENERAL);
  const [shopRows,    setShopRows]    = useState(INITIAL_SHOP);
  const [fieldRows,   setFieldRows]   = useState(INITIAL_FIELD);

  return (
    <div style={{ background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px', padding: '20px' }}>
      <PhaseCodeTable rows={generalRows} setRows={setGeneralRows} />
      <PhaseCodeTable rows={shopRows}    setRows={setShopRows} />
      <PhaseCodeTable rows={fieldRows}   setRows={setFieldRows} />
    </div>
  );
}
