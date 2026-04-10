import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/server";

// Start worker before all tests
beforeAll(() => server.listen());

//  Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());

//  Clean up after all tests are done
afterAll(() => server.close());

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
