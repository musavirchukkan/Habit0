import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { OnboardingStackParamList } from '../../navigation/types';
import { useTheme, Theme } from '../../theme';
import { useMemo } from 'react';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  return (
    <Screen style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={styles.title}>StreakFlow</Text>
        <Text style={styles.subtitle}>Small habits. Big streaks.</Text>
        <Text style={styles.description}>
          Built for short attention spans — start with just a few essentials.
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Focus')}>
          <Text style={styles.primaryButtonText}>Get started</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.secondaryButton}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    padding: theme.spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
  },
  heroTextSpacing: {
    marginTop: theme.spacing.lg,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: theme.spacing.lg,
    color: theme.colors.textPrimary,
  },
  description: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
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
  secondaryButton: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: theme.spacing.md,
  },
});

