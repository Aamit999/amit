// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'yoman_tasks';

export async function loadTasks() {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveTasks(tasks) {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function getTasksForDate(tasks, ds) {
  const { parseLocalDate, dateStr } = require('../data/holidays');
  const target = parseLocalDate(ds);
  const targetDay = target.getDay();

  return tasks.filter(t => {
    if (!t.date) return false;
    const origin = parseLocalDate(t.date);
    if (target < origin) return false;

    const repeat = t.repeat || 'none';
    if (repeat === 'none') return t.date === ds;

    const diffDays = Math.round((target - origin) / 86400000);

    switch (repeat) {
      case 'daily': return true;
      case 'weekly': return diffDays % 7 === 0;
      case 'monthly':
        return origin.getDate() === target.getDate();
      case 'yearly':
        return origin.getDate() === target.getDate() && origin.getMonth() === target.getMonth();
      case 'weekdays':
        return (t.repeatDays || []).includes(targetDay);
      default: return t.date === ds;
    }
  });
}
