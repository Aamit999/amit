// src/screens/MonthScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { COLORS, PRIORITY_COLORS } from '../utils/theme';
import { getTasksForDate } from '../utils/storage';
import { DAY_NAMES, MONTH_NAMES, HEBREW_DATES, dateStr, getHolidaysForDate } from '../data/holidays';

export default function MonthScreen({ tasks, onNavigateDay }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function navigate(dir) {
    let m = month + dir;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  let cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: prevDays - i, other: true, date: new Date(year, month - 1, prevDays - i) });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, other: false, date: new Date(year, month, d) });
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - daysInMonth - firstDay + 1, other: true, date: new Date(year, month + 1, cells.length - daysInMonth - firstDay + 1) });

  return (
    <View style={styles.container}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigate(1)} style={styles.navArrow}>
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}>
          <Text style={styles.navLabel}>{MONTH_NAMES[month]} {year}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.navArrow}>
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Day names header */}
      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((n, i) => (
          <Text key={i} style={[styles.dayName, i === 6 && styles.dayNameShabbat]}>
            {n.slice(0, 1)}
          </Text>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {cells.map((cell, idx) => {
            const ds = dateStr(cell.date);
            const isToday = ds === dateStr(today);
            const hols = getHolidaysForDate(ds);
            const cellTasks = getTasksForDate(tasks, ds);

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.cell,
                  cell.other && styles.cellOther,
                  isToday && styles.cellToday,
                  hols.length > 0 && styles.cellHoliday,
                ]}
                onPress={() => !cell.other && onNavigateDay(cell.date)}
                activeOpacity={0.7}
              >
                {isToday ? (
                  <View style={styles.todayCircle}>
                    <Text style={styles.todayNum}>{cell.day}</Text>
                  </View>
                ) : (
                  <Text style={[styles.cellNum, cell.other && styles.cellNumOther]}>
                    {cell.day}
                  </Text>
                )}

                {hols.length > 0 && (
                  <Text style={styles.cellHolIcon} numberOfLines={1}>{hols[0].icon}</Text>
                )}

                {cellTasks.length > 0 && !cell.other && (
                  <View style={styles.taskDots}>
                    {cellTasks.slice(0, 3).map((t, ti) => (
                      <View
                        key={ti}
                        style={[styles.taskDot, { backgroundColor: PRIORITY_COLORS[t.priority]?.dot || COLORS.gold }]}
                      />
                    ))}
                    {cellTasks.length > 3 && (
                      <Text style={styles.taskMore}>+{cellTasks.length - 3}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgCard },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navArrow: { padding: 8 },
  navArrowText: { fontSize: 22, color: COLORS.textSec },
  navLabel: { fontSize: 18, fontWeight: '700', color: COLORS.textPrime },

  dayNamesRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgVoid,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMute,
    letterSpacing: 0.5,
  },
  dayNameShabbat: { color: COLORS.gold, opacity: 0.7 },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },

  cell: {
    width: `${100 / 7}%`,
    minHeight: 80,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    padding: 6,
    backgroundColor: COLORS.bgCard,
  },
  cellOther: { opacity: 0.3 },
  cellToday: { backgroundColor: 'rgba(160,120,40,0.06)' },
  cellHoliday: { backgroundColor: 'rgba(160,120,40,0.04)' },

  cellNum: { fontSize: 13, fontWeight: '700', color: COLORS.textPrime, textAlign: 'right' },
  cellNumOther: { color: COLORS.textMute },

  todayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  todayNum: { fontSize: 12, fontWeight: '800', color: '#fff' },

  cellHolIcon: { fontSize: 14, marginTop: 2, textAlign: 'right' },

  taskDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  taskDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  taskMore: {
    fontSize: 8,
    color: COLORS.textMute,
    fontWeight: '700',
  },
});
