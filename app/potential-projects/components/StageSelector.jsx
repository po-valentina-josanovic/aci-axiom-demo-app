'use client';

import { useProjects } from './ProjectsStore';

const STAGE_COLORS = {
  Preliminary: { bg: '#e8ecf1', color: '#1e293b', activeBg: '#5a6577', ring: '#8694a7' },
  Lead: { bg: '#dbe4f0', color: '#2979ff', activeBg: '#2979ff', ring: '#90b8f8' },
  Budget: { bg: '#e0e7ff', color: '#4338ca', activeBg: '#4338ca', ring: '#a5b4fc' },
  Bid: { bg: '#f3e8ff', color: '#7c3aed', activeBg: '#7c3aed', ring: '#c4b5fd' },
  Pending: { bg: '#fef9c2', color: '#a36100', activeBg: '#d97706', ring: '#fcd34d' },
  Award: { bg: '#dcfce7', color: '#15803d', activeBg: '#15803d', ring: '#86efac' },
  Lost: { bg: '#ffe2e2', color: '#d32f2f', activeBg: '#d32f2f', ring: '#fca5a5' },
  Cancel: { bg: '#e8ecf1', color: '#5a6577', activeBg: '#64748b', ring: '#94a3b8' },
};

export default function StageSelector({ currentStage, onStageChange, disabled }) {
  const { STAGES } = useProjects();
  const currentColors = STAGE_COLORS[currentStage] || STAGE_COLORS.Preliminary;

  return (
    <div className="flex flex-col gap-2">
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#5a6577', fontWeight: 600 }}>Currently:</span>
        <span
          style={{
            padding: '2px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: currentColors.activeBg,
            color: '#fff',
          }}
        >
          {currentStage}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-wrap" role="radiogroup" aria-label="Project Status">
        {STAGES.map((stage) => {
          const isActive = stage === currentStage;
          const colors = STAGE_COLORS[stage] || STAGE_COLORS.Preliminary;

          return (
            <button
              key={stage}
              role="radio"
              aria-checked={isActive}
              onClick={() => !disabled && onStageChange(stage)}
              className="flex items-center gap-1.5 transition-all"
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                border: 'none',
                background: isActive ? colors.activeBg : colors.bg,
                color: isActive ? '#fff' : colors.color,
                boxShadow: isActive ? `0 0 0 2px ${colors.ring}` : 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled && !isActive ? 0.5 : 1,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isActive ? '#fff' : colors.color,
                  opacity: isActive ? 1 : 0.5,
                }}
              />
              {stage}
            </button>
          );
        })}
      </div>
    </div>
  );
}
