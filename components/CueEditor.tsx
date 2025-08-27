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
import { Cue, SoundCue } from "../assets/data/mock";

interface CueEditorProps {
  cue: Cue | null;
  onSave: (cue: Cue) => void;
  onDelete?: (cueId: string) => void;
  onClose: () => void;
  maxTime: number; // Maximum time in seconds (session duration)
}

// Predefined colors for the color picker
const colorOptions = [
  "#FF5252", // Red
  "#FF9800", // Orange
  "#FFEB3B", // Yellow
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#673AB7", // Purple
  "#E91E63", // Pink
  "#795548", // Brown
];

// Predefined sound options
const soundOptions = ["bell", "gong", "beep", "complete"];

const CueEditor = ({
  cue,
  onSave,
  onDelete,
  onClose,
  maxTime,
}: CueEditorProps) => {
  // State for edited cue with default initialization
  const [editedCue, setEditedCue] = useState<Cue>({
    id: Math.random().toString(36).substring(2, 10),
    type: "trigger",
    startTime: 0,
    color: colorOptions[0],
    sound: { type: "sound", soundId: soundOptions[0] },
  });
  const [isTTS, setIsTTS] = useState(false);

  // Initialize state when cue changes
  useEffect(() => {
    console.log("CueEditor useEffect triggered with cue:", cue);

    if (cue) {
      console.log("Initializing with existing cue data");
      setEditedCue({ ...cue });
      setIsTTS(cue.sound?.type === "tts");
    } else {
      console.log("No cue provided, using default values");
      // Default values for a new cue
      setEditedCue({
        id: Math.random().toString(36).substring(2, 10),
        type: "trigger",
        startTime: 0,
        color: colorOptions[0],
        sound: { type: "sound", soundId: soundOptions[0] },
      });
      setIsTTS(false);
    }
  }, [cue]);

  if (!editedCue) {
    console.log("editedCue is null, not rendering CueEditor");
    return null;
  }

  console.log("Rendering CueEditor with editedCue:", editedCue);

  // Handle time change
  const handleTimeChange = (value: string, field: "startTime" | "duration") => {
    const numValue = parseInt(value, 10) || 0;

    // Ensure time is within valid range
    const validValue = Math.min(Math.max(0, numValue), maxTime);

    setEditedCue((prev) => {
      return {
        ...prev,
        [field]: validValue,
      };
    });
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setEditedCue((prev) => {
      return {
        ...prev,
        color,
      };
    });
  };

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

  // Handle type toggle (trigger/segment)
  const handleTypeToggle = (type: "trigger" | "segment") => {
    setEditedCue((prev) => {
      if (type === "trigger") {
        // Convert to trigger - remove duration if it exists
        const { duration, ...triggerCue } = prev as any;
        return { ...triggerCue, type };
      } else {
        // Convert to segment - add duration if it doesn't exist
        return {
          ...prev,
          type,
          duration: (prev as any).duration || 5, // Default duration of 5 seconds
        };
      }
    });
  };

  // Handle save
  const handleSave = () => {
    console.log("Save button pressed, editedCue:", editedCue);
    if (editedCue) {
      console.log("Calling onSave with editedCue");
      onSave(editedCue);
    } else {
      console.log("Cannot save: editedCue is null");
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (editedCue && onDelete) {
      onDelete(editedCue.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{cue ? "Edit Cue" : "New Cue"}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainContent}>
        {/* Cue Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cue Type</Text>
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
          </View>
        </View>

        {/* Time Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time</Text>
          <View style={styles.timeInputContainer}>
            <Text style={styles.inputLabel}>Start Time (seconds):</Text>
            <TextInput
              style={styles.timeInput}
              value={editedCue.startTime.toString()}
              onChangeText={(value) => handleTimeChange(value, "startTime")}
              keyboardType="number-pad"
            />
          </View>

          {editedCue.type === "segment" && (
            <View style={styles.timeInputContainer}>
              <Text style={styles.inputLabel}>Duration (seconds):</Text>
              <TextInput
                style={styles.timeInput}
                value={(editedCue.duration || 0).toString()}
                onChangeText={(value) => handleTimeChange(value, "duration")}
                keyboardType="number-pad"
              />
            </View>
          )}
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.colorOptions}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  editedCue.color === color && styles.selectedColorOption,
                ]}
                onPress={() => handleColorSelect(color)}
              />
            ))}
          </View>
        </View>

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
  colorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: "white",
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
