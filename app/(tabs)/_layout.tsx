import { Tabs } from "expo-router";
import { useTheme } from "tamagui";
import {
  Home,
  CheckSquare,
  Sparkles,
  Smile,
  Settings,
} from "@tamagui/lucide-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bgCard.val,
          borderTopColor: theme.borderColor.val,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8), // respect home indicator
        },
        tabBarActiveTintColor: theme.primary.val,
        tabBarInactiveTintColor: theme.colorMuted.val,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: "Plans",
          tabBarIcon: ({ color, size }) => (
            <CheckSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="moments"
        options={{
          title: "Moments",
          tabBarIcon: ({ color, size }) => (
            <Sparkles size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: "Mood",
          tabBarIcon: ({ color, size }) => <Smile size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      {/* Hidden screens - kept for backwards compatibility but not shown in tab bar */}
      <Tabs.Screen
        name="notification"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
