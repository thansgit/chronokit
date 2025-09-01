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
    startTime: 0,
    color: TYPE_COLORS.trigger,
    sound: { type: "sound", soundId: soundOptions[0] },
    duration: 0,
  });
  const [isTTS, setIsTTS] = useState(false);
  // Local state for pattern builder
  const [isPattern, setIsPattern] = useState(false);
  // Editable phases for pattern builder
  const [phases, setPhases] = useState<Array<{
    duration: string;
    label: string;
    isTTS: boolean;
    ttsText: string;
    soundId: string;
  }>>([{ duration: "5", label: "", isTTS: true, ttsText: "", soundId: soundOptions[0] }]);
  // Repeat controls
  const [repeatCycles, setRepeatCycles] = useState<string>("");
  const [repeatUntilH, setRepeatUntilH] = useState<string>("0");
  const [repeatUntilM, setRepeatUntilM] = useState<string>("0");
  const [repeatUntilS, setRepeatUntilS] = useState<string>("0");

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
      // Enforce color by inferred type (duration presence)
      const enforcedColor = cue.duration && cue.duration > 0 ? TYPE_COLORS.segment : TYPE_COLORS.trigger;
      setEditedCue({ ...cue, color: enforcedColor });
      setIsTTS(cue.sound?.type === "tts");
      // When editing an existing cue, default to non-pattern mode
      const hasPhases = Array.isArray((cue as any).phases) && (cue as any).phases.length > 0;
      setIsPattern(!!hasPhases);
      if (hasPhases) {
        const cps = (cue as any).phases as { duration: number; sound?: SoundCue; label?: string }[];
        setPhases(
          cps.map((p) => ({
            duration: String(Math.max(1, Math.floor(p.duration || 0))),
            label: p.label ?? "",
            isTTS: p.sound?.type === "tts",
            ttsText: p.sound?.type === "tts" ? (p.sound.text ?? "") : "",
            soundId: p.sound?.type === "sound" ? (p.sound.soundId ?? soundOptions[0]) : soundOptions[0],
          }))
        );
        const rep = (cue as any).repeat as { cycles?: number; untilTime?: number } | undefined;
        if (rep?.cycles != null) setRepeatCycles(String(Math.max(0, Math.floor(rep.cycles))));
        else setRepeatCycles("");
        if (rep?.untilTime != null) {
          const ut = Math.max(0, Math.floor(rep.untilTime));
          setRepeatUntilH(String(Math.floor(ut / 3600)));
          setRepeatUntilM(String(Math.floor((ut % 3600) / 60)));
          setRepeatUntilS(String(ut % 60));
        } else {
          setRepeatUntilH("0");
          setRepeatUntilM("0");
          setRepeatUntilS("0");
        }
      } else {
        // Reset pattern builder state when editing a non-pattern cue
        setPhases([{ duration: "5", label: "", isTTS: true, ttsText: "", soundId: soundOptions[0] }]);
        setRepeatCycles("");
        setRepeatUntilH("0");
        setRepeatUntilM("0");
        setRepeatUntilS("0");
      }
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

  // Derived flags
  const isSegment = (editedCue?.duration ?? 0) > 0;

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

  // Handle type toggle (instant/segment/pattern) using unified Cue
  const handleTypeToggle = (type: "trigger" | "segment" | "pattern") => {
    setEditedCue((prev) => {
      if (type === "trigger") {
        // Convert to trigger - remove duration if it exists
        const { duration, ...triggerCue } = prev as any;
        return { ...triggerCue, color: TYPE_COLORS.trigger } as Cue;
      } else if (type === "segment") {
        // Convert to segment - add duration if it doesn't exist
        return {
          ...prev,
          duration: (prev as any).duration || DEFAULT_SEGMENT_DURATION, // Default duration
          color: TYPE_COLORS.segment,
        };
      } else {
        // Pattern is a virtual builder mode; keep base fields, mark local flag
        setIsPattern(true);
        return {
          ...(prev as any),
          duration: (prev as any).duration || DEFAULT_SEGMENT_DURATION,
          color: TYPE_COLORS.segment,
        } as any;
      }
    });
    setIsPattern(type === "pattern");
  };

  // Helpers for pattern builder
  const addPhase = () => {
    setPhases((prev) => [...prev, { duration: "5", label: "", isTTS: true, ttsText: "", soundId: soundOptions[0] }]);
  };
  const removePhase = (i: number) => {
    setPhases((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updatePhase = (i: number, patch: Partial<{ duration: string; label: string; isTTS: boolean; ttsText: string; soundId: string }>) => {
    setPhases((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };
  const repeatUntilTotal = () => {
    const h = toInt(repeatUntilH);
    const m = toInt(repeatUntilM);
    const s = toInt(repeatUntilS);
    return clampSec(h * 3600 + m * 60 + s);
  };

  // Handle save
  const handleSave = () => {
    console.log("Save button pressed, editedCue:", editedCue);
    if (!editedCue) {
      console.log("Cannot save: editedCue is null");
      return;
    }
    // If in pattern mode, save a single cue with phases and optional repeat
    if (isPattern) {
      const builtPhases = phases
        .map((p) => ({
          duration: Math.max(1, toInt(p.duration)),
          label: (p.label || undefined) as any,
          sound: p.isTTS
            ? ({ type: "tts", text: p.ttsText || "" } as SoundCue)
            : ({ type: "sound", soundId: p.soundId || soundOptions[0] } as SoundCue),
        }))
        .filter((p) => p.duration > 0);
      if (builtPhases.length === 0) return;

      const cyclesVal = repeatCycles.trim() === "" ? undefined : Math.max(0, toInt(repeatCycles));
      const untilVal = repeatUntilTotal();
      const useUntil = (repeatUntilH !== "0" || repeatUntilM !== "0" || repeatUntilS !== "0") && untilVal > 0;
      const repeat = cyclesVal != null && !useUntil ? { cycles: cyclesVal } : useUntil ? { untilTime: untilVal } : undefined;

      const startAt = clampSec(Math.round(editedCue.startTime || 0));
      const cueToSave: Cue = {
        id: editedCue.id,
        startTime: startAt,
        color: TYPE_COLORS.segment,
        phases: builtPhases as any,
        repeat: repeat as any,
        // Remove parent duration for patterns
      } as any;
      onSave(cueToSave);
      return;
    }
    // Default single-cue save
    console.log("Calling onSave with editedCue");
    // Enforce color by inferred type (duration presence) on save
    const enforced: Cue = (editedCue.duration && editedCue.duration > 0)
      ? { ...(editedCue as any), color: TYPE_COLORS.segment }
      : { ...(editedCue as any), color: TYPE_COLORS.trigger };
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
                !isSegment && !isPattern && styles.selectedTypeButton,
              ]}
              onPress={() => handleTypeToggle("trigger")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  !isSegment && !isPattern && styles.selectedTypeButtonText,
                ]}
              >
                Trigger
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                isSegment && !isPattern && styles.selectedTypeButton,
              ]}
              onPress={() => handleTypeToggle("segment")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  isSegment && !isPattern && styles.selectedTypeButtonText,
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


          {isSegment && !isPattern && (
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
              <Text style={styles.inputLabel}>Phases:</Text>
              {phases.map((ph, i) => (
                <View key={i} style={{ marginBottom: 10, borderWidth: 1, borderColor: "#444", borderRadius: 6, padding: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text style={{ color: "#fff" }}>Phase {i + 1}</Text>
                    <TouchableOpacity onPress={() => removePhase(i)}>
                      <Text style={{ color: "#FF5252" }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <Text style={styles.inputLabel}>Label</Text>
                    <TextInput
                      style={[styles.timeInput, { width: undefined, flex: 1, textAlign: "left" }]}
                      placeholder="optional"
                      placeholderTextColor="#999"
                      value={ph.label}
                      onChangeText={(v) => updatePhase(i, { label: v })}
                    />
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <Text style={styles.inputLabel}>Duration</Text>
                    <TextInput
                      style={[styles.timeInput, { width: 100 }]}
                      keyboardType="number-pad"
                      value={ph.duration}
                      onChangeText={(v) => updatePhase(i, { duration: v })}
                      placeholder="secs"
                      placeholderTextColor="#999"
                    />
                    <Text style={styles.timeSuffix}>s</Text>
                  </View>
                  <View style={[styles.soundTypeToggle, { marginTop: 4 }]}>
                    <Text style={styles.inputLabel}>Phase TTS</Text>
                    <Switch
                      value={ph.isTTS}
                      onValueChange={(val) => updatePhase(i, { isTTS: val })}
                      trackColor={{ false: "#767577", true: "#81b0ff" }}
                      thumbColor={ph.isTTS ? "#f5dd4b" : "#f4f3f4"}
                    />
                  </View>
                  {ph.isTTS ? (
                    <TextInput
                      style={[styles.ttsInput, { marginTop: 6 }]}
                      value={ph.ttsText}
                      onChangeText={(v) => updatePhase(i, { ttsText: v })}
                      placeholder="Enter text to speak for this phase"
                      placeholderTextColor="#999"
                      multiline
                    />
                  ) : (
                    <View style={[styles.soundOptions, { marginTop: 6 }]}>
                      {soundOptions.map((sound) => (
                        <TouchableOpacity
                          key={sound}
                          style={[
                            styles.soundOption,
                            ph.soundId === sound && styles.selectedSoundOption,
                          ]}
                          onPress={() => updatePhase(i, { soundId: sound })}
                        >
                          <Text
                            style={[
                              styles.soundOptionText,
                              ph.soundId === sound && styles.selectedSoundOptionText,
                            ]}
                          >
                            {sound}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              <TouchableOpacity onPress={addPhase} style={[styles.typeButton, { marginTop: 6 }]}>
                <Text style={styles.typeButtonText}>+ Add Phase</Text>
              </TouchableOpacity>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.sectionTitle}>Repeat</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Text style={styles.inputLabel}>Cycles</Text>
                  <TextInput
                    style={[styles.timeInput, { width: 100 }]}
                    keyboardType="number-pad"
                    value={repeatCycles}
                    onChangeText={setRepeatCycles}
                    placeholder="e.g. 4"
                    placeholderTextColor="#999"
                  />
                  <Text style={{ color: "#bbb" }}>or</Text>
                  <Text style={styles.inputLabel}>Until</Text>
                  <TextInput
                    style={[styles.timeInput, { width: 70 }]}
                    keyboardType="number-pad"
                    value={repeatUntilH}
                    onChangeText={setRepeatUntilH}
                    placeholder="hh"
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.timeSuffix}>h</Text>
                  <TextInput
                    style={[styles.timeInput, { width: 70 }]}
                    keyboardType="number-pad"
                    value={repeatUntilM}
                    onChangeText={setRepeatUntilM}
                    placeholder="mm"
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.timeSuffix}>m</Text>
                  <TextInput
                    style={[styles.timeInput, { width: 70 }]}
                    keyboardType="number-pad"
                    value={repeatUntilS}
                    onChangeText={setRepeatUntilS}
                    placeholder="ss"
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.timeSuffix}>s</Text>
                </View>
                <Text style={styles.hintText}>
                  Set either cycles or until time. Leaving both empty runs once.
                </Text>
              </View>
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
