'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Icons as small inline SVGs
function Icon({ name, size = 16, color = 'currentColor' }) {
  const s = { width: size, height: size, flexShrink: 0 };
  switch (name) {
    case 'briefcase':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>;
    case 'clipboard':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
    case 'grid':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
    case 'edit':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
    case 'file-text':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case 'target':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={1.8} /><circle cx="12" cy="12" r="6" strokeWidth={1.8} /><circle cx="12" cy="12" r="2" strokeWidth={1.8} /></svg>;
    case 'chart':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
    case 'pie-chart':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
    case 'users':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case 'calendar':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case 'box':
      return <svg style={s} fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
    default:
      return null;
  }
}

function ToggleIcon({ open }) {
  return (
    <span style={{
      width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '14px', fontWeight: 700, lineHeight: 1,
      color: open ? '#e6a817' : 'rgba(255,255,255,0.4)',
      flexShrink: 0,
    }}>
      {open ? '\u2212' : '+'}
    </span>
  );
}

const MENU = [
  {
    label: 'Business Dev',
    icon: 'briefcase',
    children: [
      { label: 'Bid Summary Warehouse', icon: 'clipboard', href: '#' },
      {
        label: 'Dashboard',
        icon: 'grid',
        children: [],
      },
      {
        label: 'Inputs',
        icon: 'edit',
        children: [
          { label: 'Flash Monthly Entry', icon: 'file-text', href: '#' },
          { label: 'Div Sales Goals Entry', icon: 'target', href: '#' },
          { label: 'Potential Projects', icon: 'box', href: '/potential-projects' },
          { label: 'Company & Contact Management', icon: 'users', href: '/client-contacts' },
        ],
      },
      {
        label: 'Reporting',
        icon: 'pie-chart',
        children: [],
      },
    ],
  },
  { label: 'Dashboard Analytics', icon: 'chart', children: [] },
  {
    label: 'Master Manpower',
    icon: 'users',
    children: [
      { label: 'Awarded Manpower', icon: 'chart', href: '/awarded-manpower' },
    ],
  },
  { label: 'Revenue Forecasts', icon: 'calendar', children: [] },
];

function MenuItem({ item, depth = 0, pathname }) {
  const hasChildren = item.children && item.children.length > 0;
  const isLink = !!item.href;
  const isActive = isLink && item.href !== '#' && (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));
  function isHrefActive(href) {
    if (!href || href === '#') return false;
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  }
  const hasActiveChild = hasChildren && item.children.some(
    (c) => isHrefActive(c.href) ||
           (c.children && c.children.some((gc) => isHrefActive(gc.href)))
  );

  const [open, setOpen] = useState(hasActiveChild || (depth === 0 && hasChildren && item.label === 'Business Dev'));

  const indent = depth === 0 ? 14 : depth === 1 ? 28 : 44;
  const isExpandable = item.children !== undefined;
  const isGroupActive = isActive || hasActiveChild;

  const textColor = isGroupActive && depth > 0 ? '#e6a817' : 'rgba(255,255,255,0.85)';
  const fontWeight = depth === 0 ? 600 : (isActive ? 600 : 400);
  const fontSize = depth === 0 ? '13px' : '12px';

  const rowStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: `7px ${indent}px 7px ${indent}px`,
    fontSize, fontWeight,
    color: textColor,
    textDecoration: 'none',
    cursor: isExpandable || isLink ? 'pointer' : 'default',
    background: isActive ? 'rgba(230, 168, 23, 0.1)' : 'transparent',
    borderLeft: isActive ? '3px solid #e6a817' : '3px solid transparent',
    transition: 'background 0.1s',
  };

  function handleClick(e) {
    if (isExpandable) {
      e.preventDefault();
      setOpen(!open);
    }
  }

  const content = (
    <>
      <Icon name={item.icon} size={depth === 0 ? 16 : 14} color={isGroupActive ? '#e6a817' : 'rgba(255,255,255,0.55)'} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {isExpandable && <ToggleIcon open={open} />}
    </>
  );

  return (
    <>
      {isLink && !isExpandable ? (
        <Link href={item.href} style={rowStyle}
          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
        >
          {content}
        </Link>
      ) : (
        <button style={{ ...rowStyle, width: '100%', border: 'none', textAlign: 'left' }} onClick={handleClick}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? 'rgba(230, 168, 23, 0.1)' : 'transparent'; }}
        >
          {content}
        </button>
      )}
      {open && hasChildren && (
        <div>
          {item.children.map((child) => (
            <MenuItem key={child.label} item={child} depth={depth + 1} pathname={pathname} />
          ))}
        </div>
      )}
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{ width: '220px', background: '#2c3340', minHeight: 0, overflowY: 'auto' }}
    >
      {/* Logo */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
      }}>
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-1px', fontFamily: 'Georgia, serif' }}>
          <span style={{ color: '#e6a817' }}>A</span>CI
        </div>
        <div style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Atlantic Constructors
        </div>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, paddingTop: '6px', paddingBottom: '12px' }}>
        {MENU.map((item) => (
          <MenuItem key={item.label} item={item} depth={0} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}
