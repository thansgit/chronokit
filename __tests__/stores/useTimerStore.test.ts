import { useTimerStore } from '@/stores/useTimerStore';

describe('stores/useTimerStore', () => {
  beforeEach(() => {
    // reset to initial state by setting fields explicitly
    useTimerStore.setState({
      isRunning: false,
      startAt: null,
      elapsedOffsetMs: 0,
      timeInput: { hours: '', minutes: '', seconds: '' },
    });
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('startTimer sets running and startAt; is idempotent when already running', () => {
    const t0 = 1_000_000;
    const spyNow = jest.spyOn(Date, 'now').mockReturnValue(t0);

    const { startTimer, getState } = { startTimer: useTimerStore.getState().startTimer, getState: useTimerStore.getState } as any;

    startTimer();
    let s = getState();
    expect(s.isRunning).toBe(true);
    expect(s.startAt).toBe(t0);

    // Call again should not overwrite
    spyNow.mockReturnValue(t0 + 5000);
    startTimer();
    s = getState();
    expect(s.startAt).toBe(t0);
  });

  it('stopTimer accumulates elapsed and clears flags; safe when not running', () => {
    // Not running path
    useTimerStore.getState().stopTimer();
    let s = useTimerStore.getState();
    expect(s.isRunning).toBe(false);
    expect(s.startAt).toBeNull();

    // Running path
    const t0 = 2_000_000;
    const spyNow = jest.spyOn(Date, 'now');
    spyNow.mockReturnValue(t0);
    useTimerStore.getState().startTimer();

    spyNow.mockReturnValue(t0 + 4200);
    useTimerStore.getState().stopTimer();

    s = useTimerStore.getState();
    expect(s.isRunning).toBe(false);
    expect(s.startAt).toBeNull();
    expect(s.elapsedOffsetMs).toBeGreaterThanOrEqual(4200);
    expect(s.elapsedOffsetMs).toBeLessThan(4300); // allow minor rounding slack
  });

  it('resetTimer clears running, startAt, and elapsedOffsetMs', () => {
    useTimerStore.setState({ isRunning: true, startAt: 123, elapsedOffsetMs: 999 });
    useTimerStore.getState().resetTimer();
    const s = useTimerStore.getState();
    expect(s.isRunning).toBe(false);
    expect(s.startAt).toBeNull();
    expect(s.elapsedOffsetMs).toBe(0);
  });

  it('toggleTimer delegates to start/stop', () => {
    const spyStart = jest.spyOn(useTimerStore.getState(), 'startTimer');
    const spyStop = jest.spyOn(useTimerStore.getState(), 'stopTimer');

    useTimerStore.setState({ isRunning: false });
    useTimerStore.getState().toggleTimer();
    expect(spyStart).toHaveBeenCalled();

    useTimerStore.setState({ isRunning: true, startAt: 1 });
    useTimerStore.getState().toggleTimer();
    expect(spyStop).toHaveBeenCalled();
  });

  it('setTimeInput updates the struct', () => {
    const ti = { hours: '1', minutes: '2', seconds: '3' };
    useTimerStore.getState().setTimeInput(ti as any);
    expect(useTimerStore.getState().timeInput).toEqual(ti);
  });
});
