# 🛠️ Utility Features

Practical tools to make life easier together.

**Total Features**: 10  
**Complexity Range**: Easy to Complex

---

## 1. Expense Tracking & Splitting

**What It Is**  
Track shared expenses and see who owes whom.

**What You'll Experience**

- Add expenses with amount, category, and who paid
- Split 50/50 or custom percentages
- See running balance (who owes what)
- View monthly spending summaries
- Get charts showing spending by category
- Set settlement reminders
- Export expense reports
- Optional: Scan receipts with your camera

**How It Works Behind the Scenes**  
Expenses are stored with payment and split information. The app calculates balances and generates reports and visualizations.

**Technical Implementation**:

- Create `pairs/{pairId}/expenses` collection
- Fields: amount, category, paidBy, splitRatio, date, notes
- Running balance calculation
- Monthly summary and charts
- Settlement reminders
- Export to CSV for records
- Optional: Receipt scanning with ML Kit

**Effort Level**: Medium-Complex

---

## 2. Shared Notes & Journal

**What It Is**  
A private space to write notes, ideas, and memories together.

**What You'll Experience**

- Create notes with rich text formatting
- Add photos to notes
- Organize notes into folders
- Tag notes for easy finding
- Search through all notes
- See edit history
- Pin important notes to the top
- Optional: AI suggests related memories

**How It Works Behind the Scenes**  
Notes are stored in the cloud with formatting preserved. Search functionality indexes all text. Version history tracks changes over time.

**Technical Implementation**:

- Rich text editor using `react-native-pell-rich-editor`
- Store in `pairs/{pairId}/notes`
- Support images embedded in notes
- Folder/tag organization
- Version history for important notes
- Optional: AI-powered memory suggestions

**Effort Level**: Medium

---

## 3. Wishlist Sharing

**What It Is**  
Share gift ideas so your partner always knows what you want.

**What You'll Experience**

- Create a wishlist of items you'd like
- Add product links, photos, and prices
- Set priority levels
- Tag items for occasions (birthday, anniversary, etc.)
- Your partner can secretly mark items as "purchased"
- Get gift ideas for your partner
- Link to online stores for easy shopping

**How It Works Behind the Scenes**  
Each person has their own wishlist that their partner can view. The "purchased" status is hidden from the wishlist owner to preserve surprises.

**Technical Implementation**:

- Create `users/{uid}/wishlist` collection
- Fields: title, description, price, url, priority, purchased
- Partner can mark as purchased (hidden from owner)
- Integration with product links for auto-fill
- Occasion tagging (birthday, Christmas, anniversary)

**Effort Level**: Easy-Medium

---

## 4. Countdown Timers

**What It Is**  
Count down to events you're excited about.

**What You'll Experience**

- Create countdowns for trips, events, or special days
- See days, hours, and minutes remaining
- Display countdowns on home screen
- Get notifications as the date approaches
- Celebration animation when countdown reaches zero
- Link countdowns to calendar events

**How It Works Behind the Scenes**  
The app calculates time remaining and updates the display. Notifications are scheduled for milestones (1 week away, 1 day away, etc.).

**Technical Implementation**:

- Store events in `pairs/{pairId}/events`
- Home screen countdown display
- Daily notification as date approaches
- Celebration animation on the day
- Can be linked to milestones

**Effort Level**: Easy

---

## 5. Location Sharing

**What It Is**  
Share your real-time location with your partner.

**What You'll Experience**

- See your partner's location on a map
- Get estimated arrival time when they're heading home
- Set up automatic sharing (always, only when app is open, or never)
- View location history (optional)
- Get notified when partner arrives/leaves certain places
- Easy on/off toggle for privacy
- **Your privacy is protected**: You control when and how location is shared

**How It Works Behind the Scenes**  
With your permission, the app accesses your phone's GPS and shares coordinates. Location data is encrypted and you can disable it anytime.

**Technical Implementation**:

- Use `expo-location` foreground/background location
- Map view using `react-native-maps`
- Store location in Firestore with timestamp
- Privacy controls: Always/When open/Never
- Location history (optional with clear data policy)
- ETA calculation to partner
- **Critical**: Requires explicit consent and easy opt-out

**Effort Level**: Complex

---

## 6. Travel Planner

**What It Is**  
Plan trips together with itineraries, packing lists, and budgets.

**What You'll Experience**

- Create trips with dates and destinations
- Build day-by-day itineraries
- Add activities, restaurants, and attractions
- Create shared packing lists
- Track trip budget and expenses
- Save travel documents and confirmations
- Countdown to your trip
- Access everything offline during travel

**How It Works Behind the Scenes**  
Trip data is organized in a structured format and synced between partners. Offline mode caches data locally for access without internet.

**Technical Implementation**:

- Create `pairs/{pairId}/trips` collection
- Nested structure: trip > days > activities
- Packing list integration (similar to shopping lists)
- Budget tracking (integration with expense tracker)
- Document storage in Firebase Storage
- Offline data caching
- Countdown integration

**Effort Level**: Medium-Complex

---

## 7. Recipe Collection

**What It Is**  
Save and share your favorite recipes.

**What You'll Experience**

- Add recipes with ingredients and instructions
- Upload photos of your dishes
- Tag recipes (breakfast, dessert, quick meals, etc.)
- Rate recipes and add notes
- Generate shopping lists from recipes
- Share recipes with your partner
- Import recipes from websites
- Search your collection

**How It Works Behind the Scenes**  
Recipes are stored in a structured format. The app can parse recipe websites and extract ingredients/instructions automatically.

**Technical Implementation**:

- Create `pairs/{pairId}/recipes` collection
- Fields: title, ingredients[], instructions[], tags, rating, photos
- Shopping list generation from ingredients
- Recipe import via web scraping/API
- Search and filter functionality
- Integration with meal planning feature

**Effort Level**: Medium

---

## 8. Subscription Tracker

**What It Is**  
Keep track of all your shared subscriptions and memberships.

**What You'll Experience**

- Add subscriptions (Netflix, Spotify, gym, etc.)
- See monthly and yearly costs
- Get renewal reminders
- Track total subscription spending
- Mark subscriptions as shared or individual
- Get suggestions to cancel unused subscriptions
- See payment history

**How It Works Behind the Scenes**  
Subscription data is stored with renewal dates. The app calculates costs and sends reminders before renewals.

**Technical Implementation**:

- Create `pairs/{pairId}/subscriptions` collection
- Fields: name, cost, billingCycle, renewalDate, category, sharedStatus
- Calculate monthly/yearly totals
- Renewal reminders (similar to bill reminders)
- Usage tracking (optional)
- Cancellation suggestions based on usage

**Effort Level**: Easy-Medium

---

## 9. Password Sharing (Secure)

**What It Is**  
Safely share passwords for shared accounts.

**What You'll Experience**

- Store passwords for shared services
- Passwords are encrypted and secure
- Copy passwords with one tap
- Organize by category (streaming, utilities, etc.)
- Generate strong passwords
- Share access with your partner only
- Optional: Require authentication to view

**How It Works Behind the Scenes**  
Passwords are encrypted using industry-standard security before storage. Only you and your partner can decrypt them.

**Technical Implementation**:

- Create `pairs/{pairId}/passwords` collection (encrypted)
- End-to-end encryption using crypto libraries
- Biometric authentication to view passwords
- Password generator
- Category organization
- Secure clipboard copy with auto-clear
- **Critical**: Security audit required

**Effort Level**: Complex (security is critical)

---

## 10. Pet Care Tracker

**What It Is**  
Manage your pet's care together (feeding, vet visits, medications).

**What You'll Experience**

- Add your pets with photos and info
- Track feeding schedules
- Log vet appointments and vaccinations
- Set medication reminders
- Record weight and health notes
- Share pet care duties
- Store vet contact information
- Track pet expenses

**How It Works Behind the Scenes**  
Pet profiles store all information. Reminders and schedules work like other task features but are pet-specific.

**Technical Implementation**:

- Create `pairs/{pairId}/pets` collection
- Pet profile: name, species, breed, birthdate, photo, vetInfo
- Feeding schedule with reminders
- Medical records and vaccination tracking
- Medication reminders (similar to todo system)
- Weight tracking with charts
- Expense tracking integration

**Effort Level**: Medium

---

## 📊 Category Summary

**Quick Wins** (Easy to build):

- Countdown Timers
- Wishlist Sharing
- Subscription Tracker

**Medium Priority**:

- Shared Notes
- Recipe Collection
- Pet Care Tracker
- Expense Tracking
- Travel Planner

**Long-term Goals** (Complex):

- Location Sharing
- Password Sharing (requires security audit)

---

[← Back to Overview](README.md)
