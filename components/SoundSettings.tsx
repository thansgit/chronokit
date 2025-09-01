import React from "react";
import { View, Text, Switch, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { soundOptions } from "@/helpers/constants";

interface SoundSettingsProps {
  isTTS: boolean;
  onToggleTTS: (value: boolean) => void;
  ttsText: string;
  onChangeTTSText: (text: string) => void;
  selectedSoundId: string | undefined;
  onSelectSound: (soundId: string) => void;
}

const SoundSettings: React.FC<SoundSettingsProps> = ({
  isTTS,
  onToggleTTS,
  ttsText,
  onChangeTTSText,
  selectedSoundId,
  onSelectSound,
}) => {
  return (
    <View>
      <View style={styles.soundTypeToggle}>
        <Text style={styles.inputLabel}>Text-to-Speech:</Text>
        <Switch
          value={isTTS}
          onValueChange={onToggleTTS}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isTTS ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {isTTS ? (
        <View style={styles.ttsContainer}>
          <Text style={styles.inputLabel}>Message:</Text>
          <TextInput
            style={styles.ttsInput}
            value={ttsText}
            onChangeText={onChangeTTSText}
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
              style={[styles.soundOption, selectedSoundId === sound && styles.selectedSoundOption]}
              onPress={() => onSelectSound(sound)}
            >
              <Text
                style={[styles.soundOptionText, selectedSoundId === sound && styles.selectedSoundOptionText]}
              >
                {sound}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputLabel: {
    color: "white",
    flex: 1,
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
});

export default SoundSettings;
