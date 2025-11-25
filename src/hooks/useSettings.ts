import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, ThemePreference, StreakMode, defaultSettings } from '../types/settings';

export const SETTINGS_STORAGE_KEY = 'habit-tracker::settings';

type SettingsContextValue = {
  settings: Settings;
  loading: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggleNotification: (key: keyof Settings['notifications']) => void;
  setNotificationTime: (key: 'morningTime' | 'eveningTime', time: string) => void;
  setGraceDays: (value: 0 | 1 | 2) => void;
  setStreakMode: (mode: StreakMode) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(stored) });
        } catch {
          setSettings(defaultSettings);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const setAndPersist = useCallback((updater: (prev: Settings) => Settings) => {
    setSettings((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      setAndPersist((prev) => ({ ...prev, theme }));
    },
    [setAndPersist],
  );

  const toggleNotification = useCallback(
    (key: keyof Settings['notifications']) => {
      setAndPersist((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
      }));
    },
    [setAndPersist],
  );

  const setNotificationTime = useCallback(
    (key: 'morningTime' | 'eveningTime', time: string) => {
      setAndPersist((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: time },
      }));
    },
    [setAndPersist],
  );

  const setGraceDays = useCallback(
    (value: 0 | 1 | 2) => {
      setAndPersist((prev) => ({ ...prev, graceDays: value }));
    },
    [setAndPersist],
  );

  const setStreakMode = useCallback(
    (mode: StreakMode) => {
      setAndPersist((prev) => ({ ...prev, streakMode: mode }));
    },
    [setAndPersist],
  );

  const value = useMemo(
    () => ({
      settings,
      loading,
      setTheme,
      toggleNotification,
      setNotificationTime,
      setGraceDays,
      setStreakMode,
    }),
    [settings, loading, setTheme, toggleNotification, setNotificationTime, setGraceDays, setStreakMode],
  );

  return React.createElement(SettingsContext.Provider, { value }, children);
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

