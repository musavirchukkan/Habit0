import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { spacing, radii, fontWeights } from './tokens';
import { lightPalette, darkPalette } from './palettes';
import { SettingsProvider, useSettings } from '../hooks/useSettings';

export type ThemeMode = 'light' | 'dark';

export const createTheme = (mode: ThemeMode) => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  return {
    mode,
    colors: palette,
    spacing,
    radii,
    fontWeights,
    shadow: {
      card: {
        shadowColor: mode === 'dark' ? 'rgba(0,0,0,0.8)' : '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: mode === 'dark' ? 0.45 : 0.08,
        shadowRadius: 16,
        elevation: 4,
      },
    },
  };
};

export type Theme = ReturnType<typeof createTheme>;

const ThemeContext = createContext<Theme>(createTheme('light'));

export function ThemeProvider({ children }: { children: ReactNode }) {
  return React.createElement(
    SettingsProvider,
    null,
    React.createElement(InnerThemeProvider, null, children)
  );
}

function InnerThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const systemColorScheme = useColorScheme();
  
  // Ensure we properly resolve the theme mode
  const resolvedMode: ThemeMode = useMemo(() => {
    if (settings.theme === 'system') {
      // Default to 'light' if system returns null
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return settings.theme;
  }, [settings.theme, systemColorScheme]);
  
  const value = useMemo(() => createTheme(resolvedMode), [resolvedMode]);
  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Static theme export for backwards compatibility
export const theme = createTheme('light');
