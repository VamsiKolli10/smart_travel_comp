import "@testing-library/jest-dom";
import { vi } from "vitest";

const quiet =
  import.meta.env.MODE === "test" &&
  process.env.VERBOSE_TEST_LOGS !== "true";

if (quiet) {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
}

// jsdom doesn't implement matchMedia; provide a minimal stub for MUI theme checks
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
