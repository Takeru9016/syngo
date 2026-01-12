import SwiftUI
import WidgetKit

// MARK: - 1. Partner Status Widget (Small)
// Shows: Partner avatar + mood emoji + name

struct PartnerStatusWidget: Widget {
    let kind: String = "PartnerStatusWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            PartnerStatusWidgetView(entry: entry)
                .containerBackground(Color.syngoBackground, for: .widget)
        }
        .configurationDisplayName("Partner Status")
        .description("See your partner's mood at a glance")
        .supportedFamilies([.systemSmall])
    }
}

struct PartnerStatusWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if let partner = entry.data.partner, entry.data.isPaired {
            Link(destination: WidgetDeepLink.home) {
                VStack(spacing: 8) {
                    // Partner Avatar
                    AvatarView(
                        avatarUrl: partner.avatarUrl,
                        name: partner.name,
                        size: 56
                    )
                    
                    // Mood Emoji
                    Text(partner.moodEmoji ?? "💕")
                        .font(.system(size: 28))
                    
                    // Partner Name
                    Text(partner.name)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        } else {
            EmptyStateView(
                isPaired: entry.data.isPaired,
                isAuthenticated: entry.data.isAuthenticated
            )
        }
    }
}

// MARK: - 2. Mood Widget (Small)
// Shows: Both moods side-by-side (You + Partner)

struct MoodWidget: Widget {
    let kind: String = "MoodWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            MoodWidgetView(entry: entry)
                .containerBackground(Color.syngoBackground, for: .widget)
        }
        .configurationDisplayName("Mood")
        .description("How are you both feeling")
        .supportedFamilies([.systemSmall])
    }
}

struct MoodWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if entry.data.isPaired, let partner = entry.data.partner, let user = entry.data.user {
            Link(destination: WidgetDeepLink.mood) {
                VStack(spacing: 12) {
                    Text("Mood")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundColor(.syngoMuted)
                        .textCase(.uppercase)
                    
                    HStack(spacing: 16) {
                        // Your mood
                        VStack(spacing: 4) {
                            Text(user.moodEmoji ?? "😐")
                                .font(.system(size: 32))
                            Text("You")
                                .font(.caption2)
                                .foregroundColor(.syngoMuted)
                        }
                        
                        // Divider heart
                        Text("💕")
                            .font(.system(size: 16))
                        
                        // Partner's mood
                        VStack(spacing: 4) {
                            Text(partner.moodEmoji ?? "😐")
                                .font(.system(size: 32))
                            Text(partner.name.prefix(6) + (partner.name.count > 6 ? "." : ""))
                                .font(.caption2)
                                .foregroundColor(.syngoMuted)
                        }
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        } else {
            EmptyStateView(
                isPaired: entry.data.isPaired,
                isAuthenticated: entry.data.isAuthenticated
            )
        }
    }
}

// MARK: - 3. Quick Nudge Widget (Small)
// Shows: Heart icon, one-tap nudge button

struct QuickNudgeWidget: Widget {
    let kind: String = "QuickNudgeWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            QuickNudgeWidgetView(entry: entry)
                .containerBackground(Color.syngoBackground, for: .widget)
        }
        .configurationDisplayName("Quick Nudge")
        .description("Send a nudge with one tap")
        .supportedFamilies([.systemSmall])
    }
}

struct QuickNudgeWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if entry.data.isPaired, let partner = entry.data.partner {
            Link(destination: WidgetDeepLink.nudge) {
                VStack(spacing: 12) {
                    // Animated heart
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [Color.syngoPrimary, Color.syngoPrimaryLight],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 64, height: 64)
                        
                        Image(systemName: "heart.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.white)
                    }
                    
                    Text("Nudge \(partner.name)")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                        .lineLimit(1)
                    
                    Text("Tap to send 💕")
                        .font(.caption2)
                        .foregroundColor(.syngoMuted)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        } else {
            EmptyStateView(
                isPaired: entry.data.isPaired,
                isAuthenticated: entry.data.isAuthenticated
            )
        }
    }
}

// MARK: - Preview

#Preview("Partner Status", as: .systemSmall) {
    PartnerStatusWidget()
} timeline: {
    SyngoWidgetEntry(date: .now, data: WidgetDataProvider.shared.getPlaceholderData())
}

#Preview("Mood", as: .systemSmall) {
    MoodWidget()
} timeline: {
    SyngoWidgetEntry(date: .now, data: WidgetDataProvider.shared.getPlaceholderData())
}

#Preview("Quick Nudge", as: .systemSmall) {
    QuickNudgeWidget()
} timeline: {
    SyngoWidgetEntry(date: .now, data: WidgetDataProvider.shared.getPlaceholderData())
}
