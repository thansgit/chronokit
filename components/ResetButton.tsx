import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

type Props = {
  onReset: () => void;
};

export function ResetButton({ onReset }: Props) {
  return (
    <TouchableOpacity onPress={onReset} style={{ padding: 10 }}>
      <Ionicons name="refresh" size={30} color="#FF0000" />
    </TouchableOpacity>
  );
}
