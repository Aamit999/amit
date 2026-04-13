// src/components/TaskEditModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, PRIORITY_COLORS } from '../utils/theme';

const REPEAT_OPTIONS = [
  { value: 'none',     label: 'ללא חזרה' },
  { value: 'daily',    label: 'כל יום' },
  { value: 'weekly',   label: 'כל שבוע' },
  { value: 'monthly',  label: 'כל חודש' },
  { value: 'yearly',   label: 'כל שנה' },
  { value: 'weekdays', label: 'ימים נבחרים' },
];
const WEEKDAYS_HE = ['א\'','ב\'','ג\'','ד\'','ה\'','ו\'','ש\''];
const DAY_NAMES = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const MONTH_NAMES = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function parseLocal(str) {
  const [y,m,d] = str.split('-').map(Number);
  return new Date(y, m-1, d);
}

export default function TaskEditModal({ visible, task, onClose, onSave, onDelete }) {
  const [title, setTitle]     = useState('');
  const [note, setNote]       = useState('');
  const [date, setDate]       = useState(new Date());
  const [time, setTime]       = useState(null);
  const [priority, setPriority] = useState('medium');
  const [repeat, setRepeat]   = useState('none');
  const [repeatDays, setRepeatDays] = useState([]);
  const [showRepeat, setShowRepeat] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (task && visible) {
      setTitle(task.title || '');
      setNote(task.note || '');
      setPriority(task.priority || 'medium');
      setRepeat(task.repeat || 'none');
      setRepeatDays(task.repeatDays || []);
      setShowRepeat(false);
      setShowDatePicker(false);
      setShowTimePicker(false);

      if (task.date) setDate(parseLocal(task.date));
      else setDate(new Date());

      if (task.time) {
        const [h, m] = task.time.split(':').map(Number);
        const t = new Date(); t.setHours(h, m, 0, 0);
        setTime(t);
      } else setTime(null);
    }
  }, [task, visible]);

  function formatDateLabel(d) {
    return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ב${MONTH_NAMES[d.getMonth()]}'`;
  }
  function formatTimeLabel(d) {
    if (!d) return 'ללא שעה';
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  function dateToStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function timeToStr(d) {
    if (!d) return '';
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      ...task,
      title: title.trim(),
      note: note.trim(),
      date: dateToStr(date),
      time: timeToStr(time),
      priority,
      repeat,
      repeatDays: repeat === 'weekdays' ? repeatDays : [],
    });
  }

  function handleDelete() {
    Alert.alert('מחיקת משימה', `למחוק את "${task?.title}"?`, [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => { onDelete(task.id); onClose(); } },
    ]);
  }

  function toggleDay(i) {
    setRepeatDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]);
  }

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.cancelText}>ביטול</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>עריכת משימה</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>שמור</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.titleInput}
            value={title} onChangeText={setTitle}
            placeholder="כותרת" placeholderTextColor={COLORS.textMute}
            textAlign="right" autoFocus
          />
          <TextInput
            style={styles.noteInput}
            value={note} onChangeText={setNote}
            placeholder="הערות" placeholderTextColor={COLORS.textMute}
            textAlign="right" multiline
          />
          <View style={styles.divider} />

          {/* Date */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => { setShowTimePicker(false); setShowDatePicker(v => !v); }} activeOpacity={0.7}>
            <Text style={styles.fieldIcon}>📅</Text>
            <Text style={styles.fieldLabel}>תאריך</Text>
            <Text style={styles.fieldValue}>{formatDateLabel(date)}</Text>
            <Text style={styles.fieldChevron}>›</Text>
          </TouchableOpacity>
          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerWrapper}>
              <DateTimePicker value={date} mode="date" display="spinner" locale="he"
                onChange={(e, d) => { if (d) setDate(d); }} style={styles.picker} textColor={COLORS.textPrime} />
              <TouchableOpacity style={styles.pickerDone} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerDoneText}>סיום</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Time */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => { setShowDatePicker(false); setShowTimePicker(v => !v); }} activeOpacity={0.7}>
            <Text style={styles.fieldIcon}>⏰</Text>
            <Text style={styles.fieldLabel}>שעה</Text>
            <Text style={[styles.fieldValue, !time && { color: COLORS.textMute }]}>{formatTimeLabel(time)}</Text>
            <Text style={styles.fieldChevron}>›</Text>
          </TouchableOpacity>
          {showTimePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerWrapper}>
              <DateTimePicker value={time || new Date()} mode="time" display="spinner" is24Hour locale="he"
                onChange={(e, d) => { if (d) setTime(d); }} style={styles.picker} textColor={COLORS.textPrime} />
              <View style={styles.pickerDoneRow}>
                <TouchableOpacity onPress={() => { setTime(null); setShowTimePicker(false); }}>
                  <Text style={[styles.pickerDoneText, { color: COLORS.ember }]}>הסר שעה</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerDoneText}>סיום</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>עדיפות</Text>
            <View style={styles.priorityRow}>
              {['high','medium','low'].map(p => (
                <TouchableOpacity key={p}
                  style={[styles.priBtn, priority === p && { backgroundColor: PRIORITY_COLORS[p].bg, borderColor: PRIORITY_COLORS[p].border }]}
                  onPress={() => setPriority(p)}>
                  <Text style={[styles.priBtnText, priority === p && { color: PRIORITY_COLORS[p].text }]}>
                    {p === 'high' ? '🔴 גבוהה' : p === 'medium' ? '🟡 בינונית' : '🔵 נמוכה'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Repeat */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.repeatToggle} onPress={() => setShowRepeat(v => !v)}>
              <Text style={styles.fieldIcon}>🔁</Text>
              <Text style={styles.fieldLabel}>חזרה</Text>
              <Text style={[styles.fieldValue, repeat !== 'none' && { color: COLORS.gold }]}>
                {REPEAT_OPTIONS.find(r => r.value === repeat)?.label}
              </Text>
              <Text style={styles.fieldChevron}>{showRepeat ? '▼' : '›'}</Text>
            </TouchableOpacity>
            {showRepeat && (
              <View style={styles.repeatOptions}>
                {REPEAT_OPTIONS.map(r => (
                  <TouchableOpacity key={r.value}
                    style={[styles.repeatOpt, repeat === r.value && styles.repeatOptSel]}
                    onPress={() => setRepeat(r.value)}>
                    <Text style={[styles.repeatOptText, repeat === r.value && styles.repeatOptTextSel]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
                {repeat === 'weekdays' && (
                  <View style={styles.weekdayRow}>
                    {WEEKDAYS_HE.map((label, i) => (
                      <TouchableOpacity key={i}
                        style={[styles.wdBtn, repeatDays.includes(i) && styles.wdBtnOn]}
                        onPress={() => toggleDay(i)}>
                        <Text style={[styles.wdText, repeatDays.includes(i) && styles.wdTextOn]}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>🗑️  מחק משימה</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Android pickers */}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker value={date} mode="date" display="default"
            onChange={(e, d) => { setShowDatePicker(false); if (d) setDate(d); }} />
        )}
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker value={time || new Date()} mode="time" display="default" is24Hour
            onChange={(e, d) => { setShowTimePicker(false); if (d) setTime(d); }} />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgVoid },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 20, backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrime },
  headerBtn: { paddingHorizontal: 8, paddingVertical: 4, minWidth: 60 },
  cancelText: { fontSize: 15, color: COLORS.textSec },
  saveBtn: { backgroundColor: COLORS.gold, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, minWidth: 60 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  scroll: { flex: 1 },
  titleInput: {
    backgroundColor: COLORS.bgCard, fontSize: 22, fontWeight: '700',
    color: COLORS.textPrime, padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  noteInput: {
    backgroundColor: COLORS.bgCard, fontSize: 15, color: COLORS.textSec,
    padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, minHeight: 56,
  },
  divider: { height: 8, backgroundColor: COLORS.bgVoid },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12,
  },
  fieldIcon: { fontSize: 20 },
  fieldLabel: { fontSize: 15, color: COLORS.textSec, width: 52, textAlign: 'right' },
  fieldValue: { flex: 1, fontSize: 15, color: COLORS.gold, fontWeight: '600', textAlign: 'left' },
  fieldChevron: { fontSize: 18, color: COLORS.textMute },
  pickerWrapper: { backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  picker: { height: 200, backgroundColor: COLORS.bgCard },
  pickerDone: { alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  pickerDoneRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  pickerDoneText: { fontSize: 16, color: COLORS.gold, fontWeight: '700' },
  section: { backgroundColor: COLORS.bgCard, marginTop: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  sectionLabel: { fontSize: 11, color: COLORS.textMute, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, textAlign: 'right' },
  priorityRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 14 },
  priBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgVoid, alignItems: 'center' },
  priBtnText: { fontSize: 12, color: COLORS.textSec, fontWeight: '500' },
  repeatToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  repeatOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 14 },
  repeatOpt: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgVoid },
  repeatOptSel: { backgroundColor: COLORS.goldDim, borderColor: COLORS.gold },
  repeatOptText: { fontSize: 13, color: COLORS.textSec },
  repeatOptTextSel: { color: COLORS.gold, fontWeight: '700' },
  weekdayRow: { flexDirection: 'row', gap: 6, paddingTop: 4, width: '100%' },
  wdBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  wdBtnOn: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  wdText: { fontSize: 12, fontWeight: '600', color: COLORS.textSec },
  wdTextOn: { color: '#fff' },
  deleteBtn: { marginHorizontal: 16, marginTop: 24, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(192,57,43,0.3)', backgroundColor: 'rgba(192,57,43,0.06)', alignItems: 'center' },
  deleteBtnText: { fontSize: 15, color: COLORS.ember, fontWeight: '600' },
});
