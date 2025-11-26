module.exports = {
  expo: {
    name: "HabitØ",
    slug: "habit-tracker",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FF6B35"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.habito.tracker",
      icon: "./assets/icon.png",
      infoPlist: {
        // Remove background modes for push notifications
        UIBackgroundModes: []
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000",
        monochromeImage: "./assets/adaptive-icon.png"
      },
      package: "com.habito.tracker",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-notifications",
        {
          // Only use local notifications (no push notifications)
          // This works with free Apple Developer accounts
          icon: "./assets/icon.png",
          sounds: [],
          // Disable push notifications capability
          mode: "development"
        }
      ]
    ]
  }
};

