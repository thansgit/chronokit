export type Session = {
  id: string;
  name: string;
  totalDuration: number;
  cues: Cue[];
};

export type TriggerCue = {
  id: string;
  type: "trigger";
  startTime: number;
  color: string;
  soundId: string;
};

export type SegmentCue = {
  id: string;
  type: "segment";
  startTime: number;
  duration: number;
  color: string;
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
  totalDuration: 30,
  cues: [
    {
      id: "1",
      type: "trigger",
      startTime: 4,
      color: "#FFD700",
      soundId: "gong",
    },
    {
      id: "2",
      type: "segment",
      startTime: 10,
      duration: 5,
      color: "green",
    },
    {
      id: "3",
      type: "trigger",
      startTime: 20,
      color: "#FF4500",
      soundId: "bell",
    },
  ],
};

// Jos haluat startTimeja käyttöön esim. ajastimelle
export const cuesWithStartTime = getCuesWithStartTimes(mockSession.cues);
