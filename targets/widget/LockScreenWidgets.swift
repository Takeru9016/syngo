import SwiftUI
import WidgetKit

// MARK: - Lock Screen Widgets (iOS 16+)
// Note: These widgets use @available on supportedFamilies to handle iOS version compatibility

// MARK: - Partner Mood Accessory Widget (Circular)
// Shows: Mood emoji in a circle

struct PartnerMoodAccessoryWidget: Widget {
    let kind: String = "PartnerMoodAccessoryWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            PartnerMoodAccessoryView(entry: entry)
        }
        .configurationDisplayName("Partner Mood")
        .description("Your partner's mood")
        .supportedFamilies(partnerMoodSupportedFamilies)
    }
    
    private var partnerMoodSupportedFamilies: [WidgetFamily] {
        if #available(iOS 16.0, *) {
            return [.accessoryCircular]
        } else {
            return []
        }
    }
}

struct PartnerMoodAccessoryView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if #available(iOS 16.0, *) {
            if let partner = entry.data.partner, entry.data.isPaired {
                ZStack {
                    AccessoryWidgetBackground()
                    Text(partner.moodEmoji ?? "💕")
                        .font(.system(size: 24))
                }
                .widgetURL(WidgetDeepLink.mood)
            } else {
                ZStack {
                    AccessoryWidgetBackground()
                    Image(systemName: "heart")
                        .font(.system(size: 20))
                }
                .widgetURL(WidgetDeepLink.pair)
            }
        } else {
            EmptyView()
        }
    }
}

// MARK: - Partner Status Accessory Widget (Rectangular)
// Shows: "Partner: 😊 Good" in compact form

struct PartnerStatusAccessoryWidget: Widget {
    let kind: String = "PartnerStatusAccessoryWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            PartnerStatusAccessoryView(entry: entry)
        }
        .configurationDisplayName("Partner Status")
        .description("Partner name and mood")
        .supportedFamilies(partnerStatusSupportedFamilies)
    }
    
    private var partnerStatusSupportedFamilies: [WidgetFamily] {
        if #available(iOS 16.0, *) {
            return [.accessoryRectangular]
        } else {
            return []
        }
    }
}

struct PartnerStatusAccessoryView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if let partner = entry.data.partner, entry.data.isPaired {
            HStack(spacing: 8) {
                Text(partner.moodEmoji ?? "💕")
                    .font(.system(size: 20))
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(partner.name)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .lineLimit(1)
                    Text(partner.moodLabel ?? "Connected")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                Spacer()
            }
            .widgetURL(WidgetDeepLink.home)
        } else {
            HStack(spacing: 8) {
                Image(systemName: "heart.circle")
                    .font(.system(size: 20))
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("Syngo")
                        .font(.headline)
                        .fontWeight(.semibold)
                    Text("Tap to pair")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                Spacer()
            }
            .widgetURL(WidgetDeepLink.pair)
        }
    }
}

// MARK: - Nudge Inline Widget
// Note: Inline widgets are text-only and show above the time

struct NudgeInlineWidget: Widget {
    let kind: String = "NudgeInlineWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            NudgeInlineView(entry: entry)
        }
        .configurationDisplayName("Nudge Inline")
        .description("Quick nudge above the time")
        .supportedFamilies(nudgeInlineSupportedFamilies)
    }
    
    private var nudgeInlineSupportedFamilies: [WidgetFamily] {
        if #available(iOS 16.0, *) {
            return [.accessoryInline]
        } else {
            return []
        }
    }
}

struct NudgeInlineView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if #available(iOS 16.0, *) {
            if let partner = entry.data.partner, entry.data.isPaired {
                ViewThatFits {
                    // Full text
                    Label("💕 Send a nudge to \(partner.name)", systemImage: "heart.fill")
                    // Shorter version if needed
                    Label("\(partner.moodEmoji ?? "💕") \(partner.name)", systemImage: "heart")
                    // Minimal
                    Label(partner.moodEmoji ?? "💕", systemImage: "heart")
                }
                .widgetURL(WidgetDeepLink.nudge)
            } else {
                Label("💕 Syngo", systemImage: "heart")
                    .widgetURL(WidgetDeepLink.home)
            }
        } else {
            EmptyView()
        }
    }
}
