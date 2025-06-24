import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

type Props = {
  isPlaying: boolean;
  onToggle: () => void;
};

export function PlayPauseButton({ isPlaying, onToggle }: Props) {
  return (
    <TouchableOpacity onPress={onToggle} style={{ padding: 10 }}>
      <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#FF0000" />
    </TouchableOpacity>
  );
}
