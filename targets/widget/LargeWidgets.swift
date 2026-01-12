import SwiftUI
import WidgetKit

// MARK: - 8. Full Dashboard Widget (Large)
// Shows: Partner card + notifications + quick actions

struct FullDashboardWidget: Widget {
    let kind: String = "FullDashboardWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            FullDashboardWidgetView(entry: entry)
                .containerBackground(Color.syngoBackground, for: .widget)
        }
        .configurationDisplayName("Dashboard")
        .description("Full partner dashboard with notifications")
        .supportedFamilies([.systemLarge])
    }
}

struct FullDashboardWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if entry.data.isPaired, let partner = entry.data.partner {
            VStack(spacing: 12) {
                // Partner Card Header
                HStack(spacing: 12) {
                    AvatarView(
                        avatarUrl: partner.avatarUrl,
                        name: partner.name,
                        size: 48
                    )
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(partner.name)
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        HStack(spacing: 6) {
                            Text(partner.moodEmoji ?? "💕")
                            Text(partner.moodLabel ?? "Connected")
                                .font(.subheadline)
                                .foregroundColor(.syngoMuted)
                        }
                    }
                    
                    Spacer()
                    
                    // Stats badge
                    VStack(alignment: .trailing, spacing: 4) {
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
                        
                        Text(formatLastUpdated(entry.data.lastUpdated))
                            .font(.caption2)
                            .foregroundColor(.syngoMuted)
                    }
                }
                
                Divider()
                
                // Recent Notifications
                VStack(alignment: .leading, spacing: 8) {
                    Text("Recent Updates")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.syngoMuted)
                        .textCase(.uppercase)
                    
                    if entry.data.recentNotifications.isEmpty {
                        HStack {
                            Spacer()
                            VStack(spacing: 4) {
                                Image(systemName: "bell.slash")
                                    .font(.title3)
                                    .foregroundColor(.syngoMuted)
                                Text("No recent updates")
                                    .font(.caption)
                                    .foregroundColor(.syngoMuted)
                            }
                            .padding(.vertical, 8)
                            Spacer()
                        }
                    } else {
                        ForEach(entry.data.recentNotifications.prefix(2), id: \.id) { notification in
                            Link(destination: WidgetDeepLink.notifications) {
                                NotificationPreviewView(notification: notification)
                            }
                        }
                    }
                }
                
                Spacer()
                
                // Quick Actions Row
                HStack(spacing: 16) {
                    Spacer()
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
                    Spacer()
                }
            }
        } else {
            EmptyStateView(
                isPaired: entry.data.isPaired,
                isAuthenticated: entry.data.isAuthenticated
            )
        }
    }
    
    private func formatLastUpdated(_ timestamp: Double) -> String {
        let date = Date(timeIntervalSince1970: timestamp / 1000)
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - 10. Couple Overview Widget (Large)
// Shows: Both partners side-by-side + stats + latest activity

struct CoupleOverviewWidget: Widget {
    let kind: String = "CoupleOverviewWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            CoupleOverviewWidgetView(entry: entry)
                .containerBackground(Color.syngoBackground, for: .widget)
        }
        .configurationDisplayName("Couple Overview")
        .description("You and your partner at a glance")
        .supportedFamilies([.systemLarge])
    }
}

struct CoupleOverviewWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if entry.data.isPaired, let partner = entry.data.partner, let user = entry.data.user {
            VStack(spacing: 16) {
                // Title
                Text("Together")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.syngoMuted)
                    .textCase(.uppercase)
                
                // Couple avatars side by side
                HStack(spacing: 24) {
                    // You
                    Link(destination: WidgetDeepLink.mood) {
                        VStack(spacing: 8) {
                            AvatarView(
                                avatarUrl: user.avatarUrl,
                                name: user.name,
                                size: 56
                            )
                            Text(user.moodEmoji ?? "😐")
                                .font(.system(size: 24))
                            Text("You")
                                .font(.caption)
                                .foregroundColor(.primary)
                            Text(user.moodLabel ?? "No mood")
                                .font(.caption2)
                                .foregroundColor(.syngoMuted)
                        }
                    }
                    
                    // Heart connector
                    VStack {
                        Text("💕")
                            .font(.system(size: 28))
                        Text("Connected")
                            .font(.caption2)
                            .foregroundColor(.syngoMuted)
                    }
                    
                    // Partner
                    Link(destination: WidgetDeepLink.home) {
                        VStack(spacing: 8) {
                            AvatarView(
                                avatarUrl: partner.avatarUrl,
                                name: partner.name,
                                size: 56
                            )
                            Text(partner.moodEmoji ?? "😐")
                                .font(.system(size: 24))
                            Text(partner.name)
                                .font(.caption)
                                .foregroundColor(.primary)
                                .lineLimit(1)
                            Text(partner.moodLabel ?? "No mood")
                                .font(.caption2)
                                .foregroundColor(.syngoMuted)
                        }
                    }
                }
                
                Divider()
                
                // Stats Row
                HStack(spacing: 16) {
                    StatBadgeView(
                        value: entry.data.stats.updatesToday,
                        label: "Today",
                        icon: "bell.fill"
                    )
                    StatBadgeView(
                        value: entry.data.stats.unreadCount,
                        label: "Unread",
                        icon: "envelope.fill"
                    )
                    StatBadgeView(
                        value: entry.data.stats.stickersThisWeek,
                        label: "Stickers",
                        icon: "face.smiling.fill"
                    )
                    StatBadgeView(
                        value: entry.data.stats.pendingTodos,
                        label: "Todos",
                        icon: "checkmark.square.fill"
                    )
                }
                
                Spacer()
                
                // Latest notification preview
                if let notification = entry.data.latestNotification {
                    Link(destination: WidgetDeepLink.notifications) {
                        NotificationPreviewView(notification: notification)
                    }
                }
                
                // Nudge button
                Link(destination: WidgetDeepLink.nudge) {
                    HStack {
                        Image(systemName: "heart.fill")
                            .font(.subheadline)
                        Text("Send a Nudge")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(
                        LinearGradient(
                            colors: [Color.syngoPrimary, Color.syngoPrimaryLight],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
                }
            }
        } else {
            EmptyStateView(
                isPaired: entry.data.isPaired,
                isAuthenticated: entry.data.isAuthenticated
            )
        }
    }
}

// MARK: - Previews

#Preview("Full Dashboard", as: .systemLarge) {
    FullDashboardWidget()
} timeline: {
    SyngoWidgetEntry(date: .now, data: WidgetDataProvider.shared.getPlaceholderData())
}

#Preview("Couple Overview", as: .systemLarge) {
    CoupleOverviewWidget()
} timeline: {
    SyngoWidgetEntry(date: .now, data: WidgetDataProvider.shared.getPlaceholderData())
}
