import { mockSession } from "@/assets/data/mock";
import { PlayPauseButton } from "@/components/PlayPauseButton";
import TimerRing from "@/components/TimerRing";
import { useSessionStore } from "@/stores/useSessionStore";
import { useEffect, useMemo, useState } from "react";
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

  // Initialize session
  useEffect(() => {
    setSession(mockSession);
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

  // auto-reset when we reach the end so the starting value shows
  useEffect(() => {
    if (!session) return;
    if (isRunning && remainingSec <= 0) {
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
        />
      )}
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
  text: {
    color: "#fff",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
