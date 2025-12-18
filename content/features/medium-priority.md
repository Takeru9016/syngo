# 📈 Medium Priority Features

Good value features with moderate implementation effort.

**Total Features**: 10  
**Effort Level**: Medium  
**Expected Timeline**: 2-4 weeks per feature

---

## 1. Shared Photo Album

**Category**: Communication  
**Effort Level**: Medium

**What It Is**  
A private photo gallery where both of you can add, view, and organize pictures together.

**What You'll Experience**

- Upload photos from your camera or gallery
- Create albums for different occasions (vacations, date nights, etc.)
- See all photos in a beautiful grid layout
- Add captions and dates to photos
- Both partners can add or delete photos
- Download photos to your device anytime

**Why Medium Priority**  
Requires cloud storage management, image optimization, and real-time sync. High user value for memories.

**Technical Implementation**:

- Create Firestore collection `pairs/{pairId}/photos`
- Store images in Firebase Storage under `pairs/{pairId}/gallery/`
- Implement photo grid view using `react-native-fast-image` for performance
- Add albums/folders organization
- Support image upload from camera and gallery using `expo-image-picker`
- Optional: Background upload queue for reliability

---

## 2. Quick Emoji Reactions

**Category**: Communication  
**Effort Level**: Easy-Medium

**What It Is**  
React to notifications with emojis without opening the app.

**What You'll Experience**

- When you get a notification, see emoji buttons (❤️ 😍 👍 😂 🥰)
- Tap an emoji to send a quick reaction
- Your partner sees your reaction on their notification
- View reaction history in the app

**Why Medium Priority**  
Enhances notification experience with minimal effort. Quick engagement boost.

**Technical Implementation**:

- Add custom notification actions using `expo-notifications` categories
- Define 3-5 quick reaction buttons
- Store reactions in Firestore
- Show reaction badges on notification history items
- Handle notification action response in `_layout.tsx`

---

## 3. Shared Shopping Lists

**Category**: Tasks & Organization  
**Effort Level**: Medium

**What It Is**  
Create grocery and shopping lists that both of you can edit in real-time.

**What You'll Experience**

- Create multiple lists (groceries, Target, hardware store, etc.)
- Add items with quantities and notes
- Check off items while shopping
- See your partner's changes instantly
- Organize items by category (produce, dairy, etc.)

**Why Medium Priority**  
Practical daily use case. Similar to existing todo system but with categories.

**Technical Implementation**:

- Create new Firestore collection `pairs/{pairId}/shoppingLists`
- Similar structure to todos but with categories
- Add real-time listeners for live updates while shopping
- Checkbox strikethrough animation when items are checked
- Optional: Barcode scanner for quick item add

---

## 4. Daily Conversation Questions

**Category**: Fun & Engagement  
**Effort Level**: Medium

**What It Is**  
Get a new question every day to spark meaningful conversations.

**What You'll Experience**

- See a new question each day on your home screen
- Questions range from fun to deep and meaningful
- Both partners can answer privately
- Reveal answers to each other when ready
- Save favorite questions
- Browse past questions and answers

**Why Medium Priority**  
Requires question database curation and answer reveal mechanism. High engagement potential.

**Technical Implementation**:

- Create curated database of 365+ questions
- Daily schedule via Cloud Functions to push new question
- UI: Special card on home screen showing today's question
- Both partners can answer, then reveal answers together
- Track question history and favorites

---

## 5. Custom Notification Sounds

**Category**: Customization  
**Effort Level**: Medium

**What It Is**  
Choose different sounds for different types of notifications.

**What You'll Experience**

- Pick sounds for reminders, nudges, messages, etc.
- Preview sounds before selecting
- Choose from a library of pleasant tones
- Set different sounds for day and night

**Why Medium Priority**  
Personalization feature that enhances user experience. Platform-specific implementation needed.

**Technical Implementation**:

- Bundle collection of notification sounds in app
- Store user preference per category in `notificationPreferences`
- iOS: Use different sound files in notification payload
- Android: Create multiple notification channels with different sounds
- UI: Sound picker in Settings with preview playback

---

## 6. Recurring Reminders

**Category**: Tasks & Organization  
**Effort Level**: Medium

**What It Is**  
Set reminders that repeat automatically (daily, weekly, monthly).

**What You'll Experience**

- Create a reminder once, set it to repeat
- Choose: daily, weekly, monthly, or yearly
- Pick specific days (like "every Monday and Wednesday")
- Get notifications at the scheduled times
- Mark as complete, and it automatically creates the next one

**Why Medium Priority**  
Powerful automation feature. Extends existing todo system with recurrence logic.

**Technical Implementation**:

- Extend current `Todo` type with recurrence fields
- Update `scheduleLocalNotification` to use CALENDAR trigger type
- Create Cloud Function to regenerate next occurrence after completion
- UI: Add recurrence picker in TodoModal

---

## 7. Expense Tracking

**Category**: Utility  
**Effort Level**: Medium-Complex

**What It Is**  
Track shared expenses and see who owes whom.

**What You'll Experience**

- Add expenses with amount, category, and who paid
- Split 50/50 or custom percentages
- See running balance (who owes what)
- View monthly spending summaries
- Get charts showing spending by category

**Why Medium Priority**  
Practical feature for couples living together. Requires calculation logic and visualization.

**Technical Implementation**:

- Create `pairs/{pairId}/expenses` collection
- Fields: amount, category, paidBy, splitRatio, date, notes
- Running balance calculation
- Monthly summary and charts
- Settlement reminders
- Export to CSV for records

---

## 8. Shared Notes

**Category**: Utility  
**Effort Level**: Medium

**What It Is**  
A private space to write notes, ideas, and memories together.

**What You'll Experience**

- Create notes with rich text formatting
- Add photos to notes
- Organize notes into folders
- Tag notes for easy finding
- Search through all notes

**Why Medium Priority**  
Versatile feature for many use cases. Rich text editor integration required.

**Technical Implementation**:

- Rich text editor using `react-native-pell-rich-editor`
- Store in `pairs/{pairId}/notes`
- Support images embedded in notes
- Folder/tag organization
- Version history for important notes

---

## 9. Meal Planning

**Category**: Tasks & Organization  
**Effort Level**: Medium-Complex

**What It Is**  
Plan your weekly meals together and generate shopping lists automatically.

**What You'll Experience**

- See a weekly calendar view for breakfast, lunch, and dinner
- Add meals by typing or choosing from favorites
- Generate a shopping list from your meal plan
- Share cooking duties by assigning meals

**Why Medium Priority**  
Solves common couple problem. Integrates with shopping lists and recipes.

**Technical Implementation**:

- Create `pairs/{pairId}/mealPlan` collection with weekly structure
- Store meals with ingredient lists
- Generate shopping list by aggregating ingredients
- Calendar view component for meal planning
- Integration with recipe collection feature

---

## 10. Achievements & Badges

**Category**: Gamification  
**Effort Level**: Medium

**What It Is**  
Earn rewards for using the app and being a great partner.

**What You'll Experience**

- Unlock badges for milestones (100 days together, 50 reminders completed, etc.)
- See achievement progress
- Celebrate achievements together
- Collect rare badges for special accomplishments

**Why Medium Priority**  
Gamification increases engagement. Requires activity tracking across features.

**Technical Implementation**:

- Define achievement criteria
- Track user activities in background
- Check criteria on relevant actions
- Store unlocked badges in user profile
- Badge collection UI with progress bars
- Celebration animation when unlocking

---

## 📊 Implementation Strategy

### Recommended Phases

**Phase 1 - Core Enhancements** (Weeks 1-4):

1. Quick Emoji Reactions
2. Shared Shopping Lists
3. Recurring Reminders

**Phase 2 - Engagement** (Weeks 5-8): 4. Daily Questions 5. Shared Photo Album 6. Custom Notification Sounds

**Phase 3 - Advanced Utility** (Weeks 9-12): 7. Shared Notes 8. Meal Planning 9. Expense Tracking 10. Achievements & Badges

### Success Metrics

- User engagement increase
- Feature adoption rate
- User retention improvement
- Positive feedback and ratings

---

[← Back to Overview](README.md)
