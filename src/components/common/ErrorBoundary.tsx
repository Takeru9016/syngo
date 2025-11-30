import React, { Component, ReactNode } from "react";
import { YStack, Text, Button } from "tamagui";
import * as Sentry from "@sentry/react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("❌ [ErrorBoundary] Caught error:", error, errorInfo);
    Sentry.captureException(error, {
      extra: errorInfo as any,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$4"
          gap="$4"
          backgroundColor="$bg"
        >
          <Text fontSize={48}>⚠️</Text>
          <Text fontSize="$6" fontWeight="bold" color="$color">
            Something went wrong
          </Text>
          <Text fontSize="$4" color="$muted" textAlign="center">
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <Button onPress={this.handleReset} backgroundColor="$primary" size="$4">
            <Text color="white" fontWeight="600">
              Try Again
            </Text>
          </Button>
        </YStack>
      );
    }

    return this.props.children;
  }
}
