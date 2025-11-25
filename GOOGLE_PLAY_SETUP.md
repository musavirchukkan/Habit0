# 🔐 Google Play Store Service Account Setup

Complete guide for setting up automated Play Store submissions using Google Service Account.

---

## 📋 Prerequisites

- ✅ Google Play Console account
- ✅ App already created in Play Console
- ✅ Admin access to Play Console

---

## 🚀 Step-by-Step Setup

### Step 1: Create Service Account in Google Cloud

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select or create a project

2. **Enable Google Play Android Developer API**
   - Go to: https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com
   - Click **"Enable"**

3. **Create Service Account**
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Click **"Create Service Account"**
   - Name: `play-store-submitter` (or any name)
   - Description: `Service account for automated Play Store submissions`
   - Click **"Create and Continue"**

4. **Grant Role (Optional)**
   - Skip this step (we'll grant permissions in Play Console)
   - Click **"Continue"** → **"Done"**

5. **Create Key**
   - Click on the newly created service account
   - Go to **"Keys"** tab
   - Click **"Add Key"** → **"Create new key"**
   - Select **JSON** format
   - Click **"Create"**
   - **Download the JSON file** (you'll need this!)

---

### Step 2: Link Service Account to Play Console

1. **Go to Play Console**
   - Visit: https://play.google.com/console
   - Select your app

2. **Navigate to API Access**
   - Go to: **Settings** → **API access**
   - Or direct link: https://play.google.com/console/developers/[your-developer-id]/api-access

3. **Link Service Account**
   - Scroll to **"Service accounts"** section
   - Click **"Link service account"**
   - Enter the **Service Account Email** (from Step 1)
   - Click **"Link"**

4. **Grant Permissions**
   - Find your service account in the list
   - Click **"Grant access"**
   - Select **"Release apps"** permission
   - Choose release track: **Internal testing** (or Production if ready)
   - Click **"Invite user"**

---

### Step 3: Add JSON to GitHub Secrets

1. **Open the JSON file** you downloaded in Step 1
   - It looks like this:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "play-store-submitter@your-project.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }
   ```

2. **Copy entire JSON content**

3. **Add to GitHub Secrets**
   - Go to your GitHub repo
   - **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Value: Paste the **entire JSON content** (all of it, including braces)
   - Click **"Add secret"**

---

## ✅ Verification

### Test the Setup

1. **Run workflow manually:**
   - Go to GitHub → Actions
   - Select "Build and Submit Android to Play Store"
   - Click "Run workflow"
   - Select branch and run

2. **Check Play Console:**
   - Go to: **Production** → **Releases** (or **Internal testing**)
   - You should see a new release being created
   - Status will show "In review" or "Draft"

### Troubleshooting

**Error: "Service account not linked"**
- Verify service account email matches in Play Console
- Check permissions are granted

**Error: "Permission denied"**
- Ensure "Release apps" permission is granted
- Check release track matches in `eas.json`

**Error: "Invalid JSON"**
- Verify entire JSON is copied (including all braces)
- Check for extra spaces or line breaks

---

## 🔒 Security Best Practices

1. **Never commit the JSON file**
   - ✅ Already in `.gitignore`
   - ✅ Only stored in GitHub Secrets

2. **Rotate keys regularly**
   - Create new key every 90 days
   - Revoke old keys

3. **Limit permissions**
   - Only grant "Release apps" permission
   - Don't grant "Manage production releases" unless needed

---

## 📝 Configuration

### Release Track Options

In `eas.json`, you can change the track:

```json
{
  "submit": {
    "production-android": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"  // Options: internal, alpha, beta, production
      }
    }
  }
}
```

**Track Options:**
- `internal` - Internal testing track (recommended for auto-submissions)
- `alpha` - Alpha testing track
- `beta` - Beta testing track
- `production` - Production track (use with caution!)

---

## 🎯 Workflow Behavior

### Automatic Submission

When you:
1. Push to `main` branch
2. Create a release tag (e.g., `v1.0.0`)

The workflow will:
1. ✅ Build Android AAB
2. ✅ Wait for build to complete
3. ✅ Automatically submit to Play Store
4. ✅ Release appears in your selected track

### Manual Override

If you want to build without submitting:
- Use `--no-wait` flag in workflow
- Or comment out the submit step temporarily

---

## 📚 Additional Resources

- [Google Play Console API](https://developers.google.com/android-publisher)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/service-accounts)

---

## ✅ Checklist

- [ ] Google Cloud project created
- [ ] Google Play Android Developer API enabled
- [ ] Service account created
- [ ] JSON key downloaded
- [ ] Service account linked in Play Console
- [ ] "Release apps" permission granted
- [ ] JSON added to GitHub Secrets as `GOOGLE_SERVICE_ACCOUNT_JSON`
- [ ] Test workflow run successfully
- [ ] Release appears in Play Console

---

**Once set up, every new version will automatically be submitted to Play Store! 🚀**

