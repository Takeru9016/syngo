import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NudgeService } from "@/services/nudge/nudge.service";
import { useProfileStore } from "@/store/profile";
import { triggerSuccessHaptic } from "@/state/haptics";

/**
 * Hook for sending nudges with rate limiting and cooldown tracking
 */
export function useNudge() {
    const profile = useProfileStore((s) => s.profile);
    const partnerProfile = useProfileStore((s) => s.partnerProfile);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    // Check if user can send a nudge
    const { data: canSendNudge = false, refetch: refetchCanSend } = useQuery({
        queryKey: ["canSendNudge", profile?.uid, profile?.pairId],
        queryFn: async () => {
            if (!profile?.uid || !profile?.pairId) return false;
            return await NudgeService.canSendNudge(profile.uid, profile.pairId);
        },
        enabled: !!profile?.uid && !!profile?.pairId,
        refetchInterval: 10000, // Check every 10 seconds
    });

    // Get cooldown remaining
    useEffect(() => {
        if (!profile?.uid || !profile?.pairId) return;

        const updateCooldown = async () => {
            const remaining = await NudgeService.getCooldownRemaining(
                profile.uid,
                profile.pairId!
            );
            setCooldownRemaining(remaining);
        };

        updateCooldown();
        const interval = setInterval(updateCooldown, 1000); // Update every second

        return () => clearInterval(interval);
    }, [profile?.uid, profile?.pairId, canSendNudge]);

    // Send nudge mutation
    const sendNudgeMutation = useMutation({
        mutationFn: async () => {
            await NudgeService.sendNudge();
        },
        onSuccess: () => {
            triggerSuccessHaptic();
            refetchCanSend();
        },
        onError: (error: Error) => {
            console.error("Failed to send nudge:", error);
        },
    });

    // Format cooldown time as MM:SS
    const formatCooldown = (ms: number): string => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return {
        sendNudge: sendNudgeMutation.mutate,
        isLoading: sendNudgeMutation.isPending,
        isError: sendNudgeMutation.isError,
        error: sendNudgeMutation.error,
        canSendNudge: canSendNudge && !!partnerProfile,
        cooldownRemaining,
        cooldownFormatted: formatCooldown(cooldownRemaining),
        hasPartner: !!partnerProfile,
    };
}
