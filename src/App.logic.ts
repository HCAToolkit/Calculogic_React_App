/**
 * Configuration: cfg-appFrame (App Frame)
 * Concern File: Logic
 * Source NL: doc/nl-config/cfg-appFrame.md
 * Responsibility: Manage dark-mode preference state and document class sync for the app frame.
 * Invariants: Body class mirrors state; prefers-color-scheme is evaluated once on mount.
 */
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

// ─────────────────────────────────────────────
// 5. Logic – cfg-appFrame (App Frame)
// NL Sections: §5.1–5.3 in cfg-appFrame.md
// Purpose: Provide reusable hooks for theme preference control.
// Constraints: Only mutate body class; avoid introducing DOM structure.
// ─────────────────────────────────────────────

// [5.1] cfg-appFrame · Primitive · "Theme Preference State"
// Concern: Logic · Parent: "—" · Catalog: state.preference
// Notes: Initializes dark-mode boolean from prefers-color-scheme media query.
function useInitialDarkPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// [5.2] cfg-appFrame · Primitive · "Body Class Synchronization"
// Concern: Logic · Parent: "Theme Preference State" · Catalog: effect.domSideEffect
// Notes: Mirrors the dark-mode flag onto document.body without cleanup needs.
function useBodyClass(dark: boolean) {
  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);
}

// [5.3] cfg-appFrame · Primitive · "Toggle Handler"
// Concern: Logic · Parent: "Theme Preference State" · Catalog: action.toggle
// Notes: Provides a stable callback that flips the dark-mode boolean.
function useDarkToggle(setDark: Dispatch<SetStateAction<boolean>>) {
  return useCallback(() => {
    setDark(previous => !previous);
  }, [setDark]);
}

export function useAppFrameLogic() {
  const [dark, setDark] = useState(useInitialDarkPreference);
  useBodyClass(dark);
  const toggleDark = useDarkToggle(setDark);

  return { dark, toggleDark };
}
