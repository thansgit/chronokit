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
 * Pads a number to 2 digits with leading zero.
 */
export function pad2(n: number): string {
  return Math.trunc(Math.abs(n)).toString().padStart(2, "0");
}

/**
 * Formats seconds into a clock string:
 *  - < 60: S
 *  - < 3600: M:SS
 *  - >= 3600: H:MM:SS
 */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  if (s >= 3600) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${pad2(m)}:${pad2(sec)}`;
  }
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${pad2(sec)}`;
  }
  return `${s}`;
}

/**
 * Formats a default session title using duration, e.g., "Session 30m10s".
 */
export function formatSessionTitle(totalSeconds: number): string {
  return `Timer ${formatDurationShort(totalSeconds)}`;
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
