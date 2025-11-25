import React, { useState, useCallback } from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Theme } from '../theme';

interface TimeInputProps {
  value: string;
  onChangeTime: (time: string) => void;
  defaultValue: string;
  theme: Theme;
  style?: TextInputProps['style'];
}

export function TimeInput({ value, onChangeTime, defaultValue, theme, style }: TimeInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const formatTime = useCallback((text: string) => {
    // Remove non-digits
    const digits = text.replace(/\D/g, '');
    
    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    
    // Max 4 digits (HH:mm)
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  }, []);

  const validateTime = useCallback((time: string) => {
    if (!time || time.length === 0) return false;
    
    const parts = time.split(':');
    if (parts.length !== 2) return false;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  }, []);

  const handleChangeText = useCallback((text: string) => {
    const formatted = formatTime(text);
    setLocalValue(formatted);
    
    // Only call onChange if it's a valid complete time
    if (formatted.length === 5 && validateTime(formatted)) {
      onChangeTime(formatted);
    }
  }, [formatTime, validateTime, onChangeTime]);

  const handleBlur = useCallback(() => {
    // If empty or invalid, restore default
    if (!localValue || !validateTime(localValue)) {
      setLocalValue(defaultValue);
      onChangeTime(defaultValue);
    } else if (localValue.length === 5) {
      // Ensure it's saved
      onChangeTime(localValue);
    }
  }, [localValue, defaultValue, validateTime, onChangeTime]);

  const handleFocus = useCallback(() => {
    // Set to current value on focus
    setLocalValue(value);
  }, [value]);

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      value={localValue}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder="00:00"
      placeholderTextColor={theme.colors.textSecondary}
      keyboardType="number-pad"
      maxLength={5}
      returnKeyType="done"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 90,
    textAlign: 'center',
  },
});

