/**
 * Session type definitions
 * Contains all types related to sessions and cues
 */
import { SoundCue } from './sound';

/**
 * Represents a complete timer session with cues
 */
export interface Session {
  id: string;
  name: string;
  totalDuration: number; // in seconds
  cues: Cue[];
}

/**
 * Unified Cue type
 * - Instant trigger: no duration
 * - Segment: duration > 0
 * - Pattern: phases[] with optional repeat
 */
export interface Cue {
  id: string;
  startTime: number; // seconds from session start
  duration?: number; // optional; if present and >0, it's a segment
  color: string;
  sound?: SoundCue;
  imageId?: string;
  label?: string;
  // Pattern extensions (optional)
  phases?: CuePhase[];
  repeat?: CueRepeat;
}

/**
 * Pattern phase inside a Cue. Each phase can have its own sound and styling.
 */
export interface CuePhase {
  duration: number; // seconds, > 0
  sound?: SoundCue;
  label?: string;
  color?: string;
}

/**
 * Repeat options for a pattern (phases). Repeat for a number of cycles or until a time.
 */
export interface CueRepeat {
  cycles?: number; // number of full phase-set repetitions
  untilTime?: number; // absolute session time (sec)
}

// (Removed legacy TriggerCue/SegmentCue)
