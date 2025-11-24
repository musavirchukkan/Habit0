import { useState, useMemo } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { OnboardingStackParamList } from '../../navigation/types';
import { useTheme, Theme } from '../../theme';

const focusPresets = [
  { key: 'beginner', label: 'Beginner', description: '1–2 habits', emoji: '🟢' },
  { key: 'normal', label: 'Normal', description: '3 habits', emoji: '🟡' },
  { key: 'focused', label: 'Focused', description: '4+ habits', emoji: '🔴' },
];

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Focus'>;

export default function FocusScreen({ navigation }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selected, setSelected] = useState<string>('normal');

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Choose a focus</Text>
      <View style={styles.cardGroup}>
        {focusPresets.map((item, index) => {
          const active = item.key === selected;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.card,
                index < focusPresets.length - 1 && styles.cardSpacer,
                active && styles.cardActive,
              ]}
              onPress={() => setSelected(item.key)}
            >
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <Text style={styles.cardTitle}>{item.label}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Essentials')}>
        <Text style={styles.primaryButtonText}>Next</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    padding: theme.spacing.xxxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: theme.spacing.xxl,
    color: theme.colors.textPrimary,
  },
  cardGroup: {
    marginTop: theme.spacing.xxl,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  cardSpacer: {
    marginRight: 0,
  },
  cardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  cardEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  cardDescription: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  primaryButton: {
    marginTop: theme.spacing.xxxl,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

