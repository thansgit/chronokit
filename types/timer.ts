/**
 * Timer type definitions
 * Contains all types related to timer functionality
 */

/**
 * Timer state
 */
export interface TimerState {
  isRunning: boolean;
  startAt: number | null; // ms timestamp when started
  elapsedOffsetMs: number; // accumulated elapsed across pauses
}

/**
 * Timer calculations
 */
export interface TimerCalculations {
  elapsedMs: number;
  elapsedSec: number;
  remainingMs: number;
  remainingSec: number;
  progress: number; // 0 to 1
}

/**
 * Timer actions
 */
export interface TimerActions {
  start: () => void;
  stop: () => void;
  reset: () => void;
  toggle: () => void;
}
