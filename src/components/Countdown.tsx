import { useEffect, useMemo, useState } from 'react';
import { Text } from 'tamagui';

export default function Countdown({ expiresAt }: { expiresAt?: number }) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const label = useMemo(() => {
    if (!expiresAt) return '--:--';
    const delta = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const m = Math.floor(delta / 60)
      .toString()
      .padStart(2, '0');
    const s = (delta % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [expiresAt, now]);

  return (
    <Text color="$primary" fontWeight="700">
      Code expires in {label}
    </Text>
  );
}