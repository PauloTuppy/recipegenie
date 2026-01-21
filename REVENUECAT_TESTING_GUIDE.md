# RevenueCat Testing Guide 🧪

## Quick Start Testing

### 1. **Verify API Key Configuration** ✅

The API key has been set in `.env`:
```bash
EXPO_PUBLIC_REVENUECAT_API_KEY=WRexmBQiVWOFljGnpspgH5HlusC2ChKSYV6QdNu-
```

**To verify:**
- The app will log initialization status on launch
- Look for: `✅ RevenueCat initialized successfully`

---

## 2. **Test Free Tier (2 Parses/Week)**

### Step-by-Step:

**A. Initial State**
1. Launch the app
2. Navigate to Home screen
3. Look for usage indicator: **"0 / 2 free parses this week"**
4. Progress bar should be empty (no fill)

**B. First Parse**
1. Paste a YouTube URL (e.g., any cooking video)
2. Tap "Parse Recipe & Extract"
3. Wait for AI parsing to complete
4. Check usage indicator: **"1 / 2 free parses this week"**
5. Progress bar should be 50% filled (burnt orange)

**C. Second Parse**
1. Paste another YouTube URL
2. Tap "Parse Recipe & Extract"
3. Wait for completion
4. Check usage indicator: **"2 / 2 free parses this week"**
5. Progress bar should be 100% filled
6. Should see **"Upgrade for unlimited"** link appear

**D. Third Parse (Blocked)**
1. Try to paste another URL
2. Tap "Parse Recipe & Extract"
3. Should see alert: **"Free Limit Reached"**
4. Alert message: _"You've used all 2 free parses this week. Upgrade to Premium for unlimited parsing!"_
5. Two buttons: [Cancel] [Upgrade to Premium]

**Expected Behavior:**
- ✅ Parse counter increments correctly
- ✅ Visual progress bar updates
- ✅ Alert blocks 3rd parse attempt
- ✅ "Upgrade to Premium" navigates to paywall

---

## 3. **Test Paywall**

### Step-by-Step:

**A. Open Paywall**
1. From alert, tap "Upgrade to Premium"
   OR
2. From home usage indicator, tap "Upgrade for unlimited"
   OR
3. Navigate manually to Profile tab → Tap premium badge

**B. Verify Offerings Load**
1. Wait for loading spinner: _"Loading subscription options..."_
2. Should see pricing cards with:
   - Product title (from RevenueCat)
   - Price (actual price from App Store/Play Store)
   - Description
   - Checkmark on selected package

**C. Verify Features Display**
1. Premium star badge at top
2. Four feature cards:
   - 🔄 Unlimited Recipe Parsing
   - 📅 AI Meal Planning
   - 🛒 Smart Grocery Lists
   - ⚡ Priority AI Processing

**D. UI Check**
- [ ] Burnt orange (#E67E22) color scheme
- [ ] Cream background (#F5F1E8)
- [ ] Professional shadows on cards
- [ ] 16px border radius
- [ ] Proper spacing and typography

**Expected Behavior:**
- ✅ Real offerings load from RevenueCat
- ✅ Actual prices display
- ✅ Professional UI matches brand
- ✅ Loading states are smooth

---

## 4. **Test Purchase Flow**

### Step-by-Step:

**A. Select Package**
1. Tap on a pricing card
2. Card should highlight with burnt orange border
3. Checkmark appears
4. Haptic feedback

**B. Initiate Purchase**
1. Tap "Subscribe Now" button
2. Button shows loading spinner
3. App Store/Play Store purchase sheet appears

**C. Complete Purchase (Sandbox)**
1. Use test account credentials
2. Complete sandbox purchase
3. Wait for success

**D. Verify Premium Status**
1. Should see alert: **"Welcome to Premium!"**
2. Tap "Continue"
3. Return to home screen
4. Usage indicator **should be hidden**
5. Premium badge appears in profile

**E. Test Unlimited Parsing**
1. Parse 3+ recipes
2. No alerts should appear
3. No limits enforced
4. Counter does NOT increment

**Expected Behavior:**
- ✅ Purchase flow completes
- ✅ Premium status updates
- ✅ Usage indicator disappears
- ✅ Unlimited parsing works

---

## 5. **Test Restore Purchases**

### Step-by-Step:

**A. Simulate Reinstall**
1. Have active subscription
2. Delete app data (or reinstall)
3. Launch app fresh

**B. Open Paywall**
1. App should show as "free tier"
2. Navigate to paywall

**C. Restore**
1. Tap "Restore Purchases" link at bottom
2. Loading spinner appears
3. Wait for RevenueCat to check

**D. Verify Restoration**
1. If subscription found:
   - Alert: **"Purchases Restored!"**
   - Premium status activated
2. If no subscription:
   - Alert: **"No Purchases Found"**

**Expected Behavior:**
- ✅ Previous purchases restore
- ✅ Premium status activated
- ✅ No double-charging

---

## 6. **Test Weekly Reset**

### Automatic Reset (7 Days)

**Natural Test:**
1. Use both free parses today
2. Wait 7 days
3. Open app
4. Counter should reset to 0/2

**Manual Test (Developer):**
```typescript
// In React Native Debugger or dev tools:
AsyncStorage.setItem('@recipegenie_last_reset_date', '2026-01-14');
// Then restart app
// Counter should auto-reset to 0/2
```

**Expected Behavior:**
- ✅ Counter resets after 7 days
- ✅ Date tracking works correctly
- ✅ Fresh 2 parses available

---

## 7. **Test Persistence**

### Cross-Session Persistence:

**A. Mid-Parse State**
1. Use 1 parse (counter: 1/2)
2. Close app completely
3. Reopen app
4. Check counter: Should still show **1/2**

**B. Limit State**
1. Use both parses (counter: 2/2)
2. Close app
3. Reopen app
4. Try to parse → Should still be blocked

**C. Premium State**
1. Purchase premium
2. Close app
3. Reopen app
4. Premium status should persist

**Expected Behavior:**
- ✅ Parse counter persists in AsyncStorage
- ✅ Premium status persists via RevenueCat
- ✅ No data loss on restart

---

## 8. **Visual Indicators**

### Home Screen Elements:

**Free User:**
```
┌─────────────────────────────────┐
│ Paste YouTube or TikTok link... │
│ [Parse Recipe & Extract]         │
│                                   │
│ ▓▓▓▓▓░░░░░ 1 / 2 free parses    │ ← Orange progress bar
│ this week                         │
└─────────────────────────────────┘
```

**At Limit:**
```
┌─────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓ 2 / 2 free parses    │ ← Full orange bar
│ this week                         │
│                                   │
│ [Upgrade for unlimited →]        │ ← Orange link
└─────────────────────────────────┘
```

**Premium User:**
```
┌─────────────────────────────────┐
│ Paste YouTube or TikTok link... │
│ [Parse Recipe & Extract]         │
│                                   │
│ (No usage indicator shown)       │ ← Completely hidden
└─────────────────────────────────┘
```

---

## 9. **Console Logs to Watch**

When testing, monitor console for these logs:

### Initialization:
```
🔄 Initializing subscription system...
✅ RevenueCat initialized successfully
🔑 Using API key: WRexmBQiVW...
💎 Premium status: Active / Inactive
📅 Last reset date: 2026-01-21
📊 Loaded parse count: 0/2
✅ Subscription system initialized successfully
```

### Parse Tracking:
```
📈 Parse count incremented: 1/2
⚠️ User has 1 parse remaining
📈 Parse count incremented: 2/2
⚠️ User has reached free tier limit!
```

### Premium:
```
✨ Premium access active
✨ Premium user - parse not counted
```

### Weekly Reset:
```
⏰ Days since last reset: 7
🔄 Weekly limit reached, resetting parse counter
```

---

## 10. **Error Scenarios**

### Test Error Handling:

**A. Network Issues**
1. Disable internet
2. Try to load paywall
3. Should show: _"No subscription options available"_
4. Subtitle: _"Please check your internet connection"_

**B. RevenueCat Down**
1. If RevenueCat API is down
2. Should gracefully default to free tier
3. Console: `⚠️ RevenueCat not initialized, defaulting to free tier`

**C. Invalid Parse**
1. Enter invalid URL
2. Try to parse
3. Should show: _"Invalid URL"_
4. Message: _"Please enter a valid YouTube or TikTok link."_

**Expected Behavior:**
- ✅ Graceful error handling
- ✅ User-friendly messages
- ✅ Fail-safe to free tier on errors

---

## ✅ Complete Testing Checklist

### Setup
- [ ] API key configured in .env
- [ ] RevenueCat dashboard has products
- [ ] "premium" entitlement exists
- [ ] Current offering configured

### Free Tier
- [ ] Counter starts at 0/2
- [ ] Counter increments to 1/2
- [ ] Counter increments to 2/2
- [ ] 3rd parse blocked with alert
- [ ] Progress bar updates correctly
- [ ] "Upgrade" link appears at limit

### Paywall
- [ ] Opens from multiple places
- [ ] Loads real offerings
- [ ] Shows actual prices
- [ ] Professional UI
- [ ] Package selection works
- [ ] Haptic feedback

### Purchase
- [ ] Purchase flow completes
- [ ] Premium status updates
- [ ] Usage indicator disappears
- [ ] Unlimited parsing works
- [ ] Success alert shows

### Restore
- [ ] Restore finds purchases
- [ ] Premium status restored
- [ ] Correct alerts shown

### Persistence
- [ ] Parse counter persists
- [ ] Premium status persists
- [ ] Data survives app restart
- [ ] Weekly reset works

### UI/UX
- [ ] Burnt orange theme
- [ ] Professional typography
- [ ] Smooth loading states
- [ ] Haptic feedback
- [ ] Clear error messages

---

## 🐛 Troubleshooting

### Issue: "RevenueCat not initialized"
**Solution:** Check API key in .env file

### Issue: "No offerings load"
**Solution:**
1. Check internet connection
2. Verify RevenueCat dashboard has products
3. Ensure "Current" offering exists

### Issue: "Parse counter not incrementing"
**Solution:** Check AsyncStorage permissions

### Issue: "Premium status not updating"
**Solution:**
1. Check entitlement name is "premium"
2. Verify purchase completed successfully
3. Try restore purchases

### Issue: "Weekly reset not working"
**Solution:** Check date comparison logic in SubscriptionContext

---

## 🎉 Success Criteria

Your RevenueCat integration is working if:

1. ✅ You can complete a sandbox purchase
2. ✅ Premium status updates correctly
3. ✅ Free tier is limited to 2 parses/week
4. ✅ Usage indicator shows accurate count
5. ✅ Paywall displays real pricing
6. ✅ Restore purchases works
7. ✅ UI matches Eitan Bernath aesthetic
8. ✅ All loading states are smooth
9. ✅ Error handling is graceful
10. ✅ Parse counter persists correctly

---

**Happy Testing!** 🧪✨

If everything works as described above, your RevenueCat integration is production-ready! 🚀
