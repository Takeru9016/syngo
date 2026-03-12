import Svg, { Circle, Path } from "react-native-svg";
import type { MoodLevel } from "@/types";

type MoodIconProps = {
  level: MoodLevel;
  size?: number;
};

/**
 * MoodIcon — Renders a colorful SVG emoji face for the given mood level.
 * Uses react-native-svg for consistent rendering across all devices.
 */
export function MoodIcon({ level, size = 24 }: MoodIconProps) {
  switch (level) {
    case 1:
      return <SadFace size={size} />;
    case 2:
      return <DownFace size={size} />;
    case 3:
      return <NeutralFace size={size} />;
    case 4:
      return <HappyFace size={size} />;
    case 5:
      return <GreatFace size={size} />;
    default:
      return <NeutralFace size={size} />;
  }
}

// Level 1 — 😢 Struggling (crying face)
function SadFace({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36">
      {/* Face */}
      <Circle cx="18" cy="18" r="18" fill="#FDCB58" />
      {/* Eyes */}
      <Path
        d="M11.5 16.5C11.5 17.88 10.88 19 10 19C9.12 19 8.5 17.88 8.5 16.5C8.5 15.12 9.12 14 10 14C10.88 14 11.5 15.12 11.5 16.5Z"
        fill="#664500"
      />
      <Path
        d="M27.5 16.5C27.5 17.88 26.88 19 26 19C25.12 19 24.5 17.88 24.5 16.5C24.5 15.12 25.12 14 26 14C26.88 14 27.5 15.12 27.5 16.5Z"
        fill="#664500"
      />
      {/* Sad mouth */}
      <Path
        d="M23.485 27.879C23.474 27.835 22.34 23.5 18 23.5C13.66 23.5 12.526 27.835 12.515 27.879C12.462 28.092 12.559 28.313 12.747 28.424C12.935 28.535 13.174 28.508 13.333 28.357C13.347 28.344 14.78 27 18 27C21.22 27 22.653 28.344 22.667 28.357C22.753 28.44 22.866 28.482 22.979 28.482C23.049 28.482 23.119 28.465 23.184 28.43C23.374 28.322 23.474 28.098 23.485 27.879Z"
        fill="#664500"
      />
      {/* Tear */}
      <Path
        d="M16 20C16 20 14.5 23 13 23C11.567 23 10.5 21.933 10.5 20.5C10.5 19.067 13 16 13 16C13 16 16 18.567 16 20Z"
        fill="#5DADEC"
      />
    </Svg>
  );
}

// Level 2 — 😔 Down (slightly sad face)
function DownFace({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36">
      {/* Face */}
      <Circle cx="18" cy="18" r="18" fill="#FDCB58" />
      {/* Eyes */}
      <Path
        d="M11.5 17C11.5 18.38 10.88 19.5 10 19.5C9.12 19.5 8.5 18.38 8.5 17C8.5 15.62 9.12 14.5 10 14.5C10.88 14.5 11.5 15.62 11.5 17Z"
        fill="#664500"
      />
      <Path
        d="M27.5 17C27.5 18.38 26.88 19.5 26 19.5C25.12 19.5 24.5 18.38 24.5 17C24.5 15.62 25.12 14.5 26 14.5C26.88 14.5 27.5 15.62 27.5 17Z"
        fill="#664500"
      />
      {/* Slight frown */}
      <Path
        d="M13 26C13 26 15 24 18 24C21 24 23 26 23 26"
        stroke="#664500"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sad eyebrows */}
      <Path
        d="M7 13C7 13 9 11 12 12"
        stroke="#664500"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M29 13C29 13 27 11 24 12"
        stroke="#664500"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

// Level 3 — 😐 Okay (neutral face)
function NeutralFace({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36">
      {/* Face */}
      <Circle cx="18" cy="18" r="18" fill="#FDCB58" />
      {/* Eyes */}
      <Path
        d="M11.5 17C11.5 18.38 10.88 19.5 10 19.5C9.12 19.5 8.5 18.38 8.5 17C8.5 15.62 9.12 14.5 10 14.5C10.88 14.5 11.5 15.62 11.5 17Z"
        fill="#664500"
      />
      <Path
        d="M27.5 17C27.5 18.38 26.88 19.5 26 19.5C25.12 19.5 24.5 18.38 24.5 17C24.5 15.62 25.12 14.5 26 14.5C26.88 14.5 27.5 15.62 27.5 17Z"
        fill="#664500"
      />
      {/* Straight mouth */}
      <Path
        d="M13 25H23"
        stroke="#664500"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

// Level 4 — 🙂 Good (smiling face)
function HappyFace({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36">
      {/* Face */}
      <Circle cx="18" cy="18" r="18" fill="#FDCB58" />
      {/* Eyes */}
      <Path
        d="M11.5 17C11.5 18.38 10.88 19.5 10 19.5C9.12 19.5 8.5 18.38 8.5 17C8.5 15.62 9.12 14.5 10 14.5C10.88 14.5 11.5 15.62 11.5 17Z"
        fill="#664500"
      />
      <Path
        d="M27.5 17C27.5 18.38 26.88 19.5 26 19.5C25.12 19.5 24.5 18.38 24.5 17C24.5 15.62 25.12 14.5 26 14.5C26.88 14.5 27.5 15.62 27.5 17Z"
        fill="#664500"
      />
      {/* Smile */}
      <Path
        d="M18 28C21.3137 28 24 25.7614 24 25C24 25 21.3137 27 18 27C14.6863 27 12 25 12 25C12 25.7614 14.6863 28 18 28Z"
        fill="#664500"
      />
    </Svg>
  );
}

// Level 5 — 😊 Great (big smile with blush)
function GreatFace({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36">
      {/* Face */}
      <Circle cx="18" cy="18" r="18" fill="#FDCB58" />
      {/* Blush cheeks */}
      <Circle cx="7.5" cy="22" r="3.5" fill="#F4900C" opacity={0.35} />
      <Circle cx="28.5" cy="22" r="3.5" fill="#F4900C" opacity={0.35} />
      {/* Happy eyes (closed/squinting) */}
      <Path
        d="M7.5 16C7.5 16 8.5 14 10.5 14C12.5 14 13.5 16 13.5 16"
        stroke="#664500"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M22.5 16C22.5 16 23.5 14 25.5 14C27.5 14 28.5 16 28.5 16"
        stroke="#664500"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Big smile */}
      <Path
        d="M18 29C22.4183 29 26 26.0899 26 24.5C26 24.5 22.4183 27 18 27C13.5817 27 10 24.5 10 24.5C10 26.0899 13.5817 29 18 29Z"
        fill="#664500"
      />
    </Svg>
  );
}
