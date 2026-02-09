"use client";

import { useCallback, useEffect, useState } from "react";
import { useSettings } from "@/components/settings-panel";
import {
  getSoundManager,
  playHoverSound,
  playClickSound,
  playToggleSound,
  playNavigateSound,
} from "@/lib/sounds";

interface UseSoundReturn {
  playHover: () => void;
  playClick: () => void;
  playToggle: () => void;
  playNavigate: () => void;
  isReady: boolean;
}

/**
 * Hook for playing UI feedback sounds
 * Respects user's sound preference from settings
 * Respects prefers-reduced-motion
 */
export function useSound(): UseSoundReturn {
  const soundEnabled = useSettings((state) => state.soundEnabled);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Track sound manager readiness
  useEffect(() => {
    const checkReady = () => {
      setIsReady(getSoundManager().isReady());
    };

    // Check periodically until ready
    const interval = setInterval(checkReady, 100);
    checkReady();

    return () => clearInterval(interval);
  }, []);

  const shouldPlay = soundEnabled && !prefersReducedMotion;

  const playHover = useCallback(() => {
    if (shouldPlay) {
      playHoverSound();
    }
  }, [shouldPlay]);

  const playClick = useCallback(() => {
    if (shouldPlay) {
      playClickSound();
    }
  }, [shouldPlay]);

  const playToggle = useCallback(() => {
    if (shouldPlay) {
      playToggleSound();
    }
  }, [shouldPlay]);

  const playNavigate = useCallback(() => {
    if (shouldPlay) {
      playNavigateSound();
    }
  }, [shouldPlay]);

  return {
    playHover,
    playClick,
    playToggle,
    playNavigate,
    isReady,
  };
}
