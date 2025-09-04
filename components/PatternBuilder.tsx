import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface PhaseDraft {
  duration: string;
  label: string;
}

interface PatternBuilderProps {
  phases: PhaseDraft[];
  onAddPhase: () => void;
  onRemovePhase: (index: number) => void;
  onUpdatePhase: (index: number, patch: Partial<PhaseDraft>) => void;

  repeatCycles: string;
  onChangeRepeatCycles: (v: string) => void;
}

const toInt = (v: string) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const PatternBuilder: React.FC<PatternBuilderProps> = ({
  phases,
  onAddPhase,
  onRemovePhase,
  onUpdatePhase,
  repeatCycles,
  onChangeRepeatCycles,
}) => {
  return (
    <View style={{ marginTop: 6 }}>
      {phases.map((ph, i) => (
        <View key={i} style={styles.phaseCard}>
          <View style={styles.phaseHeaderRow}>
            <Text style={{ color: "#fff" }}>Phase {i + 1}</Text>
            <TouchableOpacity onPress={() => onRemovePhase(i)}>
              <Text style={{ color: "#FF5252" }}>Remove</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inlineRow}>
            <Text style={styles.inputLabel}>Label</Text>
            <TextInput
              style={[
                styles.timeInput,
                { width: undefined, flex: 1, textAlign: "left" },
              ]}
              placeholder="e.g. Inhale"
              placeholderTextColor="#999"
              value={ph.label}
              onChangeText={(v) => onUpdatePhase(i, { label: v })}
            />
          </View>

          <View style={styles.inlineRow}>
            <Text style={styles.inputLabel}>Duration</Text>
            <TouchableOpacity
              onPress={() =>
                onUpdatePhase(i, {
                  duration: String(Math.max(1, toInt(ph.duration) - 1)),
                })
              }
              style={[
                styles.typeButton,
                { paddingVertical: 6, paddingHorizontal: 10, flex: 0 },
              ]}
            >
              <Text style={styles.typeButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.timeInput, { width: 80 }]}
              keyboardType="number-pad"
              value={ph.duration}
              onChangeText={(v) => onUpdatePhase(i, { duration: v })}
              placeholder="secs"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={() =>
                onUpdatePhase(i, {
                  duration: String(Math.max(1, toInt(ph.duration) + 1)),
                })
              }
              style={[
                styles.typeButton,
                { paddingVertical: 6, paddingHorizontal: 10, flex: 0 },
              ]}
            >
              <Text style={styles.typeButtonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.timeSuffix}>s</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={onAddPhase}
        style={[styles.typeButton, { marginTop: 6 }]}
      >
        <Text style={styles.typeButtonText}>+ Add Phase</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.sectionTitle}>Repeat</Text>
        <View style={styles.repeatRow}>
          <Text style={styles.inputLabel}>Cycles</Text>
          <TextInput
            style={[styles.timeInput, { width: 100 }]}
            keyboardType="number-pad"
            value={repeatCycles}
            onChangeText={onChangeRepeatCycles}
            placeholder="e.g. 4"
            placeholderTextColor="#999"
          />
        </View>
        <Text style={styles.hintText}>
          Set cycles to repeat the phase sequence.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputLabel: {
    color: "white",
    flex: 1,
  },
  phaseCard: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 6,
    padding: 8,
  },
  phaseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  inlineRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 6,
  },
  timeInput: {
    backgroundColor: "#333",
    color: "white",
    padding: 8,
    borderRadius: 5,
    width: 80,
    textAlign: "center",
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
  typeButtonText: {
    color: "white",
  },
  timeSuffix: {
    color: "#bbb",
    marginLeft: 4,
  },
  repeatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  hintText: {
    color: "#bbb",
    marginTop: 4,
  },
});

export default PatternBuilder;
