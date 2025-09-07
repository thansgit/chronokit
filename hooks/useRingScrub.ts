import { useState } from "react";

export function useRingScrub(isRunning: boolean, onPickTime: (t: number) => void) {
  const [isScrubbing, setIsScrubbing] = useState(false);

  const onScrubStart = () => {
    if (isRunning) return;
    setIsScrubbing(true);
  };

  const onScrub = (_: { time: number; x: number; y: number }) => {
    if (isRunning) return;
    // no-op (internal overlay handles readout)
  };

  const onScrubEnd = ({ time }: { time: number; x: number; y: number }) => {
    if (isRunning) return;
    setIsScrubbing(false);
    onPickTime(time);
  };

  return { isScrubbing, onScrubStart, onScrub, onScrubEnd };
}
