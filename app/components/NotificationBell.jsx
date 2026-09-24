'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_NOTIFICATIONS, SYSTEM_SOURCES } from '../notifications/components/mockData';

function pillStyle(active) {
  return {
    padding: '4px 10px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer',
    color: active ? '#fff' : '#2979ff',
    background: active ? '#2979ff' : '#fff',
    border: `1px solid ${active ? '#2979ff' : '#a8c4e6'}`,
    display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
  };
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all'); // 'all' | 'release' | 'system'
  const [systemSource, setSystemSource] = useState(''); // '' = all system sources
  const [systemMenuOpen, setSystemMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSystemMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const visible = items.filter((n) => {
    if (filter === 'release') return n.category === 'release';
    if (filter === 'system') return n.category === 'system' && (!systemSource || n.source === systemSource);
    return true;
  });

  function markRead(id) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center cursor-pointer"
        style={{ color: open ? '#fff' : '#7ea3c8', background: 'none', border: 'none', padding: '4px', position: 'relative' }}
        title="Notifications"
      >
        <svg style={{ width: '19px', height: '19px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-1px', right: '-3px', minWidth: '15px', height: '15px', padding: '0 4px',
            borderRadius: '8px', background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #152238',
          }}>
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: '-40px', width: '380px',
          background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.14)', zIndex: 999, color: '#1e293b',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Notifications</span>
            <button
              onClick={markAllRead}
              disabled={unread === 0}
              style={{ fontSize: '12px', color: unread ? '#3a4a5c' : '#a8b5c4', background: 'none', border: 'none', cursor: unread ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Mark all as read
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '6px', padding: '0 14px 10px', borderBottom: '1px solid #e8ecf1' }}>
            <button onClick={() => { setFilter('all'); setSystemMenuOpen(false); }} style={pillStyle(filter === 'all')}>All</button>
            <button onClick={() => { setFilter('release'); setSystemMenuOpen(false); }} style={pillStyle(filter === 'release')}>Release</button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setFilter('system'); setSystemMenuOpen((o) => !o); }} style={pillStyle(filter === 'system')}>
                {filter === 'system' && systemSource ? systemSource : 'System'}
                <svg style={{ width: '10px', height: '10px' }} fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5 6 5-6H5z" /></svg>
              </button>
              {systemMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid #d9dfe7', borderRadius: '6px', boxShadow: '0 6px 20px rgba(0,0,0,0.14)', minWidth: '150px', zIndex: 1000, overflow: 'hidden' }}>
                  {['', ...SYSTEM_SOURCES].map((src) => (
                    <button
                      key={src || 'all'}
                      onClick={() => { setSystemSource(src); setSystemMenuOpen(false); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', fontSize: '12px', border: 'none', cursor: 'pointer', color: '#1e293b', fontWeight: systemSource === src ? 600 : 400, background: systemSource === src ? '#eef4ff' : '#fff' }}
                    >
                      {src || 'All System'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {visible.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#8694a7', textAlign: 'center', padding: '24px 0', margin: 0 }}>No notifications.</p>
            ) : visible.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '9px 14px', background: 'none', border: 'none', borderBottom: '1px solid #eef1f5', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg style={{ width: '15px', height: '15px', flexShrink: 0, color: n.read ? '#a8b5c4' : '#3a4a5c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span style={{ flex: 1, minWidth: 0, fontSize: '12px', fontWeight: n.read ? 400 : 600, color: n.read ? '#5a6577' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.title}
                </span>
                {n.recurring && (
                  <span title={`Recurring reminder (${n.recurring})`} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', padding: '1px 6px', flexShrink: 0 }}>
                    <RepeatIcon /> {n.recurring}
                  </span>
                )}
                <span style={{ fontSize: '11px', color: '#8694a7', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</span>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: n.read ? 'transparent' : '#2979ff', flexShrink: 0 }} />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '8px 14px', textAlign: 'center', borderTop: '1px solid #e8ecf1' }}>
            <button
              onClick={() => { setOpen(false); router.push('/notifications'); }}
              style={{ fontSize: '12px', fontWeight: 600, color: '#2979ff', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RepeatIcon({ size = 10 }) {
  return (
    <svg style={{ width: `${size}px`, height: `${size}px` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
