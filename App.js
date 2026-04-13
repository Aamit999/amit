// App.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

import { loadTasks, saveTasks } from './src/utils/storage';
import {
  requestPermissions,
  scheduleTaskNotification,
  cancelTaskNotification,
  useNotificationListeners,
} from './src/utils/notifications';
import { dateStr } from './src/data/holidays';
import { COLORS } from './src/utils/theme';

import WeekScreen from './src/screens/WeekScreen';
import DayScreen from './src/screens/DayScreen';
import MonthScreen from './src/screens/MonthScreen';
import HolidaysScreen from './src/screens/HolidaysScreen';
import AddTaskModal from './src/components/AddTaskModal';
import TaskEditModal from './src/components/TaskEditModal';
import SettingsModal from './src/components/SettingsModal';

const TABS = [
  { key: 'day',      label: 'יום',    icon: '☀️' },
  { key: 'week',     label: 'שבוע',   icon: '📅' },
  { key: 'month',    label: 'חודש',   icon: '🗓️' },
  { key: 'holidays', label: 'חגים',   icon: '✦' },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('week');

  // Add modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalDate, setAddModalDate] = useState(null);

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Day navigation target
  const [dayTarget, setDayTarget] = useState(null);

  // Settings modal
  const [settingsVisible, setSettingsVisible] = useState(false);

  // ── Boot ──────────────────────────────────────────────────
  useEffect(() => {
    loadTasks().then(setTasks);
    requestPermissions();
  }, []);

  // ── Notification listeners ─────────────────────────────────
  useEffect(() => {
    const cleanup = useNotificationListeners(
      (notification) => {
        const taskId = notification.request.content.data?.taskId;
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          Alert.alert('⏰ ' + task.title, `הגיע הזמן! ${task.time}`, [
            { text: 'סגור' },
            { text: 'סמן כבוצע', onPress: () => handleToggleTask(task.id) },
          ]);
        }
      },
      (response) => {
        // User tapped notification — navigate to day view
        setActiveTab('day');
      }
    );
    return cleanup;
  }, [tasks]);

  // ── Task CRUD ─────────────────────────────────────────────
  async function handleAddTask(taskOrNull, presetDate) {
    if (taskOrNull && typeof taskOrNull === 'object' && taskOrNull.id) {
      // Inline add from week view — direct task object
      if (taskOrNull.time) {
        const notifId = await scheduleTaskNotification(taskOrNull);
        if (notifId) taskOrNull.notificationId = notifId;
      }
      const newTasks = [...tasks, taskOrNull];
      setTasks(newTasks);
      await saveTasks(newTasks);
    } else {
      // Open add modal
      setAddModalDate(presetDate || dateStr(new Date()));
      setAddModalVisible(true);
    }
  }

  async function handleSaveNew(task) {
    const notifId = await scheduleTaskNotification(task);
    if (notifId) task.notificationId = notifId;
    const newTasks = [...tasks, task];
    setTasks(newTasks);
    await saveTasks(newTasks);
    setAddModalVisible(false);
  }

  async function handleToggleTask(id) {
    const newTasks = tasks.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, done: !t.done };
      if (updated.done) {
        cancelTaskNotification(updated.notificationId);
        updated.notificationId = null;
      } else if (updated.time) {
        scheduleTaskNotification(updated).then(nid => {
          if (nid) {
            updated.notificationId = nid;
            saveTasks(tasks.map(x => x.id === id ? updated : x));
          }
        });
      }
      return updated;
    });
    setTasks(newTasks);
    await saveTasks(newTasks);
  }

  async function handleDeleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task?.notificationId) cancelTaskNotification(task.notificationId);
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    await saveTasks(newTasks);
  }

  function handleEditTask(task) {
    setEditingTask(task);
    setEditModalVisible(true);
  }

  async function handleSaveEdit(updatedTask) {
    // Cancel old notification, schedule new one
    if (editingTask?.notificationId) cancelTaskNotification(editingTask.notificationId);
    const notifId = await scheduleTaskNotification(updatedTask);
    if (notifId) updatedTask.notificationId = notifId;

    const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(newTasks);
    await saveTasks(newTasks);
    setEditModalVisible(false);
    setEditingTask(null);
  }

  function handleNavigateDay(date) {
    setDayTarget(date);
    setActiveTab('day');
  }

  // ── Render ────────────────────────────────────────────────
  function renderScreen() {
    switch (activeTab) {
      case 'day':
        return (
          <DayScreen
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            initialDate={dayTarget}
          />
        );
      case 'week':
        return (
          <WeekScreen
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onNavigateDay={handleNavigateDay}
            onEditTask={handleEditTask}
          />
        );
      case 'month':
        return (
          <MonthScreen
            tasks={tasks}
            onNavigateDay={handleNavigateDay}
          />
        );
      case 'holidays':
        return (
          <HolidaysScreen onNavigateDay={handleNavigateDay} />
        );
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgVoid} />
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

          {/* Top header — logo + settings only */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => setSettingsVisible(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
            <Text style={styles.appName}>✦ יומן</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Screen */}
          <View style={styles.screenContainer}>
            {renderScreen()}
          </View>

          {/* Tab bar with FAB in center */}
          <SafeAreaView edges={['bottom']} style={styles.tabBarWrapper}>
            <View style={styles.tabBar}>
              {TABS.slice(0, 2).map(tab => {
                const active = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={styles.tab}
                    onPress={() => { if (tab.key !== 'day') setDayTarget(null); setActiveTab(tab.key); }}
                    activeOpacity={0.7}
                  >
                    {active && <View style={styles.tabIndicator} />}
                    <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{tab.icon}</Text>
                    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}

              {/* Center FAB slot */}
              <View style={styles.fabSlot}>
                <TouchableOpacity
                  style={styles.fab}
                  onPress={() => handleAddTask(null, null)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.fabLabel}>משימה</Text>
              </View>

              {TABS.slice(2).map(tab => {
                const active = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={styles.tab}
                    onPress={() => { if (tab.key !== 'day') setDayTarget(null); setActiveTab(tab.key); }}
                    activeOpacity={0.7}
                  >
                    {active && <View style={styles.tabIndicator} />}
                    <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{tab.icon}</Text>
                    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SafeAreaView>

          <AddTaskModal
            visible={addModalVisible}
            onClose={() => setAddModalVisible(false)}
            onSave={handleSaveNew}
            initialDate={addModalDate}
          />
          <TaskEditModal
            visible={editModalVisible}
            task={editingTask}
            onClose={() => { setEditModalVisible(false); setEditingTask(null); }}
            onSave={handleSaveEdit}
            onDelete={handleDeleteTask}
          />
          <SettingsModal
            visible={settingsVisible}
            onClose={() => setSettingsVisible(false)}
          />

        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgVoid },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(240,237,232,0.97)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrime,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 22 },

  screenContainer: { flex: 1 },

  tabBarWrapper: {
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 1,
  },
  tabIcon: { fontSize: 20, opacity: 0.35 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: COLORS.textMute, fontWeight: '500', marginTop: 2 },
  tabLabelActive: { color: COLORS.gold, fontWeight: '700' },

  fabSlot: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 38,
    marginTop: -2,
  },
  fabLabel: {
    fontSize: 10,
    color: COLORS.gold,
    fontWeight: '700',
    marginTop: 2,
  },
});
