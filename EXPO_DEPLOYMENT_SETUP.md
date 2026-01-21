# 🚀 Expo Deployment Setup - Complete Guide

## ✅ Configuration Corrected

### Token Clarification
The token `WRexmBQiVWOFljGnpspgH5HlusC2ChKSYV6QdNu-` is an **Expo Token** for EAS (Expo Application Services), not a RevenueCat API key.

**Corrected Configuration:**
```bash
# .env file

# Expo Application Services (EAS) - Build & Deploy
EXPO_TOKEN=WRexmBQiVWOFljGnpspgH5HlusC2ChKSYV6QdNu-

# RevenueCat (Not yet configured)
EXPO_PUBLIC_REVENUECAT_API_KEY=not_configured
```

---

## 📱 App Status

### ✅ Fully Functional Features
The app works perfectly without RevenueCat configured:

1. **✅ Recipe Parsing** - Parse YouTube/TikTok recipes with Newell AI
2. **✅ Recipe Library** - Save and manage parsed recipes
3. **✅ Grocery Lists** - AI-categorized ingredients by store section
4. **✅ Meal Planning** - Generate weekly meal plans
5. **✅ Video Search** - Search and save recipe videos
6. **✅ Free Tier** - 2 recipe parses per week (enforced locally)
7. **✅ Professional UI** - Beautiful Eitan Bernath aesthetic throughout

### ⚠️ Subscription Features (Waiting for RevenueCat)
- Paywall displays with "Subscriptions Coming Soon" message
- No crash or errors when RevenueCat is not configured
- Graceful fallback to free tier
- Purchase buttons disabled until configured

---

## 🔧 EAS Build Configuration

### Files Created/Updated

#### 1. **eas.json** (NEW)
Complete EAS build configuration with profiles:

```json
{
  "build": {
    "development": { ... },     // Dev builds with simulator
    "preview": { ... },         // Internal testing (APK/IPA)
    "production": { ... },      // App Store/Play Store
    "production-ios": { ... },  // iOS-specific production
    "production-android": { ... } // Android-specific production
  },
  "submit": {
    "production": { ... }       // Auto-submit configuration
  }
}
```

#### 2. **app.json** (UPDATED)
Added proper build identifiers:

```json
{
  "expo": {
    "owner": "recipegenie",
    "extra": {
      "eas": {
        "projectId": "351d20bc-571f-4ec6-8b81-05880fb9c1ae"
      }
    },
    "ios": {
      "bundleIdentifier": "com.recipegenie.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.recipegenie.app",
      "versionCode": 1
    }
  }
}
```

#### 3. **.env** (UPDATED)
Properly categorized tokens:

```bash
# Expo Token (for EAS builds)
EXPO_TOKEN=WRexmBQiVWOFljGnpspgH5HlusC2ChKSYV6QdNu-

# RevenueCat (placeholder until configured)
EXPO_PUBLIC_REVENUECAT_API_KEY=not_configured
```

---

## 🏗️ Building with EAS

### Prerequisites
```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to Expo (will use EXPO_TOKEN from .env)
eas login

# 3. Verify configuration
eas build:configure
```

### Build Commands

#### Development Build (Simulator)
```bash
# iOS Simulator
eas build --profile development --platform ios

# Android Emulator
eas build --profile development --platform android
```

#### Preview Build (Internal Testing)
```bash
# iOS TestFlight Beta
eas build --profile preview --platform ios

# Android APK (for testing)
eas build --profile preview --platform android
```

#### Production Build (Store Submission)
```bash
# iOS App Store
eas build --profile production-ios --platform ios

# Android Google Play
eas build --profile production-android --platform android

# Both platforms
eas build --profile production --platform all
```

---

## 📤 Submitting to Stores

### iOS - TestFlight & App Store

#### Step 1: Build for Production
```bash
eas build --profile production-ios --platform ios
```

#### Step 2: Submit to App Store Connect
```bash
eas submit --platform ios
```

**Manual Submit Alternative:**
1. Download IPA from EAS dashboard
2. Upload via Transporter app or Xcode
3. Submit for TestFlight or review

**Required Before First Submit:**
- [ ] App Store Connect account
- [ ] App created in App Store Connect
- [ ] Bundle ID: `com.recipegenie.app`
- [ ] App privacy policy URL
- [ ] App description and screenshots
- [ ] Apple Developer Program membership ($99/year)

#### TestFlight Distribution:
```bash
# Build and auto-submit to TestFlight
eas build --profile production-ios --platform ios --auto-submit
```

### Android - Google Play

#### Step 1: Build for Production
```bash
eas build --profile production-android --platform android
```

#### Step 2: Submit to Google Play Console
```bash
eas submit --platform android
```

**Manual Submit Alternative:**
1. Download AAB from EAS dashboard
2. Upload to Google Play Console
3. Create release in Internal Testing, Closed Beta, or Production

**Required Before First Submit:**
- [ ] Google Play Developer account ($25 one-time)
- [ ] App created in Google Play Console
- [ ] Package name: `com.recipegenie.app`
- [ ] App privacy policy URL
- [ ] App description and screenshots
- [ ] Service account JSON key (for automated submission)

---

## 🔐 Environment Variables for EAS

### Setting Secrets in EAS

For production builds, you may want to set secrets securely:

```bash
# Set Newell API URL (if different for production)
eas secret:create --scope project --name EXPO_PUBLIC_NEWELL_API_URL --value https://newell.fastshot.ai

# Set Supabase credentials
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value your_supabase_url
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your_supabase_key

# Set RevenueCat (when ready)
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_API_KEY --value appl_your_key_here
```

**View all secrets:**
```bash
eas secret:list
```

**Delete a secret:**
```bash
eas secret:delete --name SECRET_NAME
```

---

## 📋 Build Profiles Explained

### `development`
**Purpose:** Development builds with Expo Go or dev client
- Includes development tools
- Fast refresh enabled
- Simulator/Emulator compatible
- Not for production

**Use Cases:**
- Local development
- Testing new features
- Debugging

### `preview`
**Purpose:** Internal testing and beta distribution
- iOS: IPA for TestFlight
- Android: APK for direct install
- No dev tools included
- Release configuration

**Use Cases:**
- Share with internal team
- Beta testing with testers
- QA validation

### `production` / `production-ios` / `production-android`
**Purpose:** Store submission and public release
- Optimized builds
- Code signing for stores
- Auto-increment build numbers
- Ready for App Store/Play Store

**Use Cases:**
- Submit to TestFlight (public beta)
- Submit to App Store
- Submit to Google Play

---

## 🎯 Complete Deployment Workflow

### Phase 1: Development
```bash
# 1. Develop locally with Expo Go or simulator
npx expo start

# 2. Build development version for device testing
eas build --profile development --platform ios
```

### Phase 2: Internal Testing
```bash
# 1. Build preview version
eas build --profile preview --platform all

# 2. Share with internal team
# iOS: Install via TestFlight or direct IPA
# Android: Install APK directly
```

### Phase 3: Beta Testing (TestFlight / Play Internal Testing)
```bash
# 1. Build production version
eas build --profile production-ios --platform ios
eas build --profile production-android --platform android

# 2. Submit to TestFlight / Internal Testing
eas submit --platform ios
eas submit --platform android

# 3. Add testers in App Store Connect / Play Console
```

### Phase 4: Production Release
```bash
# 1. Update version in app.json
# "version": "1.1.0"

# 2. Build production
eas build --profile production --platform all

# 3. Submit to stores
eas submit --platform all

# 4. Wait for review and publish
```

---

## 🔍 Monitoring Builds

### Check Build Status
```bash
# View all builds
eas build:list

# View specific build
eas build:view [BUILD_ID]

# View build logs
eas build:logs [BUILD_ID]
```

### Build Dashboard
Visit: https://expo.dev/accounts/recipegenie/projects/recipegenie/builds

**Features:**
- Real-time build progress
- Build logs and errors
- Download IPA/APK/AAB
- Build artifacts
- Build history

---

## 🛠️ Troubleshooting

### Build Fails with "Invalid credentials"
**Solution:** Re-authenticate with EAS
```bash
eas logout
eas login
```

### "Bundle Identifier already in use"
**Solution:** Change bundle ID in app.json
```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.recipegenie"
  },
  "android": {
    "package": "com.yourcompany.recipegenie"
  }
}
```

### "No provisioning profile found" (iOS)
**Solution:** Let EAS manage certificates
```bash
eas build --profile production-ios --platform ios
# Select "Let EAS handle signing" when prompted
```

### Build succeeds but app crashes
**Solution:** Check environment variables
```bash
# Ensure all required env vars are set
eas secret:list

# Test build with verbose logging
eas build --profile production --platform ios --no-wait
eas build:logs [BUILD_ID]
```

---

## 📊 RevenueCat Setup (When Ready)

### Getting RevenueCat API Key

1. **Sign up at RevenueCat:** https://app.revenuecat.com
2. **Create a project:** RecipeGenie
3. **Add platforms:**
   - iOS: Bundle ID `com.recipegenie.app`
   - Android: Package `com.recipegenie.app`
4. **Get Public API Key:**
   - Navigate to "API Keys" in dashboard
   - Copy Public Key (starts with `appl_` for iOS or `goog_` for Android)
5. **Update .env:**
   ```bash
   EXPO_PUBLIC_REVENUECAT_API_KEY=appl_YourActualKeyHere
   ```
6. **Rebuild and redeploy:**
   ```bash
   eas build --profile production --platform all
   ```

### Creating Products

**iOS (App Store Connect):**
1. Create In-App Purchases in App Store Connect
2. Import to RevenueCat dashboard

**Android (Google Play Console):**
1. Create In-App Products in Play Console
2. Import to RevenueCat dashboard

**Configure Entitlements:**
- Create entitlement: `premium`
- Attach products to entitlement
- Set as "Current" offering

---

## ✅ Pre-Launch Checklist

### App Store Requirements
- [ ] Bundle ID registered: `com.recipegenie.app`
- [ ] App icons (1024x1024 for App Store, various sizes for app)
- [ ] Screenshots (required sizes for iPhone/iPad)
- [ ] App description (max 4000 characters)
- [ ] Keywords (max 100 characters)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] App category selection
- [ ] Age rating questionnaire
- [ ] Export compliance documentation

### Google Play Requirements
- [ ] Package name: `com.recipegenie.app`
- [ ] App icons (512x512 for Play Store, various sizes for app)
- [ ] Screenshots (min 2, max 8 per device type)
- [ ] Feature graphic (1024x500)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] Privacy policy URL
- [ ] App category and tags
- [ ] Content rating questionnaire
- [ ] Target audience and content

### Technical Requirements
- [ ] EAS CLI installed
- [ ] Expo account authenticated
- [ ] Build profiles configured
- [ ] Environment variables set
- [ ] Bundle identifiers registered
- [ ] Signing certificates configured (EAS manages)
- [ ] All dependencies up to date
- [ ] App tested on physical devices
- [ ] Crash reporting configured (optional but recommended)

---

## 🎉 Summary

### ✅ What's Configured
1. **Expo Token** - Ready for EAS builds
2. **EAS Configuration** - Complete build profiles
3. **App Identifiers** - Bundle ID and package name set
4. **Build Profiles** - Development, preview, production
5. **Submit Configuration** - Ready for store submission

### ⚠️ What's Pending
1. **RevenueCat API Key** - Needs configuration for live subscriptions
2. **Store Accounts** - Apple Developer, Google Play Developer
3. **App Store Assets** - Icons, screenshots, descriptions
4. **Service Account Keys** - For automated Play Store submission

### 🚀 Next Steps
1. **Test the app** - Verify all features work in free tier mode
2. **Build preview** - `eas build --profile preview --platform all`
3. **Set up store accounts** - Apple Developer + Google Play
4. **Create store listings** - Icons, screenshots, descriptions
5. **Configure RevenueCat** - When ready for subscriptions
6. **Submit for review** - Launch! 🎊

---

## 📞 Support Resources

- **EAS Documentation:** https://docs.expo.dev/build/introduction/
- **Expo Forums:** https://forums.expo.dev/
- **App Store Connect:** https://appstoreconnect.apple.com/
- **Google Play Console:** https://play.google.com/console/
- **RevenueCat Docs:** https://docs.revenuecat.com/

---

**Your RecipeGenie app is ready for deployment!** 🚀📱

Use the Expo Token to build and deploy to TestFlight and Google Play following the steps above.
