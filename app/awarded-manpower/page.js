import PageHeader from "../components/PageHeader";
import ControlsBar from "../components/ControlsBar";
import JobTable from "../components/JobTable";
import JobSection from "../components/JobSection";

export default function AwardedManpower() {
  return (
    <>
      <PageHeader />
      <ControlsBar />
      <div className="flex-1 overflow-auto" style={{ padding: '12px 16px', background: '#f1f5f9' }}>
        {/* Main data table */}
        <JobTable />

        {/* Expandable job rows */}
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <JobSection
            jobId="01-2135"
            jobDesc="AVIENT: DSM-FIRMENICH-BLD 50 BATHROOM MODIFICAT..."
          />

          {/* Additional collapsed job rows (matching PNG yellow/amber highlighted rows) */}
          {[
            { id: "01-2135", desc: "AVIENT: DSM-FIRMENICH-BLD 50 BATHROOM MODIFICAT...", highlight: true },
            { id: "01-2133", desc: "AVIENT: DSM-FIRMENICH-BLD 50 BATHROOM MODIFICAT...", highlight: true },
            { id: "01-2133", desc: "AVIENT: DSM-FIRMENICH-BLD 50 BATHROOM MODIFICAT...", highlight: false },
            { id: "01-2132", desc: "AVIENT: DSM-FIRMENICH-BLD 50 BATHROOM MODIFICAT...", highlight: false },
            { id: "01-2133", desc: "AVIENT: DSM-FIRMENICH-BLD 50 BATHROOM MODIFICAT...", highlight: false },
            { id: "01-2133", desc: "AVIENT: DSM-FIRMENICH-BLD 50 BATHROOM MODIFICAT...", highlight: false },
            { id: "01-2128", desc: "AVIENT: DSM-FIRMENICH-BLD 50 BATHROOM MODIFICAT...", highlight: false },
          ].map((job, idx) => (
            <div
              key={idx}
              className="flex items-center"
              style={{
                border: `2px solid ${job.highlight ? '#f9a825' : '#2979ff'}`,
                borderRadius: '4px',
                background: job.highlight ? '#fff8e1' : '#e8f4fd',
                height: '36px',
              }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: '32px', cursor: 'pointer' }}
              >
                <svg style={{ width: '14px', height: '14px', color: job.highlight ? '#f9a825' : '#2979ff' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#fff',
                  background: job.highlight ? '#f9a825' : '#2979ff',
                  borderRadius: '3px',
                  marginRight: '10px',
                }}
              >
                {job.id}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: job.highlight ? '#e65100' : '#2979ff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {job.desc}
              </span>
              {/* Placeholder data cells */}
              <div className="flex items-center gap-0 flex-shrink-0" style={{ marginRight: '10px' }}>
                {[0,0,0,0,0,0].map((v, i) => (
                  <span key={i} style={{ width: '80px', textAlign: 'center', fontSize: '11px', color: '#5a6577' }}>
                    0 (0)
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Values footnote */}
        <div style={{ fontSize: '11px', color: '#8694a7', marginTop: '12px', fontStyle: 'italic' }}>
          Values in parentheses are actual manpower units used.
        </div>
      </div>
    </>
  );
}
