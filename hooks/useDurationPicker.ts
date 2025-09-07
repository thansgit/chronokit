import { useState } from "react";
import { timerService } from "@/services/TimerService";
import { useTimerStore } from "@/stores/useTimerStore";

export type DurationParts = { hours?: number; minutes?: number; seconds?: number };

export function useDurationPicker() {
  const [visible, setVisible] = useState(false);
  const resetTimerStore = useTimerStore((s) => s.resetTimer);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const confirm = ({ hours, minutes, seconds }: DurationParts) => {
    const pad = (n?: number) => String(n ?? 0).padStart(2, "0");
    const payload = {
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
    };
    timerService.createAndSetSession(payload);
    resetTimerStore();
    setVisible(false);
  };

  return { visible, open, close, confirm };
}
