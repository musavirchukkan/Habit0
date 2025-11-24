import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { format, addDays, isAfter, startOfDay } from 'date-fns';
import { useHabits } from '../hooks/useHabits';
import {
  fetchCompletionsForDate,
  markHabitComplete,
  unmarkHabitComplete,
} from '../storage/habits';
import { Habit, Weekday } from '../types/habits';
import { Screen } from '../components/Screen';
import { useTheme, Theme } from '../theme';

const today = startOfDay(new Date());

export default function DailyCheckInScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loadingCompletions, setLoadingCompletions] = useState(false);
  const { habits, loading: loadingHabits, refresh } = useHabits();

  const isoDate = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const weekday = selectedDate.getDay() as Weekday;

  const scheduledHabits = useMemo(
    () =>
      habits.filter(
        (habit) => !habit.archived && habit.daysOfWeek.includes(weekday),
      ),
    [habits, weekday],
  );

  const loadCompletions = useCallback(async () => {
    setLoadingCompletions(true);
    const entries = await fetchCompletionsForDate(isoDate);
    setCompletedIds(new Set(entries.map((entry) => entry.habitId)));
    setLoadingCompletions(false);
  }, [isoDate]);

  useEffect(() => {
    loadCompletions();
  }, [loadCompletions]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleCompletion = async (habitId: string) => {
    if (completedIds.has(habitId)) {
      await unmarkHabitComplete(habitId, isoDate);
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    } else {
      await markHabitComplete(habitId, isoDate);
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.add(habitId);
        return next;
      });
    }
  };

  const changeDay = (delta: number) => {
    const next = addDays(selectedDate, delta);
    if (delta > 0 && isAfter(next, today)) {
      return;
    }
    setSelectedDate(next);
  };

  const progress = scheduledHabits.length
    ? Math.round((completedIds.size / scheduledHabits.length) * 100)
    : 0;

  const fullyComplete = scheduledHabits.length > 0 && completedIds.size === scheduledHabits.length;

  return (
    <Screen style={styles.container}>
      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => changeDay(-1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dateTextWrapper}>
          <Text style={styles.dateLabel}>{format(selectedDate, 'EEEE')}</Text>
          <Text style={styles.dateValue}>{format(selectedDate, 'MMM d, yyyy')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => changeDay(1)}
          disabled={isAfter(addDays(selectedDate, 1), today)}
          style={[styles.navButton, isAfter(addDays(selectedDate, 1), today) && styles.navButtonDisabled]}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {completedIds.size} / {scheduledHabits.length} complete ({progress}%)
        </Text>
        {fullyComplete && <Text style={styles.successText}>All habits complete! 🔥</Text>}
      </View>

      {(loadingHabits || loadingCompletions) && (
        <ActivityIndicator style={styles.loader} size="small" color={theme.colors.primary} />
      )}

      <FlatList
        data={scheduledHabits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={scheduledHabits.length === 0 && styles.emptyList}
        renderItem={({ item }) => {
          const done = completedIds.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.habitCard, done && styles.habitCardDone]}
              onPress={() => toggleCompletion(item.id)}
            >
              <Text style={[styles.habitTitle, done && styles.habitTitleDone]}>{item.title}</Text>
              <Text style={styles.habitAction}>{done ? 'Completed' : 'Tap to complete'}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No habits scheduled</Text>
            <Text style={styles.emptyCopy}>Plan habits for this day to check in.</Text>
          </View>
        }
      />
    </Screen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundAlt,
    padding: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dateTextWrapper: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  dateValue: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  progressContainer: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  successText: {
    marginTop: 8,
    color: theme.colors.success,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 8,
  },
  habitCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  habitCardDone: {
    borderColor: theme.colors.success,
    borderWidth: 1,
    backgroundColor: theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7',
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  habitTitleDone: {
    textDecorationLine: 'line-through',
    color: theme.colors.success,
  },
  habitAction: {
    marginTop: 6,
    color: theme.colors.textSecondary,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  emptyCopy: {
    marginTop: 6,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

