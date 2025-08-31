import { formatClock, formatDurationShort, formatDurationSpaced } from '@/helpers/format';

describe('helpers/format', () => {
  test('formatClock: <60 returns seconds only', () => {
    expect(formatClock(0)).toBe('0');
    expect(formatClock(9)).toBe('9');
  });

  test('formatClock: minutes and seconds', () => {
    expect(formatClock(65)).toBe('1:05');
    expect(formatClock(600)).toBe('10:00');
  });

  test('formatClock: hours, minutes, seconds', () => {
    expect(formatClock(3661)).toBe('1:01:01');
  });

  test('formatDurationShort: compact string', () => {
    expect(formatDurationShort(0)).toBe('0s');
    expect(formatDurationShort(59)).toBe('59s');
    expect(formatDurationShort(65)).toBe('1m5s');
    expect(formatDurationShort(3661)).toBe('1h1m1s');
  });

  test('formatDurationSpaced: spaced human-readable', () => {
    expect(formatDurationSpaced(0)).toBe('0s');
    expect(formatDurationSpaced(65)).toBe('1m 5s');
    expect(formatDurationSpaced(3661)).toBe('1h 1m 1s');
  });
});
