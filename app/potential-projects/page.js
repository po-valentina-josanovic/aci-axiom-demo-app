'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectsProvider } from './components/ProjectsStore';
import ProjectListTable from './components/ProjectListTable';
import CreateProjectModal from './components/CreateProjectModal';
import MonthlySnapshotReport from './components/MonthlySnapshotReport';
import { downloadXls } from './components/exportXls';

function PotentialProjectsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [exportPayload, setExportPayload] = useState({ rows: [], headers: [], count: 0 });
  const router = useRouter();

  const handleVisibleRowsChange = useCallback((payload) => {
    setExportPayload(payload);
  }, []);

  function handleExport() {
    if (exportPayload.count === 0) return;
    const today = new Date().toISOString().split('T')[0];
    downloadXls({
      filename: `potential_projects_${today}.xls`,
      sheetName: 'Potential Projects',
      headers: exportPayload.headers,
      rows: exportPayload.rows,
    });
  }

  return (
    <>
      {/* Page Header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '10px 20px',
          background: '#fff',
          borderBottom: '1px solid #d9dfe7',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: '#5a6577', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '1px' }}>
            Business Dev - Inputs
          </div>
          <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Potential Projects</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exportPayload.count === 0}
            className="flex items-center gap-1.5"
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 500,
              color: exportPayload.count === 0 ? '#8694a7' : '#3a4a5c',
              background: '#fff',
              border: '1px solid #c8d1dc',
              borderRadius: '6px',
              cursor: exportPayload.count === 0 ? 'not-allowed' : 'pointer',
            }}
            title="Export the currently filtered projects to Excel"
          >
            Export
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          {/* Monthly Report */}
          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#3a4a5c',
              background: '#fff',
              border: '1px solid #c8d1dc',
              borderRadius: '6px',
            }}
          >
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Monthly Report
          </button>
          {/* New Project */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              background: '#2979ff',
              border: '1px solid #2979ff',
              borderRadius: '6px',
            }}
          >
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Potential Project
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', background: '#f1f5f9' }}>
        <ProjectListTable onVisibleRowsChange={handleVisibleRowsChange} />
      </div>

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(project) => {
          setModalOpen(false);
          router.push(`/potential-projects/${project.id}`);
        }}
      />

      <MonthlySnapshotReport
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}

export default function PotentialProjectsPageWrapper() {
  return (
    <ProjectsProvider>
      <PotentialProjectsPage />
    </ProjectsProvider>
  );
}
