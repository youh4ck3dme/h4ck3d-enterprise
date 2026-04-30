import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import InstallPrompt from "./InstallPrompt";

function dispatchInstallPromptEvent() {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  };

  event.prompt = vi.fn(async () => undefined);
  event.userChoice = Promise.resolve({ outcome: "accepted" });
  act(() => {
    window.dispatchEvent(event);
  });

  return event;
}

describe("InstallPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      media: "(display-mode: standalone)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  it("shows a manual install button after beforeinstallprompt", async () => {
    render(<InstallPrompt />);
    dispatchInstallPromptEvent();

    expect(await screen.findByRole("button", { name: "Inštalovať Appku" })).toBeInTheDocument();
  });

  it("calls the browser install prompt when clicked", async () => {
    render(<InstallPrompt />);
    const event = dispatchInstallPromptEvent();

    fireEvent.click(await screen.findByRole("button", { name: "Inštalovať Appku" }));

    await waitFor(() => {
      expect(event.prompt).toHaveBeenCalledTimes(1);
    });
  });
});
