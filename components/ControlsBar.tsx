import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MuteToggleButton } from "@/components/MuteToggleButton";

interface ControlsBarProps {
  style?: ViewStyle;
  onNew: () => void;
  onSave?: () => void; // optional
  onOpenSaved?: () => void; // optional
}

export const ControlsBar: React.FC<ControlsBarProps> = ({ style, onNew, onSave, onOpenSaved }) => {
  return (
    <View style={[styles.controlsContainer, style]}>      
      <MuteToggleButton size={46} color="black" style={styles.muteButton} />

      <TouchableOpacity style={styles.secondaryButton} onPress={onNew} accessibilityRole="button" accessibilityLabel="Create new session">
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.secondaryButtonText}>New</Text>
      </TouchableOpacity>

      {onSave && (
        <TouchableOpacity style={styles.secondaryButton} onPress={onSave} accessibilityRole="button" accessibilityLabel="Save session">
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.secondaryButtonText}>Save</Text>
        </TouchableOpacity>
      )}

      {onOpenSaved && (
        <TouchableOpacity style={styles.secondaryButton} onPress={onOpenSaved} accessibilityRole="button" accessibilityLabel="Open saved sessions">
          <Ionicons name="folder-open-outline" size={20} color="#fff" />
          <Text style={styles.secondaryButtonText}>Saved</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ControlsBar;
