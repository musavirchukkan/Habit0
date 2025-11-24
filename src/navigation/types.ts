export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  HabitForm: { habitId?: string } | undefined;
  HabitDetail: { habitId: string };
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Focus: undefined;
  Essentials: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Habits: undefined;
  History: undefined;
  Profile: undefined;
};

