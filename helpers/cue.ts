import { Cue } from "@/assets/data/mock";

/**
 * Normalize a cue with respect to total session duration.
 * - startTime clamped to [0, total]
 * - segment duration rounded and min 1 second
 */
export function normalizeCue(cue: Cue, total: number): Cue {
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const round = (v: number) => Math.round(v);

  const normalizedStart = clamp(round(cue.startTime || 0), 0, total);

  if (cue.type === "segment") {
    const duration = Math.max(1, round((cue as any).duration || 0));
    return { ...(cue as any), startTime: normalizedStart, duration } as Cue;
  }
  return { ...cue, startTime: normalizedStart };
}
