// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import { TextEncoder, TextDecoder } from "util";
import "whatwg-fetch";

global.TextEncoder = TextEncoder;
// @ts-expect-error I love jest
global.TextDecoder = TextDecoder;
global.Uint8Array = Uint8Array;
global.ResizeObserver = require("resize-observer-polyfill");

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

jest.mock("@rainbow-me/rainbowkit", () => ({
  ...jest.requireActual("@rainbow-me/rainbowkit"),
  ConnectButton: jest.fn(),
}));

// NB: use smaller delay for faster tests
jest.mock("./constants", () => ({
  ...jest.requireActual("./constants"),
  errorModalDelayMs: 0,
}));
