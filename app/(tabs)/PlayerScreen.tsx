import CircularProgressTimer from "@/components/CircularProgressTimer";
import ControlsBar from "@/components/ControlsBar";
import DurationPicker from "@/components/DurationPicker";
import PatternEditor from "@/components/PatternEditor";
import SavedSessionsModal from "@/components/SavedSessionsModal";
import SegmentEditor from "@/components/SegmentEditor";
import SoundCueEditor from "@/components/SoundCueEditor";

import { TIMER_GRADIENT, TYPE_COLORS } from "@/helpers/constants";
import { formatClock, formatSessionTitle } from "@/helpers/format";
import { generateId } from "@/helpers/id";

import { useAddCuePrompt } from "@/hooks/useAddCuePrompt";
import { useCueEditor } from "@/hooks/useCueEditor";
import { useDurationPicker } from "@/hooks/useDurationPicker";
import { useRingScrub } from "@/hooks/useRingScrub";
import { useSavedSessions } from "@/hooks/useSavedSessions";
import { useSessionTitle } from "@/hooks/useSessionTitle";
import { useTimer } from "@/hooks/useTimer";

import { useSessionStore } from "@/stores/useSessionStore";
import { useTimerStore } from "@/stores/useTimerStore";

import { Cue } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PlayerScreen() {
  // Get timer state from hook
  const {
    session,
    isRunning,
    elapsedSec,
    remainingSec,
    progress,
    stopTimer,
    resetTimer,
    toggleTimer,
  } = useTimer();
  const updateSession = useSessionStore((s) => s.updateSession);
  const startNewSession = useSessionStore((s) => s.startNewSession);
  const deleteSession = useSessionStore((s) => s.deleteSession);
  const resetTimerStore = useTimerStore((s) => s.resetTimer);

  // Title hook manages syncing and focus
  const title = useSessionTitle(session, updateSession);
  const saved = useSavedSessions();
  // Hooks: duration picker and cue editor
  const durationPicker = useDurationPicker();

  // Scrub and add-cue prompt hooks
  const addCue = useAddCuePrompt();
  const scrub = useRingScrub(isRunning, (t) => addCue.openAt(t));

  // Cue editor modal state
  const cueEditor = useCueEditor(session, updateSession);

  // Default title (for dirty check). Display handled by hook
  const defaultTitle = useMemo(() => {
    if (!session) return "";
    return formatSessionTitle(session.totalDuration);
  }, [session]);

  // Determine if current working session has unsaved changes compared to persisted sessions list
  const isDirty = useMemo(() => {
    if (!session) return false;
    const savedSess = saved.sessions.find((s) => s.id === session.id);
    if (!savedSess) return true; // new, not yet saved
    try {
      return JSON.stringify(savedSess) !== JSON.stringify(session);
    } catch {
      // Fallback: if comparison fails, assume dirty to be safe
      return true;
    }
  }, [session, saved.sessions]);

  return (
    <View style={styles.container}>
      {session ? (
        <View style={styles.card}>
          {/* Close/Delete current session */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              if (session?.id) {
                deleteSession(session.id);
              } else {
                startNewSession();
              }
              resetTimerStore();
              // Remain on player screen; user can set duration again
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Delete session"
          >
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            {!title.isEditing ? (
              <View style={styles.titleRow}>
                <TouchableOpacity
                  style={styles.titleTapArea}
                  activeOpacity={0.7}
                  onPress={() => title.startEditing()}
                  accessibilityRole="button"
                  accessibilityLabel="Edit session name"
                >
                  <Text
                    style={styles.titleText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {title.displayTitle}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.titleDropdownButton}
                  activeOpacity={0.7}
                  onPress={() => saved.open()}
                  accessibilityRole="button"
                  accessibilityLabel="Open saved sessions"
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Ionicons
                    name="chevron-down-outline"
                    size={22}
                    color="#bbb"
                    style={styles.titleIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.titleDropdownButton}
                  activeOpacity={0.7}
                  onPress={() => saved.save()}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isDirty ? "Save session (unsaved changes)" : "Session saved"
                  }
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Ionicons
                    // Filled icon and accent color when dirty; outline and muted when clean
                    name={isDirty ? "save" : "save-outline"}
                    size={20}
                    color={isDirty ? "#4caf50" : "#bbb"}
                    style={styles.titleIcon}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.editRow}>
                <TextInput
                  ref={title.inputRef}
                  style={styles.titleInput}
                  value={title.localName}
                  onChangeText={title.setLocalName}
                  onEndEditing={() => {
                    title.confirmEditing();
                  }}
                  onSubmitEditing={() => {
                    title.confirmEditing();
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
                    title.confirmEditing();
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
                onScrubStart={scrub.onScrubStart}
                onScrub={scrub.onScrub}
                onScrubEnd={scrub.onScrubEnd}
              />
            </View>
          )}
          <ControlsBar
            style={{ marginTop: 28 }}
            onNew={() => {
              startNewSession();
              resetTimerStore();
              // Prompt for duration
              durationPicker.open();
            }}
          />
        </View>
      ) : (
        // No session: show Set Duration button centered
        <View style={styles.emptyCenter}>
          <TouchableOpacity
            onPress={() => durationPicker.open()}
            accessibilityRole="button"
            accessibilityLabel="Set duration"
            activeOpacity={0.8}
          >
            <View style={styles.setDurationBtn}>
              <Ionicons name="timer-outline" size={24} color="#C2C2C2" />
              <Text style={styles.setDurationText}>Set duration</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Saved Sessions Modal */}
      <SavedSessionsModal
        visible={saved.visible}
        sessions={saved.sessions}
        onNew={() => {
          saved.createNew();
          durationPicker.open();
        }}
        onClose={saved.close}
        onSelect={(id) => {
          saved.select(id);
          saved.close();
        }}
        onDelete={(id) => saved.remove(id)}
      />

      {/* Confirm Add Cue Modal */}
      <Modal
        visible={addCue.visible}
        transparent
        animationType="fade"
        onRequestClose={() => addCue.close()}
      >
        <View style={styles.smallModalBackdrop}>
          <View style={styles.smallModalCard}>
            <Text style={styles.smallModalTitle}>
              Add at {formatClock(Math.round(addCue.draftStartTime ?? 0))}
            </Text>
            <View style={[styles.smallModalRow, { justifyContent: "center" }]}>
              <TouchableOpacity
                style={[styles.smallPill, { backgroundColor: "#3a8bff" }]}
                onPress={() => {
                  if (!session || addCue.draftStartTime == null) return;
                  const newCue: Cue = {
                    id:
                      generateId?.() ?? Math.random().toString(36).slice(2, 10),
                    startTime: Math.round(addCue.draftStartTime),
                    color: TYPE_COLORS.trigger,
                    sound: { type: "sound", soundId: "bell" },
                  };
                  cueEditor.open("sound", newCue);
                  addCue.close();
                }}
              >
                <Ionicons name="volume-high" size={16} color="#fff" />
                <Text style={styles.smallPillText}>Sound</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallPill, { backgroundColor: "#3a8b55" }]}
                onPress={() => {
                  if (!session || addCue.draftStartTime == null) return;
                  const newCue: Cue = {
                    id:
                      generateId?.() ?? Math.random().toString(36).slice(2, 10),
                    startTime: Math.round(addCue.draftStartTime),
                    color: TYPE_COLORS.segment,
                    sound: { type: "sound", soundId: "bell" },
                    duration: undefined, // segment editor will set default
                  } as any;
                  cueEditor.open("segment", newCue);
                  addCue.close();
                }}
              >
                <Ionicons name="time" size={16} color="#fff" />
                <Text style={styles.smallPillText}>Segment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallPill, { backgroundColor: "#bb6bd9" }]}
                onPress={() => {
                  if (!session || addCue.draftStartTime == null) return;
                  const newCue: Cue = {
                    id:
                      generateId?.() ?? Math.random().toString(36).slice(2, 10),
                    startTime: Math.round(addCue.draftStartTime),
                    color: TYPE_COLORS.segment,
                  } as any;
                  cueEditor.open("pattern", newCue);
                  addCue.close();
                }}
              >
                <Ionicons name="grid" size={16} color="#fff" />
                <Text style={styles.smallPillText}>Pattern</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.smallModalRow, { marginTop: 10 }]}>
              <TouchableOpacity
                style={[
                  styles.smallPill,
                  {
                    backgroundColor: "#3a3f47",
                    flex: 1,
                    justifyContent: "center",
                  },
                ]}
                onPress={() => addCue.close()}
              >
                <Ionicons name="close" size={16} color="#fff" />
                <Text style={styles.smallPillText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cue Editor Modal */}
      <Modal
        visible={cueEditor.visible}
        transparent
        animationType="slide"
        onRequestClose={() => cueEditor.close()}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: "80%" }]}>
            {session && cueEditor.editorType === "sound" && (
              <SoundCueEditor
                cue={cueEditor.editingCue}
                maxTime={session.totalDuration}
                onSave={(cue) => cueEditor.save(cue as Cue)}
                onClose={() => cueEditor.close()}
              />
            )}
            {session && cueEditor.editorType === "segment" && (
              <SegmentEditor
                cue={cueEditor.editingCue}
                maxTime={session.totalDuration}
                onSave={(cue) => cueEditor.save(cue as Cue)}
                onClose={() => cueEditor.close()}
              />
            )}
            {session && cueEditor.editorType === "pattern" && (
              <PatternEditor
                cue={cueEditor.editingCue}
                maxTime={session.totalDuration}
                onSave={(cue) => cueEditor.save(cue as Cue)}
                onClose={() => cueEditor.close()}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Duration Picker Modal */}
      <DurationPicker
        visible={durationPicker.visible}
        onClose={durationPicker.close}
        onConfirm={({
          hours,
          minutes,
          seconds,
        }: {
          hours?: number;
          minutes?: number;
          seconds?: number;
        }) => durationPicker.confirm({ hours, minutes, seconds })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  card: {
    width: "92%",
    paddingHorizontal: 16,
    paddingTop: 155,
    paddingBottom: 24,
    borderRadius: 16,
    backgroundColor: "#2b2f36",
    alignItems: "center",
    // subtle shadow (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    // elevation (Android)
    elevation: 4,
  },
  emptyCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  setDurationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#8C8C8C",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  setDurationText: {
    color: "#C2C2C2",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrapper: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 48, // leave space for close button on the right
    width: "auto",
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  titleText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "left",
    maxWidth: "100%",
  },
  titleIcon: {
    marginLeft: 8,
    opacity: 0.7,
  },
  titleDropdownButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  titleTapArea: {
    width: "45%",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  titleInput: {
    flexShrink: 1,
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "left",
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
    alignSelf: "center",
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
