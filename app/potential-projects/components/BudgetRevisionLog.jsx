'use client';

import { useState } from 'react';
import { formatDateMDY, formatCurrencyCents } from './formatters';

const thStyle = { padding: '6px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#1e293b', background: '#dbe4f0', border: '1px solid #c8d1dc' };
const tdStyle = { padding: '6px 10px', fontSize: '11px', color: '#1e293b', border: '1px solid #d9dfe7' };
const inputStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', outline: 'none', background: '#fff', color: '#1e293b' };

function escapeXml(val) {
  return String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Cost of Work / (1 - (GM/100)) = Total Price. Any 2 of 3 fields fill the 3rd.
function autoCalc(fields, changedKey) {
  const cow = parseFloat(fields.cost_of_work);
  const gm = parseFloat(fields.gross_margin_percent);
  const tp = parseFloat(fields.total_price);
  const next = { ...fields };
  if (changedKey === 'total_price') {
    if (!isNaN(cow) && !isNaN(tp) && tp !== 0) {
      next.gross_margin_percent = ((1 - cow / tp) * 100).toFixed(2);
    } else if (!isNaN(gm) && !isNaN(tp) && gm < 100) {
      next.cost_of_work = (tp * (1 - gm / 100)).toFixed(2);
    }
  } else if (!isNaN(cow) && !isNaN(gm) && gm < 100) {
    next.total_price = (cow / (1 - gm / 100)).toFixed(2);
  }
  return next;
}

function buildRows(revisions, originalValues, createdDate) {
  const rev0 = {
    revision_number: 0,
    date: createdDate,
    cost_of_work: originalValues?.cost_of_work || '0',
    gross_margin_percent: originalValues?.gross_margin_percent || '0',
    total_price: originalValues?.total_price || '0',
  };
  return [rev0, ...(revisions || [])];
}

export default function BudgetRevisionLog({ revisions, originalValues, createdDate, onAddRevision, readOnly, exportFileLabel }) {
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ cost_of_work: '', gross_margin_percent: '', total_price: '' });

  const allRows = buildRows(revisions, originalValues, createdDate);
  const latest = allRows.reduce((max, r) => (r.revision_number > max.revision_number ? r : max), allRows[0]);
  const sortedDesc = [...allRows].sort((a, b) => b.revision_number - a.revision_number);
  const hasHistory = allRows.length > 1;

  function updateDraft(key, value) {
    setDraft((prev) => autoCalc({ ...prev, [key]: value }, key));
  }

  function saveRevision() {
    const cow = parseFloat(draft.cost_of_work);
    const gm = parseFloat(draft.gross_margin_percent);
    const tp = parseFloat(draft.total_price);
    if (isNaN(cow) || isNaN(gm) || isNaN(tp)) return;
    onAddRevision({
      cost_of_work: cow.toFixed(2),
      gross_margin_percent: gm.toFixed(2),
      total_price: tp.toFixed(2),
    });
    setDraft({ cost_of_work: '', gross_margin_percent: '', total_price: '' });
    setAdding(false);
  }

  function exportExcel() {
    const headers = ['Date', 'Revision', 'Cost of Work ($)', 'GM (%)', 'Total Price ($)'];
    const rows = sortedDesc.map((r) => [
      formatDateMDY(r.date) || '—',
      r.revision_number === 0 ? 'Revision 0' : `Revision ${r.revision_number}`,
      formatCurrencyCents(r.cost_of_work),
      `${r.gross_margin_percent}%`,
      formatCurrencyCents(r.total_price),
    ]);

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="Bid Revision History">
<Table>
<Row>${headers.map((h) => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('')}</Row>
${rows.map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}</Row>`).join('\n')}
</Table>
</Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bid_revision_history_${(exportFileLabel || 'export').replace(/[^a-z0-9-_]+/gi, '_')}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const canSave = draft.cost_of_work !== '' && draft.gross_margin_percent !== '' && draft.total_price !== '';

  return (
    <div style={{ marginTop: '8px', border: '1px solid #c8d1dc', borderRadius: '8px', overflow: 'hidden' }}>
      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Revision</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Cost of Work ($)</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>GM (%)</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Total Price ($)</th>
          </tr>
        </thead>
        <tbody>
          {(expanded ? sortedDesc : [latest]).map((r) => (
            <tr
              key={r.revision_number}
              onClick={hasHistory ? () => setExpanded((v) => !v) : undefined}
              style={{ cursor: hasHistory ? 'pointer' : 'default', background: '#fff' }}
              title={hasHistory ? (expanded ? 'Click to collapse history' : 'Click to view revision history') : undefined}
            >
              <td style={tdStyle}>{formatDateMDY(r.date) || '—'}</td>
              <td style={tdStyle}>{r.revision_number}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrencyCents(r.cost_of_work)}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>{r.gross_margin_percent}%</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCurrencyCents(r.total_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderTop: '1px solid #e8ecf1', gap: '8px' }}>
        <div style={{ justifySelf: 'start' }}>
          {!readOnly && !adding && (
            <button
              onClick={() => setAdding(true)}
              style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer' }}
            >
              + Add Revision
            </button>
          )}
        </div>

        <div style={{ justifySelf: 'center' }}>
          {hasHistory && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#5a6577',
                background: '#fff', border: '1px solid #d9dfe7', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer', fontWeight: 600,
              }}
            >
              <svg style={{ width: '10px', height: '10px', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
              {expanded ? 'Hide history' : `View history (${allRows.length - 1})`}
            </button>
          )}
        </div>

        <div style={{ justifySelf: 'end' }}>
          <button
            onClick={exportExcel}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 600, color: '#15803d', background: '#fff', border: '1px solid #bbe5c8', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer' }}
          >
            <svg style={{ width: '11px', height: '11px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </button>
        </div>
      </div>

      {adding && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px', borderTop: '1px solid #e8ecf1', background: '#fffbea' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: '#8694a7', marginBottom: '2px', display: 'block' }}>Cost of Work ($)</label>
            <input type="number" value={draft.cost_of_work} onChange={(e) => updateDraft('cost_of_work', e.target.value)} style={inputStyle} placeholder="0.00" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: '#8694a7', marginBottom: '2px', display: 'block' }}>GM (%)</label>
            <input type="number" value={draft.gross_margin_percent} onChange={(e) => updateDraft('gross_margin_percent', e.target.value)} style={inputStyle} placeholder="0.00" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: '#8694a7', marginBottom: '2px', display: 'block' }}>Total Price ($)</label>
            <input type="number" value={draft.total_price} onChange={(e) => updateDraft('total_price', e.target.value)} style={inputStyle} placeholder="0.00" />
          </div>
          <button
            onClick={saveRevision}
            disabled={!canSave}
            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, color: '#fff', background: canSave ? '#2979ff' : '#c8d1dc', border: 'none', borderRadius: '6px', cursor: canSave ? 'pointer' : 'not-allowed' }}
          >
            Save Revision
          </button>
          <button
            onClick={() => { setAdding(false); setDraft({ cost_of_work: '', gross_margin_percent: '', total_price: '' }); }}
            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 500, color: '#3a4a5c', background: '#fff', border: '1px solid #c8d1dc', borderRadius: '6px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
