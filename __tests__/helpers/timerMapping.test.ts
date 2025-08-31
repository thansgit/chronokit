import { angleFromPoint, angleFromTime, timeFromAngle } from '@/helpers/timerMapping';

describe('helpers/timerMapping', () => {
  describe('angleFromPoint', () => {
    const cx = 100, cy = 100;

    test('12 o\'clock is 0°', () => {
      expect(angleFromPoint(cx, cy, cx, cy - 50)).toBeCloseTo(0, 5);
    });

    test('3 o\'clock is 90°', () => {
      expect(angleFromPoint(cx, cy, cx + 50, cy)).toBeCloseTo(90, 5);
    });

    test('6 o\'clock is 180°', () => {
      expect(angleFromPoint(cx, cy, cx, cy + 50)).toBeCloseTo(180, 5);
    });

    test('9 o\'clock is 270°', () => {
      expect(angleFromPoint(cx, cy, cx - 50, cy)).toBeCloseTo(270, 5);
    });
  });

  describe('angleFromTime', () => {
    test('maps time proportionally to 360° (total=60)', () => {
      expect(angleFromTime(0, 60)).toBe(0);
      expect(angleFromTime(15, 60)).toBeCloseTo(90, 5);
      expect(angleFromTime(30, 60)).toBeCloseTo(180, 5);
      expect(angleFromTime(45, 60)).toBeCloseTo(270, 5);
      expect(angleFromTime(60, 60)).toBeCloseTo(0, 5); // wraps to 0
    });

    test('clamps to [0,total]', () => {
      expect(angleFromTime(-5, 60)).toBe(0);
      expect(angleFromTime(1000, 60)).toBeCloseTo(0, 5);
    });
  });

  describe('timeFromAngle', () => {
    test('maps angle proportionally to total with 1s snap', () => {
      expect(timeFromAngle(0, 60)).toBe(0);
      expect(timeFromAngle(90, 60)).toBe(15);
      expect(timeFromAngle(180, 60)).toBe(30);
      expect(timeFromAngle(270, 60)).toBe(45);
      expect(timeFromAngle(360, 60)).toBe(60);
    });

    test('normalizes negative/large angles', () => {
      expect(timeFromAngle(-90, 60)).toBe(45);
      expect(timeFromAngle(450, 60)).toBe(15);
    });

    test('snaps to provided step', () => {
      expect(timeFromAngle(95, 60, 5)).toBe(15); // ~15.83 -> 15 with 5s snap
      expect(timeFromAngle(95, 60, 10)).toBe(20); // -> 20 with 10s snap
    });

    test('clamps to [0,total]', () => {
      expect(timeFromAngle(-1, 10)).toBe(10); // -1deg normalizes to 359°, maps near 10, snaps to 10, then clamps to 10
      expect(timeFromAngle(9999, 10)).toBeGreaterThanOrEqual(0);
      expect(timeFromAngle(9999, 10)).toBeLessThanOrEqual(10);
    });
  });
});
