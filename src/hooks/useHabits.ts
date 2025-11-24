import { useCallback, useEffect, useState } from 'react';
import { Habit, HabitInput } from '../types/habits';
import { deleteHabit, fetchHabits, upsertHabit } from '../storage/habits';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchHabits();
      setHabits(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const saveHabit = useCallback(
    async (input: HabitInput & { id?: string }) => {
      const saved = await upsertHabit(input);
      await loadHabits();
      return saved;
    },
    [loadHabits],
  );

  const removeHabit = useCallback(
    async (id: string) => {
      await deleteHabit(id);
      await loadHabits();
    },
    [loadHabits],
  );

  return {
    habits,
    loading,
    refresh: loadHabits,
    saveHabit,
    removeHabit,
  };
}

