export type ThemePreference = 'system' | 'light' | 'dark';
export type StreakMode = 'strict' | 'lenient';

export interface NotificationPreferences {
  morning: boolean;
  morningTime: string; // HH:mm format
  evening: boolean;
  eveningTime: string; // HH:mm format
  smart: boolean;
  habitReminders: boolean;
}

export interface Settings {
  theme: ThemePreference;
  notifications: NotificationPreferences;
  graceDays: 0 | 1 | 2;
  streakMode: StreakMode;
}

export const defaultSettings: Settings = {
  theme: 'system',
  notifications: {
    morning: true,
    morningTime: '07:00',
    evening: true,
    eveningTime: '21:30',
    smart: false,
    habitReminders: true,
  },
  graceDays: 0,
  streakMode: 'strict',
};

