import { mockSession } from "@/assets/data/mock";
import { PlayPauseButton } from "@/components/PlayPauseButton";
import TimerRing from "@/components/TimerRing";
import { useSessionStore } from "@/stores/useSessionStore";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PlayerScreen() {
  // Use selector pattern to minimize re-renders
  const session = useSessionStore((state) => state.session);
  const animatedValue = useSessionStore((state) => state.animatedValue);
  const remainingTime = useSessionStore((state) => state.remainingTime);
  const setSession = useSessionStore((state) => state.setSession);
  const startTimer = useSessionStore((state) => state.startTimer);

  // Initialize session only once
  useEffect(() => {
    setSession(mockSession);

    // Add a small delay before starting the timer to ensure setSession completes
    const timer = setTimeout(() => {
      startTimer();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Memoize the TimerRing component to prevent unnecessary re-renders
  const timerRingComponent = useMemo(() => {
    return (
      mockSession && (
        <TimerRing
          progress={animatedValue}
          totalDuration={mockSession.totalDuration}
          currentValue={remainingTime}
          ringColor="green"
          backgroundColor="lightgreen"
        />
      )
    );
  }, [animatedValue, remainingTime]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Player screen</Text>
      {timerRingComponent}
      <PlayPauseButton isPlaying={false} onToggle={() => {}} />
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
