import { create } from "zustand";
import { Session } from "@/types";

interface SessionState {
  // State
  session: Session | null;
  sessions: Session[];

  // Actions
  setSession: (session: Session) => void;
  addSession: (session: Session) => void;
  updateSession: (session: Session) => void;
  deleteSession: (sessionId: string) => void;
  getSessionById: (sessionId: string) => Session | undefined;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  session: null,
  sessions: [],

  // Actions
  setSession: (session) => {
    set({ session });
  },

  addSession: (session) => {
    set((state) => ({
      sessions: [...state.sessions, session],
    }));
  },

  updateSession: (updatedSession) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === updatedSession.id ? updatedSession : s
      ),
      // Also update current session if it's the one being updated
      session: state.session?.id === updatedSession.id ? updatedSession : state.session,
    }));
  },

  deleteSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      // Clear current session if it's the one being deleted
      session: state.session?.id === sessionId ? null : state.session,
    }));
  },

  getSessionById: (sessionId) => {
    return get().sessions.find((s) => s.id === sessionId);
  },
}));
