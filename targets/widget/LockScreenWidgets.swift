import SwiftUI
import WidgetKit

// MARK: - Lock Screen Widgets (iOS 16+)

// Partner Mood - Circular accessory
@available(iOS 16.0, *)
struct PartnerMoodAccessory: Widget {
    let kind = "PartnerMoodAccessory"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            PartnerMoodAccessoryView(entry: entry)
        }
        .configurationDisplayName("Partner Mood")
        .description("Partner's mood emoji")
        .supportedFamilies([.accessoryCircular])
    }
}

@available(iOS 16.0, *)
struct PartnerMoodAccessoryView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            
            if entry.data.hasPair {
                VStack(spacing: 2) {
                    Text(entry.data.partner.moodEmoji ?? "😊")
                        .font(.system(size: 22))
                    Text("💕")
                        .font(.system(size: 8))
                }
            } else {
                Image(systemName: "heart.circle.fill")
                    .font(.system(size: 24))
            }
        }
        .widgetURL(URL(string: "syngo:///mood"))
    }
}

// Partner Status - Rectangular accessory
@available(iOS 16.0, *)
struct PartnerStatusAccessory: Widget {
    let kind = "PartnerStatusAccessory"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            PartnerStatusAccessoryView(entry: entry)
        }
        .configurationDisplayName("Partner Status")
        .description("Partner name and mood")
        .supportedFamilies([.accessoryRectangular])
    }
}

@available(iOS 16.0, *)
struct PartnerStatusAccessoryView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if entry.data.hasPair {
            HStack(spacing: 8) {
                Text(entry.data.partner.moodEmoji ?? "😊")
                    .font(.system(size: 20))
                
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 4) {
                        Text(entry.data.partner.name)
                            .font(.system(size: 14, weight: .semibold))
                            .lineLimit(1)
                        Text("💕")
                            .font(.system(size: 10))
                    }
                    
                    if let days = entry.data.stats.daysTogether {
                        Text("\(days) days together")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    } else {
                        Text(moodLabel(for: entry.data.partner.mood))
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    }
                }
            }
        } else {
            HStack(spacing: 6) {
                Image(systemName: "heart.fill")
                    .font(.system(size: 16))
                Text("Open Syngo")
                    .font(.system(size: 12))
            }
        }
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

// Days Together - Inline accessory
@available(iOS 16.0, *)
struct DaysTogetherAccessory: Widget {
    let kind = "DaysTogetherAccessory"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SyngoTimelineProvider()) { entry in
            DaysTogetherAccessoryView(entry: entry)
        }
        .configurationDisplayName("Days Together")
        .description("Show your love journey")
        .supportedFamilies([.accessoryInline])
    }
}

@available(iOS 16.0, *)
struct DaysTogetherAccessoryView: View {
    let entry: SyngoWidgetEntry
    
    var body: some View {
        if entry.data.hasPair {
            if let days = entry.data.stats.daysTogether {
                Label {
                    Text("💕 \(days) days with \(entry.data.partner.name)")
                } icon: {
                    Image(systemName: "heart.fill")
                }
            } else {
                Label {
                    Text("In love with \(entry.data.partner.name)")
                } icon: {
                    Image(systemName: "heart.fill")
                }
            }
        } else {
            Label {
                Text("Open Syngo")
            } icon: {
                Image(systemName: "heart")
            }
        }
    }
}

// MARK: - Previews

@available(iOS 16.0, *)
struct PartnerMoodAccessory_Previews: PreviewProvider {
    static var previews: some View {
        PartnerMoodAccessoryView(entry: SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData))
            .previewContext(WidgetPreviewContext(family: .accessoryCircular))
    }
}

@available(iOS 16.0, *)
struct PartnerStatusAccessory_Previews: PreviewProvider {
    static var previews: some View {
        PartnerStatusAccessoryView(entry: SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData))
            .previewContext(WidgetPreviewContext(family: .accessoryRectangular))
    }
}

@available(iOS 16.0, *)
struct DaysTogetherAccessory_Previews: PreviewProvider {
    static var previews: some View {
        DaysTogetherAccessoryView(entry: SyngoWidgetEntry(date: Date(), data: WidgetDataProvider.shared.defaultData))
            .previewContext(WidgetPreviewContext(family: .accessoryInline))
    }
}
