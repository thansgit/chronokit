export type Session = {
  id: string;
  name: string;
  totalDuration: number;
  cues: Cue[];
};

type SoundCue = {
  id: string;
  type: "sound";
  duration: number;
  color: string;
  soundId: string;
};

type SilenceCue = {
  id: string;
  type: "silence";
  duration: number;
  color: string;
};

type Cue = SoundCue | SilenceCue;

// Helper-funktio startTimejen laskemiseen
function getCuesWithStartTimes(cues: Cue[]): (Cue & { startTime: number })[] {
  let currentTime = 0;
  return cues.map((cue) => {
    const cueWithStart = { ...cue, startTime: currentTime };
    currentTime += cue.duration;
    return cueWithStart;
  });
}

// Mock data ilman startTimea
export const mockSession: Session = {
  id: "test-session-1",
  name: "Test Session",
  totalDuration: 10,
  cues: [
    { id: "2", type: "silence", duration: 2, color: "#444" },
    { id: "1", type: "sound", duration: 2, color: "#FFD700", soundId: "gong" },
    { id: "3", type: "sound", duration: 2, color: "#FF4500", soundId: "bell" },
    { id: "4", type: "silence", duration: 2, color: "#444" },
  ],
};

// Jos haluat startTimeja käyttöön esim. ajastimelle
export const cuesWithStartTime = getCuesWithStartTimes(mockSession.cues);
