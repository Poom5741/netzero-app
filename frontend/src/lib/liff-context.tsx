"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type Liff from "@line/liff";

interface LiffContextType {
  liff: typeof Liff | null;
  liffId: string | null;
  userId: string | null;
  accessToken: string | null;
  profile: { displayName: string; pictureUrl?: string; userId: string } | null;
  isLoading: boolean;
  error: Error | null;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  liffId: null,
  userId: null,
  accessToken: null,
  profile: null,
  isLoading: true,
  error: null,
});

export function useLiff() {
  return useContext(LiffContext);
}

interface LiffProviderProps {
  children: ReactNode;
  liffId?: string;
}

export function LiffProvider({ children, liffId }: LiffProviderProps) {
  const [liff, setLiff] = useState<typeof Liff | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<LiffContextType["profile"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initLiff() {
      try {
        const liffModule = await import("@line/liff");
        const liff = liffModule.default;

        const id = liffId || process.env.NEXT_PUBLIC_LIFF_ID || "";
        if (!id) {
          // Demo mode
          setLiff(liff);
          setUserId("demo-user");
          setProfile({ displayName: "Demo User", userId: "demo-user" });
          setIsLoading(false);
          return;
        }

        await liff.init({ liffId: id });
        setLiff(liff);

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setUserId(profile.userId);
          setAccessToken(liff.getAccessToken());
          setProfile({
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            userId: profile.userId,
          });
        } else {
          liff.login();
        }
      } catch (err) {
        // Fallback to demo mode
        setUserId("demo-user");
        setProfile({ displayName: "Demo User", userId: "demo-user" });
      } finally {
        setIsLoading(false);
      }
    }

    initLiff();
  }, [liffId]);

  return (
    <LiffContext.Provider value={{ liff, liffId: liffId || null, userId, accessToken, profile, isLoading, error }}>
      {children}
    </LiffContext.Provider>
  );
}
