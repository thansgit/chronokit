import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

type Props = {
  isPlaying: boolean;
  onToggle: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function PlayPauseButton({ isPlaying, onToggle, disabled = false, style }: Props) {
  return (
    <TouchableOpacity 
      onPress={onToggle}
      disabled={disabled}
      style={[
        styles.circleButton,
        styles.orangeButton,
        disabled ? styles.disabledButton : null,
        style, // Allow custom styles to be passed
      ]}
    >
      <Ionicons 
        name={isPlaying ? "pause" : "play"} 
        size={46} 
        color="black" 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circleButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  orangeButton: {
    backgroundColor: "orange",
  },
  disabledButton: {
    backgroundColor: "#555",
    opacity: 0.7,
  },
});
