import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0f0e1a" },
        headerTintColor: "#EDEAFB",
        tabBarStyle: { backgroundColor: "#1b1930", borderTopColor: "#1b1930" },
        tabBarActiveTintColor: "#7C5CFC",
        tabBarInactiveTintColor: "#B7B6C3",
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="todos" options={{ title: "Todos" }} />
      <Tabs.Screen name="favorites" options={{ title: "Favorites" }} />
      <Tabs.Screen name="stickers" options={{ title: "Stickers" }} />
      <Tabs.Screen name="notification" options={{ title: "Notification" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
