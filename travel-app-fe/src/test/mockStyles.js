/**
 * Mock CSS imports for testing environment
 * This prevents CSS parsing errors in jsdom during tests
 */

// Mock all CSS imports to return empty objects
const mockCSS = {};

// Mock CSS modules
const mockCSSModule = {
  __esModule: true,
  default: {},
  ...mockCSS,
};

export default mockCSSModule;
export { mockCSS };
