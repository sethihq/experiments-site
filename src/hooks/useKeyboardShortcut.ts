import { useEffect, useCallback } from "react";

interface KeyboardShortcutOptions {
  /** Prevent default browser behavior */
  preventDefault?: boolean;
  /** Stop event propagation */
  stopPropagation?: boolean;
  /** Only trigger when no input is focused */
  ignoreInputs?: boolean;
  /** Require meta key (Cmd on Mac, Ctrl on Windows) */
  meta?: boolean;
  /** Require shift key */
  shift?: boolean;
  /** Require alt key */
  alt?: boolean;
}

/**
 * useKeyboardShortcut - Hook for handling keyboard shortcuts
 *
 * @example
 * useKeyboardShortcut("k", () => openSearch(), { meta: true });
 * useKeyboardShortcut("Escape", () => closeModal());
 * useKeyboardShortcut(["ArrowLeft", "ArrowRight"], (e) => navigate(e.key));
 */
export function useKeyboardShortcut(
  keys: string | string[],
  callback: (event: KeyboardEvent) => void,
  options: KeyboardShortcutOptions = {}
) {
  const {
    preventDefault = true,
    stopPropagation = false,
    ignoreInputs = true,
    meta = false,
    shift = false,
    alt = false,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if input is focused
      if (ignoreInputs) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
      }

      // Check modifier keys
      if (meta && !(event.metaKey || event.ctrlKey)) return;
      if (shift && !event.shiftKey) return;
      if (alt && !event.altKey) return;

      // Check if key matches
      const keyList = Array.isArray(keys) ? keys : [keys];
      if (!keyList.includes(event.key)) return;

      if (preventDefault) {
        event.preventDefault();
      }

      if (stopPropagation) {
        event.stopPropagation();
      }

      callback(event);
    },
    [keys, callback, preventDefault, stopPropagation, ignoreInputs, meta, shift, alt]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
