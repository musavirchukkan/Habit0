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
    if (!completionSet.has(dateKey)) {
      return {
        count: streak,
        lastCompletion,
        brokenOn: iso(cursor),
      };
    }

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

