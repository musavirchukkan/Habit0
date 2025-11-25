import { BSON } from 'realm';
import { Habit, HabitCompletion, HabitInput } from '../types/habits';
import { getRealm, HabitSchema, HabitCompletionSchema, deleteRealmDatabase } from './realm-config';

/**
 * Fetch all habits (sorted by creation date, newest first)
 */
export async function fetchHabits(): Promise<Habit[]> {
  const realm = await getRealm();
  const habits = realm.objects<HabitSchema>('Habit').sorted('createdAt', true);
  return Array.from(habits).map((h) => h.toHabit());
}

/**
 * Fetch a single habit by ID
 */
export async function fetchHabitById(id: string): Promise<Habit | undefined> {
  const realm = await getRealm();
  
  try {
    const objectId = BSON.ObjectId.createFromHexString(id);
    const habit = realm.objectForPrimaryKey<HabitSchema>('Habit', objectId);
    return habit ? habit.toHabit() : undefined;
  } catch (error) {
    console.error('Invalid habit ID:', id);
    return undefined;
  }
}

/**
 * Create or update a habit
 */
export async function upsertHabit(input: HabitInput & { id?: string }): Promise<Habit> {
  const realm = await getRealm();
  const now = new Date();
  let savedHabit: HabitSchema;

  realm.write(() => {
    if (input.id) {
      // Update existing habit
      try {
        const objectId = BSON.ObjectId.createFromHexString(input.id);
        const existing = realm.objectForPrimaryKey<HabitSchema>('Habit', objectId);
        
        if (existing) {
          existing.title = input.title;
          existing.description = input.description;
          existing.daysOfWeek.splice(0, existing.daysOfWeek.length, ...input.daysOfWeek);
          existing.reminderTime = input.reminderTime;
          existing.archived = input.archived ?? false;
          existing.category = input.category ?? 'essential';
          existing.updatedAt = now;
          savedHabit = existing;

          if (__DEV__) {
            console.log('\n💾 HABIT UPDATED');
            console.log('   ID:', existing._id.toHexString());
            console.log('   Title:', existing.title);
            console.log('   Category:', existing.category);
            console.log('   Days:', Array.from(existing.daysOfWeek));
          }
          return;
        }
      } catch (error) {
        console.error('Invalid habit ID for update:', input.id);
      }
    }

    // Create new habit
    const newHabit = {
      _id: new BSON.ObjectId(),
      title: input.title,
      description: input.description,
      daysOfWeek: input.daysOfWeek,
      reminderTime: input.reminderTime,
      archived: input.archived ?? false,
      category: input.category ?? 'essential',
      createdAt: now,
      updatedAt: now,
    };

    savedHabit = realm.create('Habit', newHabit);

    if (__DEV__) {
      console.log('\n💾 HABIT CREATED');
      console.log('   ID:', savedHabit._id.toHexString());
      console.log('   Title:', savedHabit.title);
      console.log('   Category:', savedHabit.category);
      console.log('   Days:', Array.from(savedHabit.daysOfWeek));
    }
  });

  return savedHabit!.toHabit();
}

/**
 * Delete a habit and all its completions
 */
export async function deleteHabit(id: string) {
  const realm = await getRealm();

  realm.write(() => {
    try {
      const objectId = BSON.ObjectId.createFromHexString(id);
      const habit = realm.objectForPrimaryKey<HabitSchema>('Habit', objectId);
      
      if (habit) {
        // Delete all completions for this habit
        const completions = realm.objects<HabitCompletionSchema>('HabitCompletion')
          .filtered('habitId = $0', id);
        realm.delete(completions);
        
        // Delete the habit
        realm.delete(habit);

        if (__DEV__) {
          console.log(`🗑️ Deleted habit: ${id} (${completions.length} completions)`);
        }
      }
    } catch (error) {
      console.error('Failed to delete habit:', id, error);
    }
  });
}

/**
 * Fetch all completions (sorted by completion time, newest first)
 */
export async function fetchCompletions(): Promise<HabitCompletion[]> {
  const realm = await getRealm();
  const completions = realm.objects<HabitCompletionSchema>('HabitCompletion')
    .sorted('completedAt', true);
  return Array.from(completions).map((c) => c.toCompletion());
}

/**
 * Fetch completions for a specific date
 */
export async function fetchCompletionsForDate(date: string): Promise<HabitCompletion[]> {
  const realm = await getRealm();
  const completions = realm.objects<HabitCompletionSchema>('HabitCompletion')
    .filtered('date = $0', date);
  return Array.from(completions).map((c) => c.toCompletion());
}

/**
 * Mark a habit as complete for a specific date
 */
export async function markHabitComplete(habitId: string, date: string): Promise<HabitCompletion> {
  const realm = await getRealm();

  // Check if already completed
  const existing = realm.objects<HabitCompletionSchema>('HabitCompletion')
    .filtered('habitId = $0 AND date = $1', habitId, date)[0];

  if (existing) {
    return existing.toCompletion();
  }

  let completion: HabitCompletionSchema;
  realm.write(() => {
    completion = realm.create('HabitCompletion', {
      _id: new BSON.ObjectId(),
      habitId,
      date,
      completedAt: new Date(),
    });

    if (__DEV__) {
      console.log(`✅ Marked complete: ${habitId} on ${date}`);
    }
  });

  return completion!.toCompletion();
}

/**
 * Unmark a habit completion
 */
export async function unmarkHabitComplete(habitId: string, date: string) {
  const realm = await getRealm();

  realm.write(() => {
    const completions = realm.objects<HabitCompletionSchema>('HabitCompletion')
      .filtered('habitId = $0 AND date = $1', habitId, date);
    
    if (completions.length > 0) {
      realm.delete(completions);
      
      if (__DEV__) {
        console.log(`❌ Unmarked: ${habitId} on ${date}`);
      }
    }
  });
}

/**
 * Clear all habit data (for dev reset)
 */
export async function clearAllHabitData() {
  try {
    await deleteRealmDatabase();
    
    if (__DEV__) {
      console.log('✅ All habit data cleared');
    }
  } catch (error) {
    console.error('❌ Failed to clear habit data:', error);
    throw error;
  }
}
