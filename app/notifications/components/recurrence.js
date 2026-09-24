// Generic recurring-reminder helpers shared by the Template Builder modal
// and the template cards on the Notification Center page.
//
// recurrence shape (same for custom and auto-trigger templates):
//   { repetition: '' | 'daily' | 'weekly' | 'monthly', start: 'YYYY-MM-DD' | '', end: 'YYYY-MM-DD' | '', override: bool }
// `override` only applies to auto-trigger templates — when true, the event's
// fixed stop condition is replaced by the start/end duration.

export const REPETITIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const EMPTY_RECURRENCE = { repetition: '', start: '', end: '', override: false };

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Parse 'YYYY-MM-DD' as a local date (avoids the UTC shift of new Date(str)).
function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${m}/${d}/${y}`;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function everyPhrase(repetition, start) {
  const date = parseDate(start);
  if (repetition === 'daily') return 'every day';
  if (repetition === 'weekly') return date ? `every week on ${WEEKDAYS[date.getDay()]}` : 'every week';
  if (repetition === 'monthly') return date ? `every month on the ${ordinal(date.getDate())}` : 'every month';
  return '';
}

// Returns { tone: 'info' | 'muted' | 'warning' | 'error', text, valid }
// `event` is the auto-trigger event (null for custom templates).
export function describeRecurrence(type, recurrence, event) {
  const { repetition, start, end, override } = recurrence;

  if (start && end && parseDate(end) < parseDate(start)) {
    return { tone: 'error', text: 'The end date must be on or after the start date.', valid: false };
  }

  // Auto-trigger, default behaviour: fixed stop condition + repetition
  if (type === 'auto' && !override) {
    if (!event) return { tone: 'muted', text: 'Select a trigger event to see its default stop condition.', valid: false };
    if (!repetition) return { tone: 'warning', text: 'Select how often the reminder should repeat.', valid: false };
    return {
      tone: 'info',
      text: `This notification will be sent ${everyPhrase(repetition)} after "${event.label}" is triggered, until ${event.stopCondition}.`,
      valid: true,
    };
  }

  // Auto-trigger override: duration + repetition are all required
  if (type === 'auto' && override) {
    if (!start || !end || !repetition) {
      return { tone: 'warning', text: 'Start date, end date and repetition are required when overriding the default stop condition.', valid: false };
    }
    return {
      tone: 'info',
      text: `This notification will be sent ${everyPhrase(repetition, start)} from ${formatDate(start)} until ${formatDate(end)}. The default stop condition no longer applies.`,
      valid: true,
    };
  }

  // Custom: everything is optional
  if (!repetition && !start && !end) {
    return { tone: 'muted', text: 'No recurrence — this notification will be sent once, when published.', valid: true };
  }
  if (!repetition) {
    return { tone: 'warning', text: 'Select a repetition to repeat this notification within the selected dates, or clear the dates.', valid: false };
  }
  let text = `This notification will be sent ${everyPhrase(repetition, start)}`;
  if (start) text += ` starting ${formatDate(start)}`;
  text += end ? ` until ${formatDate(end)}.` : ', with no end date.';
  return { tone: 'info', text, valid: true };
}

// Compact one-liner for template cards.
export function recurrenceBadge(type, recurrence, event) {
  const rep = REPETITIONS.find((r) => r.value === recurrence.repetition)?.label;
  if (!rep) return null;
  if (type === 'auto' && !recurrence.override) return { label: `${rep} · until condition met`, title: event ? `Until ${event.stopCondition}` : '', override: false };
  if (type === 'auto') return { label: `${rep} · ${formatDate(recurrence.start)} – ${formatDate(recurrence.end)}`, title: 'Default stop condition overridden', override: true };
  if (recurrence.end) return { label: `${rep} · until ${formatDate(recurrence.end)}`, title: recurrence.start ? `From ${formatDate(recurrence.start)}` : '', override: false };
  return { label: `${rep} · no end date`, title: '', override: false };
}
