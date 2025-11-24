export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HabitCategory = 'essential' | 'flexible' | 'weekly';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  daysOfWeek: Weekday[];
  reminderTime?: string; // HH:mm in local time
  archived?: boolean;
  category?: HabitCategory;
  createdAt: string;
  updatedAt: string;
}

export type HabitInput = Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>;

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // yyyy-MM-dd
  completedAt: string;
}

