import Realm, { BSON } from 'realm';
import { Habit, HabitCompletion, Weekday, HabitCategory } from '../types/habits';

/**
 * Realm Schema for Habit
 */
export class HabitSchema extends Realm.Object<HabitSchema> {
  _id!: BSON.ObjectId;
  title!: string;
  description?: string;
  daysOfWeek!: Realm.List<number>;
  reminderTime?: string;
  archived!: boolean;
  category!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Habit',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      title: 'string',
      description: 'string?',
      daysOfWeek: 'int[]',
      reminderTime: 'string?',
      archived: { type: 'bool', default: false },
      category: { type: 'string', default: 'essential' },
      createdAt: 'date',
      updatedAt: 'date',
    },
  };

  // Convert to plain Habit object
  toHabit(): Habit {
    return {
      id: this._id.toHexString(),
      title: this.title,
      description: this.description,
      daysOfWeek: Array.from(this.daysOfWeek) as Weekday[],
      reminderTime: this.reminderTime,
      archived: this.archived,
      category: this.category as HabitCategory,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

/**
 * Realm Schema for HabitCompletion
 */
export class HabitCompletionSchema extends Realm.Object<HabitCompletionSchema> {
  _id!: BSON.ObjectId;
  habitId!: string; // Hex string of habit's ObjectId
  date!: string; // yyyy-MM-dd
  completedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'HabitCompletion',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      habitId: { type: 'string', indexed: true }, // Index for fast queries
      date: { type: 'string', indexed: true }, // Index for date queries
      completedAt: 'date',
    },
  };

  // Convert to plain HabitCompletion object
  toCompletion(): HabitCompletion {
    return {
      id: this._id.toHexString(),
      habitId: this.habitId,
      date: this.date,
      completedAt: this.completedAt.toISOString(),
    };
  }
}

// Singleton Realm instance
let realmInstance: Realm | null = null;

/**
 * Get or create Realm instance
 */
export async function getRealm(): Promise<Realm> {
  if (realmInstance && !realmInstance.isClosed) {
    return realmInstance;
  }

  try {
    realmInstance = await Realm.open({
      schema: [HabitSchema, HabitCompletionSchema],
      schemaVersion: 1,
    });

    if (__DEV__) {
      console.log('✅ Realm database opened');
      console.log('   Schema version:', realmInstance.schemaVersion);
      console.log('   Habits:', realmInstance.objects('Habit').length);
      console.log('   Completions:', realmInstance.objects('HabitCompletion').length);
    }

    return realmInstance;
  } catch (error) {
    console.error('❌ Failed to open Realm:', error);
    throw error;
  }
}

/**
 * Close Realm instance
 */
export function closeRealm() {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
    if (__DEV__) {
      console.log('🔒 Realm closed');
    }
  }
}

/**
 * Delete entire Realm database (for dev reset)
 */
export async function deleteRealmDatabase() {
  try {
    closeRealm();
    Realm.deleteFile({ schema: [HabitSchema, HabitCompletionSchema] });
    if (__DEV__) {
      console.log('🗑️ Realm database deleted');
    }
  } catch (error) {
    console.error('❌ Failed to delete Realm:', error);
    throw error;
  }
}
