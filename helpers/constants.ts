// Centralized app constants

export const TYPE_COLORS: Record<"trigger" | "segment" | "pattern", string> = {
  trigger: "#2196F3", // Blue
  segment: "#673AB7", // Purple
  pattern: "#4CAF50", // Green (pattern-generated segments)
} as const;

export const soundOptions = [
  "bell",
  "gong",
  "beep",
  "complete",
] as const;

export const DEFAULT_SEGMENT_DURATION = 5;

// Visuals
export const TIMER_GRADIENT: string[] = ["#FFA500", "#FF4433"]; // orange to red
export const ACTIVE_DASH_COLOR = "#FFFFFF" as const;

// Time input field visibility thresholds
export const TIME_FIELD_THRESHOLDS = {
  minutes: 60,
  hours: 3600,
} as const;
