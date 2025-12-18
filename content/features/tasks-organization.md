# ✅ Tasks & Organization Features

Stay organized and manage your life together.

**Total Features**: 7  
**Complexity Range**: Easy to Complex

---

## 1. Shared Shopping Lists

**What It Is**  
Create grocery and shopping lists that both of you can edit in real-time.

**What You'll Experience**

- Create multiple lists (groceries, Target, hardware store, etc.)
- Add items with quantities and notes
- Check off items while shopping
- See your partner's changes instantly
- Organize items by category (produce, dairy, etc.)
- Optional: Scan barcodes to add items quickly

**How It Works Behind the Scenes**  
Lists are stored in the cloud and update in real-time. When one person checks an item, it immediately shows as checked for the other person.

**Technical Implementation**:

- Create new Firestore collection `pairs/{pairId}/shoppingLists`
- Similar structure to todos but with categories (Produce, Dairy, etc.)
- Add real-time listeners for live updates while shopping
- Checkbox strikethrough animation when items are checked
- Optional: Barcode scanner for quick item add using `expo-barcode-scanner`
- Integration with stores like Instacart (future)

**Effort Level**: Medium

---

## 2. Recurring Reminders

**What It Is**  
Set reminders that repeat automatically (daily, weekly, monthly).

**What You'll Experience**

- Create a reminder once, set it to repeat
- Choose: daily, weekly, monthly, or yearly
- Pick specific days (like "every Monday and Wednesday")
- Set an end date or let it repeat forever
- Get notifications at the scheduled times
- Mark as complete, and it automatically creates the next one

**How It Works Behind the Scenes**  
The app stores the repeat pattern and automatically creates new reminders after you complete them. Uses your phone's calendar system for reliable notifications.

**Technical Implementation**:

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

**Effort Level**: Medium

---

## 3. Task Assignment

**What It Is**  
Assign reminders and tasks to yourself or your partner.

**What You'll Experience**

- When creating a reminder, choose who it's for
- Filter view to see "My Tasks", "Partner's Tasks", or "All"
- Your partner gets notified when you assign them something
- See a small avatar icon showing who the task is assigned to
- Track who's responsible for what

**How It Works Behind the Scenes**  
Each task stores who it's assigned to. The app filters and displays tasks based on this assignment and sends notifications accordingly.

**Technical Implementation**:

- Add `assignedTo: uid` field to Todo type
- Filter todos view by "My Tasks" / "Partner's Tasks" / "All"
- Send notification when assigned to partner
- Add avatar indicator on TodoItem showing assignee
- UI: Dropdown/toggle in TodoModal for assignment

**Effort Level**: Easy

---

## 4. Location-Based Reminders

**What It Is**  
Get reminded when you or your partner arrive at or leave a specific place.

**What You'll Experience**

- Save important locations (home, work, grocery store, gym)
- Set reminders like "When I arrive at the store, remind me to buy milk"
- Get notified when your partner arrives home
- Full control over location sharing (you choose when to enable it)
- Privacy-first: clear consent required

**How It Works Behind the Scenes**  
The app monitors your location (with your permission) and triggers notifications when you enter or exit defined areas. Location data is handled securely.

**Technical Implementation**:

- Use `expo-location` with geofencing
- Define saved locations (home, work, grocery store)
- Monitor partner's proximity to location (with privacy consent)
- Trigger notification when partner enters/exits geofence
- Store locations in `pairs/{pairId}/savedLocations`
- **Important**: Requires clear privacy consent and toggle to enable/disable

**Effort Level**: Complex

---

## 5. Calendar Integration

**What It Is**  
Connect your reminders with your phone's calendar or Google Calendar.

**What You'll Experience**

- See your Syngo reminders in your regular calendar app
- Import calendar events into Syngo as reminders
- Two-way sync keeps everything updated
- Choose which calendars to sync
- Avoid double-booking and conflicts

**How It Works Behind the Scenes**  
The app connects to your calendar using official calendar APIs. It reads and writes events while respecting your privacy and permissions.

**Technical Implementation**:

- Use `expo-calendar` to read/write native calendar events
- Two-way sync option (create calendar events from todos, import calendar to todos)
- OAuth flow for Google Calendar API integration
- Show calendar overlay on todos screen
- Conflict detection and merge UI

**Effort Level**: Complex

---

## 6. Meal Planning

**What It Is**  
Plan your weekly meals together and generate shopping lists automatically.

**What You'll Experience**

- See a weekly calendar view for breakfast, lunch, and dinner
- Add meals by typing or choosing from favorites
- Add recipes with ingredients
- Generate a shopping list from your meal plan
- Share cooking duties by assigning meals
- Save favorite meals for quick planning

**How It Works Behind the Scenes**  
Meals are stored with their ingredients. The app analyzes your weekly plan and creates a consolidated shopping list automatically.

**Technical Implementation**:

- Create `pairs/{pairId}/mealPlan` collection with weekly structure
- Store meals with ingredient lists
- Generate shopping list by aggregating ingredients from weekly meals
- Calendar view component for meal planning
- Integration with recipe collection feature
- Assign meals to partners for cooking duties

**Effort Level**: Medium-Complex

---

## 7. Bill Reminders

**What It Is**  
Never miss a bill payment with automatic reminders.

**What You'll Experience**

- Add bills with amounts and due dates
- Set reminders for a few days before due date
- Mark bills as paid
- See upcoming bills at a glance
- Track payment history
- Set recurring bills (monthly rent, subscriptions, etc.)

**How It Works Behind the Scenes**  
Bills are stored with due dates and recurrence patterns. The notification system sends reminders before due dates.

**Technical Implementation**:

- Create `pairs/{pairId}/bills` collection
- Fields: name, amount, dueDate, recurrence, paidBy, status
- Schedule notifications X days before due date (configurable)
- Mark as paid and track payment history
- Support recurring bills (monthly, quarterly, yearly)
- Dashboard showing upcoming bills

**Effort Level**: Easy-Medium

---

## 📊 Category Summary

**Quick Wins** (Easy to build):

- Task Assignment
- Bill Reminders

**Medium Priority**:

- Shared Shopping Lists
- Recurring Reminders
- Meal Planning

**Long-term Goals** (Complex):

- Location-Based Reminders
- Calendar Integration

---

[← Back to Overview](README.md)
