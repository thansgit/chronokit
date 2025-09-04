import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import SegmentedTimeInput from "./SegmentedTimeInput";
import SoundSettings from "./SoundSettings";
import { Cue, SoundCue } from "@/types";
import { DEFAULT_SEGMENT_DURATION, TYPE_COLORS, soundOptions } from "@/helpers/constants";
import { formatClock } from "@/helpers/format";

interface SegmentEditorProps {
  cue: Cue | null;
  onSave: (cue: Cue) => void;
  onDelete?: (cueId: string) => void;
  onClose: () => void;
  maxTime: number;
}

const SegmentEditor: React.FC<SegmentEditorProps> = ({ cue, onSave, onDelete, onClose, maxTime }) => {
  const [editedCue, setEditedCue] = useState<Cue>({
    id: Math.random().toString(36).substring(2, 10),
    startTime: 0,
    duration: DEFAULT_SEGMENT_DURATION,
    color: TYPE_COLORS.segment,
    sound: { type: "sound", soundId: soundOptions[0] },
  } as Cue);
  const [isTTS, setIsTTS] = useState(false);
  const [startH, setStartH] = useState("0");
  const [startM, setStartM] = useState("0");
  const [startS, setStartS] = useState("0");
  const [durH, setDurH] = useState("0");
  const [durM, setDurM] = useState("0");
  const [durS, setDurS] = useState("0");

  useEffect(() => {
    if (cue) {
      const enforcedColor = (cue.duration && cue.duration > 0) ? TYPE_COLORS.segment : TYPE_COLORS.trigger;
      setEditedCue({ ...(cue as any), color: enforcedColor, duration: Math.max(1, (cue as any).duration || DEFAULT_SEGMENT_DURATION) } as Cue);
      setIsTTS(cue.sound?.type === "tts");
      const s = Math.max(0, Math.floor(cue.startTime || 0));
      setStartH(String(Math.floor(s / 3600)));
      setStartM(String(Math.floor((s % 3600) / 60)));
      setStartS(String(s % 60));
      const d = Math.max(1, Math.floor((cue as any).duration || DEFAULT_SEGMENT_DURATION));
      setDurH(String(Math.floor(d / 3600)));
      setDurM(String(Math.floor((d % 3600) / 60)));
      setDurS(String(d % 60));
    } else {
      setEditedCue({
        id: Math.random().toString(36).substring(2, 10),
        startTime: 0,
        duration: DEFAULT_SEGMENT_DURATION,
        color: TYPE_COLORS.segment,
        sound: { type: "sound", soundId: soundOptions[0] },
      } as Cue);
      setIsTTS(false);
      setStartH("0");
      setStartM("0");
      setStartS("0");
      const d = DEFAULT_SEGMENT_DURATION;
      setDurH(String(Math.floor(d / 3600)));
      setDurM(String(Math.floor((d % 3600) / 60)));
      setDurS(String(d % 60));
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
    setEditedCue((prev) => ({ ...prev, startTime: total }));
  };

  const recomputeDuration = (hStr: string, mStr: string, sStr: string) => {
    const h = toInt(hStr);
    const m = toInt(mStr);
    const s = toInt(sStr);
    const total = Math.max(1, clampSec(h * 3600 + m * 60 + s));
    setEditedCue((prev) => ({ ...(prev as any), duration: total } as any));
  };

  const handleSoundTypeToggle = (value: boolean) => {
    setIsTTS(value);
    setEditedCue((prev) => {
      const newSound: SoundCue = value ? { type: "tts", text: "" } : { type: "sound", soundId: soundOptions[0] };
      return { ...prev, sound: newSound };
    });
  };

  const handleSoundSelect = (soundId: string) => {
    setEditedCue((prev) => ({ ...prev, sound: { type: "sound", soundId } }));
  };

  const handleTTSTextChange = (text: string) => {
    setEditedCue((prev) => ({ ...prev, sound: { type: "tts", text } }));
  };

  const handleSave = () => {
    const enforced: Cue = { ...(editedCue as any), color: TYPE_COLORS.segment };
    onSave(enforced);
  };

  const handleDelete = () => {
    if (editedCue && onDelete) onDelete(editedCue.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{cue ? "Edit Segment" : "New Segment"}</Text>
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

      <View style={styles.section}>
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
        <Text style={styles.hintText}>= {formatClock((editedCue as any).duration || 0)}</Text>
      </View>

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
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
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

export default SegmentEditor;
