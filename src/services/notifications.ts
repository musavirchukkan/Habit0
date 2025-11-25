import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '../types/habits';
import { fetchHabits, fetchCompletionsForDate } from '../storage/habits';
import { format } from 'date-fns';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
      });

      await Notifications.setNotificationChannelAsync('summary', {
        name: 'Daily Summary',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });
    }

    if (__DEV__) {
      console.log('✅ Notification permissions granted');
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule morning reminder
 */
export async function scheduleMorningReminder(time: string): Promise<void> {
  try {
    // Cancel existing morning reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith('morning-')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    const [hour, minute] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      identifier: 'morning-reminder',
      content: {
        title: 'Good morning! 🌅',
        body: 'Ready to start your daily habits?',
        data: { type: 'morning' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    if (__DEV__) {
      console.log(`✅ Morning reminder scheduled for ${time}`);
    }
  } catch (error) {
    console.error('Error scheduling morning reminder:', error);
  }
}

/**
 * Schedule evening summary
 */
export async function scheduleEveningSummary(time: string): Promise<void> {
  try {
    // Cancel existing evening summaries
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith('evening-')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    const [hour, minute] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      identifier: 'evening-summary',
      content: {
        title: 'Daily Summary 📊',
        body: 'Tap to see your progress today',
        data: { type: 'summary' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    if (__DEV__) {
      console.log(`✅ Evening summary scheduled for ${time}`);
    }
  } catch (error) {
    console.error('Error scheduling evening summary:', error);
  }
}

/**
 * Update evening summary with actual progress
 */
export async function updateEveningSummaryContent(): Promise<void> {
  try {
    const habits = await fetchHabits();
    const today = format(new Date(), 'yyyy-MM-dd');
    const completions = await fetchCompletionsForDate(today);
    
    const todayWeekday = new Date().getDay();
    const todaysHabits = habits.filter(
      h => !h.archived && h.daysOfWeek.includes(todayWeekday as any)
    );
    
    const completed = todaysHabits.filter(h => 
      completions.some(c => c.habitId === h.id)
    ).length;
    
    const total = todaysHabits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    let body = '';
    let emoji = '';
    
    if (percentage === 100) {
      emoji = '🎉';
      body = `Perfect day! All ${total} habits completed!`;
    } else if (percentage >= 80) {
      emoji = '💪';
      body = `Great progress! ${completed}/${total} habits completed (${percentage}%)`;
    } else if (percentage >= 50) {
      emoji = '👍';
      body = `Good effort! ${completed}/${total} habits completed (${percentage}%)`;
    } else if (completed > 0) {
      emoji = '📊';
      body = `${completed}/${total} habits completed. Keep going!`;
    } else {
      emoji = '📊';
      body = `No habits completed today yet. Time to catch up!`;
    }
    
    return; // Note: We'll update this in the trigger itself
  } catch (error) {
    console.error('Error updating evening summary:', error);
  }
}

/**
 * Schedule habit-specific reminders
 */
export async function scheduleHabitReminders(habits: Habit[]): Promise<void> {
  try {
    // Cancel existing habit reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith('habit-')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    for (const habit of habits) {
      if (habit.archived || !habit.reminderTime) continue;

      const [hour, minute] = habit.reminderTime.split(':').map(Number);

      // Schedule for each day the habit is active
      for (const weekday of habit.daysOfWeek) {
        await Notifications.scheduleNotificationAsync({
          identifier: `habit-${habit.id}-${weekday}`,
          content: {
            title: habit.title,
            body: habit.description || 'Time to complete this habit!',
            data: { type: 'habit', habitId: habit.id },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: weekday + 1, // Expo uses 1-7, we use 0-6
            hour,
            minute,
          },
        });
      }
    }

    if (__DEV__) {
      console.log(`✅ Scheduled reminders for ${habits.filter(h => h.reminderTime).length} habits`);
    }
  } catch (error) {
    console.error('Error scheduling habit reminders:', error);
  }
}

/**
 * Schedule smart reminders (based on user patterns)
 */
export async function scheduleSmartReminders(): Promise<void> {
  try {
    // Cancel existing smart reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith('smart-')) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // TODO: Implement machine learning to find optimal times
    // For now, schedule mid-morning and mid-afternoon nudges
    
    // Mid-morning nudge (10:00 AM)
    await Notifications.scheduleNotificationAsync({
      identifier: 'smart-morning',
      content: {
        title: 'Quick check-in ⏰',
        body: 'Have you completed your morning habits?',
        data: { type: 'smart' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 10,
        minute: 0,
      },
    });

    // Mid-afternoon nudge (3:00 PM)
    await Notifications.scheduleNotificationAsync({
      identifier: 'smart-afternoon',
      content: {
        title: 'Afternoon reminder 🌤️',
        body: 'Keep your streak going!',
        data: { type: 'smart' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 15,
        minute: 0,
      },
    });

    if (__DEV__) {
      console.log('✅ Smart reminders scheduled');
    }
  } catch (error) {
    console.error('Error scheduling smart reminders:', error);
  }
}

/**
 * Schedule streak warning (if user hasn't completed habits)
 */
export async function scheduleStreakWarning(): Promise<void> {
  try {
    const habits = await fetchHabits();
    const today = format(new Date(), 'yyyy-MM-dd');
    const completions = await fetchCompletionsForDate(today);
    
    const todayWeekday = new Date().getDay();
    const todaysHabits = habits.filter(
      h => !h.archived && h.daysOfWeek.includes(todayWeekday as any)
    );
    
    const completed = todaysHabits.filter(h => 
      completions.some(c => c.habitId === h.id)
    ).length;
    
    // If not all habits completed and it's past 8 PM, send warning
    if (completed < todaysHabits.length) {
      await Notifications.scheduleNotificationAsync({
        identifier: 'streak-warning',
        content: {
          title: '⚠️ Streak Alert!',
          body: `${todaysHabits.length - completed} habits left today. Don't break your streak!`,
          data: { type: 'warning' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });
    }
  } catch (error) {
    console.error('Error scheduling streak warning:', error);
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (__DEV__) {
      console.log('✅ All notifications cancelled');
    }
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (__DEV__) {
      console.log('📅 Scheduled notifications:', scheduled.length);
      scheduled.forEach(notif => {
        console.log(`  - ${notif.identifier}:`, notif.content.title);
      });
    }
    return scheduled;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Setup notification response handler (when user taps notification)
 */
export function setupNotificationHandler(navigation: any) {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    if (__DEV__) {
      console.log('📱 Notification tapped:', data);
    }

    switch (data.type) {
      case 'morning':
      case 'smart':
        navigation.navigate('MainTabs', { screen: 'Today' });
        break;
      
      case 'summary':
        navigation.navigate('MainTabs', { screen: 'Today' });
        break;
      
      case 'habit':
        if (data.habitId) {
          navigation.navigate('HabitDetail', { habitId: data.habitId });
        }
        break;
      
      case 'warning':
        navigation.navigate('MainTabs', { screen: 'Today' });
        break;
    }
  });

  return subscription;
}

