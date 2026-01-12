import SwiftUI
import WidgetKit

// MARK: - 7. Quick Actions Widget (Medium)
// Shows: 4 action buttons - Nudge, Todos, Mood, Favorites

struct QuickActionsWidget: Widget {
    let kind: String = "QuickActionsWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            QuickActionsWidgetView(entry: entry)
                .containerBackground(Color.syngoBackground, for: .widget)
        }
        .configurationDisplayName("Quick Actions")
        .description("Quick access to Syngo features")
        .supportedFamilies([.systemMedium])
    }
}

struct QuickActionsWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if entry.data.isPaired, let partner = entry.data.partner {
            VStack(spacing: 12) {
                // Header with partner info
                HStack {
                    AvatarView(
                        avatarUrl: partner.avatarUrl,
                        name: partner.name,
                        size: 36
                    )
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(partner.name)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                        HStack(spacing: 4) {
                            Text(partner.moodEmoji ?? "💕")
                                .font(.caption)
                            Text(partner.moodLabel ?? "Connected")
                                .font(.caption)
                                .foregroundColor(.syngoMuted)
                        }
                    }
                    
                    Spacer()
                    
                    // Unread badge
                    if entry.data.stats.unreadCount > 0 {
                        HStack(spacing: 4) {
                            Image(systemName: "bell.fill")
                                .font(.caption2)
                            Text("\(entry.data.stats.unreadCount)")
                                .font(.caption)
                                .fontWeight(.bold)
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.syngoPrimary)
                        .cornerRadius(12)
                    }
                }
                
                // Action buttons
                HStack(spacing: 16) {
                    QuickActionButton(
                        icon: "heart.fill",
                        label: "Nudge",
                        url: WidgetDeepLink.nudge
                    )
                    
                    QuickActionButton(
                        icon: "checkmark.square.fill",
                        label: "Todos",
                        url: WidgetDeepLink.todos
                    )
                    
                    QuickActionButton(
                        icon: "face.smiling.fill",
                        label: "Mood",
                        url: WidgetDeepLink.mood
                    )
                    
                    QuickActionButton(
                        icon: "star.fill",
                        label: "Favorites",
                        url: WidgetDeepLink.favorites
                    )
                }
            }
            .padding(.horizontal, 4)
        } else {
            EmptyStateView(
                isPaired: entry.data.isPaired,
                isAuthenticated: entry.data.isAuthenticated
            )
        }
    }
}

// MARK: - Preview

#Preview("Quick Actions", as: .systemMedium) {
    QuickActionsWidget()
} timeline: {
    SyngoWidgetEntry(date: .now, data: WidgetDataProvider.shared.getPlaceholderData())
}
