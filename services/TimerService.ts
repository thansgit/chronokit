import { useSessionStore } from "@/stores/useSessionStore";
import { useTimerStore } from "@/stores/useTimerStore";
import { Cue, Session } from "@/types";
import { soundService } from "./SoundService";
import { formatSessionTitle } from "@/helpers/format";
import { generateId } from "@/helpers/id";

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
    const occurrences = expandCues(session.cues, session.totalDuration);

    for (const occ of occurrences) {
      // 0.2 second window after occurrence start
      if (elapsedSec >= occ.time && elapsedSec < occ.time + 0.2) {
        if (!this.triggeredCues.has(occ.id)) {
          if (occ.sound) {
            soundService.playCue(occ.sound);
          }
          this.triggeredCues.add(occ.id);
        }
      }
    }
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

    const newSession: Session = {
      id: generateId(),
      name: formatSessionTitle(totalDuration),
      totalDuration,
      cues: [
        {
          id: generateId(),
          startTime: 0,
          color: "#4B0082",
          sound: {
            type: "tts",
            text: "Session started",
          },
        },
        {
          id: generateId(),
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
      const prevDefault = formatSessionTitle(currentSession.totalDuration);
      const nextDefault = formatSessionTitle(totalDuration);
      const userCustomized = (currentSession.name ?? "").trim().length > 0 && (currentSession.name ?? "").trim() !== prevDefault;

      const updatedSession: Session = {
        ...currentSession,
        name: userCustomized ? currentSession.name : nextDefault,
        totalDuration,
        // Update the end cue to match the new duration
        cues: currentSession.cues.map((cue) => {
          // Only retime the explicit end/complete cue
          const isCompleteCue =
            cue.sound?.type === "sound" && cue.sound.soundId === "complete";
          if (isCompleteCue && cue.startTime === currentSession.totalDuration) {
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

type Occurrence = { id: string; time: number; sound?: Cue["sound"] };

// Helpers to expand cues (including phases and repeat) into flat occurrences to check at runtime
function clamp01(v: number) { return Math.max(0, v); }

function totalPhasesDuration(cue: Cue): number {
  if (!('phases' in cue) || !cue.phases || cue.phases.length === 0) return 0;
  return cue.phases.reduce((sum, p) => sum + Math.max(0, Math.floor(p.duration || 0)), 0);
}

function expandCue(cue: Cue, sessionTotal: number): Occurrence[] {
  const out: Occurrence[] = [];
  const baseId = cue.id;
  const start = clamp01(Math.floor(cue.startTime || 0));

  const hasPhases = (cue as any).phases && (cue as any).phases.length > 0;
  if (!hasPhases) {
    // No phases: treat as trigger (no duration) or segment (duration>0) -> signal on entry
    out.push({ id: `${baseId}@${start}`, time: start, sound: (cue as any).sound });
    return out;
  }

  const phases = (cue as any).phases as { duration: number; sound?: any }[];
  const repeat = (cue as any).repeat as { cycles?: number; untilTime?: number } | undefined;

  const seqDuration = totalPhasesDuration(cue);
  if (seqDuration <= 0) return out;

  let cycle = 0;
  let cycleStart = start;
  const maxUntil = repeat?.untilTime != null ? Math.min(repeat.untilTime, sessionTotal) : sessionTotal;
  const maxCycles = repeat?.cycles != null ? Math.max(0, Math.floor(repeat.cycles)) : 1;

  const shouldContinue = () => {
    if (repeat?.cycles != null) return cycle < maxCycles;
    if (repeat?.untilTime != null) return cycleStart < maxUntil;
    return cycle < 1; // default single run
  };

  while (shouldContinue()) {
    let offset = 0;
    for (let i = 0; i < phases.length; i++) {
      const ph = phases[i];
      const dur = Math.max(1, Math.floor(ph.duration || 0));
      const t = cycleStart + offset; // boundary at start of phase
      if (t <= sessionTotal) {
        out.push({ id: `${baseId}@${t}#${cycle}.${i}`, time: t, sound: ph.sound });
      }
      offset += dur;
    }
    cycle += 1;
    cycleStart += seqDuration;
    if (repeat?.untilTime != null && cycleStart > maxUntil) break;
  }

  return out;
}

function expandCues(cues: Cue[], sessionTotal: number): Occurrence[] {
  const all: Occurrence[] = [];
  for (const cue of cues) {
    all.push(...expandCue(cue, sessionTotal));
  }
  // Sort by time in case consumers rely on order
  all.sort((a, b) => a.time - b.time);
  return all;
}

/**
 * Creates a session from time input and sets it as the current session
 */

// Create a singleton instance
export const timerService = new TimerService();
