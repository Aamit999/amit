export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  priority: 'high' | 'medium' | 'low';
  note: string;
  done: boolean;
  created: string;
}

export interface Holiday {
  name: string;
  date: string;
  duration: number;
  icon: string;
  fast?: boolean;
  minor?: boolean;
}

export const HOLIDAYS: Holiday[] = [
  // 2025
  { name: 'ראש השנה', date: '2025-09-22', duration: 2, icon: '🍎' },
  { name: 'צום גדליה', date: '2025-09-25', duration: 1, icon: '✡️', fast: true },
  { name: 'יום כיפור', date: '2025-10-01', duration: 1, icon: '✡️', fast: true },
  { name: 'סוכות', date: '2025-10-06', duration: 7, icon: '🌿' },
  { name: 'שמחת תורה', date: '2025-10-13', duration: 1, icon: '📖' },
  { name: 'חנוכה', date: '2025-12-14', duration: 8, icon: '🕎' },
  { name: 'צום עשרה בטבת', date: '2025-12-30', duration: 1, icon: '✡️', fast: true },
  // 2026
  { name: 'ט"ו בשבט', date: '2026-02-02', duration: 1, icon: '🌳' },
  { name: 'תענית אסתר', date: '2026-03-02', duration: 1, icon: '✡️', fast: true },
  { name: 'פורים', date: '2026-03-03', duration: 1, icon: '🎭' },
  { name: 'שושן פורים', date: '2026-03-04', duration: 1, icon: '🎭' },
  { name: 'ערב פסח', date: '2026-04-01', duration: 1, icon: '🍷' },
  { name: 'פסח', date: '2026-04-02', duration: 7, icon: '🍷' },
  { name: 'שביעי של פסח', date: '2026-04-08', duration: 1, icon: '🌊' },
  { name: 'יום הזכרון לשואה', date: '2026-04-14', duration: 1, icon: '🕯️' },
  { name: 'יום הזכרון', date: '2026-04-21', duration: 1, icon: '🕯️' },
  { name: 'יום העצמאות', date: '2026-04-22', duration: 1, icon: '🇮🇱' },
  { name: 'ל"ג בעומר', date: '2026-05-05', duration: 1, icon: '🔥' },
  { name: 'יום ירושלים', date: '2026-05-15', duration: 1, icon: '🏛️' },
  { name: 'שבועות', date: '2026-05-22', duration: 1, icon: '📜' },
  { name: 'צום י"ז בתמוז', date: '2026-07-02', duration: 1, icon: '✡️', fast: true },
  { name: 'תשעה באב', date: '2026-07-23', duration: 1, icon: '✡️', fast: true },
  // Rosh Chodesh
  { name: 'ראש חודש', date: '2025-09-22', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2025-10-22', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2025-11-20', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2025-12-20', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2026-01-18', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2026-02-17', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2026-03-17', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2026-04-17', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2026-05-16', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2026-06-15', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2026-07-15', duration: 1, icon: '🌙', minor: true },
  { name: 'ראש חודש', date: '2026-08-13', duration: 1, icon: '🌙', minor: true },
];

export const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const MONTH_NAMES = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
export const HOURS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

export const HEBREW_DATES: Record<string, string> = {
  '2026-04-01': 'י"ד ניסן', '2026-04-02': 'ט"ו ניסן', '2026-04-03': 'ט"ז ניסן',
  '2026-04-04': 'י"ז ניסן', '2026-04-05': 'י"ח ניסן', '2026-04-06': 'י"ט ניסן',
  '2026-04-07': 'כ ניסן', '2026-04-08': 'כ"א ניסן', '2026-04-09': 'כ"ב ניסן',
  '2026-04-10': 'כ"ג ניסן', '2026-04-11': 'כ"ד ניסן', '2026-04-12': 'כ"ה ניסן',
  '2026-04-13': 'כ"ו ניסן', '2026-04-14': 'כ"ז ניסן', '2026-04-15': 'כ"ח ניסן',
  '2026-04-16': 'כ"ט ניסן', '2026-04-17': 'א\' אייר', '2026-04-18': 'ב\' אייר',
  '2026-04-22': 'ה\' אייר', '2026-04-21': 'ד\' אייר', '2026-05-22': 'ו\' סיוון',
};

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
