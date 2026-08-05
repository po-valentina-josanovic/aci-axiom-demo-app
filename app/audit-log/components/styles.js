// Compact single-row toolbar controls — mirrors the filter toolbar used on
// the Potential Projects list page (ProjectListTable), but sized per
// DESIGN.md's input spec (12px text, 7px 10px padding) rather than that
// table's denser 11px — this bar carries longer real-world values (full
// area paths, emails, job names) that a tighter box would clip.

export const controlStyle = {
  border: '1px solid #c8d1dc',
  borderRadius: '6px',
  padding: '7px 10px',
  fontSize: '12px',
  background: '#fff',
  color: '#1e293b',
};

export const dividerStyle = {
  width: '1px',
  alignSelf: 'stretch',
  background: '#d9dfe7',
  flexShrink: 0,
};

export const buttonSecondary = {
  padding: '7px 14px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#5a6577',
  background: '#eef1f5',
  border: '1px solid #d9dfe7',
  borderRadius: '6px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

export function buttonPrimary(enabled) {
  return {
    padding: '7px 16px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
    background: enabled ? '#2979ff' : '#a8b5c4',
    border: 'none',
    borderRadius: '6px',
    cursor: enabled ? 'pointer' : 'default',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };
}
