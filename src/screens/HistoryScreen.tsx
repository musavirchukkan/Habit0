import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  endOfMonth,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { Screen } from '../components/Screen';
import { Theme, useTheme } from '../theme';
import { useHabits } from '../hooks/useHabits';
import {
  fetchCompletions,
  markHabitComplete,
  unmarkHabitComplete,
} from '../storage/habits';
import { Habit, HabitCompletion } from '../types/habits';

type DayStatus = 'none' | 'full' | 'partial' | 'missed';

export default function HistoryScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusStyles = useMemo(() => STATUS_STYLES(theme), [theme]);
  const { habits, refresh } = useHabits();
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = new Date();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchCompletions();
    setCompletions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    refresh();
  }, [load, refresh]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end }).map((date) => {
      const status = resolveStatus(date, habits, completions);
      return { date, status };
    });
  }, [month, habits, completions]);

  const stats = useMemo(() => {
    const currentMonthDays = monthDays.filter((day) => isSameMonth(day.date, month));
    return {
      full: currentMonthDays.filter((d) => d.status === 'full').length,
      partial: currentMonthDays.filter((d) => d.status === 'partial').length,
      missed: currentMonthDays.filter((d) => d.status === 'missed').length,
    };
  }, [monthDays, month]);

  const selectedIso = format(selectedDate, 'yyyy-MM-dd');
  const selectedEssentialHabits = useMemo(
    () =>
      habits.filter(
        (habit) =>
          !habit.archived &&
          (habit.category ?? 'essential') === 'essential' &&
          habit.daysOfWeek.includes(selectedDate.getDay() as Habit['daysOfWeek'][number]),
      ),
    [habits, selectedDate],
  );
  const selectedCompletions = completions.filter((entry) => entry.date === selectedIso);

  const toggleCompletion = async (habitId: string) => {
    const exists = selectedCompletions.some((entry) => entry.habitId === habitId);
    if (exists) {
      await unmarkHabitComplete(habitId, selectedIso);
    } else {
      await markHabitComplete(habitId, selectedIso);
    }
    await load();
  };

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMonth(subMonths(month, 1))} style={styles.navButton}>
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{format(month, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={() => setMonth(addMonths(month, 1))} style={styles.navButton}>
            <Text style={styles.navText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
            <Text key={label} style={styles.weekLabel}>
              {label}
            </Text>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginVertical: theme.spacing.xxl }} />
        ) : (
          <View style={styles.grid}>
            {monthDays.map(({ date, status }) => {
              const active = isSameDay(date, selectedDate);
              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[
                    styles.dayCell,
                    !isSameMonth(date, month) && styles.dayCellMuted,
                    statusStyles[status],
                    active && styles.dayCellActive,
                  ]}
                  onPress={() => {
                    setSelectedDate(date);
                    if (!isSameMonth(date, month)) {
                      setMonth(startOfMonth(date));
                    }
                  }}
                >
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>{date.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.full}</Text>
            <Text style={styles.statLabel}>Full days</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.partial}</Text>
            <Text style={styles.statLabel}>Partial</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.missed}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{format(selectedDate, 'MMM d, EEEE')}</Text>
            {selectedDate > today && <Text style={styles.detailHint}>Upcoming</Text>}
          </View>
          {selectedEssentialHabits.length === 0 ? (
            <Text style={styles.detailHint}>No essentials scheduled for this day.</Text>
          ) : (
            selectedEssentialHabits.map((habit) => {
              const done = selectedCompletions.some((entry) => entry.habitId === habit.id);
              return (
                <TouchableOpacity
                  key={habit.id}
                  style={styles.detailRow}
                  disabled={selectedDate > today}
                  onPress={() => toggleCompletion(habit.id)}
                >
                  <View>
                    <Text style={[styles.detailHabit, done && styles.detailHabitDone]}>{habit.title}</Text>
                    {habit.description ? (
                      <Text style={styles.detailHint}>{habit.description}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.detailStatus, done && styles.detailStatusDone]}>
                    {done ? 'Completed' : 'Mark done'}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function resolveStatus(date: Date, habits: Habit[], completions: HabitCompletion[]): DayStatus {
  const weekday = date.getDay() as Habit['daysOfWeek'][number];
  const essentialHabits = habits.filter(
    (habit) => !habit.archived && (habit.category ?? 'essential') === 'essential' && habit.daysOfWeek.includes(weekday),
  );
  if (essentialHabits.length === 0) {
    return 'none';
  }
  const iso = format(date, 'yyyy-MM-dd');
  const completionsForDay = completions.filter((entry) => entry.date === iso);
  const essentialCompletions = completionsForDay.filter((entry) =>
    essentialHabits.some((habit) => habit.id === entry.habitId),
  );
  if (essentialCompletions.length === 0) return 'missed';
  if (essentialCompletions.length === essentialHabits.length) return 'full';
  return 'partial';
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.xxxl,
      paddingBottom: 120,
      gap: theme.spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navText: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    weekLabel: {
      width: `${100 / 7}%`,
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.card,
      marginBottom: 4,
    },
    dayCellMuted: {
      opacity: 0.4,
    },
    dayCellActive: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    dayText: {
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    dayTextActive: {
      color: theme.colors.primary,
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.card,
      padding: theme.spacing.xxl,
      justifyContent: 'space-between',
    },
    stat: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    statLabel: {
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    detailCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.card,
      padding: theme.spacing.xxl,
    },
    detailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    detailTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    detailHint: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    detailRow: {
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailHabit: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    detailHabitDone: {
      textDecorationLine: 'line-through',
      color: theme.colors.accent,
    },
    detailStatus: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    detailStatusDone: {
      color: theme.colors.accent,
      fontWeight: '600',
    },
  });

const STATUS_STYLES = (theme: Theme) => ({
  none: {},
  full: { 
    backgroundColor: theme.mode === 'dark' 
      ? 'rgba(52, 211, 153, 0.5)' 
      : 'rgba(16, 185, 129, 0.4)',
  },
  partial: { 
    backgroundColor: theme.mode === 'dark' 
      ? 'rgba(251, 191, 36, 0.5)' 
      : 'rgba(251, 191, 36, 0.4)',
  },
  missed: { 
    backgroundColor: theme.mode === 'dark' 
      ? 'rgba(251, 113, 133, 0.4)' 
      : 'rgba(239, 68, 68, 0.35)',
  },
});
