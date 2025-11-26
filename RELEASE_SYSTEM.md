# 🚀 Automated Release System

## Overview

This project now has a **fully automated release system** that creates GitHub releases when you push version tags. Release notes are automatically extracted from `RELEASE_NOTES.md`.

---

## 📁 Files Created

### 1. **RELEASE_NOTES.md**
- Contains all version history and release notes
- Organized by version with emoji sections
- Source for automated release descriptions

### 2. **RELEASE_GUIDE.md**
- Complete guide for creating releases
- Step-by-step instructions
- Best practices and troubleshooting

### 3. **.github/workflows/release.yml**
- GitHub Actions workflow
- Triggers on version tags (e.g., `v1.0.1`)
- Automatically creates GitHub releases
- Extracts release notes from `RELEASE_NOTES.md`

### 4. **scripts/release.sh**
- Automated release script
- Updates versions in `package.json` and `app.json`
- Creates and pushes git tags
- Interactive with confirmations

### 5. **.github/RELEASE_TEMPLATE.md**
- Template for writing release notes
- Includes examples and best practices
- Copy-paste ready format

---

## 🎯 Quick Start

### Option 1: Automated Script (Recommended)

```bash
# Make executable (first time only)
chmod +x scripts/release.sh

# Create release
./scripts/release.sh 1.0.2
```

### Option 2: Manual Process

```bash
# 1. Update RELEASE_NOTES.md with new version section
# 2. Update versions
# 3. Commit and tag
git add .
git commit -m "chore: bump version to 1.0.2"
git tag v1.0.2
git push origin main
git push origin v1.0.2
```

---

## 🔄 How It Works

### 1. You Push a Tag
```bash
git tag v1.0.2
git push origin v1.0.2
```

### 2. GitHub Actions Triggers
- Workflow detects the tag
- Extracts version number (1.0.2)
- Reads `RELEASE_NOTES.md`

### 3. Release Notes Extracted
```markdown
## Version 1.0.2

### 🎨 UI/UX Improvements
- Feature 1
- Feature 2
...
```

### 4. GitHub Release Created
- Title: "Release v1.0.2"
- Body: Content from `RELEASE_NOTES.md`
- Tag: v1.0.2
- Auto-generated commit history included

### 5. View on GitHub
`https://github.com/YOUR_USERNAME/habit-tracker/releases`

---

## 📝 Release Notes Format

### Structure
```markdown
## Version X.X.X

### 🎨 UI/UX Improvements
- Change 1
- Change 2

### ✨ New Features
- Feature 1
- Feature 2

### 🐛 Bug Fixes
- Fix 1
- Fix 2

### 🔧 Technical Improvements
- Improvement 1
- Improvement 2

### 📱 Platform Support
- iOS: Details
- Android: Details
- Web: Details
```

### Emoji Guide
- 🎨 UI/UX changes
- ✨ New features
- 🐛 Bug fixes
- 🔧 Technical improvements
- 📱 Platform support
- ⚠️ Breaking changes
- 🔄 Migration guides
- 📝 Documentation
- 🔐 Security
- ⚡ Performance

---

## 🎯 Version Numbering

Follow [Semantic Versioning](https://semver.org/):

```
v MAJOR . MINOR . PATCH
  │       │       │
  │       │       └─── Bug fixes (1.0.0 → 1.0.1)
  │       └─────────── New features (1.0.1 → 1.1.0)
  └─────────────────── Breaking changes (1.1.0 → 2.0.0)
```

### Examples
- `1.0.0` → `1.0.1` - Fixed dark mode bug
- `1.0.1` → `1.1.0` - Added weekly habits feature
- `1.1.0` → `2.0.0` - Complete database rewrite

---

## ✅ Release Checklist

Before creating a release:

- [ ] All features tested and working
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] Release notes written in `RELEASE_NOTES.md`
- [ ] Version updated in `package.json`
- [ ] Version updated in `app.json`
- [ ] README badges updated (if needed)
- [ ] All changes committed to main branch

---

## 🔧 Customization

### Change Release Format

Edit `.github/workflows/release.yml`:

```yaml
- name: Create GitHub Release
  uses: softprops/action-gh-release@v1
  with:
    tag_name: ${{ steps.tag.outputs.tag }}
    name: Release ${{ steps.tag.outputs.tag }}  # ← Customize title
    body_path: release_notes_temp.md
    draft: false  # ← Set to true for draft releases
    prerelease: false  # ← Set to true for pre-releases
```

### Add Build Artifacts

Enable the `build-artifacts` job in `release.yml`:

```yaml
build-artifacts:
  if: false  # ← Change to: if: true
```

Then add `EXPO_TOKEN` to GitHub Secrets.

---

## 🐛 Troubleshooting

### Release Not Created?
1. Check GitHub Actions tab for errors
2. Ensure tag starts with `v` (e.g., `v1.0.1`)
3. Verify `RELEASE_NOTES.md` has section for this version

### Wrong Release Notes?
1. Edit release manually on GitHub, or
2. Delete and recreate tag:
   ```bash
   git tag -d v1.0.1
   git push origin :refs/tags/v1.0.1
   git tag v1.0.1
   git push origin v1.0.1
   ```

### Script Permissions Error?
```bash
chmod +x scripts/release.sh
```

---

## 📚 Additional Resources

- **RELEASE_GUIDE.md** - Detailed release instructions
- **RELEASE_NOTES.md** - All version history
- **.github/RELEASE_TEMPLATE.md** - Template for new releases
- **scripts/release.sh** - Automated release script

---

## 🎉 Current Version

**Version 1.0.1** - Bugfix release with dark mode and notification improvements

See [RELEASE_NOTES.md](./RELEASE_NOTES.md) for full changelog.

---

Made with ❤️ for efficient release management

