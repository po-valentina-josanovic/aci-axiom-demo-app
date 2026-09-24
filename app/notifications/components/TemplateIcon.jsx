// Small document-style illustrations used on template cards and in the
// User Selection picker. variant: 'all' | 'users' | 'groups' | 'job' | 'auto'

const NAVY = '#1e3a5f';
const GOLD = '#f0b429';

function Doc({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="34" height="44" rx="2" fill={NAVY} />
      {[8, 16, 24].map((ly) => <rect key={ly} x="5" y={ly} width="24" height="4" rx="1" fill="#fff" />)}
      <rect x="20" y="36" width="9" height="3" rx="1" fill="#fff" />
    </g>
  );
}

function Grid({ x, y, rows = 3 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="30" height={rows * 7 + 3} rx="1" fill="#fff" stroke={GOLD} strokeWidth="1.2" />
      {Array.from({ length: rows }).map((_, i) => (
        <rect key={i} x="3" y={3 + i * 7} width="24" height="4" fill={NAVY} />
      ))}
    </g>
  );
}

function Person({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="18" height="20" rx="1" fill="#fff" stroke={GOLD} strokeWidth="1.2" />
      <circle cx="9" cy="7" r="3.5" fill={NAVY} />
      <rect x="3" y="12" width="12" height="5" rx="1" fill={NAVY} />
    </g>
  );
}

export default function TemplateIcon({ variant = 'all', size = 56 }) {
  if (variant === 'auto') {
    return (
      <svg width={size * 1.4} height={size} viewBox="0 0 78 56">
        <rect x="4" y="8" width="56" height="40" rx="2" fill="#fff" stroke={NAVY} strokeWidth="3" />
        <rect x="4" y="8" width="56" height="5" fill={NAVY} />
        <Person x={54} y={4} />
      </svg>
    );
  }
  return (
    <svg width={size * 1.4} height={size} viewBox="0 0 78 56">
      <Doc x={variant === 'all' ? 22 : 8} y={6} />
      {variant === 'users' && <><Person x={38} y={14} /><Person x={50} y={26} /></>}
      {variant === 'groups' && <><Grid x={34} y={4} rows={2} /><Grid x={40} y={20} rows={2} /><Grid x={46} y={36} rows={2} /></>}
      {variant === 'users_groups' && <><Person x={36} y={10} /><Grid x={44} y={30} rows={2} /></>}
      {variant === 'job' && <><Grid x={32} y={8} /><Grid x={42} y={24} /></>}
    </svg>
  );
}
