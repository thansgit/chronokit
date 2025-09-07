import { useState } from "react";
import { Cue, Session } from "@/types";
import { normalizeCue } from "@/helpers/cue";

export type EditorType = "sound" | "segment" | "pattern" | null;

export function useCueEditor(
  session: Session | null,
  updateSession: (s: Session) => void
) {
  const [visible, setVisible] = useState(false);
  const [editorType, setEditorType] = useState<EditorType>(null);
  const [editingCue, setEditingCue] = useState<Cue | null>(null);

  const open = (type: Exclude<EditorType, null>, cue: Cue) => {
    setEditorType(type);
    setEditingCue(cue);
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
    setEditingCue(null);
    setEditorType(null);
  };

  const save = (cue: Cue) => {
    if (!session) return;
    const normalized = normalizeCue(cue as any, session.totalDuration);
    const updated = { ...session, cues: [...session.cues, normalized] };
    updateSession(updated);
    close();
  };

  return { visible, editorType, editingCue, open, close, save, setEditingCue };
}
