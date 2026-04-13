// src/screens/WeekScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, PRIORITY_COLORS } from '../utils/theme';
import { getTasksForDate } from '../utils/storage';
import { DAY_NAMES, MONTH_NAMES, dateStr, getHolidaysForDate } from '../data/holidays';

const LINES_PER_DAY = 7;

export default function WeekScreen({ tasks, onAddTask, onToggleTask, onDeleteTask, onNavigateDay, onEditTask }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [editingLine, setEditingLine] = useState(null);
  const [editText, setEditText] = useState('');
  const today = new Date();

  function getWeekStart(offset) {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay() + offset * 7);
    return d;
  }

  const weekStart = getWeekStart(weekOffset);

  function getDayDate(i) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  }

  function getWeekLabel() {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    if (weekOffset === 0) return 'השבוע';
    if (weekOffset === 1) return 'שבוע הבא';
    if (weekOffset === -1) return 'שבוע שעבר';
    return `${weekStart.getDate()}–${end.getDate()} ${MONTH_NAMES[end.getMonth()]}`;
  }

  function commitInlineAdd(ds) {
    const trimmed = editText.trim();
    if (trimmed) {
      onAddTask({
        id: Date.now().toString(),
        title: trimmed,
        date: ds,
        time: '',
        priority: 'medium',
        note: '',
        done: false,
        created: new Date().toISOString(),
      });
    }
    setEditingLine(null);
    setEditText('');
  }

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) < 50) return;
      if (g.dx > 0) setWeekOffset(o => o + 1);
      else setWeekOffset(o => o - 1);
      Haptics.selectionAsync();
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => { setWeekOffset(o => o + 1); Haptics.selectionAsync(); }} style={styles.navArrow}>
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navLabel}>{getWeekLabel()}</Text>
          {weekOffset !== 0 && (
            <TouchableOpacity onPress={() => setWeekOffset(0)} style={styles.todayPill}>
              <Text style={styles.todayPillText}>היום</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => { setWeekOffset(o => o - 1); Haptics.selectionAsync(); }} style={styles.navArrow}>
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.grid}>
          {Array.from({ length: 7 }, (_, i) => {
            const d = getDayDate(i);
            const ds = dateStr(d);
            const isToday = ds === dateStr(today);
            const hols = getHolidaysForDate(ds);
            const dayTasks = getTasksForDate(tasks, ds);
            const totalLines = Math.max(LINES_PER_DAY, dayTasks.length + 1);

            return (
              <View key={ds} style={[styles.dayCard, isToday && styles.dayCardToday, i % 2 === 0 && styles.dayCardLeft]}>
                <TouchableOpacity style={styles.dayHeader} onPress={() => onNavigateDay(d)} activeOpacity={0.7}>
                  <View style={styles.dayHeaderLeft}>
                    {isToday && <View style={styles.todayAccent} />}
                    <View>
                      <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>{d.getDate()}</Text>
                      <Text style={[styles.dayNameLabel, isToday && styles.dayNameLabelToday]} numberOfLines={1}>
                        {DAY_NAMES[d.getDay()]}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={(e) => { e.stopPropagation(); onAddTask(null, ds); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.addBtnText}>+</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                {hols.length > 0 && (
                  <View style={styles.holStrip}>
                    <Text style={styles.holText} numberOfLines={1}>{hols[0].icon} {hols[0].name}</Text>
                  </View>
                )}

                {Array.from({ length: totalLines }, (_, l) => {
                  const task = dayTasks[l];
                  const isEditing = editingLine?.ds === ds && editingLine?.lineIndex === l;

                  if (isEditing) {
                    return (
                      <View key={`edit-${l}`} style={[styles.line, styles.lineEditing]}>
                        <TextInput
                          style={styles.inlineInput}
                          value={editText}
                          onChangeText={setEditText}
                          placeholder="משימה חדשה..."
                          placeholderTextColor={COLORS.textMute}
                          textAlign="right"
                          autoFocus
                          onSubmitEditing={() => commitInlineAdd(ds)}
                          onBlur={() => setTimeout(() => commitInlineAdd(ds), 150)}
                          returnKeyType="done"
                          blurOnSubmit={false}
                        />
                      </View>
                    );
                  }

                  if (task) {
                    const pri = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                    return (
                      <TouchableOpacity
                        key={task.id}
                        style={styles.line}
                        onPress={() => onEditTask(task)}
                        onLongPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          onToggleTask(task.id);
                        }}
                        delayLongPress={400}
                        activeOpacity={0.75}
                      >
                        <View style={styles.taskInner}>
                          <TouchableOpacity
                            onPress={() => onToggleTask(task.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <View style={[styles.checkCircle, task.done && styles.checkCircleDone]}>
                              {task.done && <Text style={styles.checkMark}>✓</Text>}
                            </View>
                          </TouchableOpacity>
                          <View style={[styles.priDot, { backgroundColor: pri.dot }]} />
                          <Text style={[styles.taskText, task.done && styles.taskTextDone]} numberOfLines={2}>
                            {task.title}{task.repeat && task.repeat !== 'none' ? ' 🔁' : ''}
                          </Text>
                          {task.time ? <Text style={styles.taskTime}>{task.time}</Text> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={`empty-${l}`}
                      style={styles.line}
                      onPress={() => { setEditingLine({ ds, lineIndex: l }); setEditText(''); }}
                      activeOpacity={0.4}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
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
  scroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCard: {
    width: '50%', borderBottomWidth: 1, borderLeftWidth: 1,
    borderColor: COLORS.border, backgroundColor: COLORS.bgCard,
  },
  dayCardLeft: { borderLeftWidth: 0, borderRightWidth: 1 },
  dayCardToday: { backgroundColor: '#fdfaf3' },
  dayHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  dayHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  todayAccent: { width: 3, height: 32, borderRadius: 1.5, backgroundColor: COLORS.gold },
  dayNum: { fontSize: 18, fontWeight: '800', color: COLORS.textPrime, lineHeight: 20 },
  dayNumToday: { color: COLORS.gold },
  dayNameLabel: { fontSize: 10, color: COLORS.textMute, fontWeight: '500', marginTop: 1 },
  dayNameLabelToday: { color: COLORS.gold },
  addBtn: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontSize: 17, color: COLORS.textMute, lineHeight: 22 },
  holStrip: {
    backgroundColor: 'rgba(160,120,40,0.07)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(160,120,40,0.15)',
    paddingHorizontal: 10, paddingVertical: 3,
  },
  holText: { fontSize: 10, color: COLORS.gold, fontWeight: '600' },
  line: {
    minHeight: 36, borderBottomWidth: 1, borderBottomColor: '#e8e4de',
    paddingHorizontal: 8, paddingVertical: 5, justifyContent: 'center',
  },
  lineEditing: { borderBottomColor: COLORS.gold, backgroundColor: '#fffdf5' },
  taskInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  checkCircle: {
    width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#bbb',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkCircleDone: { backgroundColor: COLORS.jade, borderColor: COLORS.jade },
  checkMark: { fontSize: 8, color: '#fff' },
  priDot: { width: 5, height: 5, borderRadius: 2.5, flexShrink: 0 },
  taskText: { flex: 1, fontSize: 11, color: COLORS.textPrime, fontWeight: '500', textAlign: 'right' },
  taskTextDone: { textDecorationLine: 'line-through', color: COLORS.textMute },
  taskTime: {
    fontSize: 9, color: COLORS.textMute, fontWeight: '600',
    backgroundColor: COLORS.bgVoid, borderRadius: 3, paddingHorizontal: 3, paddingVertical: 1,
  },
  inlineInput: { flex: 1, fontSize: 12, color: COLORS.textPrime, fontWeight: '500', minHeight: 28, paddingVertical: 2 },
});
