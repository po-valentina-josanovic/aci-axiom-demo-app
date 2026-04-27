// Shared display/parse helpers for potential-projects.
// Dates render MM-DD-YYYY, currency renders with commas and no cents.

export function formatDateMDY(val) {
  if (!val) return '';
  // Accept 'YYYY-MM-DD' or ISO strings.
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${m}-${d}-${y}`;
  }
  const date = new Date(val);
  if (isNaN(date.getTime())) return '';
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export function formatDateTimeMDY(val) {
  if (!val) return '';
  const date = new Date(val);
  if (isNaN(date.getTime())) return '';
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  let h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${mm}-${dd}-${yyyy} ${h}:${min} ${ampm}`;
}

export function formatNumberCommas(val) {
  if (val === '' || val === null || val === undefined) return '';
  const num = typeof val === 'string' ? parseInt(val.replace(/[^0-9]/g, ''), 10) : Math.round(val);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCurrencyNoCents(val) {
  if (val === '' || val === null || val === undefined) return '';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]/g, '')) : val;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(num));
}

export function parseNumber(str) {
  if (str === '' || str === null || str === undefined) return '';
  return String(str).replace(/[^0-9]/g, '');
}
