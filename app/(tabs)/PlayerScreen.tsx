import CircularProgressTimer from "@/components/CircularProgressTimer";
import { MuteToggleButton } from "@/components/MuteToggleButton";
import { useTimer } from "@/hooks/useTimer";
import { useNavigation } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useSessionStore } from "@/stores/useSessionStore";
import { formatSessionTitle } from "@/helpers/format";
import { Ionicons } from "@expo/vector-icons";

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
  const updateSession = useSessionStore((s) => s.updateSession);

  // Local edit state for title
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState<string>("");
  const inputRef = useRef<TextInput>(null);

  // Default title derived from duration
  const defaultTitle = useMemo(() => {
    if (!session) return "";
    return formatSessionTitle(session.totalDuration);
  }, [session]);

  // Compute what to show as the current title (name or default)
  const displayTitle = useMemo(() => {
    if (!session) return "";
    const n = (session.name ?? "").trim();
    return n.length > 0 ? n : defaultTitle;
  }, [session, defaultTitle]);

  // Keep local input state in sync when session changes or edit toggles
  useEffect(() => {
    if (session) {
      setLocalName((session.name ?? "").trim() || defaultTitle);
    } else {
      setLocalName("");
    }
  }, [session, defaultTitle]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing]);

  // Start timer when screen is focused (if coming from another screen)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
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
        <View style={styles.titleWrapper}>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.titleRow}
              activeOpacity={0.7}
              onPress={() => setIsEditing(true)}
              accessibilityRole="button"
              accessibilityLabel="Edit session name"
            >
              <Text style={styles.titleText} numberOfLines={1}>
                {displayTitle}
              </Text>
              {/* Subtle pencil to indicate editability */}
              <Ionicons
                name="pencil-outline"
                size={20}
                color="#bbb"
                style={styles.titleIcon}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.editRow}>
              <TextInput
                ref={inputRef}
                style={styles.titleInput}
                value={localName}
                onChangeText={setLocalName}
                onEndEditing={() => {
                  const next = localName.trim();
                  updateSession({ ...session, name: next });
                  setIsEditing(false);
                }}
                onSubmitEditing={() => {
                  const next = localName.trim();
                  updateSession({ ...session, name: next });
                  setIsEditing(false);
                }}
                placeholder="Session name"
                placeholderTextColor="#888"
                selectTextOnFocus
                autoCorrect={false}
                autoCapitalize="sentences"
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => {
                  const next = localName.trim();
                  updateSession({ ...session, name: next });
                  setIsEditing(false);
                }}
                style={styles.confirmButton}
                accessibilityRole="button"
                accessibilityLabel="Confirm session name"
              >
                <Ionicons name="checkmark" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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
  titleWrapper: {
    width: "100%",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  titleText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
    maxWidth: "85%",
  },
  titleIcon: {
    marginLeft: 8,
    opacity: 0.7,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  titleInput: {
    flexShrink: 1,
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#2f343b",
    minWidth: 200,
    maxWidth: "75%",
  },
  confirmButton: {
    marginLeft: 8,
    backgroundColor: "#3a8bff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
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
