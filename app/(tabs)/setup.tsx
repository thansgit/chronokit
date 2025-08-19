import { NumPad } from "@/components/NumPad";
import { TimeInput } from "@/components/TimeInput";
import { useSessionStore } from "@/stores/useSessionStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SessionSetupScreen() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);

  // State for time input
  const [timeInput, setTimeInput] = useState({
    hours: "",
    minutes: "",
    seconds: "",
  });

  const handleNumpadPress = (value: string) => {
    const allDigits = timeInput.hours + timeInput.minutes + timeInput.seconds;

    // Check if we already have 6 digits (full time)
    if (allDigits.length >= 6 && allDigits.indexOf("0") !== 0) {
      // Time is already full, don't accept more input
      return;
    }

    // Special handling for '00'
    if (value === "00") {
      // If we have at least one digit, append two zeros and redistribute
      if (allDigits.length > 0) {
        redistributeDigits(allDigits + "00");
      } else {
        // If no digits yet, just add zeros normally
        addDigitAndShift("0");
        addDigitAndShift("0");
      }
      return;
    }

    // Handle single digit input by shifting everything left and adding the new digit
    addDigitAndShift(value);
  };

  // Adds a digit to the rightmost position and shifts everything left
  const addDigitAndShift = (digit: string) => {
    // Get all current digits as a single string
    const allDigits = timeInput.hours + timeInput.minutes + timeInput.seconds;

    // Add the new digit to the end
    const newDigits = allDigits + digit;

    // Redistribute the digits
    redistributeDigits(newDigits);
  };

  // Redistributes digits across hours, minutes, seconds
  const redistributeDigits = (digits: string) => {
    // Limit to 6 digits total (2 for each field)
    const limitedDigits = digits.slice(-6);

    // Pad with zeros on the left to ensure we have 6 digits
    const paddedDigits = limitedDigits.padStart(6, "0");

    // Split into hours, minutes, seconds
    const hours = paddedDigits.substring(0, 2);
    const minutes = paddedDigits.substring(2, 4);
    const seconds = paddedDigits.substring(4, 6);

    // Update state
    setTimeInput({
      hours,
      minutes,
      seconds,
    });
  };

  // Handle delete button press
  const handleDelete = () => {
    // Get all current digits as a single string
    const allDigits = timeInput.hours + timeInput.minutes + timeInput.seconds;

    if (allDigits.length === 0) return;

    // Remove the last digit
    const newDigits = allDigits.slice(0, -1);

    // Redistribute the remaining digits
    redistributeDigits(newDigits);
  };

  // Calculate total duration in seconds
  const calculateTotalDuration = () => {
    const hours = parseInt(timeInput.hours || "0", 10);
    const minutes = parseInt(timeInput.minutes || "0", 10);
    const seconds = parseInt(timeInput.seconds || "0", 10);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Create a new session and navigate to player
  const createSession = () => {
    const totalDuration = calculateTotalDuration();
    if (totalDuration === 0) return; // Don't create empty sessions

    // Generate simple IDs without uuid dependency
    const generateId = () => Math.random().toString(36).substring(2, 10);

    const newSession = {
      id: generateId(),
      name: `Session ${new Date().toLocaleTimeString()}`,
      totalDuration,
      cues: [
        {
          id: generateId(),
          type: "trigger" as const,
          startTime: 0,
          color: "#4B0082",
          sound: {
            type: "tts" as const,
            text: "Session started",
          },
        },
        {
          id: generateId(),
          type: "trigger" as const,
          startTime: totalDuration,
          color: "#FF4500",
          sound: {
            type: "sound" as const,
            soundId: "complete",
          },
        },
      ],
    };

    setSession(newSession);
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <TimeInput
        hours={timeInput.hours}
        minutes={timeInput.minutes}
        seconds={timeInput.seconds}
      />

      <NumPad onPress={handleNumpadPress} onDelete={handleDelete} />

      <TouchableOpacity
        style={[
          styles.startButton,
          calculateTotalDuration() === 0 ? styles.disabledButton : null,
        ]}
        onPress={createSession}
        disabled={calculateTotalDuration() === 0}
      >
        <Text style={styles.startButtonText}>Start Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  startButton: {
    backgroundColor: "#ffd33d",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 40,
    minWidth: 200,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#555",
    opacity: 0.7,
  },
  startButtonText: {
    color: "#25292e",
    fontSize: 18,
    fontWeight: "bold",
  },
});
