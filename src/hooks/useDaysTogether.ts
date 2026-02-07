import { usePairingStore } from "@/store/pairing";
import { differenceInDays, format } from "date-fns";
import { useMemo } from "react";

type DaysTogetherResult = {
  days: number;
  label: string;
  formattedDate: string | null;
  isLoading: boolean;
};

/**
 * Hook to calculate and return the number of days a couple has been together
 */
export function useDaysTogether(): DaysTogetherResult {
  const { pairCreatedAt, isPaired, isLoading } = usePairingStore();

  return useMemo(() => {
    if (!isPaired || !pairCreatedAt) {
      return {
        days: 0,
        label: "Not paired yet",
        formattedDate: null,
        isLoading,
      };
    }

    const startDate = new Date(pairCreatedAt);
    const now = new Date();
    const days = differenceInDays(now, startDate);
    const formattedDate = format(startDate, "MMMM d, yyyy");

    // Create a nice label based on days
    let label: string;
    if (days === 0) {
      label = "First day together! 💕";
    } else if (days === 1) {
      label = "1 day together";
    } else if (days < 7) {
      label = `${days} days together`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      label = weeks === 1 ? "1 week together" : `${weeks} weeks together`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      label = months === 1 ? "1 month together" : `${months} months together`;
    } else {
      const years = Math.floor(days / 365);
      const remainingMonths = Math.floor((days % 365) / 30);
      if (remainingMonths > 0) {
        label = `${years}y ${remainingMonths}m together`;
      } else {
        label = years === 1 ? "1 year together" : `${years} years together`;
      }
    }

    return {
      days,
      label,
      formattedDate,
      isLoading,
    };
  }, [pairCreatedAt, isPaired, isLoading]);
}
