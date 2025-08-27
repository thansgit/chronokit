/**
 * Sound type definitions
 * Contains all types related to sounds and audio playback
 */

/**
 * Union type for different sound cue types
 */
export type SoundCue = SoundEffectCue | TextToSpeechCue;

/**
 * A pre-recorded sound effect
 */
export interface SoundEffectCue {
  type: "sound";
  soundId: string; // Reference to a sound file like "gong", "bell", etc.
}

/**
 * A text-to-speech sound
 */
export interface TextToSpeechCue {
  type: "tts";
  text: string; // Text to be spoken
  options?: SpeechOptions;
}

/**
 * Options for text-to-speech
 */
export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
}

/**
 * Available sound effects in the app
 */
export type SoundEffectId = "beep" | "gong" | "bell" | "complete";

/**
 * Sound playback status
 */
export interface SoundStatus {
  isMuted: boolean;
  volume: number;
}
