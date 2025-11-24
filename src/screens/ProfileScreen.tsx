import { useMemo } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '../components/Screen';
import { useTheme, Theme } from '../theme';
import { useSettings, SETTINGS_STORAGE_KEY } from '../hooks/useSettings';
import { useHabits } from '../hooks/useHabits';
import { clearAllHabitData } from '../storage/habits';

const ONBOARDING_KEY = 'habit-tracker::onboardingComplete';

export default function ProfileScreen() {
  const theme = useTheme();
  const { settings, loading, setTheme, toggleNotification, setGraceDays, setStreakMode } = useSettings();
  const { refresh } = useHabits();

  const themeOptions = useMemo(
    () => [
      { key: 'system', label: 'System' },
      { key: 'light', label: 'Light' },
      { key: 'dark', label: 'Dark' },
    ],
    [],
  );

  const streakOptions = useMemo(
    () => [
      { key: 'strict', label: 'Strict' },
      { key: 'lenient', label: 'Lenient' },
    ],
    [],
  );

  const graceOptions: Array<0 | 1 | 2> = [0, 1, 2];

  const handleReset = () => {
    Alert.alert(
      'Reset all data?',
      'This clears habits, completions, settings, and onboarding progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllHabitData();
            await AsyncStorage.multiRemove([SETTINGS_STORAGE_KEY, ONBOARDING_KEY]);
            await refresh();
            Alert.alert('Data cleared', 'Start fresh by setting up your essentials again.');
          },
        },
      ],
    );
  };

  const styles = useMemo(() => createStyles(theme), [theme]);

  if (loading) {
    return (
      <Screen style={styles.loadingState}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile & Settings</Text>
        <Text style={styles.subtitle}>Tune reminders, streak rules, and appearance.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.chipRow}>
            {themeOptions.map((option) => {
              const active = settings.theme === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setTheme(option.key as typeof settings.theme)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingsRow
            label="Morning"
            hint="7:00 AM check-in"
            value={settings.notifications.morning}
            onToggle={() => toggleNotification('morning')}
            styles={styles}
          />
          <SettingsRow
            label="Evening"
            hint="9:30 PM summary"
            value={settings.notifications.evening}
            onToggle={() => toggleNotification('evening')}
            styles={styles}
          />
          <SettingsRow
            label="Smart reminders"
            hint="We'll nudge at the best time"
            value={settings.notifications.smart}
            onToggle={() => toggleNotification('smart')}
            styles={styles}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grace days</Text>
          <Text style={styles.sectionHint}>How many misses you allow per rolling week.</Text>
          <View style={styles.chipRow}>
            {graceOptions.map((value) => {
              const active = settings.graceDays === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setGraceDays(value)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {value === 0 ? 'None' : `${value} day${value !== 1 ? 's' : ''}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streak behavior</Text>
          <View style={styles.chipRow}>
            {streakOptions.map((option) => {
              const active = settings.streakMode === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setStreakMode(option.key as typeof settings.streakMode)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.sectionHint}>
            Strict resets streak immediately. Lenient gives you one grace day per week.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Export data', 'Export to CSV coming soon.')}
          >
            <Text style={styles.actionButtonText}>Export progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleReset}>
            <Text style={[styles.actionButtonText, styles.dangerText]}>Reset all data</Text>
          </TouchableOpacity>
        </View>

        {__DEV__ && (
          <View style={[styles.section, styles.devSection]}>
            <Text style={styles.sectionTitle}>🔧 Development</Text>
            <Text style={styles.sectionHint}>
              Full reset clears all data and returns to onboarding. Close and reopen app to see changes.
            </Text>
            <TouchableOpacity 
              style={[styles.actionButton, styles.devButton]} 
              onPress={async () => {
                Alert.alert(
                  '🚀 Full Reset',
                  'This will:\n• Clear all habits & completions\n• Reset settings to defaults\n• Reset onboarding state\n\nYou\'ll need to close and reopen the app.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reset Now',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          // Clear all data
                          await clearAllHabitData();
                          await AsyncStorage.multiRemove([
                            SETTINGS_STORAGE_KEY, 
                            'habit-tracker::onboardingComplete'
                          ]);
                          
                          // Show success and instructions
                          Alert.alert(
                            '✅ Reset Complete!',
                            Platform.select({
                              ios: 'Double-tap home button and swipe up to close the app, then reopen it.',
                              android: 'Tap the recent apps button and swipe away this app, then reopen it.',
                              default: 'Close and reopen the app to see the fresh start.',
                            }),
                            [{ text: 'Got it!' }]
                          );
                        } catch (error) {
                          Alert.alert('Error', 'Failed to reset: ' + error);
                          console.error('Reset error:', error);
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={[styles.actionButtonText, styles.devButtonText]}>🚀 Full Reset (Close App After)</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

type RowProps = {
  label: string;
  hint?: string;
  value: boolean;
  onToggle: () => void;
  styles: ReturnType<typeof createStyles>;
};

function SettingsRow({ label, hint, value, onToggle, styles }: RowProps) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.xxxl,
      gap: theme.spacing.xxxl,
      paddingBottom: 100,
    },
    loadingState: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      color: theme.colors.textSecondary,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.card,
      padding: theme.spacing.xxl,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: theme.spacing.lg,
      color: theme.colors.textPrimary,
    },
    sectionHint: {
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    rowLabel: {
      fontSize: 16,
      color: theme.colors.textPrimary,
    },
    rowHint: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.pill,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
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
    actionButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    actionButtonText: {
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    dangerButton: {
      borderColor: theme.colors.error,
    },
    dangerText: {
      color: theme.colors.error,
    },
    devSection: {
      borderWidth: 2,
      borderColor: theme.mode === 'dark' ? '#818cf8' : '#6366f1',
      borderStyle: 'dashed',
    },
    devButton: {
      borderColor: theme.mode === 'dark' ? '#818cf8' : '#6366f1',
      backgroundColor: theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
    },
    devButtonText: {
      color: theme.mode === 'dark' ? '#818cf8' : '#6366f1',
    },
  });
