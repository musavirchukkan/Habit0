# Release Notes

## Version 1.0.1 (Current)

### 🎨 UI/UX Improvements
- **Dark Mode**: Full dark mode support with beautiful color palettes
- **Today Screen Redesign**: New hero streak card with prominent streak display
- **Enhanced Progress Tracking**: Visual progress circle and better completion states
- **Improved Notifications UI**: Time pickers for morning/evening reminders with emoji indicators

### ✨ New Features
- **Smart Notifications**: AI-powered reminders throughout the day
- **Habit Reminders**: Custom time settings for individual habits
- **Weekly Habits**: New habit category for weekly goals
- **Grace Days**: Configurable grace days (0-2) for streak flexibility
- **Real-time Streak Calculation**: Instant streak updates when completing habits

### 🐛 Bug Fixes
- Fixed habit completion toggle affecting all habits
- Fixed checkbox not working for habits without IDs
- Fixed unique key warnings in Today screen
- Fixed theme switching between light/dark modes
- Fixed habit filtering to include weekly category
- Fixed onboarding habit saving to AsyncStorage

### 🔧 Technical Improvements
- Better TypeScript type safety across components
- Optimized re-renders with useMemo and useCallback
- Improved error handling and logging
- Enhanced development tools (full reset option in dev mode)
- Better notification permission handling

### 📱 Platform Support
- iOS: Full support with native animations
- Android: Edge-to-edge display support
- Web: Experimental support

---

## Version 1.0.0

### 🎉 Initial Release
- Core habit tracking functionality
- Snapchat-like streak system
- Daily check-in screen
- Habit management (CRUD operations)
- Calendar history view
- Profile & settings
- Onboarding flow
- Local data storage with AsyncStorage
- Essential vs Flexible habit categories
- Multi-day habit scheduling

