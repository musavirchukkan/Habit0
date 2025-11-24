import { useState, useMemo } from 'react';
import { Text, StyleSheet, View, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { OnboardingStackParamList } from '../../navigation/types';
import { useTheme, Theme } from '../../theme';
import { useSettings } from '../../hooks/useSettings';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Notifications'> & {
  onComplete?: () => void;
};

export default function NotificationsScreen({ onComplete }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { settings, toggleNotification } = useSettings();
  const [saving, setSaving] = useState(false);

  // Use settings from context (will use defaults if first time)
  const morning = settings.notifications.morning;
  const evening = settings.notifications.evening;
  const smart = settings.notifications.smart;

  const handleComplete = async () => {
    setSaving(true);
    try {
      // Preferences are already saved via toggleNotification
      console.log('✅ Onboarding complete! Notification preferences saved.');
      onComplete?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View>
        <Text style={styles.title}>Want reminders?</Text>
        <Text style={styles.subtitle}>We'll nudge you gently — customizable later.</Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Morning</Text>
            <Text style={styles.rowSubtitle}>7:00 AM nudge</Text>
          </View>
          <Switch value={morning} onValueChange={() => toggleNotification('morning')} />
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Evening</Text>
            <Text style={styles.rowSubtitle}>9:30 PM summary</Text>
          </View>
          <Switch value={evening} onValueChange={() => toggleNotification('evening')} />
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Smart reminders</Text>
            <Text style={styles.rowSubtitle}>We'll find the best time</Text>
          </View>
          <Switch value={smart} onValueChange={() => toggleNotification('smart')} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
        onPress={handleComplete}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Get Started!</Text>
        )}
      </TouchableOpacity>
    </Screen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    padding: theme.spacing.xxxl,
    justifyContent: 'space-between',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  rowTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  rowSubtitle: {
    color: theme.colors.textSecondary,
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

