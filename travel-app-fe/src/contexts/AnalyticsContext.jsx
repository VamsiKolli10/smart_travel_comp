import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import { useFeatureFlags } from "./FeatureFlagsContext.jsx";

const STORAGE_KEY = "stc:analytics-buffer";

const defaultValue = {
  trackEvent: () => {},
  trackModuleView: () => {},
  getRecentEvents: () => [],
};

const AnalyticsContext = createContext(defaultValue);

const readBuffer = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Failed to read analytics buffer", error);
    return [];
  }
};

const persistBuffer = (entries) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Failed to persist analytics buffer", error);
  }
};

const createEvent = (name, payload) => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${name}-${Date.now()}`,
  name,
  payload,
  timestamp: new Date().toISOString(),
});

export function AnalyticsProvider({ children }) {
  const { isEnabled } = useFeatureFlags();
  const bufferRef = useRef(readBuffer());

  const trackEvent = useCallback(
    (name, payload = {}) => {
      if (!isEnabled("analyticsEnabled")) return;
      const entry = createEvent(name, payload);
      bufferRef.current = [...bufferRef.current, entry].slice(-100);
      persistBuffer(bufferRef.current);
      if (import.meta.env.DEV) {
        console.info("[analytics]", entry);
      }
    },
    [isEnabled]
  );

  const trackModuleView = useCallback(
    (module, meta = {}) => trackEvent("module_view", { module, ...meta }),
    [trackEvent]
  );

  const getRecentEvents = useCallback(() => bufferRef.current, []);

  const value = useMemo(
    () => ({
      trackEvent,
      trackModuleView,
      getRecentEvents,
    }),
    [trackEvent, trackModuleView, getRecentEvents]
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
