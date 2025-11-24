import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { useMemo } from 'react';

type Props = {
  count: number;
};

export default function StreakBadge({ count }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
      borderRadius: 999,
      marginRight: 8,
    },
    emoji: {
      fontSize: 16,
      marginRight: 4,
    },
    text: {
      fontWeight: '600',
      color: theme.mode === 'dark' ? '#fca5a5' : '#b91c1c',
    },
  }), [theme]);

  if (count <= 0) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.emoji}>🔥</Text>
      <Text style={styles.text}>{count}</Text>
    </View>
  );
}

