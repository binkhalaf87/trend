"use client";

import { useEffect, useState } from "react";
import type { DbUser } from "@/types/db";

interface UserState {
  user: DbUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUser(): UserState {
  const [user, setUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) {
          if (res.status === 401) {
            setUser(null);
            return;
          }
          throw new Error("Failed to fetch user");
        }
        const data = await res.json();
        if (!cancelled) setUser(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();
    return () => { cancelled = true; };
  }, [tick]);

  return {
    user,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}
