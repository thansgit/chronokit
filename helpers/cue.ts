import { Cue } from "@/types";

/**
 * Normalize a cue with respect to total session duration.
 * - startTime clamped to [0, total]
 * - if duration present: rounded and min 1 second
 */
export function normalizeCue(cue: Cue, total: number): Cue {
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const round = (v: number) => Math.round(v);

  const normalizedStart = clamp(round(cue.startTime || 0), 0, total);

  if (cue.duration && cue.duration > 0) {
    const duration = Math.max(1, round(cue.duration));
    return { ...cue, startTime: normalizedStart, duration };
  }
  // Instant trigger (no duration)
  const { duration, ...rest } = cue as any;
  return { ...rest, startTime: normalizedStart } as Cue;
}
