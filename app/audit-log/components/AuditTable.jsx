'use client';

import { useState } from 'react';

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '12px',
  color: '#1e3a5f',
  background: '#fff',
  borderBottom: '2px solid #e2e8f0',
  cursor: 'pointer',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '9px 14px',
  fontSize: '12px',
  color: '#334155',
  borderBottom: '1px solid #eef1f5',
  verticalAlign: 'top',
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function AuditTable({ columns, rows, linkColumn }) {
  const [sortKey, setSortKey] = useState(columns[0]?.key);
  const [sortDir, setSortDir] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // Jump back to page 1 whenever the filtered row set changes, rather than
  // clamping to whatever page the user happened to be on.
  const [prevRows, setPrevRows] = useState(rows);
  if (rows !== prevRows) {
    setPrevRows(rows);
    setPage(1);
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...rows].sort((a, b) => {
    let aVal = a[sortKey] ?? '';
    let bVal = b[sortKey] ?? '';
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', fontSize: '12px', color: '#5a6577' }}>
        Show
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          style={{ border: '1px solid #c8d1dc', borderRadius: '6px', padding: '4px 6px', fontSize: '12px', color: '#1e293b' }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        entries
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)} style={{ ...thStyle, minWidth: col.width || undefined }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {col.label}
                    {sortKey === col.key ? (
                      <span style={{ fontSize: '9px', color: '#2979ff' }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
                    ) : (
                      <span style={{ fontSize: '9px', color: '#c8d1dc' }}>{'▲▼'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '40px 16px', textAlign: 'center', color: '#8694a7', fontSize: '13px' }}>
                  No records match your filters.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={col.key === linkColumn ? { ...tdStyle, color: '#2979ff', fontWeight: 500, whiteSpace: 'nowrap' } : tdStyle}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', fontSize: '12px', color: '#5a6577' }}>
        <span>
          {sorted.length === 0
            ? 'Showing 0 entries'
            : `Showing ${start + 1} to ${Math.min(start + pageSize, sorted.length)} of ${sorted.length} entries`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '5px 12px', fontSize: '12px', borderRadius: '6px',
              border: '1px solid #d9dfe7', background: '#fff',
              color: currentPage === 1 ? '#c8d1dc' : '#5a6577',
              cursor: currentPage === 1 ? 'default' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={{
            padding: '5px 11px', fontSize: '12px', fontWeight: 600, borderRadius: '6px',
            background: '#2979ff', color: '#fff',
          }}>
            {currentPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '5px 12px', fontSize: '12px', borderRadius: '6px',
              border: '1px solid #d9dfe7', background: '#fff',
              color: currentPage === totalPages ? '#c8d1dc' : '#5a6577',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
