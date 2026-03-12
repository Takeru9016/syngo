import Foundation
import SwiftUI
import WidgetKit

// MARK: - Widget Data Models

struct WidgetUserData: Codable {
    let name: String
    let mood: Int?
    let moodEmoji: String?
    let avatarUrl: String?
}

struct WidgetStats: Codable {
    let pendingTodos: Int
    let unreadNotifications: Int
    let daysTogether: Int?
}

struct WidgetActivity: Codable {
    let type: String
    let text: String
    let timeAgo: String
    let icon: String
}

struct WidgetData: Codable {
    let user: WidgetUserData
    let partner: WidgetUserData
    let stats: WidgetStats
    let recentActivities: [WidgetActivity]
    let lastUpdated: String
    let isAuthenticated: Bool
    let hasPair: Bool
}

// MARK: - Data Provider

class WidgetDataProvider {
    static let shared = WidgetDataProvider()
    
    private let appGroupId = "group.com.sahiljadhav.syngo"
    private let dataKey = "syngo_widget_data"
    
    private init() {}
    
    func getData() -> WidgetData {
        guard let defaults = UserDefaults(suiteName: appGroupId),
              let jsonString = defaults.string(forKey: dataKey),
              let jsonData = jsonString.data(using: .utf8) else {
            return defaultData
        }
        
        do {
            let data = try JSONDecoder().decode(WidgetData.self, from: jsonData)
            return data
        } catch {
            print("Failed to decode widget data: \(error)")
            return defaultData
        }
    }
    
    var defaultData: WidgetData {
        WidgetData(
            user: WidgetUserData(name: "You", mood: nil, moodEmoji: nil, avatarUrl: nil),
            partner: WidgetUserData(name: "Partner", mood: nil, moodEmoji: nil, avatarUrl: nil),
            stats: WidgetStats(pendingTodos: 0, unreadNotifications: 0, daysTogether: nil),
            recentActivities: [],
            lastUpdated: ISO8601DateFormatter().string(from: Date()),
            isAuthenticated: false,
            hasPair: false
        )
    }
}

// MARK: - Timeline Provider

struct SyngoTimelineProvider: TimelineProvider {
    typealias Entry = SyngoWidgetEntry
    
    func placeholder(in context: Context) -> SyngoWidgetEntry {
        print("📍 [SyngoWidget] placeholder() called")
        return SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SyngoWidgetEntry) -> Void) {
        print("📸 [SyngoWidget] getSnapshot() called, isPreview: \(context.isPreview)")
        let data = WidgetDataProvider.shared.getData()
        print("📸 [SyngoWidget] Data loaded: auth=\(data.isAuthenticated), hasPair=\(data.hasPair)")
        completion(SyngoWidgetEntry(date: Date(), data: data))
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SyngoWidgetEntry>) -> Void) {
        print("⏰ [SyngoWidget] getTimeline() called")
        let data = WidgetDataProvider.shared.getData()
        print("⏰ [SyngoWidget] Timeline data loaded: auth=\(data.isAuthenticated), hasPair=\(data.hasPair)")
        let entry = SyngoWidgetEntry(date: Date(), data: data)
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        
        print("⏰ [SyngoWidget] Timeline created, next update: \(nextUpdate)")
        completion(timeline)
    }
}

struct SyngoWidgetEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

// MARK: - Common UI Components

struct MoodEmojiView: View {
    let emoji: String?
    let mood: Int?
    let size: CGFloat
    
    /// SF Symbol name for mood level (fallback when moodEmoji is nil)
    private static func sfSymbol(for mood: Int?) -> String {
        switch mood {
        case 1: return "cloud.rain.fill"
        case 2: return "cloud.fill"
        case 3: return "face.smiling"
        case 4: return "face.smiling.fill"
        case 5: return "sun.max.fill"
        default: return "questionmark.circle"
        }
    }
    
    /// Color for mood level
    private static func moodColor(for mood: Int?) -> Color {
        switch mood {
        case 1: return Color(red: 0.49, green: 0.54, blue: 0.9) // Soft blue
        case 2: return Color(red: 0.65, green: 0.55, blue: 0.98) // Soft purple
        case 3: return .syngoMuted
        case 4: return Color(red: 0.2, green: 0.83, blue: 0.6) // Green
        case 5: return Color(red: 0.98, green: 0.75, blue: 0.15) // Gold
        default: return .syngoMuted
        }
    }
    
    var body: some View {
        let symbolName = emoji ?? MoodEmojiView.sfSymbol(for: mood)
        Image(systemName: symbolName)
            .font(.system(size: size * 0.85))
            .foregroundColor(MoodEmojiView.moodColor(for: mood))
            .symbolRenderingMode(.hierarchical)
    }
}

struct AvatarView: View {
    let name: String
    let size: CGFloat
    
    var body: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Color.romanticPink, Color.mauve],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            Text(String(name.prefix(1)).uppercased())
                .font(.system(size: size * 0.45, weight: .semibold))
                .foregroundColor(.white)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Romantic Theme Colors

extension Color {
    // Deep romantic background
    static let syngoBackground = Color(red: 0.06, green: 0.03, blue: 0.10)
    
    // Card background with warm tint
    static let syngoCard = Color(red: 0.12, green: 0.08, blue: 0.14)
    
    // Primary romantic pink
    static let romanticPink = Color(red: 0.92, green: 0.42, blue: 0.58)
    
    // Soft rose
    static let softRose = Color(red: 0.98, green: 0.65, blue: 0.72)
    
    // Warm coral
    static let warmCoral = Color(red: 0.95, green: 0.52, blue: 0.55)
    
    // Mauve purple
    static let mauve = Color(red: 0.75, green: 0.48, blue: 0.68)
    
    // Champagne gold
    static let champagne = Color(red: 1.0, green: 0.88, blue: 0.72)
    
    // Muted text
    static let syngoMuted = Color(red: 0.68, green: 0.58, blue: 0.72)
    
    // Legacy primary
    static let syngoPrimary = Color(red: 0.39, green: 0.4, blue: 0.95)
}
