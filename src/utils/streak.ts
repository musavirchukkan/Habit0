import { addDays, format, isAfter, startOfDay, subDays } from 'date-fns';
import { Habit, HabitCompletion, Weekday } from '../types/habits';

export interface HabitStreakResult {
  count: number;
  lastCompletion?: string;
  brokenOn?: string;
}

const iso = (date: Date) => format(date, 'yyyy-MM-dd');

const buildCompletionSet = (completions: HabitCompletion[]) =>
  new Set(completions.map((entry) => entry.date));

export function calculateHabitStreak(
  habit: Habit,
  completions: HabitCompletion[],
  referenceDate: Date = new Date(),
): HabitStreakResult {
  const completionSet = buildCompletionSet(completions);
  const today = startOfDay(referenceDate);
  const maxLookbackDays = 365; // prevent infinite loops
  let cursor = today;
  let streak = 0;
  let lastCompletion: string | undefined;

  for (let i = 0; i < maxLookbackDays; i += 1) {
    const weekday = cursor.getDay() as Weekday;

    if (!habit.daysOfWeek.includes(weekday)) {
      cursor = subDays(cursor, 1);
      continue;
    }

    const dateKey = iso(cursor);
    const isCompleted = completionSet.has(dateKey);
    const isToday = cursor.getTime() === today.getTime();

    // If it's today and not completed, skip it (don't break streak, just don't count it)
    if (isToday && !isCompleted) {
      cursor = subDays(cursor, 1);
      continue;
    }

    // If it's a past scheduled day and not completed, streak is broken
    if (!isCompleted) {
      return {
        count: streak,
        lastCompletion,
        brokenOn: iso(cursor),
      };
    }

    // Count this day in the streak
    streak += 1;
    lastCompletion = dateKey;
    cursor = subDays(cursor, 1);
  }

  return {
    count: streak,
    lastCompletion,
  };
}

export function isHabitOnStreakToday(habit: Habit, referenceDate: Date = new Date()) {
  const weekday = referenceDate.getDay() as Weekday;
  return habit.daysOfWeek.includes(weekday);
}

export function isHabitStreakBroken(
  habit: Habit,
  completions: HabitCompletion[],
  referenceDate: Date = new Date(),
) {
  const today = startOfDay(referenceDate);
  const nextScheduledDay = getNextScheduledDay(habit, today);
  if (!nextScheduledDay) {
    return false;
  }

  const result = calculateHabitStreak(habit, completions, referenceDate);
  if (!result.lastCompletion) {
    return true;
  }
  return isAfter(new Date(result.brokenOn ?? today), today);
}

function getNextScheduledDay(habit: Habit, fromDate: Date) {
  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(fromDate, offset);
    const weekday = date.getDay() as Weekday;
    if (habit.daysOfWeek.includes(weekday)) {
      return date;
    }
  }
  return undefined;
}

