# 🗣️ Communication & Connection Features

Stay connected with your partner in new and meaningful ways.

**Total Features**: 8  
**Complexity Range**: Easy to Complex

---

## 1. Voice Messages

**What It Is**  
Send quick voice recordings to your partner instead of typing messages.

**What You'll Experience**

- Tap and hold a microphone button to record
- Send voice notes up to 2 minutes long
- Listen to your partner's voice messages anytime
- See how long each message is before playing
- Get notified when your partner sends you a voice note

**How It Works Behind the Scenes**  
The app records your voice using your phone's microphone, saves it securely in the cloud, and sends a notification to your partner. The voice file is stored safely so you can replay it later.

**Technical Implementation**:

- Use `expo-av` for audio recording and playback
- Store audio files in Firebase Storage with paths like `pairs/{pairId}/voice/{messageId}.m4a`
- Create a new Firestore collection `voiceMessages` with metadata (duration, timestamp, read status)
- Add a microphone button to the home screen or as a new tab
- Consider transcription using Google Cloud Speech-to-Text for accessibility

**Effort Level**: Medium-Complex

---

## 2. Video Calls

**What It Is**  
Have face-to-face video conversations with your partner directly in the app.

**What You'll Experience**

- Tap a video call button to start a call
- See your partner's face in full screen
- Switch between front and back camera
- Mute your microphone or turn off video
- Get incoming call notifications with accept/decline options

**How It Works Behind the Scenes**  
Uses real-time video technology to connect you and your partner. The video streams directly between your phones with high quality and low delay.

**Technical Implementation**:

- Integrate with WebRTC via libraries like `react-native-webrtc` or `livekit-react-native`
- Alternatively, use a managed service like Daily.co, Agora, or Twilio Video
- Add signaling server using Firebase Cloud Functions or a dedicated signaling service
- Handle call notifications with push notifications (category: "incoming_call")
- UI: Full-screen video call modal with mute, flip camera, end call controls

**Effort Level**: Complex

---

## 3. Shared Photo Album

**What It Is**  
A private photo gallery where both of you can add, view, and organize pictures together.

**What You'll Experience**

- Upload photos from your camera or gallery
- Create albums for different occasions (vacations, date nights, etc.)
- See all photos in a beautiful grid layout
- Add captions and dates to photos
- Both partners can add or delete photos
- Download photos to your device anytime

**How It Works Behind the Scenes**  
Photos are uploaded to secure cloud storage and organized in a database. Both partners have access to the same collection, and changes sync instantly.

**Technical Implementation**:

- Create Firestore collection `pairs/{pairId}/photos`
- Store images in Firebase Storage under `pairs/{pairId}/gallery/`
- Implement photo grid view using `react-native-fast-image` for performance
- Add albums/folders organization
- Support image upload from camera and gallery using `expo-image-picker`
- Optional: Background upload queue for reliability

**Effort Level**: Medium

---

## 4. Quick Emoji Reactions

**What It Is**  
React to notifications with emojis without opening the app.

**What You'll Experience**

- When you get a notification, see emoji buttons (❤️ 😍 👍 😂 🥰)
- Tap an emoji to send a quick reaction
- Your partner sees your reaction on their notification
- View reaction history in the app

**How It Works Behind the Scenes**  
The notification system includes special action buttons. When you tap an emoji, it sends that reaction to the database and notifies your partner.

**Technical Implementation**:

- Add custom notification actions using `expo-notifications` categories
- Define 3-5 quick reaction buttons (❤️ 😍 👍 😂 🥰)
- Store reactions in Firestore under notification document or separate collection
- Show reaction badges on notification history items
- Handle notification action response in `_layout.tsx` notification listener

**Effort Level**: Easy-Medium

---

## 5. "Thinking of You" Nudges

**What It Is**  
A simple one-tap way to let your partner know you're thinking about them.

**What You'll Experience**

- Tap a heart button on the home screen
- Your partner gets a sweet "thinking of you" notification
- See a cute animation when you receive a nudge
- Limited to once every 5 minutes to keep it special

**How It Works Behind the Scenes**  
A simple button that sends a special notification type with a nice animation. The app tracks when you last sent one to prevent spam.

**Technical Implementation**:

- Add floating action button or gesture on home screen
- Create simple "nudge" notification type
- Include subtle animations (heartbeat, wave) when received
- Rate limit to prevent spam (max 1 every 5 minutes)
- Store nudge history for "mood timeline" feature

**Effort Level**: Easy

---

## 6. In-App Chat Messaging

**What It Is**  
Full text messaging with your partner inside the app.

**What You'll Experience**

- Send and receive text messages instantly
- Share photos, stickers, and voice messages in chat
- See when your partner is typing
- Know when messages are delivered and read
- Search through your message history
- Receive notifications for new messages

**How It Works Behind the Scenes**  
Messages are stored in a database and sync in real-time. The app listens for new messages and displays them immediately. All messages are encrypted for privacy.

**Technical Implementation**:

- Create `pairs/{pairId}/messages` collection
- Use `react-native-gifted-chat` or custom chat UI
- Support text, images, stickers, voice messages
- Real-time updates with Firestore listeners
- Message status (sent, delivered, read)
- Push notifications for new messages
- Optional: End-to-end encryption

**Effort Level**: Complex

---

## 7. Couple Status Updates

**What It Is**  
Set a status message that your partner can see (like "At the gym" or "Missing you ❤️").

**What You'll Experience**

- Choose from preset status messages or write your own
- Add an emoji to your status
- See your partner's current status on the home screen
- Status automatically clears after a set time or manually
- Get a gentle notification when your partner updates their status

**How It Works Behind the Scenes**  
Your status is saved in your profile and syncs to your partner's app. The app can automatically clear old statuses using timers.

**Technical Implementation**:

- Add `currentStatus` field to user profile with timestamp
- Create preset status options and custom input
- Display partner's status on home screen
- Auto-clear after configurable duration (1 hour, 4 hours, until manually cleared)
- Send gentle notification on status update
- Store status history (optional)

**Effort Level**: Easy

---

## 8. Scheduled Messages

**What It Is**  
Write a message now and schedule it to be sent later.

**What You'll Experience**

- Write a notification or message
- Pick a future date and time to send it
- See your scheduled messages in a list
- Edit or cancel scheduled messages before they send
- Perfect for sending good morning messages or birthday wishes

**How It Works Behind the Scenes**  
The message is saved with a scheduled time. A background system checks for scheduled messages and sends them at the right time.

**Technical Implementation**:

- Create `users/{uid}/scheduledMessages` collection
- Store message content, recipient, scheduled time, and type
- Cloud Function runs periodically to check for messages to send
- Allow editing/canceling before send time
- UI: Calendar picker and time selector
- Show pending scheduled messages in a dedicated view

**Effort Level**: Medium

---

## 📊 Category Summary

**Quick Wins** (Easy to build):

- "Thinking of You" Nudges
- Couple Status Updates

**Medium Priority**:

- Quick Emoji Reactions
- Shared Photo Album
- Voice Messages
- Scheduled Messages

**Long-term Goals** (Complex):

- Video Calls
- In-App Chat Messaging

---

[← Back to Overview](README.md)
