// src/utils/notifications.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { loadSettings } from '../components/SettingsModal';

// How notifications behave when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  if (!Device.isDevice) {
    return false; // Simulator won't get push tokens
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-alarms', {
      name: 'התראות משימות',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#a07828',
      sound: 'default',
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTaskNotification(task) {
  if (!task.date || !task.time) return null;

  const [hours, minutes] = task.time.split(':').map(Number);
  const [year, month, day] = task.date.split('-').map(Number);
  const triggerDate = new Date(year, month - 1, day, hours, minutes, 0);
  if (triggerDate <= new Date()) return null;

  // Load user settings
  const settings = await loadSettings();

  try {
    await cancelTaskNotification(task.notificationId);

    const repeat = task.repeat || 'none';
    let trigger;

    if (repeat === 'none') {
      trigger = { date: triggerDate, channelId: 'task-alarms' };
    } else if (repeat === 'daily') {
      trigger = { hour: hours, minute: minutes, repeats: true, channelId: 'task-alarms' };
    } else if (repeat === 'weekly') {
      trigger = { weekday: triggerDate.getDay() + 1, hour: hours, minute: minutes, repeats: true, channelId: 'task-alarms' };
    } else {
      trigger = { date: triggerDate, channelId: 'task-alarms' };
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ ' + task.title,
        body: `הגיע הזמן! ${task.time}`,
        sound: settings.sound === 'default' ? 'default' : 'default', // custom sounds need asset bundling
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: settings.vibrate ? [0, 250, 250, 250] : [],
        data: { taskId: task.id, ringDuration: settings.duration },
        badge: 1,
      },
      trigger,
    });

    return notificationId;
  } catch (e) {
    console.error('Failed to schedule notification:', e);
    return null;
  }
}

export async function cancelTaskNotification(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Ignore — notification may have already fired
  }
}

export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error(e);
  }
}

export async function rescheduleAllTasks(tasks) {
  for (const task of tasks) {
    if (!task.done && task.time && task.date) {
      const notifId = await scheduleTaskNotification(task);
      if (notifId) task.notificationId = notifId;
    }
  }
  return tasks;
}

export function useNotificationListeners(onReceive, onResponse) {
  // Call this from a useEffect in App.js
  const receiveListener = Notifications.addNotificationReceivedListener(onReceive);
  const responseListener = Notifications.addNotificationResponseReceivedListener(onResponse);
  return () => {
    receiveListener.remove();
    responseListener.remove();
  };
}
