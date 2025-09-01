import CircularProgressTimer from "@/components/CircularProgressTimer";
import CueEditor from "@/components/CueEditor";
import ControlsBar from "@/components/ControlsBar";
import SavedSessionsModal from "@/components/SavedSessionsModal";
import { useTimer } from "@/hooks/useTimer";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { useSessionStore } from "@/stores/useSessionStore";
import { formatClock, formatSessionTitle } from "@/helpers/format";
import { Ionicons } from "@expo/vector-icons";
import { useTimerStore } from "@/stores/useTimerStore";
import { normalizeCue } from "@/helpers/cue";
import { generateId } from "@/helpers/id";
import { Cue } from "@/types";
import { TYPE_COLORS, TIMER_GRADIENT } from "@/helpers/constants";

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
  const router = useRouter();
  const updateSession = useSessionStore((s) => s.updateSession);
  const saveCurrentSession = useSessionStore((s) => s.saveCurrentSession);
  const sessions = useSessionStore((s) => s.sessions);
  const selectSession = useSessionStore((s) => s.selectSession);
  const deleteSession = useSessionStore((s) => s.deleteSession);
  const startNewSession = useSessionStore((s) => s.startNewSession);
  const resetTimerStore = useTimerStore((s) => s.resetTimer);

  // Local edit state for title
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState<string>("");
  const inputRef = useRef<TextInput>(null);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Scrub state for ring interaction
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [confirmAddVisible, setConfirmAddVisible] = useState(false);
  const [draftStartTime, setDraftStartTime] = useState<number | null>(null);

  // Cue editor modal state
  const [cueEditorVisible, setCueEditorVisible] = useState(false);
  const [editingCue, setEditingCue] = useState<Cue | null>(null);

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
      {/* Removed extra scrub readout to avoid duplicate display during dragging */}
      {session && (
        <View style={styles.timerBox}>
          <CircularProgressTimer
            totalDuration={session.totalDuration}
            currentValue={remainingSec}
            radius={160}
            strokeWidth={15}
            dashCount={60}
            dashWidth={3}
            gradientColors={[...TIMER_GRADIENT]}
            textColor="white"
            cues={session.cues}
            onReset={resetTimer}
            allowScrub={!isRunning}
            onScrubStart={() => {
              if (isRunning) return; // guard
              setIsScrubbing(true);
            }}
            onScrub={({ time, x, y }) => {
              if (isRunning) return;
              // No external readout; keep only internal overlay
            }}
            onScrubEnd={({ time, x, y }) => {
              if (isRunning) return;
              setIsScrubbing(false);
              setDraftStartTime(time);
              setConfirmAddVisible(true);
            }}
          />
        </View>
      )}
      <ControlsBar
        onNew={() => {
          startNewSession();
          resetTimerStore();
          router.push("/(tabs)/InputDurationScreen");
        }}
        onSave={() => saveCurrentSession()}
        onOpenSaved={() => setShowSavedModal(true)}
      />

      {/* Saved Sessions Modal */}
      <SavedSessionsModal
        visible={showSavedModal}
        sessions={sessions}
        onNew={() => {
          startNewSession();
          resetTimerStore();
          setShowSavedModal(false);
          router.push("/(tabs)/InputDurationScreen");
        }}
        onClose={() => setShowSavedModal(false)}
        onSelect={(id) => {
          selectSession(id);
          setShowSavedModal(false);
        }}
        onDelete={(id) => deleteSession(id)}
      />

      {/* Confirm Add Cue Modal */}
      <Modal
        visible={confirmAddVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmAddVisible(false)}
      >
        <View style={styles.smallModalBackdrop}>
          <View style={styles.smallModalCard}>
            <Text style={styles.smallModalTitle}>
              Add cue at {formatClock(Math.round(draftStartTime ?? 0))}?
            </Text>
            <View style={styles.smallModalRow}>
              <TouchableOpacity
                style={[styles.smallPill, { backgroundColor: "#3a3f47" }]}
                onPress={() => {
                  setConfirmAddVisible(false);
                }}
              >
                <Ionicons name="close" size={16} color="#fff" />
                <Text style={styles.smallPillText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallPill, { backgroundColor: "#3a8b55" }]}
                onPress={() => {
                  if (!session || draftStartTime == null) return;
                  // Open editor with prefilled cue
                  const newCue: Cue = {
                    id: generateId?.() ?? Math.random().toString(36).slice(2, 10),
                    startTime: Math.round(draftStartTime),
                    color: TYPE_COLORS.trigger, // trigger = no duration
                    sound: { type: "sound", soundId: "bell" },
                  };
                  setEditingCue(newCue);
                  setCueEditorVisible(true);
                  setConfirmAddVisible(false);
                }}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={styles.smallPillText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cue Editor Modal */}
      <Modal
        visible={cueEditorVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCueEditorVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: "80%" }]}> 
            {session && (
              <CueEditor
                cue={editingCue}
                maxTime={session.totalDuration}
                onSave={(cue) => {
                  if (!session) return;
                  const normalized = normalizeCue(cue as any, session.totalDuration);
                  const updated = { ...session, cues: [...session.cues, normalized] };
                  updateSession(updated);
                  setCueEditorVisible(false);
                  setEditingCue(null);
                }}
                onSaveMany={(cues) => {
                  if (!session) return;
                  const normalized = cues.map((c) => normalizeCue(c as any, session.totalDuration));
                  const updated = { ...session, cues: [...session.cues, ...normalized] };
                  updateSession(updated);
                  setCueEditorVisible(false);
                  setEditingCue(null);
                }}
                onClose={() => {
                  setCueEditorVisible(false);
                  setEditingCue(null);
                }}
              />
            )}
          </View>
        </View>
      </Modal>
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
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3a3f47",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  text: {
    color: "#fff",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#2b2f36",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  smallModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  smallModalCard: {
    backgroundColor: "#2b2f36",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    width: 260,
  },
  smallModalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  smallModalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  smallPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3a3f47",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  smallPillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  timerBox: {
    position: "relative",
    width: 320,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#bbb",
    textAlign: "center",
    paddingVertical: 20,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#3a3f47",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12,
  },
  sessionName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: "#a33b3b",
    borderRadius: 10,
  },
});
