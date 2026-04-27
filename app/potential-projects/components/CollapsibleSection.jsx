'use client';

import { useState } from 'react';

export default function CollapsibleSection({ title, icon, defaultOpen = true, badge, children, isOpen, onToggle }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = isOpen !== undefined;
  const open = controlled ? isOpen : internalOpen;

  function handleClick() {
    if (controlled && onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: '6px', border: '1px solid #d9dfe7', overflow: 'hidden' }}>
      <button
        onClick={handleClick}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          textAlign: 'left',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          borderBottom: open ? '1px solid #e8ecf1' : 'none',
          fontSize: '13px',
        }}
      >
        <svg
          style={{
            width: '12px',
            height: '12px',
            color: '#5a6577',
            transition: 'transform 0.15s',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        {icon && <span style={{ color: '#2979ff' }}>{icon}</span>}
        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>{title}</span>
        {badge !== undefined && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '10px',
            background: '#dbe4f0',
            color: '#2979ff',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 600,
          }}>
            {badge}
          </span>
        )}
      </button>
      {open && <div style={{ padding: '12px 16px' }}>{children}</div>}
    </div>
  );
}
