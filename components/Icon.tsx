import * as React from "react";

export type IconKey =
  | "sun" | "moon" | "eye" | "book" | "star" | "clock" | "compass"
  | "feather" | "stillness" | "arrow" | "ritual" | "circle" | "door"
  | "step" | "release" | "journal" | "video" | "rewind" | "paper"
  | "group" | "library" | "mail" | "calendar" | "chevron-down"
  | "chevron-left" | "chevron-right" | "play" | "plus" | "card"
  | "audio" | "check" | "lock" | "shield";

const PATHS: Record<IconKey, React.ReactNode> = {
  sun: <><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" /></>,
  moon: <><path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9c-3 0-5.7-1.5-7.3-3.7" /><path d="M3 12V6" /></>,
  eye: <><circle cx="12" cy="12" r="3" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  star: <path d="M12 2l2 6h6l-5 4 2 7-5-4-5 4 2-7-5-4h6z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M16 8l-4 6-3-2" /></>,
  feather: <><path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6" /></>,
  stillness: <path d="M3 12h6l3-9 3 18 3-9h3" />,
  arrow: <><path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /><path d="M3 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /></>,
  ritual: <><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></>,
  circle: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  door: <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" />,
  step: <><path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /></>,
  release: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></>,
  journal: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></>,
  paper: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
  video: <><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M22 8l-6 4 6 4z" /></>,
  rewind: <path d="M11 19l-9-7 9-7M22 19l-9-7 9-7" />,
  group: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  library: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M9 4v13M13 4v13M17 4v13" /></>,
  mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  "chevron-down": <path d="M6 9l6 6 6-6" />,
  "chevron-left": <path d="M15 18l-6-6 6-6" />,
  "chevron-right": <path d="M9 6l6 6-6 6" />,
  play: <path d="M8 5v14l11-7z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
  audio: <><path d="M11 5l-7 6H1v2h3l7 6V5z" /><path d="M19 12c0-2.21-1.79-4-4-4M19 12c0 2.21-1.79 4-4 4" /></>,
  check: <path d="M5 12l5 5L20 7" />,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  shield: <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />,
};

interface IconProps {
  name: IconKey;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, className, strokeWidth = 1.5 }: IconProps) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "play" || name === "star" || name === "door" || name === "shield" || name === "stillness" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
