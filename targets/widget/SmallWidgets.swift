import SwiftUI
import WidgetKit

// MARK: - Partner Status Widget (Small 2×2)

struct PartnerStatusWidget: Widget {
    let kind = "PartnerStatusWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            PartnerStatusWidgetView(entry: entry)
        }
        .configurationDisplayName("Partner Status")
        .description("See your partner's mood with love")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct PartnerStatusWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        ZStack {
            // Romantic gradient background
            LinearGradient(
                colors: [
                    Color(red: 0.15, green: 0.05, blue: 0.12),
                    Color(red: 0.08, green: 0.03, blue: 0.10)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Subtle heart pattern overlay
            GeometryReader { geo in
                ForEach(0..<3, id: \.self) { i in
                    Image(systemName: "heart.fill")
                        .font(.system(size: 20))
                        .foregroundColor(Color.romanticPink.opacity(0.08))
                        .offset(
                            x: CGFloat(i * 50) - 20,
                            y: CGFloat(i % 2 == 0 ? 20 : geo.size.height - 40)
                        )
                }
            }
            
            if !entry.data.isAuthenticated {
                NotAuthenticatedView()
            } else if !entry.data.hasPair {
                NoPairView()
            } else {
                VStack(spacing: 10) {
                    // Partner avatar with glow
                    ZStack {
                        Circle()
                            .fill(Color.romanticPink.opacity(0.3))
                            .frame(width: 60, height: 60)
                            .blur(radius: 10)
                        
                        AvatarView(name: entry.data.partner.name, size: 52)
                    }
                    
                    // Mood with heart accent
                    HStack(spacing: 4) {
                        Text(entry.data.partner.moodEmoji ?? "😊")
                            .font(.system(size: 22))
                        Image(systemName: "heart.fill")
                            .font(.system(size: 8))
                            .foregroundColor(.romanticPink)
                    }
                    
                    // Partner name
                    Text(entry.data.partner.name)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    
                    // Days together if available
                    if let days = entry.data.stats.daysTogether {
                        Text("💕 \(days) days")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.softRose)
                    }
                }
                .padding()
            }
        }
        .widgetURL(URL(string: "syngo:///"))
    }
}

// MARK: - Mood Widget (Small 2×2)

struct MoodWidget: Widget {
    let kind = "MoodWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            MoodWidgetView(entry: entry)
        }
        .configurationDisplayName("Our Moods")
        .description("See both moods together")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct MoodWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        ZStack {
            // Split romantic gradient
            HStack(spacing: 0) {
                LinearGradient(
                    colors: [Color(red: 0.12, green: 0.06, blue: 0.10), Color(red: 0.08, green: 0.04, blue: 0.08)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                LinearGradient(
                    colors: [Color(red: 0.08, green: 0.04, blue: 0.08), Color(red: 0.15, green: 0.06, blue: 0.12)],
                    startPoint: .top,
                    endPoint: .bottom
                )
            }
            
            if !entry.data.isAuthenticated {
                NotAuthenticatedView()
            } else if !entry.data.hasPair {
                NoPairView()
            } else {
                VStack(spacing: 8) {
                    // Header with heart
                    HStack(spacing: 4) {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 10))
                            .foregroundColor(.romanticPink)
                        Text("Our Moods")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.white.opacity(0.9))
                        Image(systemName: "heart.fill")
                            .font(.system(size: 10))
                            .foregroundColor(.romanticPink)
                    }
                    
                    // Moods side by side
                    HStack(spacing: 20) {
                        // You
                        VStack(spacing: 6) {
                            ZStack {
                                Circle()
                                    .fill(Color.warmCoral.opacity(0.2))
                                    .frame(width: 44, height: 44)
                                Text(entry.data.user.moodEmoji ?? "😊")
                                    .font(.system(size: 26))
                            }
                            Text("You")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.syngoMuted)
                        }
                        
                        // Heart connection
                        VStack(spacing: 2) {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.romanticPink)
                            Text("💕")
                                .font(.system(size: 10))
                        }
                        
                        // Partner
                        VStack(spacing: 6) {
                            ZStack {
                                Circle()
                                    .fill(Color.mauve.opacity(0.2))
                                    .frame(width: 44, height: 44)
                                Text(entry.data.partner.moodEmoji ?? "❓")
                                    .font(.system(size: 26))
                            }
                            Text(entry.data.partner.name)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.syngoMuted)
                                .lineLimit(1)
                        }
                    }
                    
                    // Connection status
                    Text("Connected with love")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(.softRose.opacity(0.8))
                }
                .padding()
            }
        }
        .widgetURL(URL(string: "syngo:///mood"))
    }
}

// MARK: - Days Together Widget (Small 2×2) - NEW!

struct DaysTogetherWidget: Widget {
    let kind = "DaysTogetherWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            DaysTogetherWidgetView(entry: entry)
        }
        .configurationDisplayName("Days Together")
        .description("Celebrate your love journey")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct DaysTogetherWidgetView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        ZStack {
            // Beautiful romantic gradient
            LinearGradient(
                colors: [
                    Color(red: 0.85, green: 0.35, blue: 0.5),
                    Color(red: 0.6, green: 0.25, blue: 0.55),
                    Color(red: 0.35, green: 0.15, blue: 0.4)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Sparkle overlay
            GeometryReader { geo in
                ForEach(0..<5, id: \.self) { i in
                    Image(systemName: "sparkle")
                        .font(.system(size: CGFloat.random(in: 6...12)))
                        .foregroundColor(.white.opacity(Double.random(in: 0.2...0.5)))
                        .offset(
                            x: CGFloat.random(in: 0...geo.size.width),
                            y: CGFloat.random(in: 0...geo.size.height)
                        )
                }
            }
            
            if !entry.data.isAuthenticated {
                NotAuthenticatedView()
            } else if !entry.data.hasPair {
                NoPairView()
            } else {
                VStack(spacing: 8) {
                    // Heart icon
                    Image(systemName: "heart.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.white)
                    
                    // Days count
                    if let days = entry.data.stats.daysTogether {
                        Text("\(days)")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                        
                        Text("days of love")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.9))
                    } else {
                        Text("∞")
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text("forever love")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.9))
                    }
                    
                    // Couple names
                    Text("\(entry.data.user.name) & \(entry.data.partner.name)")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                        .lineLimit(1)
                }
                .padding()
            }
        }
        .widgetURL(URL(string: "syngo:///"))
    }
}

// MARK: - Placeholder Views

struct NotAuthenticatedView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "heart.circle")
                .font(.system(size: 32))
                .foregroundColor(.romanticPink.opacity(0.6))
            Text("Sign in to Syngo")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.syngoMuted)
        }
    }
}

struct NoPairView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "heart.text.square")
                .font(.system(size: 32))
                .foregroundColor(.romanticPink.opacity(0.6))
            Text("Pair with your love")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.syngoMuted)
        }
    }
}

// MARK: - Previews

struct PartnerStatusWidget_Previews: PreviewProvider {
    static var previews: some View {
        PartnerStatusWidgetView(entry: SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}

struct MoodWidget_Previews: PreviewProvider {
    static var previews: some View {
        MoodWidgetView(entry: SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}

struct DaysTogetherWidget_Previews: PreviewProvider {
    static var previews: some View {
        DaysTogetherWidgetView(entry: SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
