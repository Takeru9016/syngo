# 🎨 Customization Features

Make Syngo truly yours.

**Total Features**: 6  
**Complexity Range**: Easy to Complex

---

## 1. Custom Notification Sounds

**What It Is**  
Choose different sounds for different types of notifications.

**What You'll Experience**

- Pick sounds for reminders, nudges, messages, etc.
- Preview sounds before selecting
- Choose from a library of pleasant tones
- Set different sounds for day and night
- Upload your own custom sounds (optional)

**How It Works Behind the Scenes**  
Sound files are bundled with the app. Your preferences are saved and used when sending notifications. Different notification types use different sound files.

**Technical Implementation**:

- Bundle collection of notification sounds in app
- Store user preference per category in `notificationPreferences`
- iOS: Use different sound files in notification payload
- Android: Create multiple notification channels with different sounds
- UI: Sound picker in Settings with preview playback

**Effort Level**: Medium

---

## 2. Home Screen Widgets

**What It Is**  
See important info and quick actions right on your phone's home screen.

**What You'll Experience**

- Add a Syngo widget to your home screen
- See your partner's status, mood, or photo
- View upcoming reminders
- Tap for quick actions (send nudge, view tasks)
- Choose from different widget sizes and styles
- Widget updates automatically

**How It Works Behind the Scenes**  
The widget is a separate mini-app that reads data from the main app and displays it on your home screen. It updates periodically in the background.

**Technical Implementation**:

- iOS 14+: Use `react-native-ios-widget` or native Swift widget
- Android: Use `react-native-android-widget`
- Widget content: Partner avatar, last activity, mood, quick nudge button
- App Groups for shared data access (iOS)
- Background task to update widget data

**Effort Level**: Complex

---

## 3. Custom Sticker Packs

**What It Is**  
Create stickers from your own photos to send to your partner.

**What You'll Experience**

- Upload photos and crop them into stickers
- Remove backgrounds automatically
- Organize stickers into packs (funny faces, pets, etc.)
- Share sticker packs with your partner
- Access stickers when sending notifications or messages
- Browse and add stickers from a library (like Giphy)

**How It Works Behind the Scenes**  
Photos are processed to remove backgrounds and saved as sticker files. Sticker packs are stored in the cloud and shared between partners.

**Technical Implementation**:

- Allow image cropping/editing for stickers
- Group stickers into packs
- Share packs between partners
- Store in Firebase Storage `pairs/{pairId}/stickerPacks/`
- Optional: Background removal for proper sticker effect
- Consider integration with Giphy for additional stickers

**Effort Level**: Medium

---

## 4. Theme Customization

**What It Is**  
Personalize the app's appearance with different colors and themes.

**What You'll Experience**

- Choose from light, dark, or auto mode
- Select accent colors (pink, blue, purple, etc.)
- Pick from preset themes (romantic, minimal, vibrant)
- Customize fonts and icon styles
- Preview changes before applying
- Sync theme preferences with your partner (optional)

**How It Works Behind the Scenes**  
The app's design system uses variables for colors and styles. Changing themes updates these variables throughout the app.

**Technical Implementation**:

- Create theme system with color/style variables
- Store theme preference in user profile
- Preset themes with curated color palettes
- Live preview before applying
- Optional: Sync theme between partners
- Support system dark mode

**Effort Level**: Medium

---

## 5. Partner Nickname & Avatar

**What It Is**  
Give your partner a cute nickname and choose how they appear in the app.

**What You'll Experience**

- Set a custom nickname for your partner
- Choose or upload a couple photo
- Pick individual avatars
- Nickname appears throughout the app
- Real name shown in parentheses for clarity
- Change anytime

**How It Works Behind the Scenes**  
Nickname and avatar preferences are saved to your profile and used when displaying your partner's information.

**Technical Implementation**:

- Add `partnerNickname` and `avatarUrl` fields to user profile
- Simple text input and image picker in Settings
- Replace partner name display throughout app
- Show real name in parentheses for clarity
- Image upload to Firebase Storage

**Effort Level**: Easy

---

## 6. Notification Preferences

**What It Is**  
Fine-tune exactly when and how you want to be notified.

**What You'll Experience**

- Set quiet hours (no notifications during sleep)
- Choose which notification types you want
- Set different preferences for weekdays vs weekends
- Enable/disable vibration and sounds separately
- Set notification priority levels
- Snooze notifications temporarily

**How It Works Behind the Scenes**  
Your preferences are checked before sending each notification. The app respects quiet hours and only sends notifications you've enabled.

**Technical Implementation**:

- Create `notificationPreferences` in user profile
- Fields: quietHours, enabledTypes, vibration, sound, priority
- Check preferences before sending notifications
- Weekday/weekend schedules
- Temporary snooze functionality
- Per-notification-type settings

**Effort Level**: Medium

---

## 📊 Category Summary

**Quick Wins** (Easy to build):

- Partner Nickname & Avatar

**Medium Priority**:

- Custom Notification Sounds
- Custom Sticker Packs
- Theme Customization
- Notification Preferences

**Long-term Goals** (Complex):

- Home Screen Widgets

---

[← Back to Overview](README.md)
