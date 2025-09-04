import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import SegmentedTimeInput from "./SegmentedTimeInput";
import SoundSettings from "./SoundSettings";
import { Cue, SoundCue } from "@/types";
import { TYPE_COLORS, soundOptions } from "@/helpers/constants";

interface SoundCueEditorProps {
  cue: Cue | null;
  onSave: (cue: Cue) => void;
  onDelete?: (cueId: string) => void;
  onClose: () => void;
  maxTime: number;
}

const SoundCueEditor: React.FC<SoundCueEditorProps> = ({ cue, onSave, onDelete, onClose, maxTime }) => {
  const [editedCue, setEditedCue] = useState<Cue>({
    id: Math.random().toString(36).substring(2, 10),
    startTime: 0,
    color: TYPE_COLORS.trigger,
    sound: { type: "sound", soundId: soundOptions[0] },
  });
  const [isTTS, setIsTTS] = useState(false);
  const [startH, setStartH] = useState("0");
  const [startM, setStartM] = useState("0");
  const [startS, setStartS] = useState("0");

  useEffect(() => {
    if (cue) {
      const s = Math.max(0, Math.floor(cue.startTime || 0));
      setStartH(String(Math.floor(s / 3600)));
      setStartM(String(Math.floor((s % 3600) / 60)));
      setStartS(String(s % 60));
      setEditedCue({ ...cue, color: TYPE_COLORS.trigger });
      setIsTTS(cue.sound?.type === "tts");
    } else {
      setEditedCue({
        id: Math.random().toString(36).substring(2, 10),
        startTime: 0,
        color: TYPE_COLORS.trigger,
        sound: { type: "sound", soundId: soundOptions[0] },
      });
      setIsTTS(false);
      setStartH("0");
      setStartM("0");
      setStartS("0");
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
    const enforced: Cue = { ...(editedCue as any), color: TYPE_COLORS.trigger };
    onSave(enforced);
  };

  const handleDelete = () => {
    if (editedCue && onDelete) onDelete(editedCue.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{cue ? "Edit Sound Cue" : "New Sound Cue"}</Text>
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

export default SoundCueEditor;
