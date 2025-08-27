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
 * Union type for all cue types
 */
export type Cue = TriggerCue | SegmentCue;

/**
 * A point-in-time cue that triggers at a specific time
 */
export interface TriggerCue {
  id: string;
  type: "trigger";
  startTime: number; // in seconds from session start
  color: string;
  sound?: SoundCue;
}

/**
 * A cue that spans a duration of time
 */
export interface SegmentCue {
  id: string;
  type: "segment";
  startTime: number; // in seconds from session start
  duration: number; // in seconds
  color: string;
  sound?: SoundCue;
  imageId?: string; // Optional image to be shown during the segment
}
