import { useCallback, useEffect, useLayoutEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import WeekdaySelector from '../components/WeekdaySelector';
import { RootStackParamList } from '../navigation/types';
import { fetchHabitById, upsertHabit, deleteHabit } from '../storage/habits';
import { WEEKDAYS } from '../constants/weekdays';
import { HabitCategory, Weekday } from '../types/habits';
import { useTheme, Theme } from '../theme';
import { Screen } from '../components/Screen';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitForm'>;

const DEFAULT_DAYS: Weekday[] = WEEKDAYS.map((d) => d.value);

export default function HabitFormScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const habitId = route.params?.habitId;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState(DEFAULT_DAYS);
  const [reminderTime, setReminderTime] = useState('');
  const [archived, setArchived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<HabitCategory>('essential');

  useLayoutEffect(() => {
    navigation.setOptions({ title: habitId ? 'Edit Habit' : 'New Habit' });
  }, [habitId, navigation]);

  useEffect(() => {
    let mounted = true;
    const loadHabit = async () => {
      if (!habitId) return;
      setLoading(true);
      const habit = await fetchHabitById(habitId);
      if (habit && mounted) {
        setTitle(habit.title);
        setDescription(habit.description ?? '');
        setDaysOfWeek(habit.daysOfWeek);
        setReminderTime(habit.reminderTime ?? '');
        setArchived(Boolean(habit.archived));
        setCategory(habit.category ?? 'essential');
      }
      setLoading(false);
    };
    loadHabit();
    return () => {
      mounted = false;
    };
  }, [habitId]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a habit name.');
      return;
    }
    if (daysOfWeek.length === 0) {
      Alert.alert('Schedule required', 'Pick at least one day of the week.');
      return;
    }

    const savedHabit = await upsertHabit({
      id: habitId,
      title: title.trim(),
      description: description.trim() || undefined,
      daysOfWeek,
      reminderTime: reminderTime.trim() || undefined,
      archived,
      category,
    });

    if (__DEV__) {
      console.log('\n✅ HABIT SAVED (HabitFormScreen)');
      console.log('   ID:', savedHabit.id);
      console.log('   Title:', savedHabit.title);
      console.log('   Category:', savedHabit.category);
      console.log('   Days:', savedHabit.daysOfWeek);
      console.log('   Archived:', savedHabit.archived);
      console.log('   Mode:', habitId ? 'EDIT' : 'CREATE');
    }

    navigation.goBack();
  }, [archived, daysOfWeek, description, habitId, navigation, reminderTime, title]);

  const confirmDelete = useCallback(() => {
    if (!habitId) return;
    Alert.alert('Delete habit?', 'This will remove all history for this habit.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHabit(habitId);
          navigation.goBack();
        },
      },
    ]);
  }, [habitId, navigation]);

  const typeOptions: { value: HabitCategory; label: string; description: string }[] = [
    { value: 'essential', label: 'Essential', description: 'Counts toward streak' },
    { value: 'flexible', label: 'Flexible', description: 'Nice-to-have' },
    { value: 'weekly', label: 'Weekly', description: 'Specific days only' },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Type</Text>
          <View>
            {typeOptions.map((option) => {
              const active = category === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.typeCard, active && styles.typeCardActive]}
                  onPress={() => setCategory(option.value)}
                >
                  <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{option.label}</Text>
                  <Text style={[styles.typeDescription, active && styles.typeDescriptionActive]}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Morning workout"
            placeholderTextColor={theme.colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional notes"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Schedule</Text>
          <WeekdaySelector value={daysOfWeek} onChange={setDaysOfWeek} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Reminder time (HH:MM)</Text>
          <TextInput
            style={styles.input}
            placeholder="07:00"
            placeholderTextColor={theme.colors.textSecondary}
            value={reminderTime}
            onChangeText={setReminderTime}
            editable={!loading}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Archive habit</Text>
          <Switch value={archived} onValueChange={setArchived} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveText}>{habitId ? 'Save changes' : 'Create habit'}</Text>
        </TouchableOpacity>

        {habitId && (
          <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
            <Text style={styles.deleteText}>Delete habit</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: theme.colors.background,
    paddingBottom: 48,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
  },
  textArea: {
    textAlignVertical: 'top',
    height: 120,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  typeCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  typeLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  typeLabelActive: {
    color: theme.colors.primary,
  },
  typeDescription: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  typeDescriptionActive: {
    color: theme.colors.primary,
    opacity: 0.8,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteText: {
    color: theme.colors.error,
    fontWeight: '500',
  },
});

