import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitCompletion, HabitInput } from '../types/habits';

const HABITS_KEY = 'habit-tracker::habits';
const COMPLETIONS_KEY = 'habit-tracker::completions';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function fetchHabits(): Promise<Habit[]> {
  const records = await readJSON<Habit[]>(HABITS_KEY, []);
  return records.map((habit) => ({
    ...habit,
    category: habit.category ?? 'essential',
  }));
}

export async function fetchHabitById(id: string): Promise<Habit | undefined> {
  const habits = await fetchHabits();
  return habits.find((habit) => habit.id === id);
}

export async function upsertHabit(input: HabitInput & { id?: string }): Promise<Habit> {
  const habits = await fetchHabits();
  const now = new Date().toISOString();

  if (input.id) {
    const matchIndex = habits.findIndex((habit) => habit.id === input.id);
    if (matchIndex > -1) {
      const updated: Habit = {
        ...habits[matchIndex],
        ...input,
        id: input.id,
        category: input.category ?? habits[matchIndex].category ?? 'essential',
        updatedAt: now,
      };
      
      if (__DEV__) {
        console.log('\n💾 upsertHabit: UPDATING existing habit');
        console.log('   ID:', updated.id);
        console.log('   Title:', updated.title);
        console.log('   Category:', updated.category);
        console.log('   Days:', updated.daysOfWeek);
      }
      
      habits[matchIndex] = updated;
      await writeJSON(HABITS_KEY, habits);
      return updated;
    }
  }

  const newHabit: Habit = {
    id: input.id ?? generateId(),
    ...input,
    archived: input.archived ?? false,
    category: input.category ?? 'essential',
    createdAt: now,
    updatedAt: now,
  };

  if (__DEV__) {
    console.log('\n💾 upsertHabit: Creating NEW habit');
    console.log('   Generated ID:', newHabit.id);
    console.log('   Title:', newHabit.title);
    console.log('   Category:', newHabit.category);
    console.log('   Days:', newHabit.daysOfWeek);
  }

  habits.push(newHabit);
  await writeJSON(HABITS_KEY, habits);
  return newHabit;
}

export async function deleteHabit(id: string) {
  const habits = await fetchHabits();
  const next = habits.filter((habit) => habit.id !== id);
  await writeJSON(HABITS_KEY, next);
  await clearHabitCompletions(id);
}

export async function fetchCompletions(): Promise<HabitCompletion[]> {
  return readJSON(COMPLETIONS_KEY, []);
}

export async function fetchCompletionsForDate(date: string): Promise<HabitCompletion[]> {
  const completions = await fetchCompletions();
  return completions.filter((entry) => entry.date === date);
}

export async function markHabitComplete(habitId: string, date: string): Promise<HabitCompletion> {
  const completions = await fetchCompletions();
  const existing = completions.find((entry) => entry.habitId === habitId && entry.date === date);

  if (existing) {
    return existing;
  }

  const entry: HabitCompletion = {
    id: generateId(),
    habitId,
    date,
    completedAt: new Date().toISOString(),
  };

  completions.push(entry);
  await writeJSON(COMPLETIONS_KEY, completions);
  return entry;
}

export async function unmarkHabitComplete(habitId: string, date: string) {
  const completions = await fetchCompletions();
  const next = completions.filter((entry) => !(entry.habitId === habitId && entry.date === date));
  await writeJSON(COMPLETIONS_KEY, next);
}

async function clearHabitCompletions(habitId: string) {
  const completions = await fetchCompletions();
  const next = completions.filter((entry) => entry.habitId !== habitId);
  await writeJSON(COMPLETIONS_KEY, next);
}

export async function clearAllHabitData() {
  await AsyncStorage.multiRemove([HABITS_KEY, COMPLETIONS_KEY]);
}

