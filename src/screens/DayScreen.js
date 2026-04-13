// src/screens/DayScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, PRIORITY_COLORS } from '../utils/theme';
import { getTasksForDate } from '../utils/storage';
import { DAY_NAMES, MONTH_NAMES, HEBREW_DATES, dateStr, getHolidaysForDate } from '../data/holidays';

const HOURS = ['07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22'];

export default function DayScreen({ tasks, onAddTask, onToggleTask, onDeleteTask, onEditTask, initialDate }) {
  const today = new Date();
  const [dayOffset, setDayOffset] = useState(() => {
    if (!initialDate) return 0;
    const diff = Math.round((initialDate - today) / 86400000);
    return diff;
  });

  const currentDay = new Date(today);
  currentDay.setDate(today.getDate() + dayOffset);
  const ds = dateStr(currentDay);

  const dayTasks = getTasksForDate(tasks, ds);
  const hols = getHolidaysForDate(ds);

  function getDayLabel() {
    if (dayOffset === 0) return 'היום';
    if (dayOffset === 1) return 'מחר';
    if (dayOffset === -1) return 'אתמול';
    return `${DAY_NAMES[currentDay.getDay()]}, ${currentDay.getDate()} ב${MONTH_NAMES[currentDay.getMonth()]}'`;
  }

  function getTasksForHour(h) {
    return dayTasks.filter(t => t.time && t.time.startsWith(h + ':'));
  }

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) < 50) return;
      if (g.dx > 0) setDayOffset(o => o + 1);
      else setDayOffset(o => o - 1);
      Haptics.selectionAsync();
    },
  });

  function TaskChip({ task }) {
    const pri = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
    return (
      <TouchableOpacity
        style={[styles.chip, { backgroundColor: pri.bg, borderRightColor: pri.border }]}
        onPress={() => onEditTask(task)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onToggleTask(task.id);
        }}
        delayLongPress={400}
        activeOpacity={0.8}
      >
        <TouchableOpacity
          onPress={() => onToggleTask(task.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={[styles.chipCheck, task.done && { backgroundColor: COLORS.jade, borderColor: COLORS.jade }]}>
            {task.done && <Text style={styles.chipCheckMark}>✓</Text>}
          </View>
        </TouchableOpacity>
        <Text style={[styles.chipText, { color: pri.text }, task.done && styles.chipTextDone]} numberOfLines={2}>
          {task.title}
        </Text>
        {task.repeat && task.repeat !== 'none' && <Text style={styles.repeatIcon}>🔁</Text>}
      </TouchableOpacity>
    );
  }

  const noTimeTasks = dayTasks.filter(t => !t.time);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => { setDayOffset(o => o + 1); Haptics.selectionAsync(); }} style={styles.navArrow}>
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navLabel}>{getDayLabel()}</Text>
          {dayOffset !== 0 && (
            <TouchableOpacity onPress={() => setDayOffset(0)} style={styles.todayPill}>
              <Text style={styles.todayPillText}>היום</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => { setDayOffset(o => o - 1); Haptics.selectionAsync(); }} style={styles.navArrow}>
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Day info */}
      <View style={styles.dayInfo}>
        <View style={styles.dayInfoLeft}>
          <Text style={styles.dayNum}>{currentDay.getDate()}</Text>
          <View>
            <Text style={styles.dayName}>{DAY_NAMES[currentDay.getDay()]}</Text>
            <Text style={styles.dayMonth}>{MONTH_NAMES[currentDay.getMonth()]} {currentDay.getFullYear()}</Text>
            {HEBREW_DATES[ds] && <Text style={styles.dayHebrew}>{HEBREW_DATES[ds]}</Text>}
          </View>
        </View>
        <View style={styles.dayCount}>
          <Text style={styles.dayCountNum}>{dayTasks.length}</Text>
          <Text style={styles.dayCountLabel}>משימות</Text>
        </View>
      </View>

      {/* Holidays */}
      {hols.length > 0 && (
        <View style={styles.holBanner}>
          {hols.map((h, i) => (
            <Text key={i} style={styles.holText}>{h.icon} {h.name}</Text>
          ))}
        </View>
      )}

      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        {/* All-day tasks */}
        {noTimeTasks.length > 0 && (
          <View style={styles.timeSlot}>
            <Text style={[styles.timeLabel, { fontSize: 9 }]}>כל{'\n'}היום</Text>
            <View style={styles.slotContent}>
              {noTimeTasks.map(t => <TaskChip key={t.id} task={t} />)}
            </View>
          </View>
        )}

        {HOURS.map(h => {
          const slotTasks = getTasksForHour(h);
          return (
            <TouchableOpacity
              key={h}
              style={[styles.timeSlot, slotTasks.length > 0 && styles.timeSlotFilled]}
              onPress={() => onAddTask(h + ':00', ds)}
              activeOpacity={slotTasks.length > 0 ? 1 : 0.85}
            >
              <Text style={styles.timeLabel}>{h}:00</Text>
              <View style={styles.slotContent}>
                {slotTasks.map(t => <TaskChip key={t.id} task={t} />)}
                {slotTasks.length === 0 && (
                  <View style={styles.emptySlotHint} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgVoid },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 10,
    backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  navArrow: { padding: 10 },
  navArrowText: { fontSize: 24, color: COLORS.textSec },
  navCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrime },
  todayPill: {
    backgroundColor: COLORS.goldDim, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.gold,
  },
  todayPillText: { fontSize: 11, color: COLORS.gold, fontWeight: '700' },
  dayInfo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard, padding: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  dayInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dayNum: { fontSize: 52, fontWeight: '900', color: COLORS.gold, lineHeight: 56 },
  dayName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrime },
  dayMonth: { fontSize: 13, color: COLORS.textSec },
  dayHebrew: { fontSize: 11, color: COLORS.gold, marginTop: 4, opacity: 0.8 },
  dayCount: { alignItems: 'center' },
  dayCountNum: { fontSize: 32, fontWeight: '800', color: COLORS.textPrime },
  dayCountLabel: { fontSize: 11, color: COLORS.textSec },
  holBanner: {
    backgroundColor: 'rgba(160,120,40,0.07)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(160,120,40,0.2)',
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  holText: { fontSize: 14, color: COLORS.gold, fontWeight: '600' },
  timeline: { flex: 1 },
  timeSlot: {
    flexDirection: 'row', minHeight: 52,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  timeSlotFilled: { minHeight: 60 },
  timeLabel: {
    width: 52, paddingTop: 8, paddingHorizontal: 6,
    fontSize: 10, color: COLORS.textMute, fontWeight: '500',
    borderRightWidth: 1, borderRightColor: COLORS.border, textAlign: 'center',
  },
  slotContent: { flex: 1, padding: 5, gap: 3 },
  emptySlotHint: { flex: 1 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 6, borderRightWidth: 3,
  },
  chipCheck: {
    width: 15, height: 15, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#bbb',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  chipCheckMark: { fontSize: 9, color: '#fff' },
  chipText: { flex: 1, fontSize: 13, fontWeight: '500', textAlign: 'right' },
  chipTextDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  repeatIcon: { fontSize: 10 },
});
