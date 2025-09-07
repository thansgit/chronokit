import { useState } from "react";

export function useAddCuePrompt() {
  const [visible, setVisible] = useState(false);
  const [draftStartTime, setDraftStartTime] = useState<number | null>(null);

  const openAt = (time: number) => {
    setDraftStartTime(time);
    setVisible(true);
  };

  const close = () => setVisible(false);

  return { visible, draftStartTime, openAt, close };
}
