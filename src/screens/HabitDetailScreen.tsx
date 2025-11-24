import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { useTheme, Theme } from '../theme';
import { Habit, HabitCompletion } from '../types/habits';
import { calculateHabitStreak } from '../utils/streak';
import { deleteHabit, fetchHabitById, fetchCompletions, upsertHabit } from '../storage/habits';
import { useMemo } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetail'>;

export default function HabitDetailScreen({ route, navigation }: Props) {
  const { habitId } = route.params;
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const fetchedHabit = await fetchHabitById(habitId);
    const allCompletions = await fetchCompletions();
    setHabit(fetchedHabit ?? null);
    setCompletions(allCompletions.filter((entry) => entry.habitId === habitId));
    setLoading(false);
  }, [habitId]);

  useEffect(() => {
    navigation.setOptions({ title: 'Habit detail' });
    loadData();
  }, [loadData, navigation]);

  if (loading || !habit) {
    return (
      <Screen style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Screen>
    );
  }

  const streak = calculateHabitStreak(habit, completions, new Date());
  const completionRate = (window: number) => {
    if (!window) return 0;
    const cutoff = Date.now() - window * 24 * 60 * 60 * 1000;
    const successes = completions.filter((entry) => new Date(entry.date).getTime() >= cutoff).length;
    return Math.min(100, Math.round((successes / window) * 100));
  };

  const toggleArchive = async (isActive: boolean) => {
    await upsertHabit({
      id: habit.id,
      title: habit.title,
      description: habit.description,
      daysOfWeek: habit.daysOfWeek,
      reminderTime: habit.reminderTime,
      archived: !isActive,
      category: habit.category,
    });
    loadData();
  };

  const confirmDelete = () => {
    Alert.alert('Delete habit?', 'This removes the habit and streak history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHabit(habit.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const lastCompletion = [...completions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{habit.title}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('HabitForm', { habitId })}>
            <Text style={styles.link}>Edit</Text>
          </TouchableOpacity>
        </View>
        {habit.description ? <Text style={styles.description}>{habit.description}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.switchRow}>
            <Text style={styles.sectionValue}>{habit.archived ? 'Archived' : 'Active'}</Text>
            <Switch value={!habit.archived} onValueChange={(value) => toggleArchive(value)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Streak contribution</Text>
          <Text style={styles.streakValue}>{streak.count} days</Text>
          {lastCompletion && (
            <Text style={styles.sectionHint}>
              Last completed {format(new Date(lastCompletion.date), 'MMM d')}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Completion rate</Text>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completionRate(7)}%</Text>
              <Text style={styles.statLabel}>7 days</Text>
            </View>
            <View style={[styles.statCard, styles.statCardLast]}>
              <Text style={styles.statValue}>{completionRate(30)}%</Text>
              <Text style={styles.statLabel}>30 days</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Week schedule</Text>
          <Text style={styles.sectionHint}>{habit.daysOfWeek.length} days/week</Text>
        </View>

        <TouchableOpacity style={styles.dangerButton} onPress={confirmDelete}>
          <Text style={styles.dangerText}>Delete habit</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.xxxl,
    paddingBottom: 120,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  description: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  section: {
    marginTop: theme.spacing.xxxl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.card,
    padding: theme.spacing.xxl,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  sectionValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  sectionHint: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.card,
    padding: theme.spacing.lg,
    marginRight: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundAlt,
  },
  statCardLast: {
    marginRight: 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  dangerButton: {
    marginTop: theme.spacing.xxxl,
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.radii.card,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  dangerText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
});

