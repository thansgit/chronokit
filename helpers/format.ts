// General formatting helpers

/**
 * Formats a duration (in seconds) into a compact string like:
 *  - 1h2m3s
 *  - 30m10s
 *  - 10s
 */
export function formatDurationShort(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (sec > 0 || parts.length === 0) parts.push(`${sec}s`);
  return parts.join("");
}

/**
 * Formats a default session title using duration, e.g., "Session 30m10s".
 */
export function formatSessionTitle(totalSeconds: number): string {
  return `Session ${formatDurationShort(totalSeconds)}`;
}

/**
 * Formats a duration into a human-readable spaced string like:
 *  - "1h 2m 3s"
 *  - "30m 10s"
 *  - "10s"
 * Omits zero units except when all are zero (returns "0s").
 */
export function formatDurationSpaced(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (sec > 0 || parts.length === 0) parts.push(`${sec}s`);
  return parts.join(" ");
}
