import { ComponentProps } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  MainTabParamList,
  OnboardingStackParamList,
  RootStackParamList,
} from './types';
import HabitListScreen from '../screens/HabitListScreen';
import HabitFormScreen from '../screens/HabitFormScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import TodayScreen from '../screens/TodayScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../theme';
import { useOnboardingState } from '../hooks/useOnboardingState';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import FocusScreen from '../screens/onboarding/FocusScreen';
import EssentialsScreen from '../screens/onboarding/EssentialsScreen';
import NotificationsScreen from '../screens/onboarding/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function OnboardingNavigator({ onComplete }: { onComplete: () => void }) {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="Focus" component={FocusScreen} />
      <OnboardingStack.Screen name="Essentials" component={EssentialsScreen} />
      <OnboardingStack.Screen name="Notifications">
        {(props) => <NotificationsScreen {...props} onComplete={onComplete} />}
      </OnboardingStack.Screen>
    </OnboardingStack.Navigator>
  );
}

function MainTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { 
          height: 70,
          paddingTop: 0,
          paddingBottom: 12,
          paddingHorizontal: 0,
          marginTop: 0,
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          marginTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 0,
          marginBottom: 4,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<keyof MainTabParamList, ComponentProps<typeof Feather>['name']> = {
            Today: 'sun',
            Habits: 'check-square',
            History: 'calendar',
            Profile: 'user',
          };
          const icon = iconMap[route.name as keyof MainTabParamList] ?? 'circle';
          return <Feather name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Habits" component={HabitListScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isComplete, markComplete } = useOnboardingState();
  const theme = useTheme();

  if (isComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: {
            color: theme.colors.textPrimary,
            fontWeight: '600',
          },
          headerShadowVisible: false,
        }}
      >
        {!isComplete ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingNavigator onComplete={markComplete} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
        <Stack.Screen
          name="HabitForm"
          component={HabitFormScreen}
          options={{ 
            presentation: 'card', 
            headerShown: true, 
            title: 'Habit',
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.primary,
            headerTitleStyle: {
              color: theme.colors.textPrimary,
              fontWeight: '600',
            },
          }}
        />
        <Stack.Screen
          name="HabitDetail"
          component={HabitDetailScreen}
          options={{ 
            headerShown: true, 
            title: 'Habit Detail',
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.primary,
            headerTitleStyle: {
              color: theme.colors.textPrimary,
              fontWeight: '600',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

