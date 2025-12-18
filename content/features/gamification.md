# 🏆 Gamification Features

Make using Syngo more rewarding and fun.

**Total Features**: 3  
**Complexity Range**: Easy to Medium

---

## 1. Achievements & Badges

**What It Is**  
Earn rewards for using the app and being a great partner.

**What You'll Experience**

- Unlock badges for milestones (100 days together, 50 reminders completed, etc.)
- See achievement progress
- Celebrate achievements together
- Collect rare badges for special accomplishments
- Share achievements with your partner
- View your badge collection

**How It Works Behind the Scenes**  
The app tracks your activities and checks against achievement criteria. When you meet the requirements, you unlock the badge.

**Technical Implementation**:

- Define achievement criteria (e.g., "Send 100 nudges", "Complete 50 todos together")
- Track user activities in background
- Check criteria on relevant actions
- Store unlocked badges in user profile
- Badge collection UI with progress bars
- Celebration animation when unlocking
- Share achievement with partner notification

**Effort Level**: Medium

---

## 2. Streak Tracking

**What It Is**  
Build streaks for daily activities and keep them going.

**What You'll Experience**

- Track daily check-in streaks
- See how many days in a row you've sent messages
- Build mood tracking streaks
- Get motivated to maintain streaks
- Celebrate milestone streaks (7 days, 30 days, 100 days)
- Streak recovery if you miss a day

**How It Works Behind the Scenes**  
The app counts consecutive days of activity. Streaks reset if you miss a day, but can offer one-time recovery options.

**Technical Implementation**:

- Track daily activities (nudges sent, moods logged, etc.)
- Calculate consecutive days
- Store streak data in user profile
- Daily check at midnight to update streaks
- Streak recovery mechanism (one-time use)
- Milestone celebrations (7, 30, 100, 365 days)
- Reminder notifications to maintain streaks

**Effort Level**: Easy-Medium

---

## 3. Relationship Score

**What It Is**  
A fun score showing your relationship engagement in the app.

**What You'll Experience**

- See a relationship score based on app activity
- Earn points for communication, completing tasks together, etc.
- Watch your score grow over time
- Compare with previous months
- Get tips to improve your score
- **Note**: This is just for fun, not a real measure of your relationship!

**How It Works Behind the Scenes**  
The app assigns points to different activities and calculates a total score. It's designed to encourage engagement, not judge your relationship.

**Technical Implementation**:

- Point system for activities:
  - Send nudge: +5 points
  - Complete shared todo: +10 points
  - Log mood: +3 points
  - Answer daily question: +15 points
  - etc.
- Calculate total score and monthly average
- Store in `pairs/{pairId}/relationshipScore`
- Trend visualization (weekly/monthly)
- Suggestions to earn more points
- **Important**: Clear messaging that this is for fun only

**Effort Level**: Easy-Medium

---

## 📊 Category Summary

All three gamification features are relatively easy to medium complexity and can be built together as a cohesive engagement system.

**Recommended Implementation Order**:

1. Streak Tracking (easiest, immediate engagement)
2. Relationship Score (builds on activity tracking)
3. Achievements & Badges (most complex, requires all tracking in place)

---

[← Back to Overview](README.md)
