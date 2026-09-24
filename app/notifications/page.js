'use client';

import { useState } from 'react';
import TemplateIcon from './components/TemplateIcon';
import TemplateBuilderModal from './components/TemplateBuilderModal';
import { MOCK_TEMPLATES, MOCK_NOTIFICATIONS, TRIGGER_EVENTS } from './components/mockData';
import { recurrenceBadge } from './components/recurrence';
import { RepeatIcon } from '../components/NotificationBell';

const TABS = ['Notification Center', 'Personal Notifications', 'Company Notifications'];

const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#2979ff', display: 'flex' };

function RecurrenceChip({ template }) {
  const event = TRIGGER_EVENTS.find((e) => e.key === template.event);
  const badge = recurrenceBadge(template.type, template.recurrence, event);
  if (!badge) {
    return <span style={{ whiteSpace: 'nowrap', fontSize: '10px', fontWeight: 600, color: '#8694a7', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2px 8px' }}>One-time</span>;
  }
  return (
    <span title={badge.title} style={{ whiteSpace: 'nowrap', overflow: 'hidden', minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', padding: '2px 8px' }}>
      <RepeatIcon /> {badge.label}
      {badge.override && <span style={{ color: '#b45309', marginLeft: '2px' }}>· Override</span>}
    </span>
  );
}

function TemplateCard({ template, onEdit, onView, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isAuto = template.type === 'auto';
  return (
    <div style={{ position: 'relative', background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: isAuto ? 'stretch' : 'center', gap: '8px', minHeight: '150px' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', textAlign: isAuto ? 'left' : 'center', padding: isAuto ? '0 44px 0 0' : '0 44px' }}>{template.name}</span>
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px' }}>
        <button onClick={onEdit} style={iconBtn} title="Edit">
          <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button onClick={onView} style={iconBtn} title="View">
          <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <TemplateIcon variant={isAuto ? 'auto' : template.audience} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 'auto', gap: '6px' }}>
        <RecurrenceChip template={template} />
        {confirmDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#d32f2f', fontWeight: 500 }}>Delete?</span>
            <button onClick={onDelete} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#fff', background: '#d32f2f', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes</button>
            <button onClick={() => setConfirmDelete(false)} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#5a6577', background: '#e8ecf1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>No</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} style={{ ...iconBtn, color: '#ef4444' }} title="Delete">
            <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
      <span style={{ width: '28px', height: '14px', borderRadius: '8px', background: checked ? '#2979ff' : '#d9dfe7', position: 'relative', transition: 'background 0.15s' }}>
        <span style={{ position: 'absolute', top: '2px', left: checked ? '16px' : '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
      </span>
      {checked ? 'Activated' : 'Deactivated'}
    </button>
  );
}

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' };

function NotificationCenter() {
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [modal, setModal] = useState(null); // { template, readOnly } | { template: null }

  const custom = templates.filter((t) => t.type === 'custom');
  const auto = templates.filter((t) => t.type === 'auto');

  function handleSave(data) {
    if (data.id) {
      setTemplates((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    } else {
      setTemplates((prev) => [...prev, { ...data, id: `t${Date.now()}` }]);
    }
    setModal(null);
  }

  function cardProps(t) {
    return {
      template: t,
      onEdit: () => setModal({ template: t }),
      onView: () => setModal({ template: t, readOnly: true }),
      onDelete: () => setTemplates((prev) => prev.filter((x) => x.id !== t.id)),
    };
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Create New Notification</span>
          <span style={{ fontSize: '12px', color: '#8694a7', marginLeft: '6px' }}>Choose Category Below</span>
        </div>
        <button onClick={() => setModal({ template: null })} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, color: '#fff', background: '#2979ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          + Create new Template
        </button>
      </div>

      <div style={gridStyle}>
        {custom.map((t) => <TemplateCard key={t.id} {...cardProps(t)} />)}
      </div>

      <div style={{ borderTop: '1px solid #e8ecf1', margin: '16px 0 10px' }} />
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>System Auto-Trigger Notifications</div>
      <div style={gridStyle}>
        {auto.map((t) => (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Toggle checked={t.active} onChange={(v) => setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, active: v } : x)))} />
            <TemplateCard {...cardProps(t)} />
          </div>
        ))}
      </div>

      {modal && (
        <TemplateBuilderModal
          key={modal.template?.id || 'new'}
          template={modal.template}
          templates={templates}
          readOnly={modal.readOnly}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function PersonalNotifications() {
  return (
    <div style={{ background: '#fff', border: '1px solid #d9dfe7', borderRadius: '8px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: '#dbeafe', textAlign: 'left', color: '#1e293b' }}>
            {['Notification', 'Source', 'Recurring', 'Received', 'Status'].map((h) => <th key={h} style={{ padding: '10px 14px', fontWeight: 600 }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {MOCK_NOTIFICATIONS.map((n) => (
            <tr key={n.id} style={{ borderTop: '1px solid #e8ecf1' }}>
              <td style={{ padding: '10px 14px', fontWeight: n.read ? 400 : 600, color: '#1e293b' }}>{n.title}</td>
              <td style={{ padding: '10px 14px', color: '#5a6577' }}>{n.source}</td>
              <td style={{ padding: '10px 14px', color: n.recurring ? '#0d9488' : '#a8b5c4' }}>{n.recurring || '—'}</td>
              <td style={{ padding: '10px 14px', color: '#5a6577' }}>{n.time}</td>
              <td style={{ padding: '10px 14px', color: n.read ? '#8694a7' : '#2979ff', fontWeight: 600 }}>{n.read ? 'Read' : 'Unread'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <>
      {/* Sub-nav */}
      <div style={{ background: '#2c3340', borderBottom: '1px solid #3a4252' }}>
        <div className="flex items-center" style={{ paddingLeft: '20px' }}>
          {TABS.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px', fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#f0b429' : '#a0aec0',
                  background: 'none', border: 'none',
                  borderBottom: active ? '2px solid #f0b429' : '2px solid transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#f1f5f9' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>{activeTab}</h1>
        {activeTab === 'Notification Center' && <NotificationCenter />}
        {activeTab === 'Personal Notifications' && <PersonalNotifications />}
        {activeTab === 'Company Notifications' && (
          <p style={{ fontSize: '13px', color: '#8694a7', textAlign: 'center', padding: '32px 0' }}>No company notifications yet.</p>
        )}
      </div>
    </>
  );
}
