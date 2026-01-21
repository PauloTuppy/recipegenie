# Firebase Realtime Database Setup

The Recipegenie app uses Firebase Realtime Database for data persistence. Follow these steps to set it up:

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Name it "Recipegenie"
4. Follow the setup wizard
5. Once created, click on your project

## 2. Create Realtime Database

1. In the Firebase Console, go to **Build** → **Realtime Database**
2. Click **Create Database**
3. Choose a location (preferably close to your users)
4. Start in **Test mode** for development (or Production mode with rules)
5. Click **Enable**

## 3. Set Database Rules (Security)

For development, you can use these test rules:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "true",
        ".write": "true"
      }
    }
  }
}
```

For production, use proper authentication:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

## 4. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click the **Web** icon (</>)
4. Register your app with a nickname (e.g., "Recipegenie Web")
5. Copy the `firebaseConfig` object

## 5. Add to Environment Variables

Add these to your `.env` file (or ask the user to update them via the interface):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 6. Initialize Firebase in App

Firebase is automatically initialized when the app starts. If environment variables are not set, the app will work without persistence (data will be lost on app restart).

## Data Structure

The app stores data in this structure:

```
users/
  {userId}/
    recipes/
      {recipeId}/
        - title
        - ingredients[]
        - servings
        - cookTime
        - isFavorite
        - etc.
    groceryList/
      - Array of grocery items
    mealPlans/
      {date}/
        - date
        - meals (breakfast, lunch, dinner, snack)
    preferences/
      - notificationsEnabled
      - parsesUsed
      - parsesResetDate
```

## Features with Firebase

✅ Persistent recipe storage
✅ Cross-device sync (when authenticated)
✅ Real-time updates
✅ Grocery list persistence
✅ Meal plan storage
✅ User preferences sync

## Without Firebase

If Firebase is not configured, the app will still work but:
- Data is stored in memory only
- Data is lost when app restarts
- No cross-device sync
- No real-time updates

## Important Notes

- Firebase Realtime Database has a **free tier** with 1GB storage and 10GB/month transfer
- For production, enable **Authentication** and update security rules
- The current implementation uses a demo user ID (`demo_user`)
- In production, integrate Firebase Authentication to get real user IDs
- Consider adding offline persistence with Firebase's offline capabilities
