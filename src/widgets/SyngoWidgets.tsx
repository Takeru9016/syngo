/**
 * Android Widget Components
 *
 * React Native components that render as native Android widgets.
 * Uses react-native-android-widget's declarative components.
 */

import React from "react";
import {
  FlexWidget,
  TextWidget,
  ImageWidget,
} from "react-native-android-widget";
import type { ColorProp } from "react-native-android-widget";
import { WidgetData } from "@/types/widget-data.types";

// ============================================================================
// Theme Colors (matching Syngo design)
// ============================================================================

const colors = {
  primary: "#6366F1" as ColorProp,
  primaryLight: "#818CF8" as ColorProp,
  background: "#050816" as ColorProp,
  backgroundLight: "#0A0F1C" as ColorProp,
  card: "#111827" as ColorProp,
  text: "#FFFFFF" as ColorProp,
  textMuted: "#9CA3AF" as ColorProp,
  border: "#1F2937" as ColorProp,
};

// ============================================================================
// 1. Partner Status Widget (Small)
// ============================================================================

export function PartnerStatusWidget({ data }: { data: WidgetData }) {
  if (!data.isPaired || !data.partner) {
    return <EmptyStateWidget message="Pair with your partner" />;
  }

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 12,
      }}
      clickAction="OPEN_APP"
      clickActionData={{ screen: "home" }}
    >
      {/* Avatar placeholder */}
      <FlexWidget
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primaryLight,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextWidget
          text={data.partner.name.charAt(0).toUpperCase()}
          style={{
            fontSize: 24,
            color: colors.text,
            fontWeight: "bold",
          }}
        />
      </FlexWidget>

      {/* Mood Emoji */}
      <TextWidget
        text={data.partner.moodEmoji || "💕"}
        style={{
          fontSize: 24,
          marginTop: 8,
        }}
      />

      {/* Partner Name */}
      <TextWidget
        text={data.partner.name}
        style={{
          fontSize: 12,
          color: colors.text,
          marginTop: 4,
        }}
        maxLines={1}
      />
    </FlexWidget>
  );
}

// ============================================================================
// 2. Mood Widget (Small)
// ============================================================================

export function MoodWidget({ data }: { data: WidgetData }) {
  if (!data.isPaired || !data.partner || !data.user) {
    return <EmptyStateWidget message="Set your mood" />;
  }

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 12,
      }}
      clickAction="OPEN_APP"
      clickActionData={{ screen: "mood" }}
    >
      <TextWidget
        text="MOOD"
        style={{
          fontSize: 10,
          color: colors.textMuted,
          letterSpacing: 1,
        }}
      />

      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        {/* Your mood */}
        <FlexWidget style={{ alignItems: "center" }}>
          <TextWidget
            text={data.user.moodEmoji || "😐"}
            style={{ fontSize: 28 }}
          />
          <TextWidget
            text="You"
            style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}
          />
        </FlexWidget>

        {/* Heart divider */}
        <TextWidget text="💕" style={{ fontSize: 14, marginHorizontal: 12 }} />

        {/* Partner's mood */}
        <FlexWidget style={{ alignItems: "center" }}>
          <TextWidget
            text={data.partner.moodEmoji || "😐"}
            style={{ fontSize: 28 }}
          />
          <TextWidget
            text={data.partner.name.substring(0, 6)}
            style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}
            maxLines={1}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

// ============================================================================
// 3. Quick Nudge Widget (Small)
// ============================================================================

export function QuickNudgeWidget({ data }: { data: WidgetData }) {
  if (!data.isPaired || !data.partner) {
    return <EmptyStateWidget message="Pair first" />;
  }

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 12,
      }}
      clickAction="OPEN_APP"
      clickActionData={{ screen: "nudge" }}
    >
      {/* Heart icon */}
      <TextWidget text="💕" style={{ fontSize: 32 }} />

      <TextWidget
        text={`Nudge ${data.partner.name}`}
        style={{
          fontSize: 12,
          color: colors.text,
          fontWeight: "bold",
          marginTop: 8,
        }}
        maxLines={1}
      />

      <TextWidget
        text="Tap to send"
        style={{
          fontSize: 10,
          color: "#ffffffb3" as ColorProp,
          marginTop: 4,
        }}
      />
    </FlexWidget>
  );
}

// ============================================================================
// 7. Quick Actions Widget (Medium)
// ============================================================================

export function QuickActionsWidget({ data }: { data: WidgetData }) {
  if (!data.isPaired || !data.partner) {
    return <EmptyStateWidget message="Pair with your partner" />;
  }

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 12,
      }}
    >
      {/* Header with partner info */}
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <TextWidget
          text={data.partner.moodEmoji || "💕"}
          style={{ fontSize: 20, marginRight: 8 }}
        />
        <FlexWidget style={{ flex: 1 }}>
          <TextWidget
            text={data.partner.name}
            style={{ fontSize: 14, color: colors.text, fontWeight: "bold" }}
            maxLines={1}
          />
          <TextWidget
            text={data.partner.moodLabel || "Connected"}
            style={{ fontSize: 11, color: colors.textMuted }}
          />
        </FlexWidget>

        {data.stats.unreadCount > 0 && (
          <FlexWidget
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <TextWidget
              text={`${data.stats.unreadCount}`}
              style={{ fontSize: 12, color: colors.text, fontWeight: "bold" }}
            />
          </FlexWidget>
        )}
      </FlexWidget>

      {/* Action buttons */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          flex: 1,
        }}
      >
        <ActionButton icon="💕" label="Nudge" screen="nudge" />
        <ActionButton icon="✅" label="Todos" screen="todos" />
        <ActionButton icon="😊" label="Mood" screen="mood" />
        <ActionButton icon="⭐" label="Favorites" screen="favorites" />
      </FlexWidget>
    </FlexWidget>
  );
}

// ============================================================================
// 8. Full Dashboard Widget (Large)
// ============================================================================

export function FullDashboardWidget({ data }: { data: WidgetData }) {
  if (!data.isPaired || !data.partner) {
    return (
      <EmptyStateWidget message="Pair with your partner to see dashboard" />
    );
  }

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
      }}
    >
      {/* Partner header */}
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
        clickAction="OPEN_APP"
        clickActionData={{ screen: "home" }}
      >
        <FlexWidget
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primaryLight,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget
            text={data.partner.name.charAt(0).toUpperCase()}
            style={{ fontSize: 20, color: colors.text, fontWeight: "bold" }}
          />
        </FlexWidget>

        <FlexWidget style={{ flex: 1, marginLeft: 12 }}>
          <TextWidget
            text={data.partner.name}
            style={{ fontSize: 16, color: colors.text, fontWeight: "bold" }}
          />
          <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
            <TextWidget
              text={data.partner.moodEmoji || "💕"}
              style={{ fontSize: 14, marginRight: 4 }}
            />
            <TextWidget
              text={data.partner.moodLabel || "Connected"}
              style={{ fontSize: 12, color: colors.textMuted }}
            />
          </FlexWidget>
        </FlexWidget>

        {data.stats.unreadCount > 0 && (
          <FlexWidget
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <TextWidget
              text={`${data.stats.unreadCount}`}
              style={{ fontSize: 14, color: colors.text, fontWeight: "bold" }}
            />
          </FlexWidget>
        )}
      </FlexWidget>

      {/* Divider */}
      <FlexWidget
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginVertical: 8,
        }}
      />

      {/* Recent notifications */}
      <TextWidget
        text="RECENT UPDATES"
        style={{
          fontSize: 10,
          color: colors.textMuted,
          letterSpacing: 1,
          marginBottom: 8,
        }}
      />

      {data.recentNotifications.length > 0 ?
        <FlexWidget style={{ flex: 1 }}>
          {data.recentNotifications.slice(0, 2).map((notif) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}
        </FlexWidget>
      : <FlexWidget
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget
            text="No recent updates"
            style={{ fontSize: 12, color: colors.textMuted }}
          />
        </FlexWidget>
      }

      {/* Quick actions */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: 12,
        }}
      >
        <ActionButton icon="💕" label="Nudge" screen="nudge" />
        <ActionButton icon="✅" label="Todos" screen="todos" />
        <ActionButton icon="😊" label="Mood" screen="mood" />
        <ActionButton icon="⭐" label="Favorites" screen="favorites" />
      </FlexWidget>
    </FlexWidget>
  );
}

// ============================================================================
// 10. Couple Overview Widget (Large)
// ============================================================================

export function CoupleOverviewWidget({ data }: { data: WidgetData }) {
  if (!data.isPaired || !data.partner || !data.user) {
    return <EmptyStateWidget message="Connect with your partner" />;
  }

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
      }}
    >
      {/* Title */}
      <TextWidget
        text="TOGETHER"
        style={{
          fontSize: 10,
          color: colors.textMuted,
          letterSpacing: 1,
          textAlign: "center",
        }}
      />

      {/* Couple avatars */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        {/* You */}
        <FlexWidget style={{ alignItems: "center" }}>
          <FlexWidget
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primaryLight,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextWidget
              text={data.user.name.charAt(0).toUpperCase()}
              style={{ fontSize: 22, color: colors.text, fontWeight: "bold" }}
            />
          </FlexWidget>
          <TextWidget
            text={data.user.moodEmoji || "😐"}
            style={{ fontSize: 20, marginTop: 4 }}
          />
          <TextWidget
            text="You"
            style={{ fontSize: 11, color: colors.text, marginTop: 2 }}
          />
        </FlexWidget>

        {/* Heart connector */}
        <FlexWidget style={{ alignItems: "center", marginHorizontal: 16 }}>
          <TextWidget text="💕" style={{ fontSize: 24 }} />
          <TextWidget
            text="Connected"
            style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}
          />
        </FlexWidget>

        {/* Partner */}
        <FlexWidget style={{ alignItems: "center" }}>
          <FlexWidget
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primaryLight,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextWidget
              text={data.partner.name.charAt(0).toUpperCase()}
              style={{ fontSize: 22, color: colors.text, fontWeight: "bold" }}
            />
          </FlexWidget>
          <TextWidget
            text={data.partner.moodEmoji || "😐"}
            style={{ fontSize: 20, marginTop: 4 }}
          />
          <TextWidget
            text={data.partner.name}
            style={{ fontSize: 11, color: colors.text, marginTop: 2 }}
            maxLines={1}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Stats row */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: 16,
          paddingVertical: 12,
          backgroundColor: colors.card,
          borderRadius: 12,
        }}
      >
        <StatBadge value={data.stats.updatesToday} label="Today" />
        <StatBadge value={data.stats.unreadCount} label="Unread" />
        <StatBadge value={data.stats.stickersThisWeek} label="Stickers" />
        <StatBadge value={data.stats.pendingTodos} label="Todos" />
      </FlexWidget>

      {/* Nudge button */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 12,
          paddingVertical: 12,
          backgroundColor: colors.primary,
          borderRadius: 12,
        }}
        clickAction="OPEN_APP"
        clickActionData={{ screen: "nudge" }}
      >
        <TextWidget text="💕" style={{ fontSize: 16, marginRight: 8 }} />
        <TextWidget
          text="Send a Nudge"
          style={{ fontSize: 14, color: colors.text, fontWeight: "bold" }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function EmptyStateWidget({ message }: { message: string }) {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
      }}
      clickAction="OPEN_APP"
      clickActionData={{ screen: "pair" }}
    >
      <TextWidget text="💕" style={{ fontSize: 24 }} />
      <TextWidget
        text={message}
        style={{
          fontSize: 12,
          color: colors.text,
          marginTop: 8,
          textAlign: "center",
        }}
      />
      <TextWidget
        text="Tap to open Syngo"
        style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}
      />
    </FlexWidget>
  );
}

function ActionButton({
  icon,
  label,
  screen,
}: {
  icon: string;
  label: string;
  screen: string;
}) {
  return (
    <FlexWidget
      style={{
        alignItems: "center",
        padding: 8,
      }}
      clickAction="OPEN_APP"
      clickActionData={{ screen }}
    >
      <FlexWidget
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.card,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextWidget text={icon} style={{ fontSize: 16 }} />
      </FlexWidget>
      <TextWidget
        text={label}
        style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}
      />
    </FlexWidget>
  );
}

function StatBadge({ value, label }: { value: number; label: string }) {
  return (
    <FlexWidget style={{ alignItems: "center" }}>
      <TextWidget
        text={`${value}`}
        style={{ fontSize: 16, color: colors.text, fontWeight: "bold" }}
      />
      <TextWidget
        text={label}
        style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}
      />
    </FlexWidget>
  );
}

function NotificationItem({
  notification,
}: {
  notification: WidgetData["recentNotifications"][0];
}) {
  const typeIcons: Record<string, string> = {
    nudge: "💕",
    sticker_sent: "😊",
    todo_reminder: "✅",
    favorite_added: "⭐",
    mood_updated: "🙂",
  };

  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 10,
        marginBottom: 6,
      }}
      clickAction="OPEN_APP"
      clickActionData={{ screen: "notifications" }}
    >
      <TextWidget
        text={typeIcons[notification.type] || "🔔"}
        style={{ fontSize: 16, marginRight: 10 }}
      />
      <FlexWidget style={{ flex: 1 }}>
        <TextWidget
          text={notification.title}
          style={{ fontSize: 12, color: colors.text, fontWeight: "600" }}
          maxLines={1}
        />
        <TextWidget
          text={notification.body}
          style={{ fontSize: 11, color: colors.textMuted }}
          maxLines={1}
        />
      </FlexWidget>
      {!notification.isRead && (
        <FlexWidget
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.primary,
          }}
        />
      )}
    </FlexWidget>
  );
}
