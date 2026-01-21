# Recipegenie - Testing Checklist

## ✅ Pre-Integration Testing (Without RevenueCat Key)

### 1. App Launches Successfully
- [ ] App opens without crashes
- [ ] Tab navigation works (Home, Library, Planner, Profile)
- [ ] Colors match design (#E67E22, #F5F1E8, #A4AC86)
- [ ] No console errors (Firebase warnings are OK)

### 2. Free Tier Enforcement
- [ ] Home screen shows "0 / 2 free parses this week"
- [ ] First parse works (paste any URL, click Parse)
- [ ] Counter updates to "1 / 2 free parses this week"
- [ ] Second parse works
- [ ] Counter updates to "2 / 2 free parses this week"
- [ ] Third parse shows paywall alert
- [ ] Alert has "Upgrade to Premium" button

### 3. Paywall Modal (Without RevenueCat)
- [ ] Paywall opens when clicking "Upgrade to Premium"
- [ ] Shows "No subscription options available" message
- [ ] Close button works
- [ ] Returns to previous screen

### 4. Recipe Parsing (Newell AI)
- [ ] Paste YouTube URL → Loading states show
- [ ] "Scanning video ingredients..."
- [ ] "Extracting video content..."
- [ ] "Analyzing recipe with AI..."
- [ ] Recipe detail screen appears
- [ ] Ingredients list populated
- [ ] Servings and cook time shown

### 5. UI/UX Polish
- [ ] Haptic feedback on button taps
- [ ] Smooth animations
- [ ] Loading indicators work
- [ ] Safe area insets respected (no overlap with notch)
- [ ] Professional shadows and rounded corners

---

## 🔑 Post-Integration Testing (With RevenueCat Key)

### 6. RevenueCat Initialization
- [ ] Check console: "RevenueCat initialized successfully"
- [ ] No initialization errors in console
- [ ] App doesn't crash on launch

### 7. Subscription Offerings Load
- [ ] Open paywall
- [ ] Subscription packages appear
- [ ] Shows "Premium Monthly - $3.99/month" (or your pricing)
- [ ] Package is selectable (highlighted when tapped)

### 8. Purchase Flow (Test Store)
- [ ] Select monthly package
- [ ] Click "Subscribe Now"
- [ ] Purchase processes (spinner shows)
- [ ] Success alert appears
- [ ] Modal closes automatically
- [ ] Returns to Home screen

### 9. Premium Status Activated
- [ ] Home screen: Usage indicator disappears
- [ ] Profile screen: Shows "Premium Member" badge
- [ ] Parse limit removed (can parse unlimited)
- [ ] Check console: "Premium status: true"

### 10. Restore Purchases
- [ ] Close app completely
- [ ] Reopen app
- [ ] Go to Profile
- [ ] Tap "Manage Subscription"
- [ ] Select "Restore Purchases"
- [ ] Success alert shows
- [ ] Premium status remains active

### 11. Cross-Device Sync (Optional)
- [ ] Subscribe on Device A
- [ ] Install app on Device B (same Apple ID/Google account)
- [ ] Open app on Device B
- [ ] Restore purchases
- [ ] Premium status syncs

---

## 🎨 Visual Verification

### 12. Design Consistency
- [ ] **Colors Match**: Warm Burnt Orange (#E67E22) for primary actions
- [ ] **Colors Match**: Cream (#F5F1E8) for backgrounds
- [ ] **Colors Match**: Sage Green (#A4AC86) for accents
- [ ] **Typography**: Bold headers, readable body text
- [ ] **Spacing**: Consistent padding and margins
- [ ] **Icons**: Ionicons match design aesthetic

### 13. Screen-Specific Checks

**Home Screen**
- [ ] Recipegenie logo with chef hat icon
- [ ] URL input with clipboard icon
- [ ] "Parse Recipe & Extract" button (orange)
- [ ] Usage indicator (for free users)
- [ ] Recent recipes horizontal scroll
- [ ] Card shadows and rounded corners

**Recipe Detail**
- [ ] Full-width header image
- [ ] Back button (top-left)
- [ ] Favorite button (top-right)
- [ ] Recipe title and metadata
- [ ] Interactive ingredients list with checkboxes
- [ ] Edit button per ingredient
- [ ] "Add to Grocery List" button (orange)

**Grocery List**
- [ ] Categorized by sections (Produce, Dairy, Pantry, etc.)
- [ ] Sage green category headers
- [ ] Checkboxes with haptic feedback
- [ ] Quantity +/- controls
- [ ] Delete button (trash icon)
- [ ] "Clear Checked Items" footer button
- [ ] Share button in header

**Meal Planner**
- [ ] Week selector (Mon-Sun)
- [ ] Selected day highlighted in orange
- [ ] 4 meal slots: Breakfast, Lunch, Dinner, Snack
- [ ] Swap buttons for filled slots
- [ ] "Generate Grocery List for Week" button
- [ ] Premium badge at top

**Profile**
- [ ] Subscription status card
- [ ] Progress bar (free users)
- [ ] "Upgrade to Premium" button (free users)
- [ ] "Manage Subscription" button (premium users)
- [ ] Settings list (Notifications, Dietary, Language)
- [ ] Version info at bottom

**Paywall**
- [ ] Close button (top-right)
- [ ] Star icon badge
- [ ] "Upgrade to Premium" title
- [ ] 4 feature items with icons
- [ ] Subscription package cards
- [ ] Selected package highlighted
- [ ] "Subscribe Now" button (orange)
- [ ] "Restore Purchases" link
- [ ] Terms text at bottom

---

## 🐛 Error Scenarios

### 14. Network Errors
- [ ] Turn off internet
- [ ] Try to parse recipe
- [ ] Error alert shows
- [ ] Retry works when internet restored

### 15. Invalid Input
- [ ] Paste non-URL text
- [ ] Click "Parse Recipe & Extract"
- [ ] "Invalid URL" alert shows

### 16. Purchase Cancellation
- [ ] Start purchase flow
- [ ] Cancel before completing (if possible in Test Store)
- [ ] App returns to paywall gracefully
- [ ] No crash or stuck states

---

## 📊 Performance Checks

### 17. App Performance
- [ ] Smooth 60fps scrolling
- [ ] No frame drops during animations
- [ ] Parse button disables during loading
- [ ] Images load efficiently
- [ ] No memory leaks (use dev tools)

### 18. State Management
- [ ] Subscription state persists across tab switches
- [ ] Parse count accurate across sessions (with Firebase)
- [ ] Recent recipes update correctly
- [ ] Favorites sync properly

---

## 🚀 Production Readiness

### 19. Final Checks Before Launch
- [ ] Replace Test Store with real products
- [ ] Switch to production RevenueCat key
- [ ] Enable Firebase Authentication
- [ ] Update privacy policy links
- [ ] Test on multiple device sizes
- [ ] Test on iOS and Android
- [ ] Submit for App Store/Play Store review

---

## 📝 Notes

Use this space to track issues found during testing:

```
Issue 1: [Description]
- Steps to reproduce:
- Expected behavior:
- Actual behavior:

Issue 2: [Description]
- ...
```

---

## ✨ Success Criteria

The app is ready for production when:
- ✅ All checklist items pass
- ✅ No critical bugs found
- ✅ Subscription flow works end-to-end
- ✅ UI matches design specifications
- ✅ Performance is smooth and responsive
- ✅ Error handling is graceful

**Last Tested**: [Date]
**Tested By**: [Name]
**Device**: [iPhone/Android model]
**OS Version**: [iOS/Android version]
**Build**: [Version number]
