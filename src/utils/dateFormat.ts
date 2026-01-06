/**
 * WhatsApp-style relative time formatting
 *
 * Format rules:
 * - "Just now" (< 1 minute)
 * - "X minutes ago" (< 1 hour)
 * - "X hours ago" (< 24 hours)
 * - "Yesterday, 3:45 PM" (yesterday)
 * - "Mon, 3:45 PM" (this week)
 * - "Jan 5, 3:45 PM" (this year)
 * - "Jan 5, 2025, 3:45 PM" (older)
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Format time in 12-hour format (e.g., "3:45 PM")
 */
function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Check if a date is yesterday relative to reference date
 */
function isYesterday(date: Date, now: Date): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

/**
 * Check if a date is within the last 7 days
 */
function isWithinWeek(date: Date, now: Date): boolean {
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return date > weekAgo;
}

/**
 * Check if a date is in the same year
 */
function isSameYear(date: Date, now: Date): boolean {
  return date.getFullYear() === now.getFullYear();
}

/**
 * Format a timestamp into WhatsApp-style relative time
 * @param timestamp - Unix timestamp in milliseconds or Date object
 * @returns Formatted relative time string
 */
export function formatRelativeTime(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Just now (< 1 minute)
  if (diff < MINUTE) {
    return "Just now";
  }

  // X minutes ago (< 1 hour)
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  // X hours ago (< 24 hours, but same day)
  if (diff < DAY && isSameDay(date, now)) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  // Yesterday
  if (isYesterday(date, now)) {
    return `Yesterday, ${formatTime(date)}`;
  }

  // This week (show day name)
  if (isWithinWeek(date, now)) {
    const dayName = DAYS_OF_WEEK[date.getDay()];
    return `${dayName}, ${formatTime(date)}`;
  }

  // This year (show month and day)
  if (isSameYear(date, now)) {
    const month = MONTHS[date.getMonth()];
    return `${month} ${date.getDate()}, ${formatTime(date)}`;
  }

  // Older (show full date)
  const month = MONTHS[date.getMonth()];
  return `${month} ${date.getDate()}, ${date.getFullYear()}, ${formatTime(
    date
  )}`;
}

/**
 * Format a timestamp into a short relative time (for compact displays)
 * @param timestamp - Unix timestamp in milliseconds or Date object
 * @returns Short formatted relative time string
 */
export function formatShortRelativeTime(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Just now
  if (diff < MINUTE) {
    return "now";
  }

  // Minutes
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes}m`;
  }

  // Hours
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h`;
  }

  // Days (within a week)
  if (diff < 7 * DAY) {
    const days = Math.floor(diff / DAY);
    return `${days}d`;
  }

  // Weeks (within a month)
  if (diff < 30 * DAY) {
    const weeks = Math.floor(diff / (7 * DAY));
    return `${weeks}w`;
  }

  // Months
  const months = Math.floor(diff / (30 * DAY));
  if (months < 12) {
    return `${months}mo`;
  }

  // Years
  const years = Math.floor(months / 12);
  return `${years}y`;
}
