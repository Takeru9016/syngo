import { useEffect, useMemo, useState } from "react";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function Countdown({ expiresAt }: { expiresAt?: number | null }) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { label, expired } = useMemo(() => {
    if (!expiresAt) return { label: "--:--", expired: false };
    const delta = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const m = Math.floor(delta / 60).toString().padStart(2, "0");
    const s = (delta % 60).toString().padStart(2, "0");
    return { label: `${m}:${s}`, expired: delta === 0 };
  }, [expiresAt, now]);

  return (
    <Text style={styles.label}>
      Code expires in{" "}
      <Text style={[styles.value, expired && styles.expired]}>{label}</Text>
    </Text>
  );
}

const styles = StyleSheet.create((theme) => ({
  label: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: theme.typography.size.sm,
  },
  value: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  expired: {
    color: theme.colors.warning,
  },
}));
