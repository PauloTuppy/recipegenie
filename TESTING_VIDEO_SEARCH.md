# Testing Video Search Feature - Quick Guide

## 🎯 How to Test the New Features

### 1. **Access Video Search**
**From Home Screen:**
- Look for "Search Videos" button in the top-right corner
- Tap to open Video Search screen

**Expected Result:**
- Clean search interface appears
- Search bar with placeholder text
- "Search" button below
- Empty state with video camera icon

### 2. **Search for Recipe Videos**
**Steps:**
1. Tap search input field
2. Type a query (e.g., "crispy chicken recipes")
3. Tap "Search" button or press Enter

**What Happens:**
- Loading spinner appears
- "Searching for recipe videos..." message
- "Powered by Newell AI" branding
- After 2-3 seconds, results appear

**Expected Results:**
- Grid of video cards (2 columns)
- Each card shows:
  - Video thumbnail with play icon
  - Duration badge (e.g., "10:23")
  - Video title
  - Channel name
  - View count and publish date
- Header shows "Found X videos for [query]"

### 3. **Select a Video to Parse**
**Steps:**
1. Tap any video card from results
2. Alert dialog appears

**Expected Dialog:**
```
Parse Recipe?
Would you like to parse the recipe from "[Video Title]"?

[Cancel] [Parse Recipe]
```

**After Tapping "Parse Recipe":**
- Navigate back to Home screen
- Video URL auto-populated (future enhancement)
- Or manual parsing flow triggers

### 4. **View Saved Searches**
**From Video Search Screen:**
- Tap bookmark icon in top-right

**Expected Result:**
- Navigate to "Saved Searches" screen
- See list of previous searches
- Each search card shows:
  - Search icon
  - Search query
  - Result count (e.g., "12 videos")
  - Date (e.g., "Today", "2 days ago")
  - Delete button (trash icon)
  - Expand/collapse chevron

### 5. **Expand Saved Search**
**Steps:**
1. Tap anywhere on a search card
2. Card expands to show video list

**Expected Result:**
- Divider line appears
- List of videos from that search
- Each video shows:
  - Thumbnail with play icon
  - Duration badge
  - Video title (2 lines max)
  - Channel name
  - View count and publish date
  - Forward chevron

### 6. **Parse from Saved Search**
**Steps:**
1. Expand a saved search
2. Tap any video in the list
3. Same parse dialog appears

**Expected Flow:**
- Parse dialog → Parse Recipe → Navigate to Home
- Recipe appears in Library

### 7. **Delete Saved Search**
**Steps:**
1. Tap trash icon on any search card
2. Confirmation alert appears

**Expected Alert:**
```
Delete Search?
Remove "[Search Query]" from saved searches?

[Cancel] [Delete]
```

**After Confirming:**
- Search card disappears with animation
- Success haptic feedback
- Firebase updated

## 🔍 What to Verify

### ✅ UI/UX Checks
- [ ] All buttons have haptic feedback
- [ ] Loading states show spinners
- [ ] Empty states are helpful
- [ ] Cards have proper shadows
- [ ] Colors match app theme (burnt orange #E67E22)
- [ ] Text is readable with proper contrast
- [ ] All screens have back buttons

### ✅ Functionality Checks
- [ ] Search returns results
- [ ] Results are saved automatically
- [ ] Saved searches persist after app restart
- [ ] Videos can be selected for parsing
- [ ] Delete removes search from Firebase
- [ ] Navigation works correctly
- [ ] No crashes or errors

### ✅ Data Persistence Checks
1. Search for "pasta recipes"
2. Close app completely
3. Reopen app
4. Navigate to Saved Searches
5. Verify "pasta recipes" search is still there

## 🐛 Common Issues & Solutions

### Issue: "No videos found"
**Solution:** This is expected if Newell AI generates an empty result. Try different search terms.

### Issue: Search button disabled
**Solution:** Enter text in search field first. Button only enables with text.

### Issue: Saved searches empty
**Solution:** You need to search first. Each search auto-saves to Firebase.

### Issue: Firebase not saving
**Check:**
- Firebase credentials in .env file
- Console for Firebase errors
- Network connection

## 📱 Screen Flow Diagram

```
Home Screen
    ↓ (Tap "Search Videos")
Video Search Screen
    ↓ (Enter query & search)
Results Grid (12 videos)
    ↓ (Tap video)
Parse Dialog
    ↓ (Tap "Parse Recipe")
Back to Home → Parse initiated

OR

Video Search Screen
    ↓ (Tap bookmark icon)
Saved Searches Screen
    ↓ (Tap search card)
Expanded Video List
    ↓ (Tap video)
Parse Dialog → Parse Recipe
```

## 🎨 UI Elements to Notice

### Video Cards
- **Thumbnail**: Orange gradient background with white play icon
- **Duration Badge**: Black transparent badge in bottom-right
- **Title**: Bold, 2-line truncation
- **Channel**: Gray text, smaller font
- **Metadata**: Light gray, separated by dots

### Search Cards (Saved Searches)
- **Icon**: Orange circle with search icon
- **Header**: Expandable/collapsible
- **Delete**: Red trash icon
- **Divider**: Light gray line when expanded

### Loading States
- **Spinner**: Orange primary color
- **Text**: "Searching for recipe videos..."
- **Subtext**: "Powered by Newell AI"

### Empty States
- **Icon**: Large gray icon (64px)
- **Title**: Bold gray text
- **Description**: Helpful guidance
- **CTA Button**: Orange with shadow (when applicable)

## 🚀 Advanced Testing

### Test Firebase Integration
```javascript
// Check Firebase console after searches
users/
  demo_user/
    videoSearches/
      search-[timestamp]/
        - searchQuery: "pasta recipes"
        - results: [...]
        - createdAt: 1234567890
        - resultCount: 12
```

### Test Edge Cases
1. **Very Long Search Query**: Type 100+ characters
2. **Special Characters**: Search "café latte ☕"
3. **Empty Results**: (Should show empty state)
4. **Rapid Searches**: Search multiple times quickly
5. **Network Issues**: Disable internet, verify error handling

## ✅ Success Criteria

Your implementation is working if:
1. ✅ You can search for videos
2. ✅ Results appear in a professional grid
3. ✅ Searches are automatically saved
4. ✅ Saved searches persist after restart
5. ✅ Videos can be selected for parsing
6. ✅ UI matches Eitan Bernath aesthetic
7. ✅ All loading states are smooth
8. ✅ Haptic feedback works throughout
9. ✅ No TypeScript or ESLint errors
10. ✅ Firebase data structure is correct

## 🎉 What's Next?

After verifying these features work:
1. Test parsing a recipe from search results
2. Verify recipe appears in Library with steps
3. Test grocery list generation from parsed recipe
4. Explore meal planning with new recipes

Enjoy the new video search feature! 🎬🍳
