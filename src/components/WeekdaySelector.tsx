import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WEEKDAYS } from '../constants/weekdays';
import { Weekday } from '../types/habits';
import { useTheme, Theme } from '../theme';

type Props = {
  value: Weekday[];
  onChange: (next: Weekday[]) => void;
};

function WeekdaySelectorComponent({ value, onChange }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  const toggleDay = (day: Weekday) => {
    if (value.includes(day)) {
      onChange(value.filter((item) => item !== day));
    } else {
      onChange([...value, day].sort());
    }
  };

  return (
    <View style={styles.container}>
      {WEEKDAYS.map((day) => {
        const active = value.includes(day.value);
        return (
          <Pressable
            key={day.value}
            onPress={() => toggleDay(day.value)}
            style={[styles.day, active && styles.dayActive]}
          >
            <Text style={[styles.dayText, active && styles.dayTextActive]}>{day.short}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
  },
  dayActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayText: {
    color: theme.colors.textPrimary,
  },
  dayTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});

const WeekdaySelector = memo(WeekdaySelectorComponent);
export default WeekdaySelector;

