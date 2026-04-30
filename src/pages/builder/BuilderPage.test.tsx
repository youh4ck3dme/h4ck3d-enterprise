import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import BuilderPage from "./BuilderPage";

function renderBuilder() {
  return render(
    <MemoryRouter>
      <BuilderPage />
    </MemoryRouter>,
  );
}

describe("BuilderPage", () => {
  it("renders the four prompt workflow without auth", () => {
    renderBuilder();

    expect(screen.getByText("Čo ideš stavať?")).toBeInTheDocument();
    expect(screen.getByText("Pre koho to je?")).toBeInTheDocument();
    expect(screen.getByText("Aké sekcie alebo komponenty chceš?")).toBeInTheDocument();
    expect(screen.getByText("Ako to má vyzerať a kam to pôjde?")).toBeInTheDocument();
    expect(screen.queryByText(/Continue with Google/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Continue with GitHub/i)).not.toBeInTheDocument();
  });

  it("validates required prompts", () => {
    renderBuilder();

    fireEvent.click(screen.getByRole("button", { name: "Generovať komponenty" }));

    expect(screen.getByText("Prompt 1 (Čo ideš stavať?) je povinný.")).toBeInTheDocument();
    expect(screen.getByText("Prompt 2 (Pre koho to je?) je povinný.")).toBeInTheDocument();
  });

  it("generates preview and export tabs", async () => {
    renderBuilder();

    fireEvent.change(screen.getByLabelText("Čo ideš stavať?"), {
      target: { value: "Landing page pre PWA storefront" },
    });
    fireEvent.change(screen.getByLabelText("Pre koho to je?"), {
      target: { value: "Lokálne služby" },
    });
    fireEvent.change(screen.getByLabelText("Aké sekcie alebo komponenty chceš?"), {
      target: { value: "hero, feature grid, FAQ, CTA" },
    });
    fireEvent.change(screen.getByLabelText("Ako to má vyzerať a kam to pôjde?"), {
      target: { value: "dark SaaS Tailwind React" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Generovať komponenty" }));

    expect(screen.getByText("Import prijatý. BlogMagica pripravuje AI draft…")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Výstup je lokálny deterministic draft/)).toBeInTheDocument();
    });

    expect(await screen.findByRole("button", { name: "React" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "HTML" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "WordPress Safe HTML" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "JSON" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skopírovať" })).toBeInTheDocument();
  });
});
