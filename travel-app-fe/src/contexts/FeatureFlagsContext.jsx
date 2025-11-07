import { createContext, useContext, useMemo, useState } from "react";

const defaultFlags = {
  translationModule: true,
  staysModule: true,
  analyticsEnabled: true,
};

const FeatureFlagsContext = createContext({
  flags: defaultFlags,
  isEnabled: () => true,
  updateFlags: () => {},
});

const STORAGE_KEY = "stc:feature-flags";

const readStoredFlags = () => {
  if (typeof window === "undefined") return defaultFlags;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFlags;
    const parsed = JSON.parse(raw);
    return { ...defaultFlags, ...parsed };
  } catch (error) {
    console.warn("Failed to read feature flags from storage", error);
    return defaultFlags;
  }
};

const persistFlags = (flags) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch (error) {
    console.warn("Failed to persist feature flags", error);
  }
};

export function FeatureFlagsProvider({ children }) {
  const [flags, setFlags] = useState(readStoredFlags);

  const updateFlags = (nextFlags) => {
    setFlags((prev) => {
      const merged = { ...prev, ...nextFlags };
      persistFlags(merged);
      return merged;
    });
  };

  const value = useMemo(
    () => ({
      flags,
      updateFlags,
      isEnabled: (flag) => Boolean(flags?.[flag]),
    }),
    [flags]
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
