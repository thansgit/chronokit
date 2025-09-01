import { formatClock } from "@/helpers/format";
import { Cue, SoundCue } from "@/types";
import { TYPE_COLORS, soundOptions, DEFAULT_SEGMENT_DURATION } from "@/helpers/constants";
import SegmentedTimeInput from "./SegmentedTimeInput";
import SoundSettings from "./SoundSettings";
import PatternBuilder from "./PatternBuilder";
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

  // Toggles for segment duration and pattern mode
  const toggleSegment = (value: boolean) => {
    if (value) {
      setEditedCue((prev) => ({
        ...prev,
        duration: (prev as any).duration || DEFAULT_SEGMENT_DURATION,
        color: TYPE_COLORS.segment,
      } as any));
      setIsPattern(false);
    } else {
      setEditedCue((prev) => {
        const { duration, ...rest } = prev as any;
        return { ...rest, color: TYPE_COLORS.trigger } as Cue;
      });
    }
  };
  const togglePattern = (value: boolean) => {
    setIsPattern(value);
    if (value) {
      // Pattern uses phases, remove parent duration and force segment color
      setEditedCue((prev) => {
        const { duration, ...rest } = prev as any;
        return { ...rest, color: TYPE_COLORS.segment } as Cue;
      });
    }
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
          <Text style={styles.sectionTitle}>Mode</Text>
          <View style={{ gap: 10 }}>
            <View style={styles.soundTypeToggle}>
              <Text style={styles.inputLabel}>Add duration (segment)</Text>
              <Switch
                value={isSegment && !isPattern}
                onValueChange={toggleSegment}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isSegment && !isPattern ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>
            <View style={styles.soundTypeToggle}>
              <Text style={styles.inputLabel}>Pattern (phases)</Text>
              <Switch
                value={isPattern}
                onValueChange={togglePattern}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isPattern ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* Time Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time</Text>
          <SegmentedTimeInput
            label="Start Time:"
            hours={startH}
            minutes={startM}
            seconds={startS}
            showHours={showHours}
            showMinutes={showMinutes}
            onChange={(h, m, s) => {
              setStartH(h);
              setStartM(m);
              setStartS(s);
              recomputeStart(h, m, s);
            }}
          />


          {isSegment && !isPattern && (
            <>
              <SegmentedTimeInput
                label="Duration:"
                hours={durH}
                minutes={durM}
                seconds={durS}
                showHours={showHours}
                showMinutes={showMinutes}
                onChange={(h, m, s) => {
                  setDurH(h);
                  setDurM(m);
                  setDurS(s);
                  recomputeDuration(h, m, s);
                }}
              />
              <Text style={styles.hintText}>
                = {formatClock((editedCue as any).duration || 0)}
              </Text>
            </>
          )}
        </View>

        {isPattern && (
          <PatternBuilder
            phases={phases}
            onAddPhase={addPhase}
            onRemovePhase={removePhase}
            onUpdatePhase={updatePhase}
            repeatCycles={repeatCycles}
            repeatUntilH={repeatUntilH}
            repeatUntilM={repeatUntilM}
            repeatUntilS={repeatUntilS}
            onChangeRepeatCycles={setRepeatCycles}
            onChangeRepeatUntilH={setRepeatUntilH}
            onChangeRepeatUntilM={setRepeatUntilM}
            onChangeRepeatUntilS={setRepeatUntilS}
          />
        )}

        {!isPattern && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound</Text>
            <SoundSettings
              isTTS={isTTS}
              onToggleTTS={handleSoundTypeToggle}
              ttsText={(editedCue.sound as any)?.text || ""}
              onChangeTTSText={handleTTSTextChange}
              selectedSoundId={(editedCue.sound as any)?.soundId}
              onSelectSound={handleSoundSelect}
            />
          </View>
        )}
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
