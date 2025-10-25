import { useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  YStack,
  XStack,
  Stack,
  Text,
  Button,
  Separator,
  Switch,
  ScrollView,
} from 'tamagui';

import { CodeInput, Countdown } from '@/components';
import { usePairingStore } from '@/state/pairing';
import { redeemCode, shareCode } from '@/services/pairing.mock';

export default function PairScreen() {
  const { status, pairId, myCode, expiresAt, error, setStatus, setPairId, setCode, setError } =
    usePairingStore();
  const [input, setInput] = useState<string>('');
  const [secure, setSecure] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    if (!myCode || !expiresAt) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === 'paired' && pairId) {
      router.replace('/(tabs)');
    }
  }, [status, pairId]);

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const { code, expiresAt } = await shareCode();
      setCode(code, expiresAt);
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (myCode) {
      await Clipboard.setStringAsync(myCode);
    }
  };

  const handleShare = async () => {
    if (!myCode) return;
    await Share.share({ message: `My Notify code: ${myCode}` });
  };

  const codeExpired = useMemo(() => {
    return !!expiresAt && Date.now() > expiresAt;
  }, [expiresAt]);

  const handleRedeem = async () => {
    if (!input || input.replace(/\D/g, '').length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    setBusy(true);
    setStatus('pairing');
    const res = await redeemCode(input);
    if (res.ok) {
      setPairId(res.pairId);
      setStatus('paired');
    } else {
      setStatus('error');
      if (res.reason === 'invalid') setError('Invalid code. Check and try again.');
      if (res.reason === 'expired') setError('Code expired. Ask partner to share a new one.');
      if (res.reason === 'already_paired') setError('This code is already used.');
      if (res.reason === 'rate_limited') setError('Too many attempts. Try again in a minute.');
    }
    setBusy(false);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$bg">
      <YStack flex={1} padding="$4" paddingTop="$6" gap="$3">
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between" marginBottom="$1">
          <Text color="$color" fontSize={24} fontWeight="900" lineHeight={28} flex={1}>
            Pair with your partner
          </Text>
          <Button unstyled onPress={() => router.replace('/(tabs)')}>
            <Text color="$primary" fontSize={15} fontWeight="600">
              Next
            </Text>
          </Button>
        </XStack>

        <Text color="$muted" fontSize={14} marginBottom="$2" lineHeight={20}>
          Pair and start sending cute reminders, stickers, and notes.
        </Text>

        {/* Share Code Card */}
        <Stack backgroundColor="#e9d7ff" borderRadius="$7" padding="$4" gap="$3">
          {/* Title + Badge */}
          <XStack alignItems="flex-start" justifyContent="space-between" gap="$2">
            <Text color="$color" fontSize={18} fontWeight="900" flex={1} lineHeight={22}>
              I want to invite my partner
            </Text>
            <XStack
              backgroundColor="$background"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$4"
              paddingVertical={4}
              paddingHorizontal={8}
              alignItems="center"
              justifyContent="center"
            >
              <Text color="$muted" fontSize={12}>
                Tap to copy
              </Text>
            </XStack>
          </XStack>

          {/* Code Display */}
          <XStack alignItems="center" justifyContent="center" paddingVertical="$2">
            <Text color="$color" fontSize={36} fontWeight="900" letterSpacing={4}>
              {myCode ?? '------'}
            </Text>
          </XStack>

          {/* Copy + Share Buttons */}
          <XStack gap="$3">
            <Button
              flex={1}
              backgroundColor="$primary"
              borderRadius="$6"
              height={44}
              onPress={handleCopy}
              disabled={busy || codeExpired}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="white" fontWeight="700" fontSize={15}>
                Copy
              </Text>
            </Button>
            <Button
              flex={1}
              backgroundColor="transparent"
              borderWidth={2}
              borderColor="$primary"
              borderRadius="$6"
              height={44}
              onPress={handleShare}
              disabled={busy || codeExpired}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text color="$primary" fontWeight="700" fontSize={15}>
                Share
              </Text>
            </Button>
          </XStack>

          {/* Secure Connection Row */}
          <XStack
            backgroundColor="rgba(255,255,255,0.5)"
            borderRadius="$5"
            padding="$3"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text color="$color" fontSize={14} fontWeight="600">
              Secure Connection
            </Text>
            <Switch
              size="$3"
              checked={secure}
              onCheckedChange={(v) => setSecure(!!v)}
              backgroundColor={secure ? '$primary' : '$borderColor'}
            >
              <Switch.Thumb backgroundColor="white" />
            </Switch>
          </XStack>

          {/* Countdown Row */}
          <XStack
            backgroundColor="rgba(255,255,255,0.3)"
            borderRadius="$5"
            padding="$3"
            alignItems="center"
            justifyContent="space-between"
          >
            <Countdown expiresAt={expiresAt} />
            <Button
              chromeless
              onPress={handleGenerate}
              disabled={busy}
              pressStyle={{ opacity: 0.6 }}
            >
              <Text color="$primary" fontWeight="700" fontSize={14}>
                Regenerate
              </Text>
            </Button>
          </XStack>
        </Stack>

        {/* Divider "or" */}
        <XStack alignItems="center" justifyContent="center" marginVertical="$2">
          <Separator flex={1} borderColor="$borderColor" />
          <Stack
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$borderColor"
            alignItems="center"
            justifyContent="center"
            marginHorizontal="$3"
          >
            <Text color="$muted" fontSize={13}>
              or
            </Text>
          </Stack>
          <Separator flex={1} borderColor="$borderColor" />
        </XStack>

        {/* Enter Code Card */}
        <Stack backgroundColor="#ffd0c8" borderRadius="$7" padding="$4" gap="$3" marginBottom="$4">
          <Text color="$color" fontSize={18} fontWeight="900" lineHeight={22}>
            I have a code
          </Text>
          <Text color="$muted" fontSize={14}>
            Enter your partner's code
          </Text>

          <CodeInput length={6} group={3} value={input} onChange={setInput} error={error} />

          {error ? (
            <Stack backgroundColor="rgba(255,255,255,0.7)" borderRadius="$4" padding="$2">
              <Text color="#d32f2f" fontSize={13} fontWeight="600">
                {error}
              </Text>
            </Stack>
          ) : null}

          <Button
            backgroundColor="$primary"
            borderRadius="$6"
            height={44}
            onPress={handleRedeem}
            disabled={busy}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="white" fontWeight="700" fontSize={15}>
              Pair now
            </Text>
          </Button>
        </Stack>
      </YStack>
    </ScrollView>
  );
}