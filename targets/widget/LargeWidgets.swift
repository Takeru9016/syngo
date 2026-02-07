import SwiftUI
import WidgetKit

// MARK: - Full Dashboard Widget (Large 4×4)

struct DashboardWidget: Widget {
    let kind = "DashboardWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            DashboardWidgetView(entry: entry)
        }
        .configurationDisplayName("Love Dashboard")
        .description("Your complete couple overview")
        .supportedFamilies([.systemLarge])
        .contentMarginsDisabled()
    }
}

struct DashboardWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        ZStack {
            // Deep romantic background
            LinearGradient(
                colors: [
                    Color(red: 0.12, green: 0.06, blue: 0.14),
                    Color(red: 0.06, green: 0.03, blue: 0.08)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            
            if !entry.data.isAuthenticated {
                NotAuthenticatedView()
            } else if !entry.data.hasPair {
                NoPairView()
            } else {
                VStack(spacing: 14) {
                    // Partner Card with romantic styling
                    HStack(spacing: 14) {
                        // Avatar with glow
                        ZStack {
                            Circle()
                                .fill(Color.romanticPink.opacity(0.3))
                                .frame(width: 64, height: 64)
                                .blur(radius: 10)
                            AvatarView(name: entry.data.partner.name, size: 56)
                        }
                        
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 6) {
                                Text(entry.data.partner.name)
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(.white)
                                Image(systemName: "heart.fill")
                                    .font(.system(size: 10))
                                    .foregroundColor(.romanticPink)
                            }
                            
                            HStack(spacing: 6) {
                                Text(entry.data.partner.moodEmoji ?? "😊")
                                    .font(.system(size: 14))
                                Text(moodLabel(for: entry.data.partner.mood))
                                    .font(.system(size: 12))
                                    .foregroundColor(.syngoMuted)
                            }
                        }
                        
                        Spacer()
                        
                        // Days together badge
                        if let days = entry.data.stats.daysTogether {
                            VStack(spacing: 2) {
                                Text("\(days)")
                                    .font(.system(size: 22, weight: .bold))
                                    .foregroundColor(.softRose)
                                Text("days")
                                    .font(.system(size: 10))
                                    .foregroundColor(.syngoMuted)
                                Text("💕")
                                    .font(.system(size: 12))
                            }
                        }
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.syngoCard)
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Color.romanticPink.opacity(0.2), lineWidth: 1)
                            )
                    )
                    
                    // Stats Row
                    HStack(spacing: 12) {
                        RomanticStatCard(
                            icon: "checkmark.circle",
                            value: "\(entry.data.stats.pendingTodos)",
                            label: "Pending",
                            color: .green
                        )
                        
                        RomanticStatCard(
                            icon: "bell",
                            value: "\(entry.data.stats.unreadNotifications)",
                            label: "Unread",
                            color: .warmCoral
                        )
                    }
                    
                    // Recent Activity
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Image(systemName: "heart.text.square")
                                .font(.system(size: 12))
                                .foregroundColor(.romanticPink)
                            Text("Recent Activity")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.syngoMuted)
                                .textCase(.uppercase)
                        }
                        
                        if entry.data.recentActivities.isEmpty {
                            HStack {
                                Spacer()
                                Text("No recent activity yet 💕")
                                    .font(.system(size: 12))
                                    .foregroundColor(.syngoMuted)
                                Spacer()
                            }
                            .padding(.vertical, 8)
                        } else {
                            ForEach(entry.data.recentActivities.prefix(3), id: \.text) { activity in
                                HStack(spacing: 8) {
                                    Text(activity.icon)
                                        .font(.system(size: 14))
                                    Text(activity.text)
                                        .font(.system(size: 12))
                                        .foregroundColor(.white)
                                        .lineLimit(1)
                                    Spacer()
                                    Text(activity.timeAgo)
                                        .font(.system(size: 10))
                                        .foregroundColor(.syngoMuted)
                                }
                            }
                        }
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.syngoCard)
                    )
                    
                    // Quick Actions
                    HStack(spacing: 10) {
                        Link(destination: URL(string: "syngo:///mood")!) {
                            HStack {
                                Image(systemName: "face.smiling")
                                Text("Log Mood")
                            }
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(
                                LinearGradient(
                                    colors: [.romanticPink, .mauve],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                        }
                        
                        Link(destination: URL(string: "syngo:///todos")!) {
                            HStack {
                                Image(systemName: "checkmark.circle")
                                Text("Todos")
                            }
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.syngoCard)
                            .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
        }
        .widgetURL(URL(string: "syngo:///"))
    }
    
    func moodLabel(for mood: Int?) -> String {
        switch mood {
        case 1: return "Not great"
        case 2: return "Meh"
        case 3: return "Okay"
        case 4: return "Good"
        case 5: return "Great!"
        default: return "Feeling loved"
        }
    }
}

struct RomanticStatCard: View {
    let icon: String
    let value: String
    let label: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.2))
                    .frame(width: 36, height: 36)
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(color)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                Text(label)
                    .font(.system(size: 10))
                    .foregroundColor(.syngoMuted)
            }
            
            Spacer()
        }
        .padding()
        .background(Color.syngoCard)
        .cornerRadius(12)
    }
}

// MARK: - Couple Overview Widget (Large 4×4)

struct CoupleOverviewWidget: Widget {
    let kind = "CoupleOverviewWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            CoupleOverviewWidgetView(entry: entry)
        }
        .configurationDisplayName("Couple Overview")
        .description("Both of you, side by side")
        .supportedFamilies([.systemLarge])
        .contentMarginsDisabled()
    }
}

struct CoupleOverviewWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        ZStack {
            // Beautiful gradient
            LinearGradient(
                colors: [
                    Color(red: 0.65, green: 0.30, blue: 0.45),
                    Color(red: 0.35, green: 0.18, blue: 0.35),
                    Color(red: 0.12, green: 0.06, blue: 0.14)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            
            if !entry.data.isAuthenticated {
                NotAuthenticatedView()
            } else if !entry.data.hasPair {
                NoPairView()
            } else {
                VStack(spacing: 16) {
                    // Couple Header - Side by Side
                    HStack(spacing: 0) {
                        Spacer()
                        
                        // You
                        VStack(spacing: 10) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.15))
                                    .frame(width: 72, height: 72)
                                AvatarView(name: entry.data.user.name, size: 64)
                            }
                            Text(entry.data.user.moodEmoji ?? "😊")
                                .font(.system(size: 28))
                            Text("You")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.white.opacity(0.8))
                        }
                        
                        Spacer()
                        
                        // Heart Center with Days
                        VStack(spacing: 4) {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 28))
                                .foregroundColor(.white)
                            
                            if let days = entry.data.stats.daysTogether {
                                Text("\(days)")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.white)
                                Text("days")
                                    .font(.system(size: 10))
                                    .foregroundColor(.white.opacity(0.7))
                            }
                        }
                        .padding(.horizontal, 12)
                        
                        Spacer()
                        
                        // Partner
                        VStack(spacing: 10) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.15))
                                    .frame(width: 72, height: 72)
                                AvatarView(name: entry.data.partner.name, size: 64)
                            }
                            Text(entry.data.partner.moodEmoji ?? "😊")
                                .font(.system(size: 28))
                            Text(entry.data.partner.name)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.white.opacity(0.8))
                                .lineLimit(1)
                        }
                        
                        Spacer()
                    }
                    .padding(.top, 8)
                    
                    // Stats Pills
                    HStack(spacing: 12) {
                        RomanticStatPill(icon: "checkmark.circle", value: entry.data.stats.pendingTodos, label: "Todos")
                        RomanticStatPill(icon: "bell", value: entry.data.stats.unreadNotifications, label: "Notifs")
                    }
                    
                    // Activity Feed
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("💕")
                                .font(.system(size: 12))
                            Text("Latest Activity")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.white.opacity(0.7))
                                .textCase(.uppercase)
                        }
                        
                        if entry.data.recentActivities.isEmpty {
                            Text("Start creating memories together!")
                                .font(.system(size: 12))
                                .foregroundColor(.white.opacity(0.6))
                                .frame(maxWidth: .infinity, alignment: .center)
                                .padding(.vertical, 8)
                        } else {
                            ForEach(entry.data.recentActivities.prefix(4), id: \.text) { activity in
                                HStack(spacing: 8) {
                                    Text(activity.icon)
                                        .font(.system(size: 12))
                                    Text(activity.text)
                                        .font(.system(size: 11))
                                        .foregroundColor(.white)
                                        .lineLimit(1)
                                    Spacer()
                                    Text(activity.timeAgo)
                                        .font(.system(size: 9))
                                        .foregroundColor(.white.opacity(0.5))
                                }
                            }
                        }
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.black.opacity(0.2))
                    )
                    
                    Spacer()
                }
                .padding()
            }
        }
        .widgetURL(URL(string: "syngo:///"))
    }
}

struct RomanticStatPill: View {
    let icon: String
    let value: Int
    let label: String
    
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(.white.opacity(0.8))
            Text("\(value)")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.7))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(
            Capsule()
                .fill(Color.white.opacity(0.15))
        )
    }
}

// MARK: - Previews

struct DashboardWidget_Previews: PreviewProvider {
    static var previews: some View {
        DashboardWidgetView(entry: SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData))
            .previewContext(WidgetPreviewContext(family: .systemLarge))
    }
}

struct CoupleOverviewWidget_Previews: PreviewProvider {
    static var previews: some View {
        CoupleOverviewWidgetView(entry: SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData))
            .previewContext(WidgetPreviewContext(family: .systemLarge))
    }
}
