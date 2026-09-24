// Dummy data for the Notification Center demo.

// Bell dropdown / Personal Notifications feed.
// `recurring` marks notifications produced by a recurring reminder.
export const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'Reminder: Missing PreCon Trades on 26-DV12-JD', category: 'system', source: 'Auto-Trigger', time: '1 hour ago', read: false, recurring: 'Weekly' },
  { id: 'n2', title: 'Job redirection notif 3', category: 'system', source: 'Job-Specific', time: '4 hours ago', read: false },
  { id: 'n3', title: 'Job redirection notif 2', category: 'system', source: 'Job-Specific', time: '4 hours ago', read: false },
  { id: 'n4', title: 'Job redirection notif', category: 'system', source: 'Job-Specific', time: '4 hours ago', read: false },
  { id: 'n5', title: 'user and group notif', category: 'system', source: 'User Groups', time: '4 hours ago', read: true },
  { id: 'n6', title: 'Weekly Safety Toolbox Talk', category: 'system', source: 'User Groups', time: '12 hours ago', read: true, recurring: 'Weekly' },
  { id: 'n7', title: 'Test All components', category: 'system', source: 'General', time: '16 hours ago', read: true },
  { id: 'n8', title: 'Test All components', category: 'system', source: 'General', time: '16 hours ago', read: true },
  { id: 'n9', title: 'Test User Specific Notif', category: 'system', source: 'Specific Users', time: '09/23/2026 12:06 AM', read: true },
  { id: 'n10', title: 'Release ann 1', category: 'release', source: 'Release', time: '09/21/2026 04:18 PM', read: true },
  { id: 'n11', title: 'Release 2.24 is live', category: 'release', source: 'Release', time: '09/15/2026 09:00 AM', read: true },
];

export const SYSTEM_SOURCES = ['Auto-Trigger', 'Job-Specific', 'Specific Users', 'User Groups', 'General'];

// Auto-trigger events. Each event comes with a fixed stop condition and a
// default repetition — the reminder keeps repeating until the condition is met.
export const TRIGGER_EVENTS = [
  { key: 'missing_trades', label: 'Missing PreCon Trades', stopCondition: 'all PreCon trades are filled on the project', defaultRepetition: 'weekly' },
  { key: 'poc_snapshot', label: 'NEW POC Snapshot', stopCondition: 'the recipient reviews the snapshot', defaultRepetition: 'daily' },
  { key: 'release_note', label: 'Release Note Published', stopCondition: 'the recipient opens the release note', defaultRepetition: 'daily' },
  { key: 'pp_mention', label: 'Potential Project Mention', stopCondition: 'the recipient opens the mention', defaultRepetition: 'daily' },
  { key: 'bid_date', label: 'Bid Date Approaching', stopCondition: 'the bid date has passed', defaultRepetition: 'daily' },
  { key: 'missing_estimation', label: 'Missing Estimation Number', stopCondition: 'an estimation number is entered for every client', defaultRepetition: 'weekly' },
  { key: 'stale_project', label: 'Potential Project Not Updated (30 days)', stopCondition: 'the project is updated or moved to a new stage', defaultRepetition: 'monthly' },
];

export const FIELD_TYPES = [
  { key: 'text', label: 'Text Field', hint: 'for titles, one sentences etc...', color: '#1e293b' },
  { key: 'textarea', label: 'Text Area', hint: 'for simple paragraphs', color: '#e65100' },
  { key: 'rich', label: 'Rich Text Editor', hint: 'for multimedia paragraphs, blocks of text and mixed media', color: '#7c3aed' },
  { key: 'attachment', label: 'Attachment Upload Field', hint: 'for adding documents to the announcement', color: '#15803d' },
  { key: 'image', label: 'Image Upload Field', hint: 'for adding images to the announcement', color: '#f59e0b' },
  { key: 'url', label: 'URL Field', hint: 'redirections to specific pages', color: '#2979ff' },
  { key: 'redirect', label: 'Redirection selection', hint: 'redirections to specific pages', color: '#0d9488' },
];

// audience: 'all' | 'users' | 'groups' | 'users_groups' | 'job'
export const MOCK_TEMPLATES = [
  { id: 't1', type: 'custom', name: 'Job-Specific', audience: 'job', fields: ['text', 'redirect'], recurrence: { repetition: 'weekly', start: '2026-09-24', end: '2027-01-01', override: false } },
  { id: 't2', type: 'custom', name: 'Specific Users', audience: 'users', fields: ['text', 'textarea'], recurrence: { repetition: 'daily', start: '2026-09-24', end: '2026-10-15', override: false } },
  { id: 't3', type: 'custom', name: 'User Groups', audience: 'groups', fields: ['text', 'rich'], recurrence: { repetition: 'monthly', start: '2026-10-01', end: '2027-03-31', override: false } },
  { id: 't4', type: 'custom', name: 'General (Default)', audience: 'all', fields: ['text', 'textarea'], recurrence: { repetition: '', start: '', end: '', override: false } },
  { id: 't5', type: 'custom', name: 'Release Announcement Published', audience: 'all', fields: ['text', 'rich', 'url'], recurrence: { repetition: '', start: '', end: '', override: false } },
  { id: 't6', type: 'custom', name: 'Specific Users & User Groups Template', audience: 'users_groups', fields: ['text'], recurrence: { repetition: 'weekly', start: '', end: '', override: false } },
  { id: 't7', type: 'custom', name: 'Weekly Safety Toolbox Talk', audience: 'groups', fields: ['text', 'attachment'], recurrence: { repetition: 'weekly', start: '2026-09-28', end: '2026-12-31', override: false } },
  { id: 't8', type: 'custom', name: 'Select all template', audience: 'all', fields: ['text', 'image'], recurrence: { repetition: '', start: '', end: '', override: false } },

  { id: 'a1', type: 'auto', name: 'Missing PreCon Trades', event: 'missing_trades', active: true, audience: 'job', fields: ['text', 'redirect'], recurrence: { repetition: 'weekly', start: '', end: '', override: false } },
  { id: 'a2', type: 'auto', name: 'NEW POC Snapshot', event: 'poc_snapshot', active: true, audience: 'groups', fields: ['text'], recurrence: { repetition: 'weekly', start: '2026-09-01', end: '2026-12-31', override: true } },
  { id: 'a3', type: 'auto', name: 'Release Note Published', event: 'release_note', active: true, audience: 'all', fields: ['text', 'url'], recurrence: { repetition: 'daily', start: '', end: '', override: false } },
  { id: 'a4', type: 'auto', name: 'Potential Project Mention', event: 'pp_mention', active: false, audience: 'users', fields: ['text', 'redirect'], recurrence: { repetition: 'daily', start: '', end: '', override: false } },
];
