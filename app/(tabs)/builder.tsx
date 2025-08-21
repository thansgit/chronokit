import { Cue } from "@/assets/data/mock";
import CueConfigPanel from "@/components/CueConfigPanel";
import VerticalDashedTimeline from "@/components/VerticalDashedTimeline";
import { useSessionStore } from "@/stores/useSessionStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BuilderScreen() {
  const router = useRouter();
  const session = useSessionStore((state) => state.session);
  const setSession = useSessionStore((state) => state.setSession);

  // State for cues
  const [cues, setCues] = useState<Cue[]>([]);
  const [selectedCue, setSelectedCue] = useState<Cue | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [isAddingCue, setIsAddingCue] = useState(false);

  // Initialize cues from session
  useEffect(() => {
    if (session?.cues) {
      setCues([...session.cues]);
    } else {
      // If no session, redirect to setup
      router.replace("/setup");
    }
  }, [session, router]);

  // Handle cue selection
  const handleCueSelect = (cue: Cue) => {
    console.log("handleCueSelect called with cue:", cue);
    setSelectedCue(cue);
    setShowConfigPanel(true);
    setIsAddingCue(false);
    console.log("Modal should open with existing cue data");
  };

  // Handle adding a new cue
  const handleAddCue = (timePosition: number) => {
    console.log("handleAddCue called with timePosition:", timePosition);

    // Generate a simple ID
    const generateId = () => Math.random().toString(36).substring(2, 10);

    // Create a new cue at the specified time position
    const newCue: Cue = {
      id: generateId(),
      type: "trigger",
      startTime: timePosition,
      color: "#FF9800", // Default color
      sound: {
        type: "sound",
        soundId: "bell",
      },
    };

    console.log("Created new cue:", newCue);
    setSelectedCue(newCue);
    setShowConfigPanel(true);
    setIsAddingCue(true);
    console.log("Modal should open for new cue configuration");
  };

  // Handle saving a cue
  const handleSaveCue = (cue: Cue) => {
    console.log("handleSaveCue called with cue:", cue);
    console.log("isAddingCue:", isAddingCue);

    if (isAddingCue) {
      // Add new cue
      console.log("Adding new cue to cues array");
      setCues((prevCues) => [...prevCues, cue]);
    } else {
      // Update existing cue
      console.log("Updating existing cue in cues array");
      setCues((prevCues) => prevCues.map((c) => (c.id === cue.id ? cue : c)));
    }

    console.log("Closing modal");
    setShowConfigPanel(false);
    setSelectedCue(null);
  };

  // Handle deleting a cue
  const handleDeleteCue = (cueId: string) => {
    setCues((prevCues) => prevCues.filter((c) => c.id !== cueId));
    setShowConfigPanel(false);
    setSelectedCue(null);
  };

  // Handle saving the session
  const handleSaveSession = () => {
    if (session) {
      const updatedSession = {
        ...session,
        cues,
      };
      setSession(updatedSession);
      router.push("/"); // Navigate to player
    }
  };

  // If no session, show loading or redirect
  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading session...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Builder</Text>
      <Text style={styles.subtitle}>
        Total Duration: {Math.floor(session.totalDuration / 60)}:
        {(session.totalDuration % 60).toString().padStart(2, "0")}
      </Text>

      <ScrollView style={styles.timelineContainer}>
        <VerticalDashedTimeline
          totalDuration={session.totalDuration}
          dashCount={Math.min(120, session.totalDuration)} // Max 120 dashes or one per second
          cues={cues}
          onCueSelect={handleCueSelect}
          onCueAdd={handleAddCue}
        />
      </ScrollView>

      {/* Floating Action Button for adding cues */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Default to adding at the middle of the session
          handleAddCue(Math.floor(session.totalDuration / 2));
        }}
      >
        <Ionicons name="add" size={24} color="#25292e" />
      </TouchableOpacity>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSession}>
        <Text style={styles.saveButtonText}>Save & Play</Text>
      </TouchableOpacity>

      {/* Cue Configuration Modal */}
      <Modal
        visible={showConfigPanel}
        animationType="fade"
        transparent={true}
        onShow={() => console.log("Modal shown, selectedCue:", selectedCue)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CueConfigPanel
              cue={selectedCue}
              onSave={handleSaveCue}
              onDelete={!isAddingCue ? handleDeleteCue : undefined}
              onClose={() => {
                console.log("onClose called");
                setShowConfigPanel(false);
              }}
              maxTime={session.totalDuration}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 20,
  },
  text: {
    color: "#fff",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 20,
  },
  timelineContainer: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#ffd33d",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  saveButton: {
    backgroundColor: "#ffd33d",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#25292e",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 40, // Add padding to center the modal better
  },
  modalContent: {
    backgroundColor: "#25292e",
    borderRadius: 20,
    width: "95%", // Slightly wider for more space
    maxHeight: "80%", // Limit height to ensure it fits on screen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    overflow: "hidden",
  },
});
