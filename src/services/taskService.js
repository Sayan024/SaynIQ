import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@tasks_data';
const TIME_LOGS_KEY = '@time_logs_data';

/**
 * Task Object Structure:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   category: string,
 *   priority: 'Low' | 'Medium' | 'High',
 *   status: 'Pending' | 'Completed',
 *   createdAt: string (ISO),
 *   totalDuration: number (seconds)
 * }
 */

/**
 * Time Log Structure:
 * {
 *   id: string,
 *   taskId: string,
 *   startTime: string (ISO),
 *   endTime: string (ISO) | null,
 *   duration: number (seconds)
 * }
 */

export const getTasks = async () => {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading tasks', e);
    return [];
  }
};

export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks', e);
  }
};

export const getTimeLogs = async () => {
  try {
    const data = await AsyncStorage.getItem(TIME_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading logs', e);
    return [];
  }
};

export const saveTimeLogs = async (logs) => {
  try {
    await AsyncStorage.setItem(TIME_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving logs', e);
  }
};

export const calculateTaskDuration = (logs, taskId) => {
  return logs
    .filter(log => log.taskId === taskId && log.endTime)
    .reduce((acc, log) => acc + log.duration, 0);
};

export const calculateDailyProductivity = (logs) => {
  const today = new Date().toDateString();
  return logs
    .filter(log => new Date(log.startTime).toDateString() === today && log.endTime)
    .reduce((acc, log) => acc + log.duration, 0);
};

export const calculateProductivityStreak = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  // Get unique dates of completed tasks
  const completedDates = new Set(
    tasks
      .filter(t => t.status === 'Completed' && t.completedAt)
      .map(t => new Date(t.completedAt).toDateString())
  );

  if (completedDates.size === 0) return 0;

  let streak = 0;
  let checkDate = new Date();
  
  // If no task completed today, check if yesterday had one to maintain streak
  // But if today is missed, the streak might still be active if it's the current day.
  // Actually, productivity streak usually means "days worked".
  
  while (true) {
    const dateStr = checkDate.toDateString();
    if (completedDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If we missed today, but have yesterday, we check if today is still "open"
      // If we are checking the very first day (today) and it's missing, we check yesterday.
      if (streak === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = checkDate.toDateString();
        if (completedDates.has(yesterdayStr)) {
          // If yesterday had work, streak continues from yesterday
          continue;
        }
      }
      break;
    }
  }
  
  return streak;
};

export const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};
