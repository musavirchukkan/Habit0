# GitHub Actions Workflows

This directory contains automated build workflows for HabitØ.

## 📋 Available Workflows

### 1. `android.yml`
- **Purpose:** Build Android AAB for Google Play Store
- **Triggers:**
  - Push to `main` or `master` branch
  - Release tags (e.g., `v1.0.0`)
  - Manual trigger (workflow_dispatch)
- **Output:** Android App Bundle (.aab) on EAS Build

### 2. `ios.yml`
- **Purpose:** Build iOS for ad-hoc distribution (free Apple Developer account)
- **Triggers:**
  - Push to `main` or `master` branch
  - Release tags (e.g., `v1.0.0`)
  - Manual trigger (workflow_dispatch)
- **Output:** iOS IPA (.ipa) for ad-hoc installation

### 3. `release.yml`
- **Purpose:** Build both platforms when creating a release
- **Triggers:**
  - Release tags (e.g., `v1.0.0`)
- **Output:** Both Android AAB and iOS IPA

## 🔐 Required Secrets

Add these to GitHub → Settings → Secrets → Actions:

- **EXPO_TOKEN** - Your Expo access token
  - Get from: https://expo.dev/accounts/[your-account]/settings/access-tokens

## 🚀 Usage

### Automatic Builds

1. **Push to main branch:**
   ```bash
   git push origin main
   ```
   → Triggers Android and iOS builds

2. **Create a release:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   → Triggers release builds for both platforms

### Manual Builds

1. Go to GitHub → Actions tab
2. Select workflow (Android or iOS)
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## 📊 Build Status

- Check build status: https://expo.dev/accounts/[your-account]/builds
- Or use CLI: `eas build:list`

## 📥 Downloading Builds

After builds complete:

```bash
# Download Android AAB
eas build:download --platform android --latest

# Download iOS IPA
eas build:download --platform ios --latest
```

## 🔧 Troubleshooting

### Workflow Not Running

1. Check if `EXPO_TOKEN` secret is set
2. Verify branch name matches workflow trigger (`main` vs `master`)
3. Check Actions tab for error messages

### Build Fails

1. Check EAS Build logs: `eas build:view [build-id]`
2. Verify `eas.json` configuration
3. Check Expo account has build credits

---

For detailed deployment instructions, see [../DEPLOYMENT.md](../DEPLOYMENT.md)

