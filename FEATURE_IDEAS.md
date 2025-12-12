# Syngo Feature Ideas - Planning Document

A comprehensive list of potential features for the Syngo couples app, with implementation notes and technical approaches.

---

## 🗣️ Communication & Connection

### Voice Messages / Audio Notes

**Description**: Let partners send short voice messages to each other.

**Implementation Approach**:

- Use `expo-av` for audio recording and playback
- Store audio files in Firebase Storage with paths like `pairs/{pairId}/voice/{messageId}.m4a`
- Create a new Firestore collection `voiceMessages` with metadata (duration, timestamp, read status)
- Add a microphone button to the home screen or as a new tab
- Consider transcription using Google Cloud Speech-to-Text for accessibility

**Complexity**: Medium-High

---

### Video Calling Integration

**Description**: Enable real-time video calls between partners.

**Implementation Approach**:

- Integrate with WebRTC via libraries like `react-native-webrtc` or `livekit-react-native`
- Alternatively, use a managed service like Daily.co, Agora, or Twilio Video
- Add signaling server using Firebase Cloud Functions or a dedicated signaling service
- Handle call notifications with push notifications (category: "incoming_call")
- UI: Full-screen video call modal with mute, flip camera, end call controls

**Complexity**: High

---

### Shared Photo Album / Gallery

**Description**: A private space for couples to share and organize photos together.

**Implementation Approach**:

- Create Firestore collection `pairs/{pairId}/photos`
- Store images in Firebase Storage under `pairs/{pairId}/gallery/`
- Implement photo grid view using `react-native-fast-image` for performance
- Add albums/folders organization
- Support image upload from camera and gallery using `expo-image-picker`
- Optional: Background upload queue for reliability

**Complexity**: Medium

---

### Reaction Emojis on Notifications

**Description**: Quick emoji reactions to notifications without opening full app.

**Implementation Approach**:

- Add custom notification actions using `expo-notifications` categories
- Define 3-5 quick reaction buttons (❤️ 😍 👍 😂 🥰)
- Store reactions in Firestore under notification document or separate collection
- Show reaction badges on notification history items
- Handle notification action response in `_layout.tsx` notification listener

**Complexity**: Low-Medium

---

### "Thinking of You" Nudges

**Description**: One-tap poke/nudge to let partner know you're thinking of them.

**Implementation Approach**:

- Add floating action button or gesture on home screen
- Create simple "nudge" notification type
- Include subtle animations (heartbeat, wave) when received
- Rate limit to prevent spam (max 1 every 5 minutes)
- Store nudge history for "mood timeline" feature

**Complexity**: Low

---

## ✅ Tasks & Reminders

### Shared Grocery / Shopping Lists

**Description**: Collaborative shopping lists that sync in real-time.

**Implementation Approach**:

- Create new Firestore collection `pairs/{pairId}/shoppingLists`
- Similar structure to todos but with categories (Produce, Dairy, etc.)
- Add real-time listeners for live updates while shopping
- Checkbox strikethrough animation when items are checked
- Optional: Barcode scanner for quick item add using `expo-barcode-scanner`
- Integration with stores like Instacart (future)

**Complexity**: Medium

---

### Recurring Reminders

**Description**: Repeating reminders (daily, weekly, monthly).

**Implementation Approach**:

- Extend current `Todo` type with recurrence fields:
  ```typescript
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // every N days/weeks/etc
    endDate?: number; // optional end date
    daysOfWeek?: number[]; // for weekly: [1,3,5] = Mon,Wed,Fri
  }
  ```
- Update `scheduleLocalNotification` to use CALENDAR trigger type
- Create Cloud Function to regenerate next occurrence after completion
- UI: Add recurrence picker in TodoModal

**Complexity**: Medium

---

### Location-Based Reminders

**Description**: "Remind me when partner is near grocery store"

**Implementation Approach**:

- Use `expo-location` with geofencing
- Define saved locations (home, work, grocery store)
- Monitor partner's proximity to location (with privacy consent)
- Trigger notification when partner enters/exits geofence
- Store locations in `pairs/{pairId}/savedLocations`
- **Important**: Requires clear privacy consent and toggle to enable/disable

**Complexity**: High

---

### Todo Assignment

**Description**: Assign reminders to yourself or your partner.

**Implementation Approach**:

- Add `assignedTo: uid` field to Todo type
- Filter todos view by "My Tasks" / "Partner's Tasks" / "All"
- Send notification when assigned to partner
- Add avatar indicator on TodoItem showing assignee
- UI: Dropdown/toggle in TodoModal for assignment

**Complexity**: Low

---

### Calendar Integration

**Description**: Sync todos with device calendar or Google Calendar.

**Implementation Approach**:

- Use `expo-calendar` to read/write native calendar events
- Two-way sync option (create calendar events from todos, import calendar to todos)
- OAuth flow for Google Calendar API integration
- Show calendar overlay on todos screen
- Conflict detection and merge UI

**Complexity**: High

---

## 🎮 Fun & Engagement

### Daily Questions / Conversation Prompts

**Description**: Daily questions to spark meaningful conversations.

**Implementation Approach**:

- Create curated database of 365+ questions (serious, fun, deep)
- Store in Firestore `questions` collection or bundle with app
- Daily schedule via Cloud Functions to push new question
- UI: Special card on home screen showing today's question
- Both partners can answer, then reveal answers together
- Track question history and favorites

**Complexity**: Medium

---

### Mood Tracking

**Description**: Share daily mood/emotional state with partner.

**Implementation Approach**:

- Add mood picker (emoji scale or 1-5 rating)
- Store in `pairs/{pairId}/moodHistory`
- Show partner's mood on home screen with gentle notification
- Weekly/monthly mood trends visualization
- Optional journal entry with each mood
- Privacy: Option to share or keep private

**Complexity**: Low-Medium

---

### Milestone & Anniversary Reminders

**Description**: Never forget important dates.

**Implementation Approach**:

- Store milestones in `pairs/{pairId}/milestones`
- Types: first date, anniversary, birthdays, custom
- Schedule notifications days before
- Home screen countdown widget
- Optional: Generate shareable celebration cards/images
- Integration with calendar

**Complexity**: Low

---

### Love Language Quiz

**Description**: Discover and compare love language preferences.

**Implementation Approach**:

- Implement standard 5 Love Languages quiz (with attribution)
- Store results per user in profile
- Show compatibility insights and suggestions
- Actionable tips based on partner's love language
- Re-take option over time to track changes

**Complexity**: Low

---

### Mini Games

**Description**: Simple games to play together.

**Implementation Approach**:

- Start with turn-based games: Tic-tac-toe, Word games, Trivia
- Real-time sync using Firestore listeners
- Game state stored in `pairs/{pairId}/games/{gameId}`
- Push notification for turns
- Leaderboard/stats tracking
- Consider: React Native Game Engine for more complex games

**Game Ideas**:

- 🎯 Tic-tac-toe
- 🔤 Word chain
- ❓ Couple trivia (questions about each other)
- 🎨 Draw & guess

**Complexity**: Medium-High (depends on game complexity)

---

## 🎨 Customization

### Custom Notification Sounds

**Description**: Choose different sounds for each notification type.

**Implementation Approach**:

- Bundle collection of notification sounds in app
- Store user preference per category in `notificationPreferences`
- iOS: Use different sound files in notification payload
- Android: Create multiple notification channels with different sounds
- UI: Sound picker in Settings with preview playback

**Complexity**: Medium

---

### Home Screen Widget

**Description**: See partner status and quick actions from home screen.

**Implementation Approach**:

- iOS 14+: Use `react-native-ios-widget` or native Swift widget
- Android: Use `react-native-android-widget`
- Widget content: Partner avatar, last activity, mood, quick nudge button
- App Groups for shared data access (iOS)
- Background task to update widget data

**Complexity**: High

---

### Custom Sticker Packs

**Description**: Upload personal photos as sticker collections.

**Implementation Approach**:

- Allow image cropping/editing for stickers
- Group stickers into packs
- Share packs between partners
- Store in Firebase Storage `pairs/{pairId}/stickerPacks/`
- Optional: Background removal for proper sticker effect
- Consider integration with Giphy for additional stickers

**Complexity**: Medium

---

### Partner Nickname

**Description**: Display custom nickname instead of real name.

**Implementation Approach**:

- Add `partnerNickname` field to user profile
- Simple text input in Settings
- Replace partner name display throughout app
- Show real name in parentheses for clarity

**Complexity**: Low

---

### Chat / Messaging Feature

**Description**: Full in-app messaging between partners.

**Implementation Approach**:

- Create `pairs/{pairId}/messages` collection
- Use `react-native-gifted-chat` or custom chat UI
- Support text, images, stickers, voice messages
- Real-time updates with Firestore listeners
- Message status (sent, delivered, read)
- Push notifications for new messages
- Optional: End-to-end encryption

**Complexity**: High

---

## 🛠️ Utility

### Expense Splitting / Tracking

**Description**: Track shared expenses and settle up.

**Implementation Approach**:

- Create `pairs/{pairId}/expenses` collection
- Fields: amount, category, paidBy, splitRatio, date, notes
- Running balance calculation
- Monthly summary and charts
- Settlement reminders
- Export to CSV for records
- Optional: Receipt scanning with ML Kit

**Complexity**: Medium-High

---

### Shared Notes / Journal

**Description**: Private space for couple notes and memories.

**Implementation Approach**:

- Rich text editor using `react-native-pell-rich-editor`
- Store in `pairs/{pairId}/notes`
- Support images embedded in notes
- Folder/tag organization
- Version history for important notes
- Optional: AI-powered memory suggestions

**Complexity**: Medium

---

### Wishlist Sharing

**Description**: Share gift wishlists for special occasions.

**Implementation Approach**:

- Create `users/{uid}/wishlist` collection
- Fields: title, description, price, url, priority, purchased
- Partner can mark as purchased (hidden from owner)
- Integration with product links for auto-fill
- Occasion tagging (birthday, Christmas, anniversary)

**Complexity**: Low-Medium

---

### Event Countdown Timers

**Description**: Count down to special events together.

**Implementation Approach**:

- Store events in `pairs/{pairId}/events`
- Home screen countdown display
- Daily notification as date approaches
- Celebration animation on the day
- Can be linked to milestones

**Complexity**: Low

---

### Location Sharing

**Description**: Real-time location sharing between partners.

**Implementation Approach**:

- Use `expo-location` foreground/background location
- Map view using `react-native-maps`
- Store location in Firestore with timestamp
- Privacy controls: Always/When open/Never
- Location history (optional with clear data policy)
- ETA calculation to partner
- **Critical**: Requires explicit consent and easy opt-out

**Complexity**: High

---

## 📝 Implementation Priority Recommendations

### Quick Wins (Low effort, High impact)

1. ✅ "Thinking of You" Nudges
2. ✅ Mood Tracking
3. ✅ Partner Nickname
4. ✅ Milestone & Anniversary Reminders
5. ✅ Todo Assignment

### Medium Priority (Good ROI)

1. 📷 Shared Photo Album
2. 💬 Reaction Emojis on Notifications
3. 🛒 Shared Shopping Lists
4. ❓ Daily Questions
5. 🎵 Custom Notification Sounds

### Long-term / Major Features

1. 📹 Video Calling
2. 💬 Full Chat/Messaging
3. 📍 Location Sharing
4. 🎮 Mini Games
5. 📱 Home Screen Widgets

---

## 🔒 Privacy & Security Considerations

For all features involving location, messaging, or sensitive data:

- Clear consent dialogs before enabling
- Easy toggle to disable
- Data retention policies
- End-to-end encryption for messages (optional)
- GDPR compliance for data export/deletion
- Regular security audits

---

_Last updated: December 2024_
