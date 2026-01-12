import SwiftUI

// MARK: - Theme Colors

extension Color {
    static let syngoAccent = Color("AccentColor")
    static let syngoBackground = Color("WidgetBackground")
    
    // Fallback colors
    static let syngoPrimary = Color(red: 99/255, green: 102/255, blue: 241/255) // #6366F1
    static let syngoPrimaryLight = Color(red: 129/255, green: 140/255, blue: 248/255) // #818CF8
    static let syngoMuted = Color.gray.opacity(0.6)
    static let syngoCardBg = Color(UIColor.secondarySystemBackground)
}

// MARK: - Avatar View

struct AvatarView: View {
    let avatarUrl: String?
    let name: String
    let size: CGFloat
    
    var body: some View {
        ZStack {
            Circle()
                .fill(Color.syngoPrimary.opacity(0.2))
            
            if let urlString = avatarUrl, let url = URL(string: urlString) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure(_), .empty:
                        InitialsView(name: name, size: size)
                    @unknown default:
                        InitialsView(name: name, size: size)
                    }
                }
            } else {
                InitialsView(name: name, size: size)
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(
            Circle()
                .stroke(Color.syngoPrimary, lineWidth: 2)
        )
    }
}

struct InitialsView: View {
    let name: String
    let size: CGFloat
    
    var initials: String {
        name.prefix(1).uppercased()
    }
    
    var body: some View {
        Text(initials)
            .font(.system(size: size * 0.4, weight: .bold))
            .foregroundColor(.syngoPrimary)
    }
}

// MARK: - Mood Badge View

struct MoodBadgeView: View {
    let emoji: String?
    let label: String?
    let showLabel: Bool
    
    init(emoji: String?, label: String? = nil, showLabel: Bool = false) {
        self.emoji = emoji
        self.label = label
        self.showLabel = showLabel
    }
    
    var body: some View {
        if showLabel {
            VStack(spacing: 2) {
                Text(emoji ?? "💕")
                    .font(.system(size: 20))
                if let label = label {
                    Text(label)
                        .font(.caption2)
                        .foregroundColor(.syngoMuted)
                }
            }
        } else {
            Text(emoji ?? "💕")
                .font(.system(size: 24))
        }
    }
}

// MARK: - Stats Badge View

struct StatBadgeView: View {
    let value: Int
    let label: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 2) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.caption2)
                    .foregroundColor(.syngoPrimary)
                Text("\(value)")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.primary)
            }
            Text(label)
                .font(.caption2)
                .foregroundColor(.syngoMuted)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color.syngoCardBg)
        .cornerRadius(8)
    }
}

// MARK: - Notification Preview View

struct NotificationPreviewView: View {
    let notification: WidgetNotificationData
    
    var typeIcon: String {
        switch notification.type {
        case "nudge": return "heart.fill"
        case "sticker_sent": return "face.smiling"
        case "todo_reminder", "todo_created": return "checkmark.square"
        case "favorite_added": return "star.fill"
        case "mood_updated": return "face.smiling.inverse"
        default: return "bell.fill"
        }
    }
    
    var body: some View {
        HStack(spacing: 8) {
            // Icon
            ZStack {
                Circle()
                    .fill(Color.syngoPrimary.opacity(0.2))
                    .frame(width: 32, height: 32)
                Image(systemName: typeIcon)
                    .font(.system(size: 14))
                    .foregroundColor(.syngoPrimary)
            }
            
            // Content
            VStack(alignment: .leading, spacing: 2) {
                Text(notification.title)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                    .lineLimit(1)
                Text(notification.body)
                    .font(.caption2)
                    .foregroundColor(.syngoMuted)
                    .lineLimit(1)
            }
            
            Spacer()
            
            // Unread indicator
            if !notification.isRead {
                Circle()
                    .fill(Color.syngoPrimary)
                    .frame(width: 6, height: 6)
            }
        }
        .padding(8)
        .background(Color.syngoCardBg)
        .cornerRadius(10)
    }
}

// MARK: - Empty State View

struct EmptyStateView: View {
    let isPaired: Bool
    let isAuthenticated: Bool
    
    var title: String {
        if !isAuthenticated {
            return "Sign in to Syngo"
        } else if !isPaired {
            return "Pair with your partner"
        }
        return "No data yet"
    }
    
    var subtitle: String {
        if !isAuthenticated {
            return "Open the app to get started"
        } else if !isPaired {
            return "Connect with your partner"
        }
        return "Open Syngo to sync"
    }
    
    var icon: String {
        if !isAuthenticated {
            return "person.circle"
        } else if !isPaired {
            return "heart.circle"
        }
        return "arrow.clockwise"
    }
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 28))
                .foregroundColor(.syngoPrimary)
            Text(title)
                .font(.headline)
                .foregroundColor(.primary)
            Text(subtitle)
                .font(.caption)
                .foregroundColor(.syngoMuted)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

// MARK: - Quick Action Button

struct QuickActionButton: View {
    let icon: String
    let label: String
    let url: URL
    
    var body: some View {
        Link(destination: url) {
            VStack(spacing: 4) {
                ZStack {
                    Circle()
                        .fill(Color.syngoPrimary.opacity(0.2))
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .font(.system(size: 16))
                        .foregroundColor(.syngoPrimary)
                }
                Text(label)
                    .font(.caption2)
                    .foregroundColor(.syngoMuted)
            }
        }
    }
}
