export type Session = {
  id: string;
  name: string;
  totalDuration: number;
  cues: Cue[];
};

// Sound can be either a predefined sound effect or text-to-speech
export type SoundCue =
  | {
      type: "sound";
      soundId: string; // Reference to a sound file like "gong", "bell", etc.
    }
  | {
      type: "tts";
      text: string; // Text to be spoken
      options?: {
        language?: string;
        pitch?: number;
        rate?: number;
      };
    };

export type TriggerCue = {
  id: string;
  type: "trigger";
  startTime: number;
  color: string;
  sound?: SoundCue;
};

export type SegmentCue = {
  id: string;
  type: "segment";
  startTime: number;
  duration: number;
  color: string;
  sound?: SoundCue;
  imageId?: string; // Optional image to be shown during the segment
};

export type Cue = TriggerCue | SegmentCue;

// This helper function is no longer needed as startTime is now part of the cue types
// Keeping it for backward compatibility if needed
function getCuesWithStartTimes(cues: Cue[]): Cue[] {
  return cues.map((cue) => {
    return cue;
  });
}

// Mock data ilman startTimea
export const mockSession: Session = {
  id: "test-session-1",
  name: "Test Session",
  totalDuration: 70,
  cues: [
    {
      id: "0",
      type: "trigger",
      startTime: 0,
      color: "#4B0082",
      sound: {
        type: "tts",
        text: "Start session",
      },
    },
    {
      id: "1",
      type: "trigger",
      startTime: 20,
      color: "#FFD700",
      sound: {
        type: "sound",
        soundId: "gong",
      },
    },
    {
      id: "2",
      type: "segment",
      startTime: 10,
      duration: 5,
      color: "green",
      sound: {
        type: "tts",
        text: "Starting intense phase",
      },
    },
    {
      id: "3",
      type: "trigger",
      startTime: 20,
      color: "#FF4500",
      sound: {
        type: "sound",
        soundId: "bell",
      },
    },
    {
      id: "4",
      type: "trigger",
      startTime: 35,
      color: "#4169E1",
      sound: {
        type: "tts",
        text: "Halfway point reached",
        options: {
          rate: 0.8,
          pitch: 1.2,
        },
      },
    },
  ],
};

// Jos haluat startTimeja käyttöön esim. ajastimelle
export const cuesWithStartTime = getCuesWithStartTimes(mockSession.cues);
