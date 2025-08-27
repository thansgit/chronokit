import { useEffect, useState, useMemo } from 'react';
import { useTimerStore } from '@/stores/useTimerStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { timerService } from '@/services/TimerService';
import { Session } from '@/types';

/**
 * Custom hook for timer functionality
 */
export function useTimer() {
  const session = useSessionStore((state) => state.session);
  const isRunning = useTimerStore((state) => state.isRunning);
  const startTimer = useTimerStore((state) => state.startTimer);
  const stopTimer = useTimerStore((state) => state.stopTimer);
  const resetTimer = useTimerStore((state) => state.resetTimer);
  const toggleTimer = useTimerStore((state) => state.toggleTimer);

  // For UI updates while timer is running
  const [now, setNow] = useState(Date.now());

  // Ticker for UI updates
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [isRunning]);

  // Calculate time values
  const { elapsedSec, remainingSec, progress } = useMemo(() => {
    if (!session) {
      return { elapsedSec: 0, remainingSec: 0, progress: 0 };
    }
    
    const calculations = timerService.calculateTime(session.totalDuration);
    return {
      elapsedSec: calculations.elapsedSec,
      remainingSec: calculations.remainingSec,
      progress: calculations.progress
    };
  }, [session, now, isRunning]);

  // Handle cue triggering
  useEffect(() => {
    timerService.checkCues(session, elapsedSec, isRunning);
  }, [session, elapsedSec, isRunning]);

  // Auto-reset when timer completes
  useEffect(() => {
    if (timerService.isTimerComplete(session, remainingSec, isRunning)) {
      timerService.handleTimerComplete();
    }
  }, [session, remainingSec, isRunning]);

  // Reset triggered cues when timer is reset
  useEffect(() => {
    if (!isRunning && session && remainingSec === session.totalDuration) {
      timerService.resetTriggeredCues();
    }
  }, [isRunning, remainingSec, session]);

  return {
    session,
    isRunning,
    elapsedSec,
    remainingSec,
    progress,
    startTimer,
    stopTimer,
    resetTimer,
    toggleTimer
  };
}
