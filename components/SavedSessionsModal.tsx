import React from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";

export interface SavedSessionItem {
  id: string;
  name: string;
}

interface SavedSessionsModalProps {
  visible: boolean;
  sessions: SavedSessionItem[];
  onNew: () => void;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SavedSessionsModal: React.FC<SavedSessionsModalProps> = ({
  visible,
  sessions,
  onNew,
  onClose,
  onSelect,
  onDelete,
}) => {
  const data = useMemo(() => sessions ?? [], [sessions]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Saved Sessions</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity style={styles.smallPill} onPress={onNew}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.smallPillText}>New</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Close saved sessions">
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>No saved sessions yet</Text>}
            renderItem={({ item }) => (
              <View style={styles.sessionRow}>
                <TouchableOpacity style={styles.sessionInfo} onPress={() => onSelect(item.id)}>
                  <Text style={styles.sessionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)} accessibilityLabel="Delete session">
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#2b2f36",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  smallPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3a3f47",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  smallPillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    color: "#bbb",
    textAlign: "center",
    paddingVertical: 20,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#3a3f47",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12,
  },
  sessionName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: "#a33b3b",
    borderRadius: 10,
  },
});

export default SavedSessionsModal;
