import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface SegmentedTimeInputProps {
  label: string;
  hours: string;
  minutes: string;
  seconds: string;
  showHours: boolean;
  showMinutes: boolean;
  onChange: (h: string, m: string, s: string) => void;
}

//TODO: FIX

const SegmentedTimeInput: React.FC<SegmentedTimeInputProps> = ({
  label,
  hours,
  minutes,
  seconds,
  showHours,
  showMinutes,
  onChange,
}) => {
  return (
    <View>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.segmentedTimeRow}>
        {showHours && (
          <View style={styles.segmentedField}>
            <TextInput
              style={styles.timeInput}
              value={hours}
              onChangeText={(v) => onChange(v, minutes, seconds)}
              keyboardType="number-pad"
              placeholder="00"
              placeholderTextColor="#999"
            />
            <Text style={styles.timeSuffix}>h</Text>
          </View>
        )}
        {showMinutes && (
          <View style={styles.segmentedField}>
            <TextInput
              style={styles.timeInput}
              value={minutes}
              onChangeText={(v) => onChange(hours, v, seconds)}
              keyboardType="number-pad"
              placeholder="00"
              placeholderTextColor="#999"
            />
            <Text style={styles.timeSuffix}>m</Text>
          </View>
        )}
        <View style={styles.segmentedField}>
          <TextInput
            style={styles.timeInput}
            value={seconds}
            onChangeText={(v) => onChange(hours, minutes, v)}
            keyboardType="number-pad"
            placeholder="00"
            placeholderTextColor="#999"
          />
          <Text style={styles.timeSuffix}>s</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputLabel: {
    color: "white",
    flex: 1,
  },
  segmentedTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  segmentedField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeSuffix: {
    color: "#bbb",
    marginLeft: 4,
  },
  timeInput: {
    backgroundColor: "#333",
    color: "white",
    padding: 8,
    borderRadius: 5,
    width: 80,
    textAlign: "center",
  },
});

export default SegmentedTimeInput;
