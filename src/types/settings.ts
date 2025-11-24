export type ThemePreference = 'system' | 'light' | 'dark';
export type StreakMode = 'strict' | 'lenient';

export interface NotificationPreferences {
  morning: boolean;
  evening: boolean;
  smart: boolean;
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
    evening: false,
    smart: true,
  },
  graceDays: 0,
  streakMode: 'strict',
};

