import { useEffect, useMemo, useRef, useState } from "react";
import { Session } from "@/types";
import { TextInput } from "react-native";
import { formatSessionTitle } from "@/helpers/format";

export function useSessionTitle(
  session: Session | null,
  updateSession: (s: Session) => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState<string>("");
  const inputRef = useRef<TextInput>(null);

  // Default title derived from duration
  const defaultTitle = useMemo(() => {
    if (!session) return "";
    return formatSessionTitle(session.totalDuration);
  }, [session]);

  // Compute what to show as the current title (name or default)
  const displayTitle = useMemo(() => {
    if (!session) return "";
    const n = (session.name ?? "").trim();
    return n.length > 0 ? n : defaultTitle;
  }, [session, defaultTitle]);

  // Keep local input state in sync when session changes
  useEffect(() => {
    if (session) {
      setLocalName((session.name ?? "").trim() || defaultTitle);
    } else {
      setLocalName("");
    }
  }, [session, defaultTitle]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing]);

  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => setIsEditing(false);
  const confirmEditing = () => {
    if (!session) return;
    const next = localName.trim();
    updateSession({ ...session, name: next });
    setIsEditing(false);
  };

  return {
    isEditing,
    localName,
    setLocalName,
    inputRef,
    displayTitle,
    startEditing,
    cancelEditing,
    confirmEditing,
  };
}
