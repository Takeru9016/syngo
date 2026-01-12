import Foundation
import WidgetKit

// MARK: - Widget Data Models

/// Partner data from the app
struct WidgetPartnerData: Codable {
    let name: String
    let avatarUrl: String?
    let moodEmoji: String?
    let moodLabel: String?
    let moodLevel: Int?
}

/// User's own data
struct WidgetUserData: Codable {
    let name: String
    let avatarUrl: String?
    let moodEmoji: String?
    let moodLabel: String?
    let moodLevel: Int?
}

/// Notification preview data
struct WidgetNotificationData: Codable {
    let id: String
    let type: String
    let title: String
    let body: String
    let timestamp: Double
    let isRead: Bool
    let imageUrl: String?
}

/// Activity stats
struct WidgetStatsData: Codable {
    let updatesToday: Int
    let unreadCount: Int
    let stickersThisWeek: Int
    let pendingTodos: Int
}

/// Main widget data container
struct WidgetData: Codable {
    let partner: WidgetPartnerData?
    let user: WidgetUserData?
    let stats: WidgetStatsData
    let latestNotification: WidgetNotificationData?
    let recentNotifications: [WidgetNotificationData]
    let lastUpdated: Double
    let isAuthenticated: Bool
    let isPaired: Bool
}

// MARK: - Data Provider

class WidgetDataProvider {
    static let shared = WidgetDataProvider()
    
    private let appGroupId = "group.com.sahiljadhav.syngo"
    private let dataKey = "syngo_widget_data"
    
    private init() {}
    
    /// Load widget data from App Groups shared storage
    func loadData() -> WidgetData? {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupId) else {
            print("❌ [Widget] Failed to access App Group: \(appGroupId)")
            return nil
        }
        
        guard let jsonString = sharedDefaults.string(forKey: dataKey),
              let jsonData = jsonString.data(using: .utf8) else {
            print("⚠️ [Widget] No widget data found")
            return nil
        }
        
        do {
            let data = try JSONDecoder().decode(WidgetData.self, from: jsonData)
            return data
        } catch {
            print("❌ [Widget] Failed to decode widget data: \(error)")
            return nil
        }
    }
    
    /// Get placeholder/sample data for widget preview
    func getPlaceholderData() -> WidgetData {
        return WidgetData(
            partner: WidgetPartnerData(
                name: "Partner",
                avatarUrl: nil,
                moodEmoji: "😊",
                moodLabel: "Great",
                moodLevel: 5
            ),
            user: WidgetUserData(
                name: "You",
                avatarUrl: nil,
                moodEmoji: "🙂",
                moodLabel: "Good",
                moodLevel: 4
            ),
            stats: WidgetStatsData(
                updatesToday: 3,
                unreadCount: 2,
                stickersThisWeek: 5,
                pendingTodos: 4
            ),
            latestNotification: WidgetNotificationData(
                id: "placeholder",
                type: "nudge",
                title: "New Nudge",
                body: "Your partner is thinking of you 💕",
                timestamp: Date().timeIntervalSince1970 * 1000,
                isRead: false,
                imageUrl: nil
            ),
            recentNotifications: [],
            lastUpdated: Date().timeIntervalSince1970 * 1000,
            isAuthenticated: true,
            isPaired: true
        )
    }
    
    /// Get empty state data for unauthenticated or unpaired users
    func getEmptyData(isAuthenticated: Bool = false, isPaired: Bool = false) -> WidgetData {
        return WidgetData(
            partner: nil,
            user: nil,
            stats: WidgetStatsData(
                updatesToday: 0,
                unreadCount: 0,
                stickersThisWeek: 0,
                pendingTodos: 0
            ),
            latestNotification: nil,
            recentNotifications: [],
            lastUpdated: Date().timeIntervalSince1970 * 1000,
            isAuthenticated: isAuthenticated,
            isPaired: isPaired
        )
    }
}

// MARK: - Timeline Provider

struct SyngoTimelineProvider: TimelineProvider {
    typealias Entry = SyngoWidgetEntry
    
    func placeholder(in context: Context) -> SyngoWidgetEntry {
        SyngoWidgetEntry(
            date: Date(),
            data: WidgetDataProvider.shared.getPlaceholderData()
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SyngoWidgetEntry) -> Void) {
        let data = WidgetDataProvider.shared.loadData() 
            ?? WidgetDataProvider.shared.getPlaceholderData()
        completion(SyngoWidgetEntry(date: Date(), data: data))
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SyngoWidgetEntry>) -> Void) {
        let data = WidgetDataProvider.shared.loadData() 
            ?? WidgetDataProvider.shared.getEmptyData()
        
        let entry = SyngoWidgetEntry(date: Date(), data: data)
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

// MARK: - Widget Entry

struct SyngoWidgetEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

// MARK: - Deep Links

enum WidgetDeepLink {
    static let home = URL(string: "syngo://")!
    static let nudge = URL(string: "syngo://nudge")!
    static let todos = URL(string: "syngo://todos")!
    static let mood = URL(string: "syngo://mood")!
    static let favorites = URL(string: "syngo://favorites")!
    static let notifications = URL(string: "syngo://notifications")!
    static let pair = URL(string: "syngo://pair")!
}
