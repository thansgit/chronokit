import CircularProgressTimer from "@/components/CircularProgressTimer";
import { MuteToggleButton } from "@/components/MuteToggleButton";
import { useTimer } from "@/hooks/useTimer";
import { useRouter, useNavigation } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function PlayerScreen() {
  // Get timer state from hook
  const {
    session,
    isRunning,
    elapsedSec,
    remainingSec,
    progress,
    startTimer,
    stopTimer,
    resetTimer,
    toggleTimer,
  } = useTimer();
  const navigation = useNavigation();

  // Start timer when screen is focused (if coming from another screen)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Only start if we have a session and timer is not already running
      if (session && !isRunning) {
        startTimer();
      }
    });
    
    return unsubscribe;
  }, [navigation, session, isRunning, startTimer]);
  
  // Note: Cue triggering is now handled by the TimerService through the useTimer hook

  return (
    <View style={styles.container}>
      {session && (
        <CircularProgressTimer
          totalDuration={session.totalDuration}
          currentValue={remainingSec}
          radius={160}
          strokeWidth={15}
          dashCount={60}
          dashWidth={3}
          gradientColors={["#FFA500", "#FF4433"]} // Purple to blue gradient
          textColor="white"
          cues={session.cues}
          onReset={resetTimer}
        />
      )}
      <View style={styles.controlsContainer}>
        <MuteToggleButton size={46} color="black" style={styles.muteButton} />
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
    marginTop: 40,
    gap: 20,
  },
  muteButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "orange",
    justifyContent: "center",
    alignItems: "center",
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
