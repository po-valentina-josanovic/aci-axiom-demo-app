'use client';

import { useState, useRef } from 'react';

export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#212529', color: '#fff',
          fontSize: '11px', lineHeight: 1.5,
          padding: '5px 9px', borderRadius: '4px',
          whiteSpace: 'nowrap', zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}>
          {text}
          {/* Arrow */}
          <div style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #212529',
          }} />
        </div>
      )}
    </div>
  );
}
