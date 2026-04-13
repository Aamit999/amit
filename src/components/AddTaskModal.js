// src/components/AddTaskModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, PRIORITY_COLORS } from '../utils/theme';
import { DAY_NAMES, MONTH_NAMES, parseLocalDate } from '../data/holidays';

const REPEAT_OPTIONS = [
  { value: 'none', label: 'ללא חזרה' },
  { value: 'daily', label: 'כל יום' },
  { value: 'weekly', label: 'כל שבוע' },
  { value: 'monthly', label: 'כל חודש' },
  { value: 'yearly', label: 'כל שנה' },
  { value: 'weekdays', label: 'ימים נבחרים' },
];

const WEEKDAYS_HE = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];

export default function AddTaskModal({ visible, onClose, onSave, initialDate }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());       // JS Date object
  const [time, setTime] = useState(null);              // JS Date object or null
  const [priority, setPriority] = useState('medium');
  const [repeat, setRepeat] = useState('none');
  const [repeatDays, setRepeatDays] = useState([]);
  const [showRepeat, setShowRepeat] = useState(false);

  // Picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Android needs 2-step: date then time
  const [pickerMode, setPickerMode] = useState('date'); // 'date' | 'time'

  const titleRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setNote('');
      const initDate = initialDate ? parseLocalDate(initialDate) : new Date();
      setDate(initDate);
      setTime(null);
      setPriority('medium');
      setRepeat('none');
      setRepeatDays([]);
      setShowRepeat(false);
      setShowDatePicker(false);
      setShowTimePicker(false);
      // Auto-focus title
      setTimeout(() => titleRef.current?.focus(), 300);
    }
  }, [visible, initialDate]);

  // ── Date helpers ──────────────────────────────────────────
  function formatDateLabel(d) {
    const days = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
    const months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
    return `${days[d.getDay()]}, ${d.getDate()} ב${months[d.getMonth()]}'`;
  }

  function formatTimeLabel(d) {
    if (!d) return 'בחר שעה';
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function dateToStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function timeToStr(d) {
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  // ── Picker handlers ───────────────────────────────────────
  function openDatePicker() {
    setShowTimePicker(false);
    setShowDatePicker(true);
  }

  function openTimePicker() {
    setShowDatePicker(false);
    setShowTimePicker(true);
  }

  function onDateChange(event, selected) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'dismissed') return;
    }
    if (selected) setDate(selected);
  }

  function onTimeChange(event, selected) {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'dismissed') return;
    }
    if (selected) setTime(selected);
  }

  // ── Save ──────────────────────────────────────────────────
  function handleSave() {
    if (!title.trim()) {
      titleRef.current?.focus();
      return;
    }
    // If no time selected — open time picker and wait
    if (!time) {
      openTimePicker();
      return;
    }
    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      note: note.trim(),
      date: dateToStr(date),
      time: timeToStr(time),
      priority,
      repeat,
      repeatDays: repeat === 'weekdays' ? repeatDays : [],
      done: false,
      created: new Date().toISOString(),
    });
  }

  function toggleDay(i) {
    setRepeatDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.cancelText}>ביטול</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>משימה חדשה</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>שמור</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

          {/* Title */}
          <TextInput
            ref={titleRef}
            style={styles.titleInput}
            placeholder="כותרת המשימה..."
            placeholderTextColor={COLORS.textMute}
            value={title}
            onChangeText={setTitle}
            textAlign="right"
            returnKeyType="next"
          />

          {/* Note */}
          <TextInput
            style={styles.noteInput}
            placeholder="הערות (לא חובה)"
            placeholderTextColor={COLORS.textMute}
            value={note}
            onChangeText={setNote}
            textAlign="right"
            multiline
          />

          <View style={styles.divider} />

          {/* Date row — tap to open picker */}
          <TouchableOpacity style={styles.fieldRow} onPress={openDatePicker} activeOpacity={0.7}>
            <Text style={styles.fieldIcon}>📅</Text>
            <Text style={styles.fieldLabel}>תאריך</Text>
            <Text style={styles.fieldValue}>{formatDateLabel(date)}</Text>
            <Text style={styles.fieldChevron}>›</Text>
          </TouchableOpacity>

          {/* iOS inline date picker */}
          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                locale="he"
                onChange={onDateChange}
                style={styles.picker}
                textColor={COLORS.textPrime}
              />
              <TouchableOpacity style={styles.pickerDone} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerDoneText}>סיום</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Time row — tap to open picker */}
          <TouchableOpacity
            style={[styles.fieldRow, !time && styles.fieldRowHighlight]}
            onPress={openTimePicker}
            activeOpacity={0.7}
          >
            <Text style={styles.fieldIcon}>⏰</Text>
            <Text style={styles.fieldLabel}>שעה</Text>
            <Text style={[styles.fieldValue, !time && styles.fieldValueEmpty]}>
              {formatTimeLabel(time)}
            </Text>
            <Text style={styles.fieldChevron}>›</Text>
          </TouchableOpacity>

          {/* iOS inline time picker */}
          {showTimePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={time || new Date()}
                mode="time"
                display="spinner"
                is24Hour
                locale="he"
                onChange={onTimeChange}
                style={styles.picker}
                textColor={COLORS.textPrime}
              />
              <TouchableOpacity style={styles.pickerDone} onPress={() => setShowTimePicker(false)}>
                <Text style={styles.pickerDoneText}>סיום</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>עדיפות</Text>
            <View style={styles.priorityRow}>
              {['high','medium','low'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priBtn, priority === p && { backgroundColor: PRIORITY_COLORS[p].bg, borderColor: PRIORITY_COLORS[p].border }]}
                  onPress={() => setPriority(p)}
                >
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
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.repeatOpt, repeat === r.value && styles.repeatOptSel]}
                    onPress={() => setRepeat(r.value)}
                  >
                    <Text style={[styles.repeatOptText, repeat === r.value && styles.repeatOptTextSel]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
                {repeat === 'weekdays' && (
                  <View style={styles.weekdayRow}>
                    {WEEKDAYS_HE.map((label, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[styles.wdBtn, repeatDays.includes(i) && styles.wdBtnOn]}
                        onPress={() => toggleDay(i)}
                      >
                        <Text style={[styles.wdText, repeatDays.includes(i) && styles.wdTextOn]}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

        </ScrollView>

        {/* Android pickers — rendered outside ScrollView as overlay */}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={time || new Date()}
            mode="time"
            display="default"
            is24Hour
            onChange={onTimeChange}
          />
        )}

      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgVoid },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 20,
    backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrime },
  headerBtn: { paddingHorizontal: 8, paddingVertical: 4, minWidth: 60 },
  cancelText: { fontSize: 15, color: COLORS.textSec, textAlign: 'center' },
  saveBtn: { backgroundColor: COLORS.gold, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, minWidth: 60 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  scroll: { flex: 1 },
  titleInput: {
    backgroundColor: COLORS.bgCard, fontSize: 22, fontWeight: '700',
    color: COLORS.textPrime, padding: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  noteInput: {
    backgroundColor: COLORS.bgCard, fontSize: 15, color: COLORS.textSec,
    padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, minHeight: 56,
  },
  divider: { height: 8, backgroundColor: COLORS.bgVoid },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12,
  },
  fieldRowHighlight: {
    backgroundColor: 'rgba(160,120,40,0.04)',
  },
  fieldIcon: { fontSize: 20 },
  fieldLabel: { fontSize: 15, color: COLORS.textSec, width: 52, textAlign: 'right' },
  fieldValue: { flex: 1, fontSize: 15, color: COLORS.gold, fontWeight: '600', textAlign: 'left' },
  fieldValueEmpty: { color: COLORS.textMute, fontWeight: '400' },
  fieldChevron: { fontSize: 18, color: COLORS.textMute },

  pickerWrapper: {
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  picker: { height: 200, backgroundColor: COLORS.bgCard },
  pickerDone: {
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pickerDoneText: { fontSize: 16, color: COLORS.gold, fontWeight: '700' },

  section: { backgroundColor: COLORS.bgCard, marginTop: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  sectionLabel: {
    fontSize: 11, color: COLORS.textMute, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, textAlign: 'right',
  },
  priorityRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 14 },
  priBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgVoid, alignItems: 'center',
  },
  priBtnText: { fontSize: 13, color: COLORS.textSec, fontWeight: '500' },
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
});
