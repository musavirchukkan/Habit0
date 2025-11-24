import { useState, useMemo } from 'react';
import { Text, StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { useTheme, Theme } from '../../theme';
import { Screen } from '../../components/Screen';
import { upsertHabit } from '../../storage/habits';
import { Weekday } from '../../types/habits';

const templates = ['Wake up early', 'Drink water', 'Meditate', '10 min read', 'Take meds', 'Sleep by 11'];

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Essentials'>;

export default function EssentialsScreen({ navigation }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [input, setInput] = useState('');
  const [habits, setHabits] = useState<string[]>(['Drink water', 'Sleep by 11']);
  const [saving, setSaving] = useState(false);

  const addHabit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || habits.includes(trimmed)) return;
    setHabits((prev) => [...prev, trimmed]);
    setInput('');
  };

  const removeHabit = (habitToRemove: string) => {
    setHabits((prev) => prev.filter(h => h !== habitToRemove));
  };

  const saveHabitsAndContinue = async () => {
    if (habits.length === 0) {
      Alert.alert('Add at least one habit', 'You need at least one essential habit to get started.');
      return;
    }

    setSaving(true);
    try {
      // Save all habits with default settings (all days, essential category)
      const allDays: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
      
      console.log('\n🔄 SAVING ONBOARDING HABITS...');
      console.log('   Total to save:', habits.length);
      console.log('   Habits:', habits);
      
      for (const habitTitle of habits) {
        const savedHabit = await upsertHabit({
          title: habitTitle,
          daysOfWeek: allDays, // All days of the week
          category: 'essential',
          archived: false,
        });
        
        console.log('\n✅ HABIT SAVED (Onboarding)');
        console.log('   ID:', savedHabit.id);
        console.log('   Title:', savedHabit.title);
        console.log('   Category:', savedHabit.category);
        console.log('   Days:', savedHabit.daysOfWeek);
        console.log('   Archived:', savedHabit.archived);
      }

      console.log('\n✅ Successfully saved', habits.length, 'habits during onboarding');
      navigation.navigate('Notifications');
    } catch (error) {
      console.error('❌ Failed to save habits:', error);
      Alert.alert('Error', 'Failed to save habits. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add your essentials</Text>
        <Text style={styles.subtitle}>Essentials form your daily streak — keep it small.</Text>

        <View style={styles.templateRow}>
          {templates.map((item) => (
            <TouchableOpacity key={item} style={styles.templateChip} onPress={() => addHabit(item)}>
              <Text style={styles.templateText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add custom habit"
            placeholderTextColor={theme.colors.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => addHabit(input)}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButton} onPress={() => addHabit(input)}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectedList}>
          {habits.map((habit, index) => (
            <TouchableOpacity 
              key={habit} 
              style={styles.selectedChip}
              onLongPress={() => removeHabit(habit)}
            >
              <Text style={styles.selectedText}>
                {index + 1}. {habit}
              </Text>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeHabit(habit)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {habits.length > 0 && (
          <Text style={styles.habitCount}>
            {habits.length} essential habit{habits.length !== 1 ? 's' : ''} will be created for all days
          </Text>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.primaryButton, saving && styles.primaryButtonDisabled]} 
        onPress={saveHabitsAndContinue}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            Continue ({habits.length})
          </Text>
        )}
      </TouchableOpacity>
    </Screen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    padding: theme.spacing.xxxl,
  },
  content: {
    paddingBottom: theme.spacing.jumbo,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  templateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xxl,
  },
  templateChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  templateText: {
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.card,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
  },
  addButton: {
    marginLeft: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    width: 52,
    height: 52,
    borderRadius: theme.radii.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
  },
  selectedList: {
    marginTop: theme.spacing.xxxl,
  },
  selectedChip: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedText: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.md,
  },
  removeButtonText: {
    color: theme.colors.error,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },
  habitCount: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

