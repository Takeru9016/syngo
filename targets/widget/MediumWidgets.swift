import SwiftUI
import WidgetKit

// MARK: - Quick Actions Widget (Medium 4×2)

struct QuickActionsWidget: Widget {
    let kind = "QuickActionsWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            QuickActionsWidgetView(entry: entry)
        }
        .configurationDisplayName("Quick Actions")
        .description("3 lovely action buttons")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

struct QuickActionsWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        ZStack {
            // Romantic dark background
            LinearGradient(
                colors: [
                    Color(red: 0.10, green: 0.05, blue: 0.12),
                    Color(red: 0.06, green: 0.03, blue: 0.08)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            if !entry.data.isAuthenticated {
                NotAuthenticatedView()
            } else if !entry.data.hasPair {
                NoPairView()
            } else {
                VStack(spacing: 12) {
                    // Header
                    HStack {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 10))
                            .foregroundColor(.romanticPink)
                        Text("Quick Actions")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white.opacity(0.9))
                        Spacer()
                        if let days = entry.data.stats.daysTogether {
                            Text("💕 \(days) days")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.softRose)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 12)
                    
                    // Action buttons
                    HStack(spacing: 16) {
                        // Mood
                        Link(destination: URL(string: "syngo:///mood")!) {
                            RomanticActionButton(
                                icon: "face.smiling.fill",
                                label: "Mood",
                                gradient: [Color.warmCoral, Color.romanticPink]
                            )
                        }
                        
                        // Todos
                        Link(destination: URL(string: "syngo:///todos")!) {
                            RomanticActionButton(
                                icon: "checkmark.circle.fill",
                                label: "Todos",
                                badgeCount: entry.data.stats.pendingTodos,
                                gradient: [Color(red: 0.4, green: 0.8, blue: 0.6), Color(red: 0.3, green: 0.7, blue: 0.5)]
                            )
                        }
                        
                        // Moments/Favorites
                        Link(destination: URL(string: "syngo:///moments")!) {
                            RomanticActionButton(
                                icon: "star.fill",
                                label: "Moments",
                                gradient: [Color.mauve, Color(red: 0.6, green: 0.4, blue: 0.7)]
                            )
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 12)
                }
            }
        }
    }
}

struct RomanticActionButton: View {
    let icon: String
    let label: String
    var badgeCount: Int = 0
    let gradient: [Color]
    
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                // Glow effect
                RoundedRectangle(cornerRadius: 14)
                    .fill(
                        LinearGradient(
                            colors: gradient,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 52, height: 52)
                    .blur(radius: 8)
                    .opacity(0.4)
                
                // Button background
                RoundedRectangle(cornerRadius: 14)
                    .fill(
                        LinearGradient(
                            colors: gradient,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 52, height: 52)
                
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundColor(.white)
                
                // Badge
                if badgeCount > 0 {
                    Text("\(min(badgeCount, 99))")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(Color.red)
                        .clipShape(Capsule())
                        .offset(x: 18, y: -18)
                }
            }
            
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.white.opacity(0.8))
        }
    }
}

// MARK: - Couple Card Widget (Medium 4×2) - NEW!

struct CoupleCardWidget: Widget {
    let kind = "CoupleCardWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            CoupleCardWidgetView(entry: entry)
        }
        .configurationDisplayName("Couple Card")
        .description("Your love at a glance")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

struct CoupleCardWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        ZStack {
            // Beautiful gradient background
            LinearGradient(
                colors: [
                    Color(red: 0.75, green: 0.35, blue: 0.5),
                    Color(red: 0.55, green: 0.25, blue: 0.45),
                    Color(red: 0.25, green: 0.12, blue: 0.25)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            if !entry.data.isAuthenticated {
                NotAuthenticatedView()
            } else if !entry.data.hasPair {
                NoPairView()
            } else {
                HStack(spacing: 20) {
                    // Couple avatars with moods
                    HStack(spacing: 0) {
                        // You
                        VStack(spacing: 4) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.2))
                                    .frame(width: 54, height: 54)
                                AvatarView(name: entry.data.user.name, size: 48)
                            }
                            Text(entry.data.user.moodEmoji ?? "😊")
                                .font(.system(size: 18))
                        }
                        
                        // Floating heart
                        Image(systemName: "heart.fill")
                            .font(.system(size: 16))
                            .foregroundColor(.white)
                            .offset(x: -8)
                        
                        // Partner
                        VStack(spacing: 4) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.2))
                                    .frame(width: 54, height: 54)
                                AvatarView(name: entry.data.partner.name, size: 48)
                            }
                            Text(entry.data.partner.moodEmoji ?? "😊")
                                .font(.system(size: 18))
                        }
                        .offset(x: -16)
                    }
                    
                    // Stats
                    VStack(alignment: .leading, spacing: 8) {
                        // Days together
                        if let days = entry.data.stats.daysTogether {
                            HStack(spacing: 4) {
                                Text("💕")
                                    .font(.system(size: 12))
                                Text("\(days) days together")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }
                        
                        // Names
                        Text("\(entry.data.user.name) & \(entry.data.partner.name)")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                            .lineLimit(1)
                        
                        // Quick stats
                        HStack(spacing: 12) {
                            HStack(spacing: 4) {
                                Image(systemName: "checkmark.circle")
                                    .font(.system(size: 10))
                                Text("\(entry.data.stats.pendingTodos)")
                                    .font(.system(size: 11, weight: .medium))
                            }
                            .foregroundColor(.white.opacity(0.7))
                            
                            HStack(spacing: 4) {
                                Image(systemName: "bell")
                                    .font(.system(size: 10))
                                Text("\(entry.data.stats.unreadNotifications)")
                                    .font(.system(size: 11, weight: .medium))
                            }
                            .foregroundColor(.white.opacity(0.7))
                        }
                    }
                    
                    Spacer()
                }
                .padding()
            }
        }
        .widgetURL(URL(string: "syngo:///"))
    }
}

// MARK: - Previews

struct QuickActionsWidget_Previews: PreviewProvider {
    static var previews: some View {
        QuickActionsWidgetView(entry: SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}

struct CoupleCardWidget_Previews: PreviewProvider {
    static var previews: some View {
        CoupleCardWidgetView(entry: SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}
