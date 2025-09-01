import { normalizeCue } from '@/helpers/cue';
import { Cue } from '@/types';

describe('helpers/cue.normalizeCue', () => {
  test('clamps and rounds trigger startTime', () => {
    const cue: Cue = { id: 't1', startTime: 12.6, color: '#f00' };
    const res = normalizeCue(cue, 10);
    expect(res.startTime).toBe(10);
  });

  test('rounds trigger startTime within bounds', () => {
    const cue: Cue = { id: 't2', startTime: 4.4, color: '#00f' };
    const res = normalizeCue(cue, 100);
    expect(res.startTime).toBe(4);
  });

  test('segment: min duration 1 and rounded', () => {
    const cue = { id: 's1', startTime: 1.49, duration: 0.2, color: '#0f0' } as any;
    const res = normalizeCue(cue, 100) as any;
    expect(res.startTime).toBe(1);
    expect(res.duration).toBe(1);
  });

  test('segment: duration rounded when > 1', () => {
    const cue = { id: 's2', startTime: 10.4, duration: 9.6, color: '#aaa' } as any;
    const res = normalizeCue(cue, 100) as any;
    expect(res.startTime).toBe(10);
    expect(res.duration).toBe(10);
  });
});
