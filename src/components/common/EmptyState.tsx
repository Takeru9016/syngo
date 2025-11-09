import { YStack, Text, Button } from "tamagui";
import { ComponentType } from "react";

interface EmptyStateProps {
  icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$6"
      gap="$4"
    >
      <Icon size={64} color="$gray10" />
      <YStack gap="$2" alignItems="center">
        <Text fontSize="$6" fontWeight="bold" textAlign="center">
          {title}
        </Text>
        {description && (
          <Text fontSize="$4" color="$gray11" textAlign="center">
            {description}
          </Text>
        )}
      </YStack>
      {actionLabel && onAction && (
        <Button size="$4" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </YStack>
  );
}
