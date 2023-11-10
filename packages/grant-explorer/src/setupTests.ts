import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";
import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";
const fetchMocker = createFetchMock(vi);
import ResizeObserver from "resize-observer-polyfill";
global.ResizeObserver = ResizeObserver;

global.Uint8Array = Uint8Array;

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// adds the 'fetchMock' global variable and rewires 'fetch' global to call 'fetchMock' instead of the real implementation
fetchMocker.enableMocks();

// changes default behavior of fetchMock to use the real 'fetch' implementation and not mock responses
fetchMocker.dontMock();

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

beforeEach(() => {
  // @headlessui/react needs IntersectionObserver but isn't available in test environment
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;

  // https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});
