// Pure utilities for mapping touch positions to angles and times
// Coordinate system assumptions:
// - Input points are in the same coordinate space as the ring center (cx, cy)
// - Angle origin is at 12 o'clock (upwards)
// - Angles increase clockwise

export function angleFromPoint(
  cx: number,
  cy: number,
  x: number,
  y: number
): number {
  // Translate to center
  const dx = x - cx;
  const dy = y - cy;
  // Math.atan2 returns angle from +x axis, counterclockwise
  // We want 0° at 12 o'clock and clockwise increase.
  // Standard atan2(dy, dx): 0 rad at +x (to the right), CCW positive
  // Convert so that:
  //  - up (0, -1) => 0°
  //  - right (1, 0) => 90°
  //  - down (0, 1) => 180°
  //  - left (-1, 0) => 270°
  const rad = Math.atan2(dy, dx); // -pi..pi, 0 at +x
  let deg = (rad * 180) / Math.PI; // -180..180, 0 at +x
  // Shift so that 0 is at 12 o'clock: rotate by +90° (so +x -> 90°, up -> 0°)
  // Keep clockwise positive without inversion: this yields
  // up=0, right=90, down=180, left=270 as desired
  deg = deg + 90;
  // Normalize to [0, 360)
  deg = ((deg % 360) + 360) % 360;
  return deg;
}

export function angleFromTime(seconds: number, total: number): number {
  const clampedTotal = Math.max(0, total || 0);
  const t = Math.min(Math.max(0, seconds || 0), clampedTotal);
  if (clampedTotal === 0) return 0;
  const fraction = t / clampedTotal; // 0..1
  const angle = (fraction * 360) % 360; // 0..360)
  return angle;
}

export function timeFromAngle(
  angle: number,
  total: number,
  snapSeconds = 1
): number {
  const clampedTotal = Math.max(0, Math.floor(total || 0));
  // Normalize angle to [0, 360) but treat exact full turns (e.g., 360, -360)
  // as 360° to map to `total` instead of 0.
  const normAngle = ((angle % 360) + 360) % 360;
  const isFullTurn = normAngle === 0 && Math.abs(angle) > 0;
  const effectiveAngle = isFullTurn ? 360 : normAngle;
  const raw = (effectiveAngle / 360) * clampedTotal;
  const snapped = snapSeconds > 0 ? Math.round(raw / snapSeconds) * snapSeconds : raw;
  // Clamp into [0, total]
  const clamped = Math.min(clampedTotal, Math.max(0, Math.round(snapped)));
  return clamped;
}
