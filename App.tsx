import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme';
import { requestNotificationPermissions } from './src/services/notifications';

function AppContent() {
  const theme = useTheme();
  
  // Request notification permissions on app start
  useEffect(() => {
    const setup = async () => {
      await requestNotificationPermissions();
    };
    setup();
  }, []);
  
  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
