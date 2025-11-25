import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { format, startOfDay } from 'date-fns';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Theme, useTheme } from '../theme';
import { useHabits } from '../hooks/useHabits';
import { Habit, HabitCompletion } from '../types/habits';
import {
  fetchCompletionsForDate,
  fetchCompletions,
  markHabitComplete,
  unmarkHabitComplete,
} from '../storage/habits';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { calculateHabitStreak } from '../utils/streak';

export default function TodayScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const today = startOfDay(new Date());
  const isoDate = format(today, 'yyyy-MM-dd');
  const { habits, loading, refresh } = useHabits();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loadingCompletions, setLoadingCompletions] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [totalStreak, setTotalStreak] = useState(0);
  const [allCompletions, setAllCompletions] = useState<HabitCompletion[]>([]);

  const weekday = today.getDay();

  const todaysHabits = useMemo(
    () =>
      habits.filter(
        (habit) => !habit.archived && habit.daysOfWeek.includes(weekday as Habit['daysOfWeek'][number]),
      ),
    [habits, weekday],
  );

  const essentials = useMemo(
    () => todaysHabits.filter((habit) => {
      const category = habit.category ?? 'essential';
      return category === 'essential';
    }),
    [todaysHabits]
  );
  
  const flexible = useMemo(
    () => todaysHabits.filter((habit) => {
      const category = habit.category ?? 'essential';
      return category === 'flexible' || category === 'weekly';
    }),
    [todaysHabits]
  );

  const loadCompletions = useCallback(async () => {
    setLoadingCompletions(true);
    try {
      const entries = await fetchCompletionsForDate(isoDate);
      const allEntries = await fetchCompletions();
      setCompletedIds(new Set(entries.map((entry) => entry.habitId)));
      setAllCompletions(allEntries);
    } catch (error) {
      console.error('Error loading completions:', error);
    } finally {
      setLoadingCompletions(false);
    }
  }, [isoDate]);

  useEffect(() => {
    loadCompletions();
  }, [loadCompletions]);

  // Refresh habits when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
      loadCompletions();
    }, [refresh, loadCompletions])
  );

  // Calculate total streak from all essential habits
  useEffect(() => {
    if (habits.length > 0 && allCompletions.length >= 0) {
      const essentialHabits = habits.filter(
        (habit) => !habit.archived && (habit.category ?? 'essential') === 'essential'
      );
      
      if (essentialHabits.length === 0) {
        setTotalStreak(0);
        return;
      }

      // Group completions by habit
      const completionsByHabit = allCompletions.reduce<Record<string, HabitCompletion[]>>(
        (acc, entry) => {
          if (!acc[entry.habitId]) {
            acc[entry.habitId] = [];
          }
          acc[entry.habitId].push(entry);
          return acc;
        },
        {}
      );

      // Calculate minimum streak across all essential habits
      const streaks = essentialHabits.map((habit) => {
        const habitCompletions = completionsByHabit[habit.id] ?? [];
        const streakResult = calculateHabitStreak(habit, habitCompletions, today);
        return streakResult.count;
      });

      // Total streak is the minimum of all essential habits (weakest link)
      const minStreak = streaks.length > 0 ? Math.min(...streaks) : 0;
      setTotalStreak(minStreak);
    }
  }, [habits, allCompletions, today]);

  useEffect(() => {
    if (essentials.length > 0 && essentials.every((habit) => completedIds.has(habit.id))) {
      setCelebrate(true);
    } else {
      setCelebrate(false);
    }
  }, [completedIds, essentials]);

  const toggleHabit = useCallback(async (habitId: string) => {
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
    
    // Reload completions to update streak calculation in real-time
    await loadCompletions();
  }, [completedIds, isoDate, loadCompletions]);

  const essentialProgress = essentials.length
    ? Math.round((essentials.filter((habit) => completedIds.has(habit.id)).length / essentials.length) * 100)
    : 0;

  const markDayDisabled = essentials.length === 0 || essentialProgress < 100;

  const renderHabitRows = (items: Habit[], variant: 'essential' | 'flexible') => {
    console.log(`Rendering ${variant} habits:`, items.length, items.map(h => h.title));
    
    return items
      .filter((habit) => habit.id) // Filter out habits without IDs first
      .map((habit) => {
        const habitKey = `${variant}-${habit.id}`;
        const done = completedIds.has(habit.id);
        return (
          <TouchableOpacity
            key={habitKey}
            style={[styles.habitRow, done && styles.habitRowDone]}
            onPress={() => toggleHabit(habit.id)}
          >
            <View style={styles.habitText}>
              <Text style={[styles.habitTitle, done && styles.habitTitleDone]}>{habit.title}</Text>
              {habit.description ? <Text style={styles.habitSubtitle}>{habit.description}</Text> : null}
            </View>
            <View
              style={[
                styles.checkCircle,
                done && (variant === 'essential' ? styles.checkCircleActive : styles.checkCircleFlexible),
              ]}
            >
              <Text style={styles.checkMark}>{done ? '✓' : ''}</Text>
            </View>
          </TouchableOpacity>
        );
      });
  };

  // Debug logging
  if (__DEV__) {
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    console.log('\n=== TODAY SCREEN DEBUG ===');
    console.log('Total Habits:', habits.length);
    console.log('Today is weekday:', weekday, weekdayNames[weekday]);
    console.log('Today\'s Date:', isoDate);
    console.log('Loading states - habits:', loading, 'completions:', loadingCompletions);
    
    // Log each habit with details
    habits.forEach((habit, idx) => {
      const category = habit.category ?? 'essential';
      const includesWeekday = habit.daysOfWeek.includes(weekday as any);
      const willShow = !habit.archived && includesWeekday;
      
      console.log(`\n📋 Habit ${idx + 1}: "${habit.title}"`);
      console.log('   ID:', habit.id);
      console.log('   Category:', category);
      console.log('   Days:', habit.daysOfWeek, '→', habit.daysOfWeek.map(d => weekdayNames[d]).join(', '));
      console.log('   Archived:', habit.archived ?? false);
      console.log('   Includes weekday', weekday, '?', includesWeekday);
      console.log('   Will show today?', willShow ? '✅ YES' : '❌ NO');
      console.log('   Target section:', category === 'essential' ? 'Essentials' : 'Flexible');
    });
    
    console.log('\n--- FILTERED RESULTS ---');
    console.log('Today\'s habits (not archived, scheduled for today):', todaysHabits.length);
    if (todaysHabits.length > 0) {
      todaysHabits.forEach(h => console.log('  -', h.title, '(', h.category ?? 'essential', ')'));
    }
    
    console.log('\n📊 Final Categorization:');
    console.log('Essentials:', essentials.length);
    if (essentials.length > 0) essentials.forEach(h => console.log('  ✓', h.title));
    
    console.log('Flexible:', flexible.length);
    if (flexible.length > 0) flexible.forEach(h => console.log('  ✓', h.title));
    
    console.log('\n✅ Completed today:', Array.from(completedIds));
    console.log('========================\n');
  }

  return (
    <Screen style={styles.container} background={theme.colors.backgroundAlt}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Streak Section */}
        <View style={styles.heroCard}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNumber}>{totalStreak}</Text>
          </View>
          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.streakSubtext}>
            {totalStreak === 0 
              ? 'Start building your streak today!' 
              : totalStreak === 1 
              ? 'Great start! Keep it going!' 
              : `Amazing! ${totalStreak} days in a row!`}
          </Text>
        </View>

        {/* Date and Progress Section */}
        <View style={styles.dateCard}>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>{format(today, 'EEEE')}</Text>
            <Text style={styles.dateValue}>{format(today, 'MMM d, yyyy')}</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressValue}>{essentialProgress}%</Text>
          </View>
        </View>

        {(loading || loadingCompletions) && (
          <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
        )}

        {/* Essentials Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Essentials ({essentials.length})</Text>
            {celebrate && <Text style={styles.celebrateText}>+1 Day!</Text>}
          </View>
          <Text style={styles.sectionHint}>Complete all to maintain your streak</Text>
          {essentials.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyCopy}>No essentials today</Text>
              <Text style={styles.emptySubtext}>Add habits to build your streak</Text>
            </View>
          ) : (
            <View>
              {renderHabitRows(essentials, 'essential')}
            </View>
          )}
        </View>

        {/* Flexible Section - Always show */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💪 Flexible ({flexible.length})</Text>
            <Text style={styles.sectionHint}>Bonus habits</Text>
          </View>
          {flexible.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyCopy}>No flexible habits today</Text>
              <Text style={styles.emptySubtext}>Add flexible habits for bonus wins</Text>
            </View>
          ) : (
            <View>
              {renderHabitRows(flexible, 'flexible')}
            </View>
          )}
        </View>

        {/* Day Complete Button */}
        {essentials.length > 0 && (
          <TouchableOpacity
            style={[styles.dayButton, markDayDisabled && styles.dayButtonDisabled]}
            disabled={markDayDisabled}
            onPress={() => setCelebrate(true)}
          >
            <Text style={[styles.dayButtonText, markDayDisabled && styles.dayButtonTextDisabled]}>
              {markDayDisabled 
                ? `Complete ${essentials.length - essentials.filter(h => completedIds.has(h.id)).length} more` 
                : '✓ All Done for Today!'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('HabitForm')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
      paddingBottom: 120,
    },
    // Hero Streak Card
    heroCard: {
      backgroundColor: theme.mode === 'dark' 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : theme.colors.primary,
      borderRadius: theme.radii.card * 1.5,
      padding: theme.spacing.xxxl,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    streakEmoji: {
      fontSize: 48,
      marginRight: theme.spacing.sm,
    },
    streakNumber: {
      fontSize: 56,
      fontWeight: '800',
      color: '#fff',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    streakLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: theme.spacing.xs,
    },
    streakSubtext: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
    },
    // Date Card
    dateCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.card,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    dateInfo: {
      flex: 1,
    },
    dateLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    dateValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: 2,
    },
    progressCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    progressValue: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    loader: {
      marginVertical: theme.spacing.lg,
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.card,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    sectionHint: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      marginBottom: theme.spacing.md,
    },
    celebrateText: {
      color: theme.colors.accent,
      fontWeight: '700',
      fontSize: 14,
      backgroundColor: theme.mode === 'dark' 
        ? 'rgba(52, 211, 153, 0.2)' 
        : 'rgba(16, 185, 129, 0.1)',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.pill,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    emptyEmoji: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    emptyCopy: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    emptySubtext: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    habitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
      borderRadius: theme.radii.card,
      backgroundColor: theme.colors.backgroundAlt,
    },
    habitRowDone: {
      backgroundColor: theme.mode === 'dark'
        ? 'rgba(52, 211, 153, 0.15)'
        : 'rgba(16, 185, 129, 0.08)',
    },
    habitText: {
      flex: 1,
      paddingRight: theme.spacing.lg,
    },
    habitTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    habitTitleDone: {
      textDecorationLine: 'line-through',
      color: theme.colors.accent,
      opacity: 0.8,
    },
    habitSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    checkCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    checkCircleActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkCircleFlexible: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    checkMark: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 16,
    },
    dayButton: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.accent,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.radii.card,
      alignItems: 'center',
      shadowColor: theme.colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    dayButtonDisabled: {
      backgroundColor: theme.colors.border,
      shadowOpacity: 0,
      elevation: 0,
    },
    dayButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    dayButtonTextDisabled: {
      color: theme.colors.textSecondary,
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
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    fabText: {
      color: '#fff',
      fontSize: 32,
      fontWeight: '300',
      lineHeight: 32,
    },
  });

