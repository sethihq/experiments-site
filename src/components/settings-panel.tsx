"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Keyboard } from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { playToggleSound } from "@/lib/sounds";

// Settings store with persistence
interface SettingsState {
  preloader: boolean;
  showLabels: boolean;
  theme: "dark" | "light";
  systemTheme: boolean;
  soundEnabled: boolean;
  sidebarOpen: boolean;
  setPreloader: (value: boolean) => void;
  setShowLabels: (value: boolean) => void;
  setTheme: (value: "dark" | "light") => void;
  setSystemTheme: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
  setSidebarOpen: (value: boolean) => void;
  toggleSidebar: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      preloader: true,
      showLabels: true,
      theme: "dark",
      systemTheme: true,
      soundEnabled: false,
      sidebarOpen: true,
      setPreloader: (value) => set({ preloader: value }),
      setShowLabels: (value) => set({ showLabels: value }),
      setTheme: (value) => set({ theme: value }),
      setSystemTheme: (value) => set({ systemTheme: value }),
      setSoundEnabled: (value) => set({ soundEnabled: value }),
      setSidebarOpen: (value) => set({ sidebarOpen: value }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "experiments-settings",
    }
  )
);

// Hydration helper to prevent SSR mismatch
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

// Settings row component
function SettingsRow({
  label,
  value,
  onClick,
  playSound = true,
}: {
  label: string;
  value: string;
  onClick: () => void;
  playSound?: boolean;
}) {
  const handleClick = () => {
    onClick();
    if (playSound) {
      playToggleSound();
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        className="hover:bg-[var(--fg-04)] relative rounded-lg px-2.5 py-1.5 after:absolute after:bottom-0 after:left-0 after:h-2 after:w-full after:translate-y-full after:content-[''] group w-full transition-colors"
      >
        <div className="flex flex-1 items-center justify-between gap-2 text-sm">
          <div className="flex items-center justify-center gap-2 font-medium uppercase tracking-wide text-[var(--fg-80)]">
            {label}
          </div>
          <span className="bg-current/20 relative h-px flex-1 rounded-2xl" />
          <span className="text-[var(--fg-50)]">{value}</span>
        </div>
      </button>
    </li>
  );
}

// Settings cog icon
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 10.27 7 3.34" />
      <path d="m11 13.73-4 6.93" />
      <path d="M12 22v-2" />
      <path d="M12 2v2" />
      <path d="M14 12h8" />
      <path d="m17 20.66-1-1.73" />
      <path d="m17 3.34-1 1.73" />
      <path d="M2 12h2" />
      <path d="m20.66 17-1.73-1" />
      <path d="m20.66 7-1.73 1" />
      <path d="m3.34 17 1.73-1" />
      <path d="m3.34 7 1.73 1" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

// Settings Panel
export function SettingsPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    preloader,
    setPreloader,
    showLabels,
    setShowLabels,
    theme,
    setTheme,
    systemTheme,
    setSystemTheme,
    soundEnabled,
    setSoundEnabled,
  } = useSettings();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="fixed bottom-4 left-0 right-0 mx-auto z-50 w-[320px]"
          >
            <div className="bg-[var(--muted)] relative h-full space-y-2 overflow-hidden rounded-2xl p-2 border border-[var(--border)] shadow-2xl backdrop-blur-xl">
              <ul className="grid w-full space-y-1.5 text-sm">
                <SettingsRow
                  label="preloader"
                  value={preloader ? "true" : "false"}
                  onClick={() => setPreloader(!preloader)}
                />
                <SettingsRow
                  label="show Labels"
                  value={showLabels ? "true" : "false"}
                  onClick={() => setShowLabels(!showLabels)}
                />
                <SettingsRow
                  label="Theme"
                  value={theme}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
                <SettingsRow
                  label="system theme"
                  value={systemTheme ? "on" : "off"}
                  onClick={() => setSystemTheme(!systemTheme)}
                />
                <SettingsRow
                  label="sound"
                  value={soundEnabled ? "enabled" : "disabled"}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                />
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Keyboard shortcuts data
const shortcuts = [
  { key: "⌘K", description: "Open command menu" },
  { key: "G", description: "Go to gallery" },
  { key: "R", description: "Go to resources" },
  { key: "←/→", description: "Navigate experiments" },
  { key: "\\", description: "Toggle sidebar" },
  { key: "I", description: "Toggle info panel" },
  { key: "?", description: "Show this help" },
];

// Keyboard Shortcuts Panel
function KeyboardShortcutsPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />

          {/* Panel - centered like settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="fixed bottom-4 left-0 right-0 mx-auto z-50 w-[320px]"
          >
            <div className="bg-[var(--muted)] relative h-full space-y-2 overflow-hidden rounded-2xl p-2 border border-[var(--border)] shadow-2xl backdrop-blur-xl">
              <ul className="grid w-full space-y-1.5 text-sm">
                {shortcuts.map((s, i) => (
                  <motion.li
                    key={s.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <div className="hover:bg-[var(--fg-04)] relative rounded-lg px-2.5 py-1.5 transition-colors">
                      <div className="flex flex-1 items-center justify-between gap-2 text-sm">
                        <span className="font-medium uppercase tracking-wide text-[var(--fg-80)]">
                          {s.description}
                        </span>
                        <span className="bg-current/20 relative h-px flex-1 rounded-2xl" />
                        <kbd className="text-[var(--fg-50)] font-mono">
                          {s.key}
                        </kbd>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Floating Controls (bottom right, panel opens at bottom center)
export function FloatingControls() {
  const { soundEnabled, setSoundEnabled } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const hydrated = useHydrated();

  const handleSoundToggle = () => {
    // Play sound before toggling off so user hears feedback
    if (!soundEnabled) {
      playToggleSound();
    }
    setSoundEnabled(!soundEnabled);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "?") {
        e.preventDefault();
        setKeyboardOpen((o) => !o);
      } else if (e.key === "Escape" && keyboardOpen) {
        setKeyboardOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyboardOpen]);

  // Don't render until hydrated to prevent SSR mismatch
  if (!hydrated) return null;

  return (
    <>
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <KeyboardShortcutsPanel isOpen={keyboardOpen} onClose={() => setKeyboardOpen(false)} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="fixed bottom-4 right-4 z-30 flex items-center bg-[var(--muted)] rounded-2xl p-1 border border-[var(--border)]"
      >
        <button
          onClick={() => setKeyboardOpen(!keyboardOpen)}
          className="hover:bg-[var(--fg-05)] cursor-pointer rounded-xl size-7 flex items-center justify-center transition-all duration-200 ease-out active:scale-95 hidden lg:flex"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard size={16} className={`transition-colors duration-200 ${keyboardOpen ? "text-[var(--fg-70)]" : "text-[var(--fg-40)]"}`} />
        </button>
        <button
          onClick={handleSoundToggle}
          className="hover:bg-[var(--fg-05)] cursor-pointer rounded-xl size-7 flex items-center justify-center transition-all duration-200 ease-out active:scale-95"
          aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? (
            <Volume2 size={16} className="text-[var(--fg-60)]" />
          ) : (
            <VolumeX size={16} className="text-[var(--fg-40)]" />
          )}
        </button>
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex size-7 cursor-pointer items-center justify-center rounded-xl hover:bg-[var(--fg-05)] active:scale-90 transition-all duration-200 ease-out"
          aria-label="Settings"
        >
          <SettingsIcon className={`size-4 transition-colors duration-200 ${settingsOpen ? "text-[var(--fg-70)]" : "text-[var(--fg-40)]"}`} />
        </button>
      </motion.div>
    </>
  );
}
