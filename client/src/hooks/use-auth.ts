import { useCallback, useEffect, useState } from "react";

import { tasksService, type User } from "@/services/tasks-service";

type Session = Pick<User, "id" | "name">;
type AuthStatus = "idle" | "validating" | "authenticated";

function readStoredSession(): Session | null {
  const storedId = localStorage.getItem("userId");
  if (!storedId) return null;

  const id = Number(storedId);
  if (!Number.isFinite(id)) return null;

  return {
    id,
    name: localStorage.getItem("userName") || ""
  };
}

function persistSession(session: Session) {
  localStorage.setItem("userId", String(session.id));
  localStorage.setItem("userName", session.name);
}

function clearStoredSession() {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(readStoredSession);
  const [status, setStatus] = useState<AuthStatus>(() =>
    readStoredSession() ? "validating" : "idle"
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setStatus("idle");
  }, []);

  const login = useCallback((user: Session) => {
    persistSession(user);
    setSession(user);
    setStatus("authenticated");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const stored = readStoredSession();
      const legacyUserName = localStorage.getItem("userName");

      if (!stored && !legacyUserName) {
        setStatus("idle");
        return;
      }

      setStatus("validating");

      try {
        const user = stored
          ? await tasksService.getUser(stored.id)
          : await tasksService.resolveUser(legacyUserName!);

        if (cancelled) return;

        const nextSession = { id: user.id, name: user.name };
        persistSession(nextSession);
        setSession(nextSession);
        setStatus("authenticated");
      } catch {
        if (cancelled) return;

        clearStoredSession();
        setSession(null);
        setStatus("idle");
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const isValidating = status === "validating";
  const isLoggedIn = status === "authenticated";

  return {
    userName: session?.name ?? "",
    userId: session?.id ?? null,
    isLoggedIn,
    isValidating,
    login,
    logout
  };
}
