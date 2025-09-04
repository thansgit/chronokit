import { TYPE_COLORS } from "@/helpers/constants";
import { Cue } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PatternBuilder, { PhaseDraft } from "./PatternBuilder";
import SegmentedTimeInput from "./SegmentedTimeInput";

interface PatternEditorProps {
  cue: Cue | null;
  onSave: (cue: Cue) => void;
  onDelete?: (cueId: string) => void;
  onClose: () => void;
  maxTime: number;
}

const PatternEditor: React.FC<PatternEditorProps> = ({
  cue,
  onSave,
  onDelete,
  onClose,
  maxTime,
}) => {
  const [startH, setStartH] = useState("0");
  const [startM, setStartM] = useState("0");
  const [startS, setStartS] = useState("0");

  const [phases, setPhases] = useState<PhaseDraft[]>([
    { duration: "4", label: "" },
  ]);
  const [repeatCycles, setRepeatCycles] = useState<string>("");
  const [cueId, setCueId] = useState<string>(
    Math.random().toString(36).substring(2, 10)
  );
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (cue) {
      setCueId(cue.id);
      const s = Math.max(0, Math.floor(cue.startTime || 0));
      setStartTime(s);
      setStartH(String(Math.floor(s / 3600)));
      setStartM(String(Math.floor((s % 3600) / 60)));
      setStartS(String(s % 60));
      if (Array.isArray(cue.phases) && cue.phases.length > 0) {
        setPhases(
          cue.phases.map((p) => ({
            duration: String(Math.max(1, Math.floor(p.duration || 0))),
            label: p.label ?? "",
          }))
        );
      } else {
        setPhases([{ duration: "4", label: "" }]);
      }
      const rep = cue.repeat as { cycles?: number } | undefined;
      if (rep?.cycles != null)
        setRepeatCycles(String(Math.max(0, Math.floor(rep.cycles))));
      else setRepeatCycles("");
    } else {
      const id = Math.random().toString(36).substring(2, 10);
      setCueId(id);
      setStartTime(0);
      setStartH("0");
      setStartM("0");
      setStartS("0");
      setPhases([{ duration: "4", label: "" }]);
      setRepeatCycles("");
    }
  }, [cue]);

  const toInt = (v: string) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const clampSec = (sec: number) => Math.min(Math.max(0, sec), maxTime);
  const showHours = maxTime >= 3600;
  const showMinutes = maxTime >= 60;

  const recomputeStart = (hStr: string, mStr: string, sStr: string) => {
    const h = toInt(hStr);
    const m = toInt(mStr);
    const s = toInt(sStr);
    const total = clampSec(h * 3600 + m * 60 + s);
    setStartTime(total);
  };

  const addPhase = () =>
    setPhases((prev) => [...prev, { duration: "4", label: "" }]);
  const removePhase = (i: number) =>
    setPhases((prev) => prev.filter((_, idx) => idx !== i));
  const updatePhase = (i: number, patch: Partial<PhaseDraft>) =>
    setPhases((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
    );

  const handleSave = () => {
    const builtPhases = phases
      .map((p, idx) => ({
        duration: Math.max(1, toInt(p.duration)),
        label: (p.label || undefined) as any,
        sound: { type: "tts", text: p.label || `Phase ${idx + 1}` } as any,
      }))
      .filter((p) => p.duration > 0);
    if (builtPhases.length === 0) return;

    const cyclesVal =
      repeatCycles.trim() === "" ? undefined : Math.max(0, toInt(repeatCycles));
    const repeat = cyclesVal != null ? { cycles: cyclesVal } : undefined;

    const cueToSave: Cue = {
      id: cueId,
      startTime: clampSec(Math.round(startTime || 0)),
      color: TYPE_COLORS.segment,
      phases: builtPhases as any,
      repeat: repeat as any,
    } as any;
    onSave(cueToSave);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(cueId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{cue ? "Edit Pattern" : "New Pattern"}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
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
      </View>

      <PatternBuilder
        phases={phases}
        onAddPhase={addPhase}
        onRemovePhase={removePhase}
        onUpdatePhase={updatePhase}
        repeatCycles={repeatCycles}
        onChangeRepeatCycles={setRepeatCycles}
      />

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
  section: {
    marginBottom: 20,
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

export default PatternEditor;
