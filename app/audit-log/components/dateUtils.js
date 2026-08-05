// Rows store timestamps as 'MM/DD/YYYY HH:mm:ss'. Filter inputs are native
// <input type="date"> values ('YYYY-MM-DD'). This converts the row timestamp
// to a comparable Date, and the filter's date-only boundary is compared at
// day granularity.

export function parseRowDate(str) {
  const [datePart] = str.split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function isWithinRange(rowDateStr, from, to) {
  const rowDate = parseRowDate(rowDateStr);
  if (from) {
    const fromDate = new Date(from);
    if (rowDate < fromDate) return false;
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (rowDate > toDate) return false;
  }
  return true;
}
