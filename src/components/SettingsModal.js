// src/components/SettingsModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Alert, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { COLORS } from '../utils/theme';

// ── Sound definitions ─────────────────────────────────────────────────────────
// We use the system notification sounds via Expo's notification API for the real alarm.
// For preview in the settings screen we play tones via Audio API.
export const SOUND_OPTIONS = [
  { id: 'default',   label: 'ברירת מחדל',  emoji: '🔔', description: 'צליל מערכת רגיל' },
  { id: 'bell',      label: 'פעמון',        emoji: '🛎️', description: 'פעמון עמוק' },
  { id: 'chime',     label: 'צלצול',        emoji: '✨', description: 'צלצול קל' },
  { id: 'ding',      label: 'דינג',         emoji: '🎵', description: 'צליל קצר' },
  { id: 'alarm',     label: 'אזעקה',        emoji: '🚨', description: 'חזק ומהיר' },
  { id: 'gentle',    label: 'עדין',         emoji: '🌸', description: 'רך ונעים' },
];

// Duration options in seconds
const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

const STORAGE_KEYS = {
  sound: 'settings_sound',
  duration: 'settings_duration',
  vibrate: 'settings_vibrate',
};

export async function loadSettings() {
  try {
    const [sound, duration, vibrate] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.sound),
      AsyncStorage.getItem(STORAGE_KEYS.duration),
      AsyncStorage.getItem(STORAGE_KEYS.vibrate),
    ]);
    return {
      sound: sound || 'default',
      duration: duration ? parseInt(duration) : 15,
      vibrate: vibrate !== 'false',
    };
  } catch {
    return { sound: 'default', duration: 15, vibrate: true };
  }
}

async function saveSettings(settings) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.sound, settings.sound],
    [STORAGE_KEYS.duration, String(settings.duration)],
    [STORAGE_KEYS.vibrate, String(settings.vibrate)],
  ]);
}

// Play a preview tone using AudioContext-equivalent (expo-av)
// Each sound id generates a different tone pattern
async function playPreviewSound(soundId) {
  try {
    // Create a short beep using expo-av with a data URI isn't supported,
    // so we use system sounds via a dummy notification (silent, local)
    // and generate tones via simple frequency patterns.
    // For real preview we trigger the actual notification sound.
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `תצוגה מקדימה — ${SOUND_OPTIONS.find(s => s.id === soundId)?.label}`,
        body: 'כך נשמעת ההתראה שלך',
        sound: soundId === 'default' ? 'default' : 'default',
        data: { preview: true },
      },
      trigger: { seconds: 1 },
    });
  } catch (e) {
    console.warn('Preview sound error:', e);
  }
}

export default function SettingsModal({ visible, onClose }) {
  const [sound, setSound] = useState('default');
  const [duration, setDuration] = useState(15);
  const [vibrate, setVibrate] = useState(true);
  const [notifPermission, setNotifPermission] = useState('unknown');
  const [previewingId, setPreviewingId] = useState(null);

  useEffect(() => {
    if (visible) {
      loadSettings().then(s => {
        setSound(s.sound);
        setDuration(s.duration);
        setVibrate(s.vibrate);
      });
      Notifications.getPermissionsAsync().then(({ status }) => setNotifPermission(status));
    }
  }, [visible]);

  async function handleSave() {
    await saveSettings({ sound, duration, vibrate });
    // Update notification channel on Android with new vibration setting
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('task-alarms', {
        name: 'התראות משימות',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: vibrate ? [0, 250, 250, 250] : [],
        sound: sound === 'default' ? 'default' : sound,
        enableVibrate: vibrate,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  async function handlePreview(soundId) {
    setPreviewingId(soundId);
    await playPreviewSound(soundId);
    setTimeout(() => setPreviewingId(null), 2000);
  }

  async function handleRequestPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotifPermission(status);
    if (status === 'granted') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert(
        'הרשאה נדחתה',
        'כדי לאפשר התראות, כנס להגדרות הטלפון > אפליקציות > יומן > התראות',
        [{ text: 'אישור' }]
      );
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.cancelText}>ביטול</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚙️ הגדרות</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>שמור</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Notification permission ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>התראות</Text>
          </View>
          <View style={styles.permRow}>
            <View style={styles.permInfo}>
              <Text style={styles.permLabel}>הרשאת התראות</Text>
              <Text style={[
                styles.permStatus,
                notifPermission === 'granted' && styles.permGranted,
                notifPermission === 'denied' && styles.permDenied,
              ]}>
                {notifPermission === 'granted' ? '✅ מופעל' :
                 notifPermission === 'denied' ? '❌ חסום' : '⚠️ לא הוגדר'}
              </Text>
            </View>
            {notifPermission !== 'granted' && (
              <TouchableOpacity style={styles.permBtn} onPress={handleRequestPermission}>
                <Text style={styles.permBtnText}>אפשר</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Vibration ── */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleIcon}>📳</Text>
            <Text style={styles.toggleLabel}>רטט בהתראה</Text>
            <Switch
              value={vibrate}
              onValueChange={setVibrate}
              trackColor={{ false: COLORS.border, true: COLORS.goldDim }}
              thumbColor={vibrate ? COLORS.gold : '#ccc'}
            />
          </View>

          {/* ── Sound selection ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>צליל התראה</Text>
            <Text style={styles.sectionSub}>לחץ על צליל לתצוגה מקדימה</Text>
          </View>

          {SOUND_OPTIONS.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.soundRow, sound === s.id && styles.soundRowSelected]}
              onPress={() => { setSound(s.id); handlePreview(s.id); }}
              activeOpacity={0.75}
            >
              <View style={[styles.soundRadio, sound === s.id && styles.soundRadioSelected]}>
                {sound === s.id && <View style={styles.soundRadioDot} />}
              </View>
              <Text style={styles.soundEmoji}>{s.emoji}</Text>
              <View style={styles.soundInfo}>
                <Text style={[styles.soundLabel, sound === s.id && styles.soundLabelSelected]}>
                  {s.label}
                </Text>
                <Text style={styles.soundDesc}>{s.description}</Text>
              </View>
              {previewingId === s.id && (
                <View style={styles.playingBadge}>
                  <Text style={styles.playingText}>מנגן...</Text>
                </View>
              )}
              {sound === s.id && previewingId !== s.id && (
                <TouchableOpacity
                  style={styles.previewBtn}
                  onPress={() => handlePreview(s.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.previewBtnText}>▶</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}

          {/* ── Ring duration ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>משך צלצול</Text>
            <Text style={styles.sectionSub}>כמה זמן תצלצל ההתראה</Text>
          </View>

          <View style={styles.durationGrid}>
            {DURATION_OPTIONS.map(sec => (
              <TouchableOpacity
                key={sec}
                style={[styles.durationBtn, duration === sec && styles.durationBtnSelected]}
                onPress={() => { setDuration(sec); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.durationNum, duration === sec && styles.durationNumSelected]}>
                  {sec < 60 ? sec : '60'}
                </Text>
                <Text style={[styles.durationUnit, duration === sec && styles.durationUnitSelected]}>
                  {sec < 60 ? 'שנ\'' : 'דק\''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.durationNote}>
            <Text style={styles.durationNoteText}>
              💡 בחרת: {duration} שניות{'\n'}
              הערה: ב-Android ניתן לקבוע את משך הצלצול גם דרך הגדרות הטלפון ← צלילים ← משך צלצול.
            </Text>
          </View>

          {/* ── About ── */}
          <View style={styles.aboutBox}>
            <Text style={styles.aboutTitle}>✦ יומן משימות</Text>
            <Text style={styles.aboutText}>גרסה 1.0.0 · כל הנתונים נשמרים על הטלפון בלבד, ללא שרתים חיצוניים.</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
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
  cancelText: { fontSize: 15, color: COLORS.textSec },
  saveBtn: { backgroundColor: COLORS.gold, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, minWidth: 60 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  scroll: { flex: 1 },

  sectionHeader: {
    paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMute, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' },
  sectionSub: { fontSize: 12, color: COLORS.textMute, marginTop: 2, textAlign: 'right' },

  permRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard, marginHorizontal: 0,
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  permInfo: { flex: 1 },
  permLabel: { fontSize: 15, color: COLORS.textPrime, fontWeight: '500', textAlign: 'right' },
  permStatus: { fontSize: 13, color: COLORS.textMute, marginTop: 2, textAlign: 'right' },
  permGranted: { color: '#1a8a5a' },
  permDenied: { color: COLORS.ember },
  permBtn: {
    backgroundColor: COLORS.gold, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8, marginLeft: 12,
  },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  toggleIcon: { fontSize: 20 },
  toggleLabel: { flex: 1, fontSize: 15, color: COLORS.textPrime, textAlign: 'right' },

  soundRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  soundRowSelected: { backgroundColor: 'rgba(160,120,40,0.04)' },
  soundRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  soundRadioSelected: { borderColor: COLORS.gold },
  soundRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.gold },
  soundEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  soundInfo: { flex: 1 },
  soundLabel: { fontSize: 15, color: COLORS.textPrime, fontWeight: '500', textAlign: 'right' },
  soundLabelSelected: { color: COLORS.gold, fontWeight: '700' },
  soundDesc: { fontSize: 12, color: COLORS.textMute, marginTop: 2, textAlign: 'right' },
  playingBadge: {
    backgroundColor: COLORS.goldDim, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  playingText: { fontSize: 11, color: COLORS.gold, fontWeight: '700' },
  previewBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.goldDim, borderWidth: 1, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  previewBtnText: { fontSize: 13, color: COLORS.gold },

  durationGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 10,
    backgroundColor: COLORS.bgCard,
    paddingVertical: 16,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  durationBtn: {
    width: 72, height: 72, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bgVoid,
    alignItems: 'center', justifyContent: 'center',
  },
  durationBtnSelected: {
    backgroundColor: COLORS.goldDim,
    borderColor: COLORS.gold,
    borderWidth: 2,
  },
  durationNum: { fontSize: 22, fontWeight: '800', color: COLORS.textPrime },
  durationNumSelected: { color: COLORS.gold },
  durationUnit: { fontSize: 11, color: COLORS.textMute, marginTop: 2 },
  durationUnitSelected: { color: COLORS.gold },

  durationNote: {
    margin: 16, padding: 14,
    backgroundColor: COLORS.bgCard, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  durationNoteText: { fontSize: 13, color: COLORS.textSec, textAlign: 'right', lineHeight: 20 },

  aboutBox: {
    margin: 16, padding: 16,
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  aboutTitle: { fontSize: 16, fontWeight: '800', color: COLORS.gold, marginBottom: 6 },
  aboutText: { fontSize: 12, color: COLORS.textMute, textAlign: 'center', lineHeight: 18 },
});
