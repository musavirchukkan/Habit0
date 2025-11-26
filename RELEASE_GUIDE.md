# Release Guide

## 📦 How to Create a New Release

### 1. Update Version Numbers

Update the version in **three places**:

```bash
# 1. package.json
"version": "1.0.1"

# 2. app.json
"version": "1.0.1"

# 3. RELEASE_NOTES.md - Add new section at the top
## Version 1.0.1
...
```

### 2. Update Release Notes

Edit `RELEASE_NOTES.md` and add a new section at the top:

```markdown
## Version 1.0.1

### 🎨 UI/UX Improvements
- Feature 1
- Feature 2

### ✨ New Features
- Feature A
- Feature B

### 🐛 Bug Fixes
- Fixed issue X
- Fixed issue Y

### 🔧 Technical Improvements
- Improvement 1
- Improvement 2
```

### 3. Commit Changes

```bash
git add .
git commit -m "chore: bump version to 1.0.1"
git push origin main
```

### 4. Create and Push Tag

```bash
# Create a tag with version number (must start with 'v')
git tag v1.0.1

# Push the tag to GitHub
git push origin v1.0.1
```

### 5. Automatic Release Creation

Once you push the tag, GitHub Actions will automatically:
- ✅ Extract release notes from `RELEASE_NOTES.md`
- ✅ Create a GitHub Release
- ✅ Attach the release notes
- ✅ Generate additional release notes from commits

### 6. View Your Release

Go to: `https://github.com/YOUR_USERNAME/habit-tracker/releases`

---

## 🏷️ Tag Naming Convention

Tags **must** follow this format:
- `v1.0.0` - Major release
- `v1.0.1` - Patch/bugfix
- `v1.1.0` - Minor feature release
- `v2.0.0` - Major breaking changes

---

## 🔄 Version Numbering (Semantic Versioning)

```
v MAJOR . MINOR . PATCH
  │       │       │
  │       │       └─── Bug fixes, small changes
  │       └─────────── New features (backwards compatible)
  └─────────────────── Breaking changes
```

### Examples:
- `1.0.0` → `1.0.1` - Fixed bugs
- `1.0.1` → `1.1.0` - Added new features
- `1.1.0` → `2.0.0` - Major rewrite/breaking changes

---

## 📝 Release Notes Template

Copy this template when creating a new version section:

```markdown
## Version X.X.X

### 🎨 UI/UX Improvements
- 

### ✨ New Features
- 

### 🐛 Bug Fixes
- 

### 🔧 Technical Improvements
- 

### 📱 Platform Support
- iOS: 
- Android: 
- Web: 
```

---

## 🚀 Quick Release Checklist

- [ ] Update version in `package.json`
- [ ] Update version in `app.json`
- [ ] Add release notes to `RELEASE_NOTES.md`
- [ ] Commit changes: `git commit -m "chore: bump version to X.X.X"`
- [ ] Push to main: `git push origin main`
- [ ] Create tag: `git tag vX.X.X`
- [ ] Push tag: `git push origin vX.X.X`
- [ ] Wait for GitHub Action to complete
- [ ] Verify release on GitHub

---

## 🛠️ Troubleshooting

### Release not created automatically?
1. Check GitHub Actions tab for errors
2. Ensure tag starts with `v` (e.g., `v1.0.1`)
3. Verify `RELEASE_NOTES.md` exists and has content

### Wrong release notes?
1. Edit the release manually on GitHub
2. Or delete the tag and recreate:
   ```bash
   git tag -d v1.0.1
   git push origin :refs/tags/v1.0.1
   git tag v1.0.1
   git push origin v1.0.1
   ```

### Want to delete a release?
```bash
# Delete tag locally
git tag -d v1.0.1

# Delete tag on GitHub
git push origin :refs/tags/v1.0.1

# Delete release on GitHub (manual)
# Go to Releases → Click release → Delete release
```

---

## 🎯 Best Practices

1. **Always test before tagging** - Make sure the app works!
2. **Write clear release notes** - Users need to know what changed
3. **Use meaningful version numbers** - Follow semantic versioning
4. **Tag from main branch** - Ensure you're on the latest code
5. **One tag per version** - Don't reuse version numbers

---

## 📱 Building Release Artifacts (Optional)

To automatically build APK/IPA files with releases:

1. Set up Expo EAS:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. Add `EXPO_TOKEN` to GitHub Secrets:
   - Go to Settings → Secrets → Actions
   - Add new secret: `EXPO_TOKEN`
   - Get token from: `eas whoami` or Expo dashboard

3. Enable artifact building in `.github/workflows/release.yml`:
   ```yaml
   if: false  # Change to: if: true
   ```

---

## 📚 Additional Resources

- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Git Tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)

