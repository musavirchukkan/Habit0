# HabitØ - Habit Tracker App

A beautiful, feature-rich habit tracking app built with React Native and Expo. Track your daily habits, build streaks, and achieve your goals with an intuitive and modern interface.

![HabitØ](https://img.shields.io/badge/version-1.0.1-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB)
![Expo](https://img.shields.io/badge/Expo-54.0.25-000020)

## ✨ Features

### 📱 Core Features
- **Today View** - See all habits scheduled for today with progress tracking
- **Habit Management** - Create, edit, and organize habits with categories (Essential, Flexible, Weekly)
- **Streak Tracking** - Visual streak badges and total streak counter
- **History Calendar** - View your completion history in a beautiful calendar view
- **Dark/Light Mode** - Automatic theme switching with system preference support
- **Onboarding Flow** - Guided setup for first-time users

### 🔔 Notifications
- **Morning Reminders** - Customizable daily morning motivation (default: 7:00 AM)
- **Evening Summaries** - Daily progress recap (default: 9:30 PM)
- **Smart Reminders** - AI-powered optimal timing reminders
- **Habit-Specific Reminders** - Individual reminders for each habit
- **Streak Warnings** - Alerts to prevent breaking your streak

### 🎯 Advanced Features
- **Flexible Streak Modes** - Strict or lenient streak calculation
- **Grace Days** - Configurable grace period for missed days
- **Habit Categories** - Organize habits as Essential, Flexible, or Weekly
- **Archive Habits** - Archive old habits without losing history
- **Real-time Updates** - Instant UI updates when habits are added/edited
- **Data Export** - Export your data as JSON (development mode)

## 🛠️ Tech Stack

- **Framework:** React Native 0.81.5
- **Platform:** Expo SDK 54
- **Language:** TypeScript
- **Navigation:** React Navigation (Stack & Bottom Tabs)
- **Database:** Realm (local database)
- **Storage:** AsyncStorage (settings & preferences)
- **Notifications:** Expo Notifications
- **Date Handling:** date-fns
- **Icons:** Expo Vector Icons (Feather)

## 📋 Prerequisites

- Node.js 18+ and npm
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode 14+ (macOS only)
- For Android: Android Studio

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/habit-tracker.git
   cd habit-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

### Running on iOS

```bash
npm run ios
# or
npx expo run:ios
```

### Running on Android

```bash
npm run android
# or
npx expo run:android
```

### Running on Web

```bash
npm run web
# or
npx expo start --web
```

## 📱 Development Build

This app uses native modules (Realm), so you need a development build instead of Expo Go:

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Build for iOS
npx expo run:ios

# Build for Android
npx expo run:android
```

## 📁 Project Structure

```
habit-tracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Screen.tsx
│   │   ├── StreakBadge.tsx
│   │   ├── TimeInput.tsx
│   │   └── WeekdaySelector.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useHabits.ts
│   │   ├── useOnboardingState.ts
│   │   └── useSettings.ts
│   ├── navigation/         # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   ├── screens/            # Screen components
│   │   ├── TodayScreen.tsx
│   │   ├── HabitListScreen.tsx
│   │   ├── HabitFormScreen.tsx
│   │   ├── HabitDetailScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── onboarding/
│   ├── services/           # Business logic services
│   │   └── notifications.ts
│   ├── storage/            # Data persistence
│   │   ├── habits.ts
│   │   └── realm-config.ts
│   ├── theme/              # Theme configuration
│   │   ├── index.ts
│   │   ├── palettes.ts
│   │   └── tokens.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── habits.ts
│   │   └── settings.ts
│   └── utils/             # Utility functions
│       └── streak.ts
├── assets/                # Images, icons, fonts
├── App.tsx                # Root component
├── app.json               # Expo configuration
└── package.json           # Dependencies
```

## 🎨 Key Features Explained

### Habit Categories
- **Essential:** Daily habits that are critical to your routine
- **Flexible:** Habits that can be done on any day
- **Weekly:** Habits that occur on specific days of the week

### Streak Calculation
- **Strict Mode:** Streak breaks if you miss a scheduled day
- **Lenient Mode:** Allows grace days before breaking streak

### Notifications
- All notification times are customizable
- Habit-specific reminders only fire on scheduled days
- Smart reminders adapt to your completion patterns

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run on web browser

### Development Tools

In development mode (`__DEV__ === true`), the app includes:
- Database inspection tools
- Data export functionality
- Full reset option for testing

These are automatically removed in production builds.

## 📦 Building for Production

### Automated Builds with GitHub Actions

This repository includes GitHub Actions workflows for automated builds:

- **Android:** Builds AAB for Google Play Store
- **iOS:** Builds ad-hoc distribution for free Apple Developer accounts

**Setup:**
1. Add `EXPO_TOKEN` to GitHub Secrets (Settings → Secrets → Actions)
2. Push to `main` branch or create a release tag
3. Builds run automatically

**Manual Build Commands:**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure (first time)
eas build:configure

# Build Android for Play Store
eas build --platform android --profile production-android

# Build iOS for ad-hoc (free account)
eas build --platform ios --profile ios-adhoc
```

### Release Process

We have an **automated release system** that creates GitHub releases when you push a version tag:

#### Quick Release (Automated Script)
```bash
# Make the script executable (first time only)
chmod +x scripts/release.sh

# Create a new release
./scripts/release.sh 1.0.2
```

The script will:
1. ✅ Update `package.json` and `app.json` versions
2. ✅ Verify release notes exist in `RELEASE_NOTES.md`
3. ✅ Commit and tag the release
4. ✅ Push to GitHub
5. ✅ Trigger automatic GitHub Release creation

#### Manual Release
```bash
# 1. Update versions in package.json and app.json
# 2. Add release notes to RELEASE_NOTES.md
# 3. Commit changes
git add .
git commit -m "chore: bump version to 1.0.2"

# 4. Create and push tag
git tag v1.0.2
git push origin main
git push origin v1.0.2
```

#### What Happens Automatically
- 📝 GitHub Release is created with notes from `RELEASE_NOTES.md`
- 🏷️ Release is tagged with version number
- 📋 Commit history is included
- 🔗 Release appears on GitHub Releases page

📖 **See [RELEASE_GUIDE.md](./RELEASE_GUIDE.md) for detailed release instructions**  
📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide**

## 🗄️ Database

The app uses **Realm** for local data storage:
- Habits and completions are stored in Realm
- Settings and preferences are stored in AsyncStorage
- Database file is automatically created on first launch

## 🔐 Permissions

The app requests the following permissions:
- **Notifications** - For habit reminders and daily summaries
- Requested automatically on app launch

## 🐛 Troubleshooting

### Realm Database Issues
If you encounter database errors:
1. Close the app completely
2. Delete and reinstall the app
3. Or use the reset option in Profile screen (development mode)

### Notification Not Working
1. Check device notification settings
2. Ensure permissions are granted
3. Verify notification times are set correctly

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear cache: `npx expo start -c`
- For iOS: Clean build folder in Xcode
- For Android: `cd android && ./gradlew clean`

## 🚀 Deployment

### Google Play Store
- ✅ Automated builds via GitHub Actions
- ✅ **Automatic submission to Play Store** (after setup)
- ✅ AAB format for Play Store submission
- ✅ See [DEPLOYMENT.md](./DEPLOYMENT.md) for details
- ✅ See [GOOGLE_PLAY_SETUP.md](./GOOGLE_PLAY_SETUP.md) for Play Store automation setup

### iOS (Free Developer Account)
- ✅ Ad-hoc distribution (up to 100 devices)
- ✅ No $99/year App Store fee required
- ✅ Perfect for personal use and testing
- ✅ See [DEPLOYMENT.md](./DEPLOYMENT.md) for details

### GitHub Actions
- **Android Build:** `.github/workflows/android.yml`
- **iOS Build:** `.github/workflows/ios.yml`
- **Release Build:** `.github/workflows/release.yml`

All workflows trigger on:
- Push to `main`/`master` branch
- Release tags (e.g., `v1.0.0`)

## 📄 License

This project is private and proprietary.

## 👤 Author

**Musavir**

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Icons by [Feather Icons](https://feathericons.com/)
- Database powered by [Realm](https://realm.io/)

---

Made with ❤️ using React Native and Expo

