import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";
import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";
const fetchMocker = createFetchMock(vi);

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
