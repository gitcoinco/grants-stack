// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import { TextEncoder, TextDecoder } from "util";
import ResizeObserver from "resize-observer-polyfill";
global.ResizeObserver = ResizeObserver;

global.TextEncoder = TextEncoder;
// @ts-expect-error I love jest
global.TextDecoder = TextDecoder;

beforeEach(() => {
  // @headlessui/react needs IntersectionObserver but isn't available in test environment
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

// @ts-expect-error I love jest
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
