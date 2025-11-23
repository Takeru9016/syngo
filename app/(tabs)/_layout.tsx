import { Tabs } from "expo-router";
import { useTheme } from "tamagui";
import {
  Home,
  CheckSquare,
  Heart,
  Sticker,
  Bell,
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
          // Remove fixed height; use padding + safe area instead
          // height: 60,
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
          title: "Todos",
          tabBarIcon: ({ color, size }) => (
            <CheckSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stickers"
        options={{
          title: "Stickers",
          tabBarIcon: ({ color, size }) => (
            <Sticker size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
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
    </Tabs>
  );
}
