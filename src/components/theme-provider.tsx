"use client";

import { useEffect } from "react";
import { useSettings, useHydrated } from "./settings-panel";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme } = useSettings();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;

    const root = document.documentElement;

    if (systemTheme) {
      // Follow system preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
      const updateTheme = () => {
        if (mediaQuery.matches) {
          root.classList.add("light");
        } else {
          root.classList.remove("light");
        }
      };

      updateTheme();
      mediaQuery.addEventListener("change", updateTheme);
      return () => mediaQuery.removeEventListener("change", updateTheme);
    } else {
      // Use manual theme setting
      if (theme === "light") {
        root.classList.add("light");
      } else {
        root.classList.remove("light");
      }
    }
  }, [theme, systemTheme, hydrated]);

  return <>{children}</>;
}
