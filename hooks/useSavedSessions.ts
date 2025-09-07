import { useState } from "react";
import { useSessionStore } from "@/stores/useSessionStore";
import { useTimerStore } from "@/stores/useTimerStore";

export function useSavedSessions() {
  const [visible, setVisible] = useState(false);

  const sessions = useSessionStore((s) => s.sessions);
  const startNewSession = useSessionStore((s) => s.startNewSession);
  const select = useSessionStore((s) => s.selectSession);
  const remove = useSessionStore((s) => s.deleteSession);
  const save = useSessionStore((s) => s.saveCurrentSession);
  const resetTimer = useTimerStore((s) => s.resetTimer);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const createNew = () => {
    startNewSession();
    resetTimer();
    setVisible(false);
  };

  return { visible, open, close, sessions, createNew, select, remove, save };
}
