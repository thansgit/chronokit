import { DurationInput } from "@/components/DurationInput";
import { TimeNumPad } from "@/components/TimeNumPad";
import { useSession } from "@/hooks/useSession";
import { timerService } from "@/services/TimerService";
import { useTimerStore } from "@/stores/useTimerStore";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function InputDurationScreen() {
  const setTimeInputStore = useTimerStore((state) => state.setTimeInput);
  const { setSession } = useSession();

  const [timeInput, setTimeInput] = useState({
    hours: "",
    minutes: "",
    seconds: "",
  });

  // Update timer store and create/update session whenever time input changes
  useEffect(() => {
    // Update timer store
    setTimeInputStore(timeInput);

    // Create a session with the current time input
    const newSession = timerService.createAndSetSession(timeInput);
    if (newSession) {
      setSession(newSession);
      useTimerStore.getState().resetTimer();
    }
  }, [timeInput, setTimeInputStore, setSession]);

  const handleNumpadPress = (value: string) => {
    const allDigits = timeInput.hours + timeInput.minutes + timeInput.seconds;
    if (allDigits.length >= 6 && allDigits.indexOf("0") !== 0) {
      return;
    }

    if (value === "00") {
      if (allDigits.length > 0) {
        redistributeDigits(allDigits + "00");
      } else {
        addDigitAndShift("0");
        addDigitAndShift("0");
      }
      return;
    }
    addDigitAndShift(value);
  };

  const addDigitAndShift = (digit: string) => {
    const allDigits = timeInput.hours + timeInput.minutes + timeInput.seconds;
    const newDigits = allDigits + digit;
    redistributeDigits(newDigits);
  };

  const redistributeDigits = (digits: string) => {
    const limitedDigits = digits.slice(-6);
    const paddedDigits = limitedDigits.padStart(6, "0");

    const hours = paddedDigits.substring(0, 2);
    const minutes = paddedDigits.substring(2, 4);
    const seconds = paddedDigits.substring(4, 6);

    setTimeInput({
      hours,
      minutes,
      seconds,
    });
  };

  const handleDelete = () => {
    const allDigits = timeInput.hours + timeInput.minutes + timeInput.seconds;

    if (allDigits.length === 0) return;

    const newDigits = allDigits.slice(0, -1);
    redistributeDigits(newDigits);
  };

  return (
    <View style={styles.container}>
      <DurationInput
        hours={timeInput.hours}
        minutes={timeInput.minutes}
        seconds={timeInput.seconds}
      />

      <TimeNumPad onPress={handleNumpadPress} onDelete={handleDelete} />
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 40,
    gap: 20,
  },
  circleButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "orange",
  },
  configButton: {
    backgroundColor: "orange",
  },
  disabledButton: {
    backgroundColor: "#555",
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
    color: "white",
    textAlign: "center",
  },
});
