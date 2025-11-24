import { ReactNode, useMemo } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  background?: string;
};

export function Screen({ children, style, background }: Props) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: background ?? theme.colors.background,
        },
      }),
    [theme, background],
  );

  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
}

