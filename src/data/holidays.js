// src/data/holidays.js

export const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const MONTH_NAMES = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'
];

export const HEBREW_DATES = {
  '2026-04-01':'י"ד ניסן','2026-04-02':'ט"ו ניסן','2026-04-03':'ט"ז ניסן',
  '2026-04-04':'י"ז ניסן','2026-04-05':'י"ח ניסן','2026-04-06':'י"ט ניסן',
  '2026-04-07':'כ ניסן','2026-04-08':'כ"א ניסן','2026-04-09':'כ"ב ניסן',
  '2026-04-10':'כ"ג ניסן','2026-04-11':'כ"ד ניסן','2026-04-12':'כ"ה ניסן',
  '2026-04-13':'כ"ו ניסן','2026-04-14':'כ"ז ניסן','2026-04-15':'כ"ח ניסן',
  '2026-04-16':'כ"ט ניסן','2026-04-17':'א\' אייר','2026-04-18':'ב\' אייר',
  '2026-04-22':'ה\' אייר','2026-04-21':'ד\' אייר','2026-05-22':'ו\' סיוון',
};

export const HOLIDAYS = [
  // 2025
  { name: 'ראש השנה', date: '2025-09-22', duration: 2, icon: '🍎' },
  { name: 'יום כיפור', date: '2025-10-01', duration: 1, icon: '🕍' },
  { name: 'סוכות', date: '2025-10-06', duration: 7, icon: '🌿' },
  { name: 'שמחת תורה', date: '2025-10-13', duration: 1, icon: '📖' },
  { name: 'חנוכה', date: '2025-12-14', duration: 8, icon: '🕎' },

  // 2026
  { name: 'ט"ו בשבט', date: '2026-02-02', duration: 1, icon: '🌳' },
  { name: 'פורים', date: '2026-03-03', duration: 1, icon: '🎭' },
  { name: 'ערב פסח', date: '2026-04-01', duration: 1, icon: '🍷' },
  { name: 'פסח', date: '2026-04-02', duration: 7, icon: '🍷' },
  { name: 'שביעי של פסח', date: '2026-04-08', duration: 1, icon: '🌊' },
  { name: 'יום הזיכרון לשואה', date: '2026-04-14', duration: 1, icon: '🕯️' },
  { name: 'יום הזיכרון', date: '2026-04-21', duration: 1, icon: '🕯️' },
  { name: 'יום העצמאות', date: '2026-04-22', duration: 1, icon: '🇮🇱' },
  { name: 'ל"ג בעומר', date: '2026-05-05', duration: 1, icon: '🔥' },
  { name: 'יום ירושלים', date: '2026-05-15', duration: 1, icon: '🏛️' },
  { name: 'שבועות', date: '2026-05-22', duration: 1, icon: '📜' },
  { name: 'תשעה באב', date: '2026-07-23', duration: 1, icon: '✡️' },
  { name: 'ראש השנה', date: '2026-09-11', duration: 2, icon: '🍎' },
  { name: 'יום כיפור', date: '2026-09-20', duration: 1, icon: '🕍' },
  { name: 'סוכות', date: '2026-09-25', duration: 7, icon: '🌿' },
  { name: 'שמחת תורה', date: '2026-10-02', duration: 1, icon: '📖' },
  { name: 'חנוכה', date: '2026-12-04', duration: 8, icon: '🕎' },

  // 2027
  { name: 'פורים', date: '2027-03-23', duration: 1, icon: '🎭' },
  { name: 'פסח', date: '2027-04-22', duration: 7, icon: '🍷' },
  { name: 'יום העצמאות', date: '2027-05-12', duration: 1, icon: '🇮🇱' },
  { name: 'שבועות', date: '2027-06-11', duration: 1, icon: '📜' },
  { name: 'ראש השנה', date: '2027-10-02', duration: 2, icon: '🍎' },
  { name: 'יום כיפור', date: '2027-10-11', duration: 1, icon: '🕍' },
  { name: 'סוכות', date: '2027-10-16', duration: 7, icon: '🌿' },
  { name: 'חנוכה', date: '2027-12-25', duration: 8, icon: '🕎' },
];

export function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function dateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getHolidaysForDate(ds) {
  return HOLIDAYS.filter(h => {
    const start = parseLocalDate(h.date);
    const end = new Date(start);
    end.setDate(end.getDate() + h.duration - 1);
    const d = parseLocalDate(ds);
    return d >= start && d <= end;
  });
}
