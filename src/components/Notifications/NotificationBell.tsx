import { Text, Stack } from "tamagui";
import { Bell } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";

import { useAppNotifications } from "@/hooks/useAppNotification";
import { triggerLightHaptic } from "@/state/haptics";

type Props = {
  onPress: () => void;
};

export function NotificationBell({ onPress }: Props) {
  const { data: notifications = [] } = useAppNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handlePress = () => {
    triggerLightHaptic();
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Stack position="relative">
        <Stack
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
          justifyContent="center"
        >
          <Bell size={20} color="$color" />
        </Stack>

        {unreadCount > 0 && (
          <Stack
            position="absolute"
            top={-4}
            right={-4}
            minWidth={18}
            height={18}
            borderRadius={9}
            backgroundColor="$primary"
            alignItems="center"
            justifyContent="center"
            paddingHorizontal="$1"
            borderWidth={2}
            borderColor="$bg"
          >
            <Text
              fontFamily="$body"
              fontSize={10}
              fontWeight="700"
              color="white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </Stack>
        )}
      </Stack>
    </Pressable>
  );
}
