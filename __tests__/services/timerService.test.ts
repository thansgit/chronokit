import { timerService } from '@/services/TimerService';
import { useTimerStore } from '@/stores/useTimerStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { Session } from '@/types';

// Mock soundService methods used by TimerService
jest.mock('@/services/SoundService', () => {
  return {
    soundService: {
      playCue: jest.fn(),
      playSound: jest.fn(),
    },
  };
});

const { soundService } = jest.requireMock('@/services/SoundService');

describe('services/TimerService', () => {
  beforeEach(() => {
    // Reset stores to a known state
    useTimerStore.setState({
      isRunning: false,
      startAt: null,
      elapsedOffsetMs: 0,
      // Actions will be redefined below to avoid accidental behavior during tests
      startTimer: useTimerStore.getState().startTimer,
      stopTimer: useTimerStore.getState().stopTimer,
      resetTimer: useTimerStore.getState().resetTimer,
      toggleTimer: useTimerStore.getState().toggleTimer,
      timeInput: { hours: '', minutes: '', seconds: '' },
      setTimeInput: useTimerStore.getState().setTimeInput,
    } as any);

    useSessionStore.setState({
      session: null,
      sessions: [],
      setSession: jest.fn(),
      startNewSession: jest.fn(),
      addSession: jest.fn(),
      updateSession: jest.fn(),
      deleteSession: jest.fn(),
      getSessionById: jest.fn(),
      saveCurrentSession: jest.fn(),
      selectSession: jest.fn(),
      clearSessions: jest.fn(),
    } as any);

    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('calculateTime()', () => {
    it('returns zeros and progress 0 when not running', () => {
      useTimerStore.setState({ isRunning: false, startAt: null, elapsedOffsetMs: 0 });
      const res = timerService.calculateTime(120);
      expect(res.elapsedMs).toBe(0);
      expect(res.remainingMs).toBe(120000);
      expect(res.progress).toBe(0);
    });

    it('accumulates runtime when running', () => {
      let nowVal = 1_000_000;
      jest.spyOn(Date, 'now').mockImplementation(() => nowVal);

      // Start timer to capture startAt from mocked Date.now
      useTimerStore.getState().startTimer();

      // Advance time by 3500ms
      nowVal += 3500;

      const res = timerService.calculateTime(100);
      expect(res.elapsedMs).toBe(3500);
      expect(res.elapsedSec).toBe(3);
      expect(res.remainingMs).toBe(100000 - 3500);
      expect(res.remainingSec).toBe(Math.ceil((100000 - 3500) / 1000));
      expect(res.progress).toBeCloseTo(0.035, 3);
    });

    it('handles totalDuration=0 gracefully', () => {
      const res = timerService.calculateTime(0);
      expect(res.progress).toBe(0);
      expect(res.remainingMs).toBe(0);
    });
  });

  describe('phases and repeat expansion (via checkCues)', () => {
    it('triggers per-phase sounds across repeated cycles (cycles)', () => {
      const session: Session = {
        id: 's-ph1',
        name: 'Phases cycles',
        totalDuration: 40,
        cues: [
          {
            id: 'pc1',
            startTime: 5,
            color: '#123',
            phases: [
              { duration: 2, sound: { type: 'tts', text: 'phase A' } },
              { duration: 3, sound: { type: 'tts', text: 'phase B' } },
            ],
            repeat: { cycles: 2 },
          } as any,
        ],
      };

      timerService.resetTriggeredCues();

      // Cycle 0: boundaries at 5, 7
      timerService.checkCues(session, 5.01 as any, true);
      timerService.checkCues(session, 7.01 as any, true);
      // Cycle 1: starts at 10, boundaries at 10, 12
      timerService.checkCues(session, 10.01 as any, true);
      timerService.checkCues(session, 12.01 as any, true);

      expect(soundService.playCue).toHaveBeenCalledTimes(4);
      expect(soundService.playCue.mock.calls[0][0]).toEqual({ type: 'tts', text: 'phase A' });
      expect(soundService.playCue.mock.calls[1][0]).toEqual({ type: 'tts', text: 'phase B' });
      expect(soundService.playCue.mock.calls[2][0]).toEqual({ type: 'tts', text: 'phase A' });
      expect(soundService.playCue.mock.calls[3][0]).toEqual({ type: 'tts', text: 'phase B' });
    });

    it('stops repeating when untilTime reached (untilTime)', () => {
      const session: Session = {
        id: 's-ph2',
        name: 'Phases until',
        totalDuration: 40,
        cues: [
          {
            id: 'pu1',
            startTime: 5,
            color: '#456',
            phases: [
              { duration: 2, sound: { type: 'sound', soundId: 'beep' } },
              { duration: 2, sound: { type: 'sound', soundId: 'beep' } },
            ],
            repeat: { untilTime: 9 }, // sequence length = 4, starts at 5 -> will emit at 5 and 7, next cycle at 9 is past until -> not emitted
          } as any,
        ],
      };

      timerService.resetTriggeredCues();
      timerService.checkCues(session, 5.01 as any, true); // phase 0
      timerService.checkCues(session, 7.01 as any, true); // phase 1
      // Next cycle would start at 9; boundary equals untilTime, expandCue guards to not exceed until
      timerService.checkCues(session, 9.01 as any, true);

      expect(soundService.playCue).toHaveBeenCalledTimes(2);
      expect(soundService.playCue).toHaveBeenNthCalledWith(1, { type: 'sound', soundId: 'beep' });
      expect(soundService.playCue).toHaveBeenNthCalledWith(2, { type: 'sound', soundId: 'beep' });
    });
  });

  describe('checkCues()', () => {
    it('triggers trigger cues once and dedupes further calls', () => {
      const session: Session = {
        id: 's1',
        name: 'Test',
        totalDuration: 20,
        cues: [
          {
            id: 'c1',
            startTime: 5,
            color: '#f00',
            sound: { type: 'tts', text: 'Go' },
          },
        ],
      };

      // first pass within window
      timerService['resetTriggeredCues']();
      timerService.checkCues(session, 5.05 as any, true);
      expect(soundService.playCue).toHaveBeenCalledTimes(1);

      // second pass should be deduped
      timerService.checkCues(session, 5.1 as any, true);
      expect(soundService.playCue).toHaveBeenCalledTimes(1);

      // after reset, should trigger again
      timerService.resetTriggeredCues();
      timerService.checkCues(session, 5.05 as any, true);
      expect(soundService.playCue).toHaveBeenCalledTimes(2);
    });

    it('triggers segment cues when entering segment start', () => {
      const session: Session = {
        id: 's2',
        name: 'Test',
        totalDuration: 30,
        cues: [
          {
            id: 'seg1',
            startTime: 10,
            duration: 5,
            color: '#0f0',
            sound: { type: 'sound', soundId: 'beep' },
          },
        ],
      };

      timerService.resetTriggeredCues();
      timerService.checkCues(session, 10.01 as any, true);
      expect(soundService.playCue).toHaveBeenCalledTimes(1);
      // Should not trigger again immediately
      timerService.checkCues(session, 10.05 as any, true);
      expect(soundService.playCue).toHaveBeenCalledTimes(1);
    });

    it('does nothing when not running or session is null', () => {
      timerService.resetTriggeredCues();
      timerService.checkCues(null, 5, true);
      timerService.checkCues({ id: 's', name: 'x', totalDuration: 1, cues: [] }, 0, false);
      expect(soundService.playCue).not.toHaveBeenCalled();
    });
  });

  describe('isTimerComplete() and handleTimerComplete()', () => {
    it('isTimerComplete returns true only when session exists, running, and remainingSec<=0', () => {
      const session: Session = { id: 's', name: 'x', totalDuration: 10, cues: [] };
      expect(timerService.isTimerComplete(null, 0, true)).toBe(false);
      expect(timerService.isTimerComplete(session, 1, true)).toBe(false);
      expect(timerService.isTimerComplete(session, 0, true)).toBe(true);
      expect(timerService.isTimerComplete(session, -1, true)).toBe(true);
      expect(timerService.isTimerComplete(session, 0, false)).toBe(false);
    });

    it('handleTimerComplete plays complete sound, resets timer, and clears triggered cues', () => {
      const resetMock = jest.fn();
      useTimerStore.setState({ resetTimer: resetMock } as any);

      // Pre-mark a cue as triggered and ensure reset clears internal Set by checking re-trigger behavior
      timerService.resetTriggeredCues();

      timerService.handleTimerComplete();
      expect(soundService.playSound).toHaveBeenCalledWith('complete');
      expect(resetMock).toHaveBeenCalled();
    });
  });

  describe('createSession() and createAndSetSession()', () => {
    it('createSession returns null for zero total, and otherwise sets default cues', () => {
      expect(timerService.createSession('0', '0', '0')).toBeNull();

      const sess = timerService.createSession('0', '1', '5');
      expect(sess).not.toBeNull();
      expect(sess!.totalDuration).toBe(65);
      expect(sess!.name).toMatch(/^Timer /);
      expect(sess!.cues.length).toBe(2);

      const startCue = sess!.cues[0];
      // Trigger inferred by missing/<=0 duration
      expect(startCue.duration).toBeUndefined();
      expect(startCue.startTime).toBe(0);
      expect(startCue.sound).toEqual({ type: 'tts', text: 'Session started' });

      const endCue = sess!.cues[1];
      // Trigger inferred by missing/<=0 duration
      expect(endCue.duration).toBeUndefined();
      expect(endCue.startTime).toBe(65);
      expect(endCue.sound).toEqual({ type: 'sound', soundId: 'complete' });
    });

    it('createAndSetSession updates existing session name when default and retimes only end cue', () => {
      const existing: Session = {
        id: 'id1',
        name: 'Timer 1m',
        totalDuration: 60,
        cues: [
          { id: 'start', startTime: 0, color: '#111', sound: { type: 'tts', text: 'Session started' } },
          { id: 'end', startTime: 60, color: '#222', sound: { type: 'sound', soundId: 'complete' } },
          { id: 'other', startTime: 30, color: '#333' },
        ],
      };

      const setSession = jest.fn();
      useSessionStore.setState({ session: existing, setSession } as any);

      const res = timerService.createAndSetSession({ hours: '0', minutes: '2', seconds: '0' });
      expect(res).not.toBeNull();
      expect(setSession).toHaveBeenCalled();

      const updated = setSession.mock.calls[0][0] as Session;
      expect(updated.totalDuration).toBe(120);
      expect(updated.name).toBe('Timer 2m');
      // end cue retimed, others unchanged
      const end = updated.cues.find(c => c.id === 'end')!;
      expect(end.startTime).toBe(120);
      const other = updated.cues.find(c => c.id === 'other')!;
      expect(other.startTime).toBe(30);
    });

    it('createAndSetSession preserves customized name but still retimes end cue', () => {
      const existing: Session = {
        id: 'id2',
        name: 'My Custom',
        totalDuration: 60,
        cues: [
          { id: 'start', startTime: 0, color: '#111', sound: { type: 'tts', text: 'Session started' } },
          { id: 'end', startTime: 60, color: '#222', sound: { type: 'sound', soundId: 'complete' } },
        ],
      };

      const setSession = jest.fn();
      useSessionStore.setState({ session: existing, setSession } as any);

      const res = timerService.createAndSetSession({ hours: '0', minutes: '3', seconds: '0' });
      expect(res).not.toBeNull();
      const updated = (useSessionStore.getState().setSession as jest.Mock).mock.calls[0][0] as Session;
      expect(updated.name).toBe('My Custom');
      const end = updated.cues.find(c => c.id === 'end')!;
      expect(end.startTime).toBe(180);
    });

    it('createAndSetSession creates and sets when no existing session', () => {
      const setSession = jest.fn();
      useSessionStore.setState({ session: null, setSession } as any);

      const res = timerService.createAndSetSession({ hours: '0', minutes: '0', seconds: '10' });
      expect(res).not.toBeNull();
      expect(setSession).toHaveBeenCalled();
      const created = setSession.mock.calls[0][0] as Session;
      expect(created.totalDuration).toBe(10);
    });
  });
});
