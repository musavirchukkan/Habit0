# 🚀 Deployment Guide

Complete guide for deploying HabitØ to Google Play Store and installing on iOS devices using a free Apple Developer account.

---

## 📋 Prerequisites

### For Google Play Store
- ✅ Google Play Console account ($25 one-time fee)
- ✅ Expo account (free)
- ✅ EAS Build account (free tier available)

### For iOS (Free Developer Account)
- ✅ Free Apple Developer account (no $99/year needed)
- ✅ Expo account (free)
- ✅ EAS Build account (free tier available)
- ✅ Registered device UDIDs (up to 100 devices)

---

## 🔐 Setup Secrets

### 1. Get Expo Access Token

1. Go to https://expo.dev/accounts/[your-account]/settings/access-tokens
2. Create a new token
3. Add it to GitHub Secrets:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add secret: `EXPO_TOKEN` with your token value

### 2. Configure EAS Build

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS Build
eas build:configure
```

This creates `eas.json` (already included in the repo).

---

## 🤖 GitHub Actions Setup

### Required Secrets

Add these secrets to your GitHub repository:

1. **EXPO_TOKEN** - Your Expo access token
   - Get from: https://expo.dev/accounts/[your-account]/settings/access-tokens
   - Add to: GitHub → Settings → Secrets → Actions

2. **GOOGLE_SERVICE_ACCOUNT_JSON** - Google Service Account JSON (for Play Store auto-submission)
   - See [GOOGLE_PLAY_SETUP.md](./GOOGLE_PLAY_SETUP.md) for detailed setup
   - Add to: GitHub → Settings → Secrets → Actions

### Workflows

The repository includes three GitHub Actions workflows:

1. **`.github/workflows/android.yml`**
   - Builds Android AAB for Play Store
   - Triggers on push to main/master or tags

2. **`.github/workflows/ios.yml`**
   - Builds iOS for ad-hoc distribution
   - Triggers on push to main/master or tags

3. **`.github/workflows/release.yml`**
   - Builds both platforms when you create a release tag
   - Triggers on tags like `v1.0.0`

---

## 📱 Android - Google Play Store

### Step 1: Build Android App Bundle (AAB)

#### Option A: Using GitHub Actions (Automated)

1. Push to `main` branch or create a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically:
   - Build the AAB
   - Upload to EAS Build
   - You'll get a notification when done

3. Download the build:
   ```bash
   eas build:download --platform android --latest
   ```

#### Option B: Manual Build

```bash
# Build for Play Store
eas build --platform android --profile production-android
```

### Step 2: Automated Submission (Recommended)

**If you've set up Google Service Account** (see [GOOGLE_PLAY_SETUP.md](./GOOGLE_PLAY_SETUP.md)):
- ✅ Submission happens automatically after build completes
- ✅ No manual upload needed
- ✅ Release appears in Play Console automatically

**Manual Upload (Alternative):**

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app (if first time)
3. Go to **Production** → **Create new release**
4. Upload the `.aab` file from `eas build:download`
5. Fill in release notes
6. Review and publish

### Step 3: Submit for Review

- Complete store listing
- Add screenshots
- Set up pricing (free/paid)
- Submit for review (usually takes 1-3 days)

**Note:** With automated submission, the build is automatically uploaded to your selected track (internal/alpha/beta/production). You still need to complete store listing and submit for review in Play Console.

---

## 🍎 iOS - Free Developer Account (Ad-Hoc)

### Important Notes

- **Free Apple Developer Account:**
  - ✅ Can install on up to 100 devices
  - ✅ Valid for 1 year
  - ✅ No App Store distribution
  - ✅ Perfect for personal use/testing

- **Ad-Hoc Distribution:**
  - Install directly on registered devices
  - No App Store submission
  - Requires device UDID registration

### Step 1: Register Device UDIDs

1. Get your device UDID:
   - **iPhone/iPad:** Settings → General → About → Identifier (UDID)
   - Or connect to Mac and check in Finder/Xcode

2. Register in Apple Developer Portal:
   - Go to https://developer.apple.com/account/resources/devices/list
   - Click "+" to add device
   - Enter UDID and device name
   - Save

3. Register in Expo:
   ```bash
   # Add device UDID to Expo
   eas device:create
   ```

### Step 2: Build iOS Ad-Hoc

#### Option A: Using GitHub Actions (Automated)

1. Push to `main` branch or create a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically build

3. Download the build:
   ```bash
   eas build:download --platform ios --latest
   ```

#### Option B: Manual Build

```bash
# Build for ad-hoc distribution
eas build --platform ios --profile ios-adhoc
```

### Step 3: Install on Device

#### Method 1: Using EAS Build QR Code

1. After build completes, EAS provides a QR code
2. Scan with your iPhone camera
3. Install directly

#### Method 2: Download and Install

1. Download the `.ipa` file:
   ```bash
   eas build:download --platform ios --latest
   ```

2. Install using one of these methods:
   - **AltStore** (recommended for free account)
   - **Xcode:** Window → Devices and Simulators → Install
   - **Apple Configurator 2**

#### Method 3: Using TestFlight (Requires Paid Account)

If you upgrade to paid account later:
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

---

## 🏷️ Version Management

### Current Version

- **Version:** `1.0.0`
- **Package:** `package.json` → `version: "1.0.0"`
- **App Config:** `app.json` → `version: "1.0.0"`

### Updating Version

1. Update version in both files:
   ```json
   // package.json
   "version": "1.0.1"
   
   // app.json
   "version": "1.0.1"
   ```

2. Commit and tag:
   ```bash
   git add package.json app.json
   git commit -m "Bump version to 1.0.1"
   git tag v1.0.1
   git push origin main --tags
   ```

3. GitHub Actions will automatically build new version

---

## 🔄 Automated Workflow

### Daily Development

1. **Make changes** → Commit → Push to `main`
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin main
   ```

2. **GitHub Actions triggers** → Builds automatically

3. **Get notification** → Download when ready

### Release Process

1. **Update version** in `package.json` and `app.json`

2. **Create release tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **GitHub Actions builds both platforms**

4. **Download builds:**
   ```bash
   eas build:download --platform android --latest
   eas build:download --platform ios --latest
   ```

5. **Upload Android to Play Store**

6. **Install iOS on registered devices**

---

## 📊 Build Status

Check build status:

```bash
# List recent builds
eas build:list

# Check specific build
eas build:view [build-id]

# Or visit
https://expo.dev/accounts/[your-account]/builds
```

---

## 🐛 Troubleshooting

### Android Build Fails

1. **Check EAS Build logs:**
   ```bash
   eas build:view [build-id]
   ```

2. **Common issues:**
   - Missing keystore → EAS generates automatically
   - Version conflict → Update version number
   - Dependencies → Run `npm install` locally first

### iOS Build Fails

1. **Check device registration:**
   ```bash
   eas device:list
   ```

2. **Common issues:**
   - Device not registered → Add UDID to Apple Developer
   - Certificate expired → Re-run `eas build:configure`
   - Provisioning profile → EAS handles automatically

### GitHub Actions Not Triggering

1. **Check secrets:**
   - Verify `EXPO_TOKEN` is set correctly
   - Check token hasn't expired

2. **Check workflow file:**
   - Ensure `.github/workflows/*.yml` files exist
   - Verify branch names match (`main` vs `master`)

---

## 🔒 Security Best Practices

1. **Never commit secrets:**
   - ✅ Use GitHub Secrets
   - ❌ Don't commit `.env` files
   - ❌ Don't commit `google-service-account.json`

2. **Rotate tokens regularly:**
   - Update `EXPO_TOKEN` every 90 days
   - Revoke old tokens

3. **Use environment-specific configs:**
   - Development vs Production
   - Different API keys per environment

---

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [Apple Developer Portal](https://developer.apple.com/account)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## ✅ Checklist

### Initial Setup
- [ ] Create Expo account
- [ ] Install EAS CLI
- [ ] Configure EAS Build (`eas build:configure`)
- [ ] Get Expo access token
- [ ] Add `EXPO_TOKEN` to GitHub Secrets
- [ ] Push code to GitHub

### Android
- [ ] Create Google Play Console account
- [ ] Create app in Play Console
- [ ] Set up Google Service Account (see [GOOGLE_PLAY_SETUP.md](./GOOGLE_PLAY_SETUP.md))
- [ ] Add `GOOGLE_SERVICE_ACCOUNT_JSON` to GitHub Secrets
- [ ] Build AAB (via GitHub Actions - auto-submits!)
- [ ] Complete store listing in Play Console
- [ ] Submit for review

### iOS
- [ ] Create free Apple Developer account
- [ ] Register device UDIDs
- [ ] Build iOS ad-hoc (via GitHub Actions or manual)
- [ ] Install on registered devices

---

**Ready to deploy! 🚀**

