import { useSessionStore } from "@/stores/useSessionStore";
import { useTimerStore } from "@/stores/useTimerStore";
import { Session } from "@/types";
import { soundService } from "./SoundService";

/**
 * Service for timer-related business logic
 */
class TimerService {
  // Cache for triggered cues to avoid duplicate sounds
  private triggeredCues: Set<string> = new Set();

  /**
   * Calculate elapsed and remaining time
   */
  calculateTime(totalDuration: number): {
    elapsedMs: number;
    elapsedSec: number;
    remainingMs: number;
    remainingSec: number;
    progress: number;
  } {
    const { isRunning, startAt, elapsedOffsetMs } = useTimerStore.getState();

    // Calculate runtime since last start
    const runtimeMs = isRunning && startAt ? Date.now() - startAt : 0;

    // Total elapsed time including pauses
    const elapsedMs = elapsedOffsetMs + runtimeMs;
    const elapsedSec = Math.floor(elapsedMs / 1000);

    // Calculate remaining time
    const totalMs = totalDuration * 1000;
    const remainingMs = Math.max(0, totalMs - elapsedMs);
    const remainingSec = Math.ceil(remainingMs / 1000);

    // Calculate progress (0 to 1)
    const progress = totalDuration > 0 ? Math.min(1, elapsedMs / totalMs) : 0;

    return {
      elapsedMs,
      elapsedSec,
      remainingMs,
      remainingSec,
      progress,
    };
  }

  /**
   * Check and trigger cues based on elapsed time
   */
  checkCues(
    session: Session | null,
    elapsedSec: number,
    isRunning: boolean
  ): void {
    if (!session || !isRunning) return;

    session.cues.forEach((cue) => {
      const cueId = cue.id;

      // For trigger cues, check if we've just passed the start time
      if (cue.type === "trigger") {
        // If we're within 0.2 seconds after the trigger point and haven't triggered it yet
        if (
          elapsedSec >= cue.startTime &&
          elapsedSec < cue.startTime + 0.2 &&
          !this.triggeredCues.has(cueId)
        ) {
          // Play the sound if available
          if (cue.sound) {
            soundService.playCue(cue.sound);
          }

          // Mark as triggered
          this.triggeredCues.add(cueId);
        }
      }
      // For segment cues, check if we've just entered the segment
      else if (cue.type === "segment") {
        const segmentStart = cue.startTime;

        // If we've just entered the segment and haven't triggered it yet
        if (
          elapsedSec >= segmentStart &&
          elapsedSec < segmentStart + 0.2 &&
          !this.triggeredCues.has(cueId)
        ) {
          // Play the sound if available
          if (cue.sound) {
            soundService.playCue(cue.sound);
          }

          // Mark as triggered
          this.triggeredCues.add(cueId);
        }
      }
    });
  }

  /**
   * Reset triggered cues
   */
  resetTriggeredCues(): void {
    this.triggeredCues.clear();
  }

  /**
   * Check if timer is complete
   */
  isTimerComplete(
    session: Session | null,
    remainingSec: number,
    isRunning: boolean
  ): boolean {
    return !!session && isRunning && remainingSec <= 0;
  }

  /**
   * Handle timer completion
   */
  handleTimerComplete(): void {
    soundService.playSound("complete");
    useTimerStore.getState().resetTimer();
    this.resetTriggeredCues();
  }

  /**
   * Create a new session with default cues
   */
  createSession(
    hours: string,
    minutes: string,
    seconds: string
  ): Session | null {
    // Calculate total duration in seconds
    const hoursNum = parseInt(hours || "0", 10);
    const minutesNum = parseInt(minutes || "0", 10);
    const secondsNum = parseInt(seconds || "0", 10);
    const totalDuration = hoursNum * 3600 + minutesNum * 60 + secondsNum;

    if (totalDuration === 0) return null; // Don't create empty sessions

    // Generate simple IDs without uuid dependency
    const generateId = () => Math.random().toString(36).substring(2, 10);

    const newSession: Session = {
      id: generateId(),
      name: `Session ${new Date().toLocaleTimeString()}`,
      totalDuration,
      cues: [
        {
          id: generateId(),
          type: "trigger",
          startTime: 0,
          color: "#4B0082",
          sound: {
            type: "tts",
            text: "Session started",
          },
        },
        {
          id: generateId(),
          type: "trigger",
          startTime: totalDuration,
          color: "#FF4500",
          sound: {
            type: "sound",
            soundId: "complete",
          },
        },
      ],
    };

    return newSession;
  }

  startSession(): void {
    // Start the timer
    const timerStore = useTimerStore.getState();
    timerStore.startTimer();
  }

  createAndSetSession(timeInput: {
    hours: string;
    minutes: string;
    seconds: string;
  }): Session | null {
    // Calculate total duration in seconds
    const hoursNum = parseInt(timeInput.hours || "0", 10);
    const minutesNum = parseInt(timeInput.minutes || "0", 10);
    const secondsNum = parseInt(timeInput.seconds || "0", 10);
    const totalDuration = hoursNum * 3600 + minutesNum * 60 + secondsNum;

    if (totalDuration === 0) return null; // Don't proceed if duration is zero

    // Get the current session from the store
    const sessionStore = useSessionStore.getState();
    const currentSession = sessionStore.session;

    // If there's an existing session, update it
    if (currentSession) {
      // Update the existing session with new duration
      const updatedSession: Session = {
        ...currentSession,
        totalDuration,
        // Update the end cue to match the new duration
        cues: currentSession.cues.map((cue) => {
          // Find the end cue (assuming it's the last one or has the same time as totalDuration)
          if (cue.startTime === currentSession.totalDuration) {
            return { ...cue, startTime: totalDuration };
          }
          return cue;
        }),
      };

      // Set the updated session in the store
      sessionStore.setSession(updatedSession);
      return updatedSession;
    } else {
      // If no session exists, create a new one
      const newSession = this.createSession(
        timeInput.hours,
        timeInput.minutes,
        timeInput.seconds
      );

      if (!newSession) return null;

      // Set the new session in the store
      sessionStore.setSession(newSession);
      return newSession;
    }
  }
}

/**
 * Creates a session from time input and sets it as the current session
 */

// Create a singleton instance
export const timerService = new TimerService();
