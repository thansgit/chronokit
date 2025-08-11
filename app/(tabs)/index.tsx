import { PlayPauseButton } from "@/components/PlayPauseButton";
import { StyleSheet, Text, View } from "react-native";

export default function PlayerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Player screen</Text>

      <PlayPauseButton isPlaying={false} onToggle={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
