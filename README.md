# יומן משימות — React Native App

## מבנה הקבצים

```
yoman-app/
├── App.js                          # ← כניסה ראשית, ניהול state
├── index.js
├── app.json                        # ← הגדרות Expo + הרשאות notifications
├── package.json
├── babel.config.js
└── src/
    ├── components/
    │   └── AddTaskModal.js         # ← טופס הוספת משימה
    ├── screens/
    │   ├── WeekScreen.js           # ← תצוגת שבוע (עם עריכה inline)
    │   ├── DayScreen.js            # ← תצוגת יום עם ציר זמן
    │   ├── MonthScreen.js          # ← תצוגת לוח חודשי
    │   └── HolidaysScreen.js       # ← רשימת חגים קרובים
    ├── data/
    │   └── holidays.js             # ← חגים יהודיים + פונקציות תאריך
    └── utils/
        ├── storage.js              # ← AsyncStorage (שמירת משימות)
        ├── notifications.js        # ← expo-notifications (התראות ברקע)
        └── theme.js                # ← צבעים וסגנון
```

---

## 🚀 הרצה מהירה (Expo Go)

```bash
# 1. התקן תלויות
npm install

# 2. הפעל
npx expo start

# 3. סרוק את ה-QR עם Expo Go (iOS / Android)
```

**⚠️ חשוב:** `expo-notifications` עובד ב-Expo Go רק לתזמון בעוד זמן מה,
אך **לא שולח ברקע** כשהאפליקציה סגורה לחלוטין ב-Expo Go.
כדי שההתראות יעבדו ברקע מלא:

---

## 📱 Build מלא עם EAS (מומלץ)

```bash
# 1. התקן EAS CLI
npm install -g eas-cli

# 2. התחבר לחשבון Expo
eas login

# 3. צור את הפרויקט
eas build:configure

# 4. עדכן app.json — תחליף YOUR_EAS_PROJECT_ID בערך שמקבלים מ-eas build:configure

# 5. Build לאנדרואיד (APK לבדיקה)
eas build --platform android --profile preview

# 6. Build ל-iOS (דורש Apple Developer Account)
eas build --platform ios
```

---

## 🔔 איך ההתראות עובדות

קובץ `src/utils/notifications.js` מטפל בכל:

1. **בקשת הרשאה** — `requestPermissions()` נקראת עם טעינת האפליקציה
2. **תזמון** — `scheduleTaskNotification(task)` מתזמן את ההתראה לשעת המשימה
   - משימה חד-פעמית: `trigger: { date }` — מופעלת פעם אחת
   - יומית: `trigger: { hour, minute, repeats: true }` — חוזרת כל יום
   - שבועית: `trigger: { weekday, hour, minute, repeats: true }` — חוזרת כל שבוע
3. **ביטול** — `cancelTaskNotification(notificationId)` — כשמסמנים כבוצע או מוחקים
4. **Foreground** — כשהאפליקציה פתוחה מוצג Alert עם אפשרות לסמן כבוצע
5. **Background** — כשהאפליקציה ברקע/סגורה — התראת מערכת עם צליל

---

## הוספת תאריך במודל

בטופס הוספת משימה (AddTaskModal) יש שדות טקסט:
- **תאריך**: הזן בפורמט `DD/MM/YYYY` — לדוגמה `15/04/2026`
- **שעה**: הזן בפורמט `HH:MM` — לדוגמה `09:30`

---

## עריכת משימה בשבוע

לחץ על שורה ריקה בשבוע → מקלדת נפתחת → כתוב → Enter לשמור.
לחיצה ארוכה על משימה → תפריט מחיקה/סימון.
