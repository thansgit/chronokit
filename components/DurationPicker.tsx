import React from "react";
import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient";

export type Duration = { hours?: number; minutes?: number; seconds?: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (d: { hours?: number; minutes?: number; seconds?: number }) => void;
};

export default function DurationPicker({ visible, onClose, onConfirm }: Props) {
  return (
    <TimerPickerModal
      hourLabel="h"
      minuteLabel="m"
      secondLabel="s"
      visible={visible}
      setIsVisible={(v) => (v ? undefined : onClose())}
      modalTitle="Set Duration"
      onCancel={onClose}
      closeOnOverlayPress
      LinearGradient={LinearGradient}
      styles={{
        theme: "dark",
        // Monospace font and larger size for clarity
        pickerItem: {
          fontSize: 30,
          fontFamily: "SpaceMono-Regular",
        },
        pickerLabel: {
          fontSize: 14,
          fontFamily: "SpaceMono-Regular",
        },
        // Reduce spacing between columns
        pickerContainer: {
          marginRight: 2,
        },
        // Give each column more width so 00 fits without clipping
        pickerItemContainer: {
          width: 86,
        },
      }}
      modalProps={{ overlayOpacity: 0.2 }}
      onConfirm={onConfirm}
    />
  );
}
