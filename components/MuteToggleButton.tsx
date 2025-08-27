import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useSound } from "../hooks/useSound";

type Props = {
  size?: number;
  color?: string;
  style?: any;
};

export function MuteToggleButton({
  size = 24,
  color = "#FFFFFF",
  style,
}: Props) {
  const { isMuted, toggleMute } = useSound();

  return (
    <TouchableOpacity
      onPress={toggleMute}
      style={[styles.container, style]}
      accessibilityLabel={isMuted ? "Unmute sounds" : "Mute sounds"}
      accessibilityRole="button"
    >
      <Ionicons
        name={isMuted ? "volume-mute" : "volume-high"}
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
