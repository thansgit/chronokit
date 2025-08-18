import { mockSession } from "@/assets/data/mock";
import { MuteToggleButton } from "@/components/MuteToggleButton";
import { PlayPauseButton } from "@/components/PlayPauseButton";
import TimerRing from "@/components/TimerRing";
import { soundService } from "@/services/SoundService";
import { useSessionStore } from "@/stores/useSessionStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function PlayerScreen() {
  // Use selector pattern to minimize re-renders
  const session = useSessionStore((state) => state.session);
  const isRunning = useSessionStore((state) => state.isRunning);
  const startAt = useSessionStore((state) => state.startAt);
  const elapsedOffsetMs = useSessionStore((state) => state.elapsedOffsetMs);
  const setSession = useSessionStore((state) => state.setSession);
  const startTimer = useSessionStore((state) => state.startTimer);
  const stopTimer = useSessionStore((state) => state.stopTimer);
  const resetTimer = useSessionStore((state) => state.resetTimer);

  // Track previously triggered cues to avoid duplicate sounds
  const triggeredCuesRef = useRef<Set<string>>(new Set());

  // Initialize session
  useEffect(() => {
    setSession(mockSession);
    return () => {
      // Clean up sounds when component unmounts
      soundService.unloadSounds();
    };
  }, []);

  // lightweight ticker for display while running
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [isRunning]);

  // compute remaining seconds from timestamps
  const remainingSec = useMemo(() => {
    const totalSec = session?.totalDuration ?? 0;
    const totalMs = totalSec * 1000;
    const runtimeMs = isRunning && startAt ? Date.now() - startAt : 0;
    const elapsedMs = elapsedOffsetMs + runtimeMs;
    const remMs = Math.max(0, totalMs - elapsedMs);
    return Math.round(remMs / 1000);
    // depend on now to refresh while running
  }, [session?.totalDuration, isRunning, startAt, elapsedOffsetMs, now]);

  // Calculate elapsed seconds for cue triggering
  const elapsedSec = useMemo(() => {
    if (!session) return 0;
    return session.totalDuration - remainingSec;
  }, [session, remainingSec]);

  // Handle cue triggering
  useEffect(() => {
    if (!session || !isRunning) return;

    // Check for cues that should be triggered
    session.cues.forEach((cue) => {
      const cueId = cue.id;

      // For trigger cues, check if we've just passed the start time
      if (cue.type === "trigger") {
        // If we're within 0.2 seconds after the trigger point and haven't triggered it yet
        if (
          elapsedSec >= cue.startTime &&
          elapsedSec < cue.startTime + 0.2 &&
          !triggeredCuesRef.current.has(cueId)
        ) {
          // Play the sound if available
          if (cue.sound) {
            soundService.playCue(cue.sound);
          }

          // Mark as triggered
          triggeredCuesRef.current.add(cueId);
        }
      }
      // For segment cues, check if we've just entered the segment
      else if (cue.type === "segment") {
        const segmentStart = cue.startTime;

        // If we've just entered the segment and haven't triggered it yet
        if (
          elapsedSec >= segmentStart &&
          elapsedSec < segmentStart + 0.2 &&
          !triggeredCuesRef.current.has(cueId)
        ) {
          // Play the sound if available
          if (cue.sound) {
            soundService.playCue(cue.sound);
          }

          // Mark as triggered
          triggeredCuesRef.current.add(cueId);
        }
      }
    });
  }, [session, isRunning, elapsedSec]);

  // Reset triggered cues when timer is reset
  useEffect(() => {
    if (!isRunning && remainingSec === session?.totalDuration) {
      triggeredCuesRef.current.clear();
    }
  }, [isRunning, remainingSec, session?.totalDuration]);

  // auto-reset when we reach the end so the starting value shows
  useEffect(() => {
    if (!session) return;
    if (isRunning && remainingSec <= 0) {
      // Play completion sound
      soundService.playSound("complete");
      resetTimer();
    }
  }, [session, isRunning, remainingSec, resetTimer]);

  return (
    <View style={styles.container}>
      {session && (
        <TimerRing
          totalDuration={session.totalDuration}
          currentValue={remainingSec}
          radius={160}
          strokeWidth={15}
          dashCount={60}
          dashWidth={3}
          gradientColors={["#8A2BE2", "#4169E1"]} // Purple to blue gradient
          textColor="white"
          cues={session.cues}
          onReset={resetTimer}
        />
      )}
      <View style={styles.controlsContainer}>
        <PlayPauseButton
          isPlaying={isRunning}
          onToggle={() => {
            if (isRunning) {
              stopTimer();
            } else {
              startTimer();
            }
          }}
        />
        <MuteToggleButton size={30} color="#FF0000" style={styles.muteButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  muteButton: {
    marginLeft: 20,
  },
  text: {
    color: "#fff",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
