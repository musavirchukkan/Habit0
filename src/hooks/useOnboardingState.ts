import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'habit-tracker::onboardingComplete';

export function useOnboardingState() {
  const [isComplete, setIsComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      setIsComplete(value === 'true');
    };
    load();
  }, []);

  const markComplete = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    setIsComplete(true);
  }, []);

  return {
    isComplete,
    markComplete,
  };
}

