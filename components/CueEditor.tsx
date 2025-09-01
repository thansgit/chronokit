import { formatClock } from "@/helpers/format";
import { Cue, SoundCue } from "@/types";
import { TYPE_COLORS, soundOptions, DEFAULT_SEGMENT_DURATION } from "@/helpers/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CueEditorProps {
  cue: Cue | null;
  onSave: (cue: Cue) => void;
  // Optional: when saving a pattern we may return multiple cues
  onSaveMany?: (cues: Cue[]) => void;
  onDelete?: (cueId: string) => void;
  onClose: () => void;
  maxTime: number; // Maximum time in seconds (session duration)
}

// Constants are now imported from helpers/constants

const CueEditor = ({
  cue,
  onSave,
  onSaveMany,
  onDelete,
  onClose,
  maxTime,
}: CueEditorProps) => {
  // State for edited cue with default initialization
  const [editedCue, setEditedCue] = useState<Cue>({
    id: Math.random().toString(36).substring(2, 10),
    type: "trigger",
    startTime: 0,
    color: TYPE_COLORS.trigger,
    sound: { type: "sound", soundId: soundOptions[0] },
  });
  const [isTTS, setIsTTS] = useState(false);
  // Local state for pattern builder
  const [isPattern, setIsPattern] = useState(false);
  const [patternInput, setPatternInput] = useState<string>("5-5-5-5");

  // Local segmented inputs for Start Time and Duration
  const [startH, setStartH] = useState<string>("0");
  const [startM, setStartM] = useState<string>("0");
  const [startS, setStartS] = useState<string>("0");
  const [durH, setDurH] = useState<string>("0");
  const [durM, setDurM] = useState<string>("0");
  const [durS, setDurS] = useState<string>("0");

  // Initialize state when cue changes
  useEffect(() => {
    console.log("CueEditor useEffect triggered with cue:", cue);

    if (cue) {
      console.log("Initializing with existing cue data");
      // Enforce color by type regardless of incoming color
      const enforcedColor = cue.type === "trigger" ? TYPE_COLORS.trigger : TYPE_COLORS.segment;
      setEditedCue({ ...cue, color: enforcedColor });
      setIsTTS(cue.sound?.type === "tts");
      // When editing an existing cue, default to non-pattern mode
      setIsPattern(false);
      // Initialize segmented fields from cue
      const s = Math.max(0, Math.floor(cue.startTime || 0));
      setStartH(String(Math.floor(s / 3600)));
      setStartM(String(Math.floor((s % 3600) / 60)));
      setStartS(String(s % 60));
      const d = Math.max(0, Math.floor((cue as any).duration || 0));
      setDurH(String(Math.floor(d / 3600)));
      setDurM(String(Math.floor((d % 3600) / 60)));
      setDurS(String(d % 60));
    } else {
      console.log("No cue provided, using default values");
      // Default values for a new cue
      setEditedCue({
        id: Math.random().toString(36).substring(2, 10),
        type: "trigger",
        startTime: 0,
        color: TYPE_COLORS.trigger,
        sound: { type: "sound", soundId: soundOptions[0] },
      });
      setIsTTS(false);
      setIsPattern(false);
      // Defaults for segmented fields
      setStartH("0");
      setStartM("0");
      setStartS("0");
      setDurH("0");
      setDurM("0");
      setDurS("0");
    }
  }, [cue]);

  if (!editedCue) {
    console.log("editedCue is null, not rendering CueEditor");
    return null;
  }

  console.log("Rendering CueEditor with editedCue:", editedCue);

  // Helpers to parse and clamp
  const toInt = (v: string) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const clampSec = (sec: number) => Math.min(Math.max(0, sec), maxTime);

  // Recompute startTime from H/M/S
  const recomputeStart = (hStr: string, mStr: string, sStr: string) => {
    const h = toInt(hStr);
    const m = toInt(mStr);
    const s = toInt(sStr);
    const total = clampSec(h * 3600 + m * 60 + s);
    setEditedCue((prev) => ({ ...prev, startTime: total }));
  };

  // Recompute duration from H/M/S
  const recomputeDuration = (hStr: string, mStr: string, sStr: string) => {
    const h = toInt(hStr);
    const m = toInt(mStr);
    const s = toInt(sStr);
    const total = clampSec(h * 3600 + m * 60 + s);
    setEditedCue((prev) => ({ ...(prev as any), duration: total } as any));
  };

  // Colors are fixed by type; no manual selection

  // Handle sound type toggle
  const handleSoundTypeToggle = (value: boolean) => {
    setIsTTS(value);

    // Update sound based on type
    setEditedCue((prev) => {
      const newSound: SoundCue = value
        ? { type: "tts", text: "" }
        : { type: "sound", soundId: soundOptions[0] };

      return {
        ...prev,
        sound: newSound,
      };
    });
  };

  // Handle sound selection
  const handleSoundSelect = (soundId: string) => {
    setEditedCue((prev) => {
      return {
        ...prev,
        sound: { type: "sound", soundId },
      };
    });
  };

  // Handle TTS text change
  const handleTTSTextChange = (text: string) => {
    setEditedCue((prev) => {
      return {
        ...prev,
        sound: { type: "tts", text },
      };
    });
  };

  // Handle type toggle (trigger/segment/pattern)
  const handleTypeToggle = (type: "trigger" | "segment" | "pattern") => {
    setEditedCue((prev) => {
      if (type === "trigger") {
        // Convert to trigger - remove duration if it exists
        const { duration, ...triggerCue } = prev as any;
        return { ...triggerCue, type, color: TYPE_COLORS.trigger };
      } else if (type === "segment") {
        // Convert to segment - add duration if it doesn't exist
        return {
          ...prev,
          type,
          duration: (prev as any).duration || DEFAULT_SEGMENT_DURATION, // Default duration
          color: TYPE_COLORS.segment,
        };
      } else {
        // Pattern is a virtual builder mode; keep base fields, mark local flag
        setIsPattern(true);
        return {
          ...(prev as any),
          type: "segment",
          duration: (prev as any).duration || DEFAULT_SEGMENT_DURATION,
          color: TYPE_COLORS.segment,
        } as any;
      }
    });
    setIsPattern(type === "pattern");
  };

  // Expand pattern string to numbers
  const parsePattern = (input: string): number[] => {
    // Accept delimiters like '-', ',', ' ' and filter non-positive numbers
    const parts = input
      .split(/[^0-9]+/g)
      .map((p) => parseInt(p, 10))
      .filter((n) => Number.isFinite(n) && n > 0);
    return parts;
  };

  // Build cues from pattern until maxTime
  const buildPatternCues = (): Cue[] => {
    const steps = parsePattern(patternInput);
    if (steps.length === 0) return [];
    const cues: Cue[] = [];
    const startAt = Math.max(
      0,
      Math.min(maxTime, Math.round(editedCue.startTime || 0))
    );
    let t = startAt;
    let idx = 0;
    while (t < maxTime) {
      const dur = steps[idx % steps.length];
      // Clamp duration to not exceed maxTime
      const effectiveDur = Math.max(1, Math.min(dur, maxTime - t));
      cues.push({
        id: Math.random().toString(36).substring(2, 10),
        type: "segment",
        startTime: t,
        duration: effectiveDur,
        color: TYPE_COLORS.pattern, // pattern-generated segments are green
        sound: editedCue.sound,
      } as Cue);
      t += effectiveDur;
      idx++;
      if (effectiveDur <= 0) break; // safety
    }
    return cues;
  };

  // Handle save
  const handleSave = () => {
    console.log("Save button pressed, editedCue:", editedCue);
    if (!editedCue) {
      console.log("Cannot save: editedCue is null");
      return;
    }
    // If in pattern mode, generate many cues
    if (isPattern) {
      const generated = buildPatternCues();
      if (generated.length === 0) return;
      if (typeof onSaveMany === "function") {
        onSaveMany(generated);
      } else {
        // Fallback: save just the first one if parent doesn't support many
        onSave(generated[0]);
      }
      return;
    }
    // Default single-cue save
    console.log("Calling onSave with editedCue");
    // Enforce color by type on save
    const enforced: Cue =
      editedCue.type === "trigger"
        ? { ...(editedCue as any), color: TYPE_COLORS.trigger }
        : { ...(editedCue as any), color: TYPE_COLORS.segment };
    onSave(enforced);
  };

  // Handle delete
  const handleDelete = () => {
    if (editedCue && onDelete) {
      onDelete(editedCue.id);
    }
  };

  // Whether to show hours/minutes based on maxTime context
  const showHours = maxTime >= 3600;
  const showMinutes = maxTime >= 60;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{cue ? "Edit Cue" : "New Cue"}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                editedCue.type === "trigger" && styles.selectedTypeButton,
              ]}
              onPress={() => handleTypeToggle("trigger")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  editedCue.type === "trigger" && styles.selectedTypeButtonText,
                ]}
              >
                Trigger
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                editedCue.type === "segment" && styles.selectedTypeButton,
              ]}
              onPress={() => handleTypeToggle("segment")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  editedCue.type === "segment" && styles.selectedTypeButtonText,
                ]}
              >
                Segment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                isPattern && styles.selectedTypeButton,
              ]}
              onPress={() => handleTypeToggle("pattern")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  isPattern && styles.selectedTypeButtonText,
                ]}
              >
                Pattern
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time</Text>
          <Text style={styles.inputLabel}>Start Time:</Text>
          <View style={styles.segmentedTimeRow}>
            {showHours && (
              <View style={styles.segmentedField}>
                <TextInput
                  style={styles.timeInput}
                  value={startH}
                  onChangeText={(v) => {
                    setStartH(v);
                    recomputeStart(v, startM, startS);
                  }}
                  keyboardType="number-pad"
                  placeholder="00"
                  placeholderTextColor="#999"
                />
                <Text style={styles.timeSuffix}>h</Text>
              </View>
            )}
            {showMinutes && (
              <View style={styles.segmentedField}>
                <TextInput
                  style={styles.timeInput}
                  value={startM}
                  onChangeText={(v) => {
                    setStartM(v);
                    recomputeStart(startH, v, startS);
                  }}
                  keyboardType="number-pad"
                  placeholder="00"
                  placeholderTextColor="#999"
                />
                <Text style={styles.timeSuffix}>m</Text>
              </View>
            )}
            <View style={styles.segmentedField}>
              <TextInput
                style={styles.timeInput}
                value={startS}
                onChangeText={(v) => {
                  setStartS(v);
                  recomputeStart(startH, startM, v);
                }}
                keyboardType="number-pad"
                placeholder="00"
                placeholderTextColor="#999"
              />
              <Text style={styles.timeSuffix}>s</Text>
            </View>
          </View>


          {editedCue.type === "segment" && !isPattern && (
            <>
              <Text style={styles.inputLabel}>Duration:</Text>
              <View style={styles.segmentedTimeRow}>
                {showHours && (
                  <View style={styles.segmentedField}>
                    <TextInput
                      style={styles.timeInput}
                      value={durH}
                      onChangeText={(v) => {
                        setDurH(v);
                        recomputeDuration(v, durM, durS);
                      }}
                      keyboardType="number-pad"
                      placeholder="00"
                      placeholderTextColor="#999"
                    />
                    <Text style={styles.timeSuffix}>h</Text>
                  </View>
                )}
                {showMinutes && (
                  <View style={styles.segmentedField}>
                    <TextInput
                      style={styles.timeInput}
                      value={durM}
                      onChangeText={(v) => {
                        setDurM(v);
                        recomputeDuration(durH, v, durS);
                      }}
                      keyboardType="number-pad"
                      placeholder="00"
                      placeholderTextColor="#999"
                    />
                    <Text style={styles.timeSuffix}>m</Text>
                  </View>
                )}
                <View style={styles.segmentedField}>
                  <TextInput
                    style={styles.timeInput}
                    value={durS}
                    onChangeText={(v) => {
                      setDurS(v);
                      recomputeDuration(durH, durM, v);
                    }}
                    keyboardType="number-pad"
                    placeholder="00"
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.timeSuffix}>s</Text>
                </View>
              </View>
              <Text style={styles.hintText}>
                = {formatClock((editedCue as any).duration || 0)}
              </Text>
            </>
          )}

          {isPattern && (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.inputLabel}>
                Pattern (seconds, e.g. 5-5-5-5 or 5-7-3):
              </Text>
              <TextInput
                style={[
                  styles.timeInput,
                  { width: undefined, textAlign: "left" },
                ]}
                value={patternInput}
                onChangeText={setPatternInput}
                placeholder="5-5-5-5"
                placeholderTextColor="#999"
              />
              <Text style={{ color: "#bbb", marginTop: 6 }}>
                Repeats until {maxTime}s. Generates colored segments with this
                pattern.
              </Text>
            </View>
          )}
        </View>

        {/* Color selection removed: colors are fixed per cue type */}

        {/* Sound Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound</Text>

          <View style={styles.soundTypeToggle}>
            <Text style={styles.inputLabel}>Text-to-Speech:</Text>
            <Switch
              value={isTTS}
              onValueChange={handleSoundTypeToggle}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isTTS ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          {isTTS ? (
            <View style={styles.ttsContainer}>
              <Text style={styles.inputLabel}>Message:</Text>
              <TextInput
                style={styles.ttsInput}
                value={(editedCue.sound as any)?.text || ""}
                onChangeText={handleTTSTextChange}
                placeholder="Enter text to speak"
                placeholderTextColor="#999"
                multiline
              />
            </View>
          ) : (
            <View style={styles.soundOptions}>
              {soundOptions.map((sound) => (
                <TouchableOpacity
                  key={sound}
                  style={[
                    styles.soundOption,
                    (editedCue.sound as any)?.soundId === sound &&
                      styles.selectedSoundOption,
                  ]}
                  onPress={() => handleSoundSelect(sound)}
                >
                  <Text
                    style={[
                      styles.soundOptionText,
                      (editedCue.sound as any)?.soundId === sound &&
                        styles.selectedSoundOptionText,
                    ]}
                  >
                    {sound}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  mainContent: {
    flexGrow: 1,
    paddingBottom: 20,
    maxHeight: 500,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
    marginHorizontal: 5,
    borderRadius: 5,
  },
  selectedTypeButton: {
    backgroundColor: "#ffd33d",
    borderColor: "#ffd33d",
  },
  typeButtonText: {
    color: "white",
  },
  selectedTypeButtonText: {
    color: "#25292e",
    fontWeight: "bold",
  },
  segmentedTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  segmentedField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeSuffix: {
    color: "#bbb",
    marginLeft: 4,
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  inputLabel: {
    color: "white",
    flex: 1,
  },
  timeInput: {
    backgroundColor: "#333",
    color: "white",
    padding: 8,
    borderRadius: 5,
    width: 80,
    textAlign: "center",
  },
  soundTypeToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  ttsContainer: {
    marginTop: 10,
  },
  ttsInput: {
    backgroundColor: "#333",
    color: "white",
    padding: 10,
    borderRadius: 5,
    height: 80,
    textAlignVertical: "top",
  },
  soundOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  soundOption: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
    margin: 5,
    minWidth: "45%",
    alignItems: "center",
  },
  selectedSoundOption: {
    backgroundColor: "#ffd33d",
  },
  soundOptionText: {
    color: "white",
  },
  selectedSoundOptionText: {
    color: "#25292e",
    fontWeight: "bold",
  },
  hintText: {
    color: "#bbb",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: "#FF5252",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#ffd33d",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#25292e",
    fontWeight: "bold",
  },
});

export default CueEditor;
