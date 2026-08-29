import { createContext, useContext, useMemo, useState } from "react";

const defaultFlags = {
  translationModule: true,
  staysModule: true,
  discoverModule: true,
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
    const storage = window.localStorage;
    const raw =
      typeof storage?.getItem === "function"
        ? storage.getItem(STORAGE_KEY)
        : typeof Storage?.prototype?.getItem === "function"
        ? Storage.prototype.getItem.call(storage, STORAGE_KEY)
        : null;
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
    const storage = window.localStorage;
    if (typeof storage?.setItem === "function")
      storage.setItem(STORAGE_KEY, JSON.stringify(flags));
    else if (typeof Storage?.prototype?.setItem === "function")
      Storage.prototype.setItem.call(storage, STORAGE_KEY, JSON.stringify(flags));
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
