// src/screens/HolidaysScreen.js
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { COLORS } from '../utils/theme';
import { HOLIDAYS, MONTH_NAMES, DAY_NAMES, parseLocalDate, dateStr } from '../data/holidays';

export default function HolidaysScreen({ onNavigateDay }) {
  const today = new Date();

  const upcoming = HOLIDAYS
    .filter(h => parseLocalDate(h.date) >= today)
    .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date))
    .slice(0, 20);

  function getDiffText(dateStr_) {
    const d = parseLocalDate(dateStr_);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'היום!';
    if (diff === 1) return 'מחר';
    return `בעוד ${diff} ימים`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✦ חגים ומועדים</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {upcoming.map((h, i) => {
          const d = parseLocalDate(h.date);
          const diffText = getDiffText(h.date);
          const isToday = h.date === dateStr(today);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.row, isToday && styles.rowToday]}
              onPress={() => onNavigateDay(d)}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>{h.icon}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{h.name}</Text>
                <Text style={styles.date}>
                  {DAY_NAMES[d.getDay()]}, {d.getDate()} ב{MONTH_NAMES[d.getMonth()]}' {d.getFullYear()}
                </Text>
                {h.duration > 1 && (
                  <Text style={styles.duration}>{h.duration} ימים</Text>
                )}
              </View>
              <View style={[styles.countdown, isToday && styles.countdownToday]}>
                <Text style={[styles.countdownText, isToday && styles.countdownTextToday]}>
                  {diffText}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgVoid },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  rowToday: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(160,120,40,0.04)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgVoid,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.textPrime, textAlign: 'right' },
  date: { fontSize: 12, color: COLORS.textSec, marginTop: 2, textAlign: 'right' },
  duration: { fontSize: 11, color: COLORS.textMute, marginTop: 2, textAlign: 'right' },
  countdown: {
    backgroundColor: COLORS.bgVoid,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  countdownToday: { backgroundColor: COLORS.goldDim },
  countdownText: { fontSize: 11, fontWeight: '600', color: COLORS.textSec },
  countdownTextToday: { color: COLORS.gold },
});
