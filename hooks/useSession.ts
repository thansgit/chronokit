import { timerService } from "@/services/TimerService";
import { useSessionStore } from "@/stores/useSessionStore";
import { Cue, Session } from "@/types";
import { useCallback } from "react";

export function useSession() {
  const session = useSessionStore((state) => state.session);
  const sessions = useSessionStore((state) => state.sessions);
  const setSession = useSessionStore((state) => state.setSession);
  const addSession = useSessionStore((state) => state.addSession);
  const updateSession = useSessionStore((state) => state.updateSession);
  const deleteSession = useSessionStore((state) => state.deleteSession);

  /**
   * Create a new session from time inputs
   */
  const createSession = useCallback(
    (hours: string, minutes: string, seconds: string): Session | null => {
      const newSession = timerService.createSession(hours, minutes, seconds);
      if (newSession) {
        addSession(newSession);
        setSession(newSession);
      }
      return newSession;
    },
    [addSession, setSession]
  );

  /**
   * Update a cue in the current session
   */
  const updateCue = useCallback(
    (cueId: string, updates: Partial<Cue>) => {
      if (!session) return;

      const updatedCues = session.cues.map((cue) =>
        cue.id === cueId ? { ...cue, ...updates } : cue
      ) as Cue[];

      const updatedSession: Session = {
        ...session,
        cues: updatedCues,
      };

      updateSession(updatedSession);
      setSession(updatedSession);
    },
    [session, updateSession, setSession]
  );

  /**
   * Add a new cue to the current session
   */
  const addCue = useCallback(
    (cue: Cue) => {
      if (!session) return;

      const updatedSession: Session = {
        ...session,
        cues: [...session.cues, cue],
      };

      updateSession(updatedSession);
      setSession(updatedSession);
    },
    [session, updateSession, setSession]
  );

  /**
   * Delete a cue from the current session
   */
  const deleteCue = useCallback(
    (cueId: string) => {
      if (!session) return;

      const updatedCues = session.cues.filter((cue) => cue.id !== cueId);

      const updatedSession: Session = {
        ...session,
        cues: updatedCues,
      };

      updateSession(updatedSession);
      setSession(updatedSession);
    },
    [session, updateSession, setSession]
  );

  return {
    session,
    sessions,
    setSession,
    addSession,
    updateSession,
    deleteSession,
    createSession,
    updateCue,
    addCue,
    deleteCue,
  };
}
