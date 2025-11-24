import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useHabits } from '../hooks/useHabits';
import { WEEKDAYS } from '../constants/weekdays';
import { Habit, HabitCompletion } from '../types/habits';
import StreakBadge from '../components/StreakBadge';
import { fetchCompletions } from '../storage/habits';
import { calculateHabitStreak } from '../utils/streak';
import { useTheme, Theme } from '../theme';
import { Screen } from '../components/Screen';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Habits'>,
  NativeStackScreenProps<RootStackParamList>
>;

const daysToLabel = (habit: Habit) => {
  if (habit.daysOfWeek.length === 7) {
    return 'Every day';
  }
  return habit.daysOfWeek
    .map((value) => WEEKDAYS.find((d) => d.value === value)?.short ?? '')
    .join(' · ');
};

export default function HabitListScreen({ navigation }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { habits, loading, refresh } = useHabits();
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'essential' | 'flexible' | 'archived'>('all');

  useFocusEffect(
    useCallback(() => {
      // Only refresh if we don't have habits loaded yet
      if (habits.length === 0) {
        refresh();
      }
    }, [refresh, habits.length]),
  );

  const visibleHabits = useMemo(() => {
    return habits.filter((habit) => {
      const matchesQuery = habit.title.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'archived'
            ? Boolean(habit.archived)
            : (habit.category ?? 'essential') === filter && !habit.archived;
      return matchesQuery && matchesFilter;
    });
  }, [habits, query, filter]);

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'essential', label: 'Essentials' },
    { key: 'flexible', label: 'Flexible' },
    { key: 'archived', label: 'Archived' },
  ];
  const empty = visibleHabits.length === 0;

  useEffect(() => {
    const loadStreaks = async () => {
      const completions = await fetchCompletions();
      const completionsByHabit = completions.reduce<Record<string, HabitCompletion[]>>((acc, entry) => {
        if (!acc[entry.habitId]) {
          acc[entry.habitId] = [];
        }
        acc[entry.habitId].push(entry);
        return acc;
      }, {});
      const result: Record<string, number> = {};
      const referenceDate = new Date();
      habits.forEach((habit) => {
        const streak = calculateHabitStreak(habit, completionsByHabit[habit.id] ?? [], referenceDate);
        result[habit.id] = streak.count;
      });
      setStreaks(result);
    };

    if (habits.length > 0) {
      loadStreaks();
    } else {
      setStreaks({});
    }
  }, [habits]);

  return (
    <Screen style={styles.container}>
      <FlatList
        data={visibleHabits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          empty && styles.emptyList,
          styles.listContent,
        ]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <TextInput
              placeholder="Search habits"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
            />
            <View style={styles.filters}>
              {filters.map((chip) => {
                const active = filter === chip.key;
                return (
                  <TouchableOpacity
                    key={chip.key}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setFilter(chip.key)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.cardMeta}>
                <StreakBadge count={streaks[item.id] ?? 0} />
                {item.archived && <Text style={styles.archivedBadge}>Archived</Text>}
              </View>
            </View>
            <Text style={styles.cardSubtitle}>{daysToLabel(item)}</Text>
            <View style={styles.cardActions}>
              <Text style={styles.cardPill}>{(item.category ?? 'essential').toUpperCase()}</Text>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('HabitForm', { habitId: item.id });
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No habits yet</Text>
              <Text style={styles.emptyCopy}>Tap “New Habit” to create your first one.</Text>
            </View>
          )
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('HabitForm')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyList: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 100, // Space for FAB and tab bar
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.background,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    marginTop: 8,
    color: theme.colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  cardPill: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.mode === 'dark' ? theme.colors.textPrimary : '#1f2937',
    backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  editLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  archivedBadge: {
    fontSize: 12,
    color: theme.mode === 'dark' ? '#fbbf24' : '#b45309',
    backgroundColor: theme.mode === 'dark' ? 'rgba(251, 191, 36, 0.2)' : '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  emptyCopy: {
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32,
  },
});

