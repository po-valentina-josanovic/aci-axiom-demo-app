'use client';

import { useState, useMemo } from 'react';
import { useProjects } from './ProjectsStore';
import { formatDateMDY, formatDateTimeMDY, formatCurrencyNoCents } from './formatters';

const inputStyle = { width: '100%', border: '1px solid #c8d1dc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#3a4a5c', marginBottom: '4px' };

function escapeXml(val) {
  return String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default function MonthlySnapshotReport({ open, onClose }) {
  const { projects } = useProjects();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredProjects = useMemo(() => {
    if (!startDate && !endDate) return projects;
    return projects.filter((p) => {
      const created = new Date(p.created_at);
      if (startDate && created < new Date(startDate)) return false;
      if (endDate && created > new Date(endDate + 'T23:59:59')) return false;
      return true;
    });
  }, [projects, startDate, endDate]);

  if (!open) return null;

  function exportExcel() {
    const headers = [
      'Project #', 'Project Name', 'Division', 'Stage', 'Probability %',
      'Bid Date', 'Est. Start', 'Project Type', 'NDA', 'Data Source',
      'Street', 'City', 'State', 'Zip', 'Country',
      'Contract Type', 'End Sector', 'Square Footage',
      'Estimation Number',
      'Total Bid Cost', 'End Date',
      'Awarded Date', 'Awarded Amount', 'Awarded Cost', 'Project Manager',
      'Lost Feedback', 'Primary Competitor', 'Notice Date',
      'Created By', 'Created Date',
    ];

    const rows = filteredProjects.map((p) => [
      p.potential_project_number,
      p.project_name,
      p.division,
      p.project_stage,
      p.probability_percent,
      formatDateMDY(p.bid_date),
      formatDateMDY(p.estimated_project_start),
      p.project_type,
      p.nda || (p.nda_project ? 'Yes' : 'No'),
      p.data_source || 'Axiom',
      p.site_location?.street || '',
      p.site_location?.city || '',
      p.site_location?.state || '',
      p.site_location?.zip_code || '',
      p.site_location?.country || '',
      p.contract_details?.contract_type || '',
      p.contract_details?.end_sector || '',
      p.contract_details?.square_footage || '',
      p.estimation_number || '',
      formatCurrencyNoCents(p.bid_details?.total_bid_cost),
      formatDateMDY(p.bid_details?.project_end_date),
      formatDateMDY(p.award_details?.awarded_date),
      formatCurrencyNoCents(p.award_details?.awarded_amount),
      formatCurrencyNoCents(p.award_details?.awarded_cost),
      p.award_details?.project_manager || '',
      p.loss_details?.feedback || '',
      p.loss_details?.primary_competitor || '',
      formatDateMDY(p.loss_details?.date_of_notice),
      p.created_by,
      formatDateTimeMDY(p.created_at),
    ]);

    // Build Excel XML spreadsheet
    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="Potential Projects">
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
    const dateLabel = startDate && endDate ? `${startDate}_to_${endDate}` : new Date().toISOString().split('T')[0];
    link.download = `potential_projects_snapshot_${dateLabel}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)', width: '100%', maxWidth: '420px', margin: '16px' }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #d9dfe7' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Monthly Snapshot Report</h2>
          <button onClick={onClose} style={{ color: '#8694a7', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}>
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 24px' }}>
          <p style={{ fontSize: '12px', color: '#5a6577', margin: '0 0 16px 0' }}>
            Select a date range to export a snapshot of all potential projects created within that period.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#8694a7', marginBottom: '16px' }}>
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} in range
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '14px 24px', borderTop: '1px solid #d9dfe7' }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 14px', fontSize: '12px', fontWeight: 500,
              color: '#3a4a5c', background: '#fff',
              border: '1px solid #c8d1dc', borderRadius: '6px', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={exportExcel}
            disabled={filteredProjects.length === 0}
            style={{
              padding: '7px 14px', fontSize: '12px', fontWeight: 600,
              color: '#fff', background: filteredProjects.length > 0 ? '#15803d' : '#c8d1dc',
              border: 'none', borderRadius: '6px',
              cursor: filteredProjects.length > 0 ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}
