# RevenueCat Setup Instructions

The Recipegenie app is integrated with RevenueCat for premium subscriptions ($3.99/month). Follow these steps to complete the setup:

## 1. Create RevenueCat Account

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create a free account
3. Create a new project called "Recipegenie"

## 2. Create Test Store App

1. In your project, go to **Apps**
2. Click **+ New**
3. Select **Test Store** (no App Store account needed for development)
4. Name it "Recipegenie Test"
5. Save the app

## 3. Get API Key

1. Go to **API Keys** in the sidebar
2. Find the **Public app-specific API keys** section
3. Copy the **Sandbox** key for your Test Store app
4. Add it to your `.env` file:
   ```
   EXPO_PUBLIC_REVENUECAT_API_KEY=your_sandbox_key_here
   ```

## 4. Create Product

1. Go to **Products** in the sidebar
2. Click **+ New**
3. Configure the product:
   - **Store Identifier**: `monthly_premium`
   - **Type**: Subscription
   - **Display Name**: Premium Monthly
   - **Title**: Premium Monthly
   - **Duration**: P1M (1 month)
4. Click **Save**
5. Go to the **Pricing** tab
6. Add pricing:
   - Currency: USD
   - Price: 3.99
7. Click **Save**

## 5. Create Entitlement

1. Go to **Entitlements** in the sidebar
2. Click **+ New**
3. Configure:
   - **Identifier**: `premium`
   - **Display Name**: Premium Access
4. Click **Save**
5. Click **Attach Products**
6. Select `monthly_premium`
7. Click **Save**

## 6. Create Offering

1. Go to **Offerings** in the sidebar
2. Click **+ New**
3. Configure:
   - **Identifier**: `default`
   - **Display Name**: Default Offering
4. Click **Save**
5. Set as **Current Offering** (toggle the switch)

## 7. Create Package

1. Open your `default` offering
2. Click **+ New Package**
3. Configure:
   - **Identifier**: `$rc_monthly`
   - **Display Name**: Monthly
4. Click **Save**
5. Click **Attach Products**
6. Select `monthly_premium`
7. Set **Eligibility**: All Users
8. Click **Save**

## 8. Test the Integration

1. Run your Expo app
2. Try parsing 2 recipes (free limit)
3. On the 3rd parse, you should see the paywall
4. Click "Subscribe Now" to test the purchase flow
5. In Test Store, purchases are automatically approved

## 9. Production Setup (When Ready)

When you're ready to publish:

1. Create a real iOS/Android app in RevenueCat
2. Connect it to App Store Connect / Google Play Console
3. Create the same product (`monthly_premium`) in App Store Connect / Google Play Console
4. Link the products in RevenueCat
5. Get the **Production** API key
6. Update your `.env` with the production key

## Features Implemented

✅ Premium subscription ($3.99/month)
✅ Free tier (2 recipe parses per week)
✅ Paywall modal
✅ Usage indicator on home screen
✅ Subscription status in profile
✅ Restore purchases functionality
✅ Unlimited parsing for premium users
✅ Cross-device subscription sync (when user IDs are implemented)

## Important Notes

- Test Store purchases are **free** and automatically approved
- Test Store requires the **display_name** field for products
- Use `$rc_monthly` naming convention for package identifiers
- The sandbox environment is automatically used during development
- RevenueCat handles all the complex subscription logic (renewals, cancellations, etc.)
