import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import SidebarNav, { type Session } from "./SidebarNav";

const sessions: Session[] = [
  {
    id: "1",
    title: "Demo session",
    date: "Práve teraz",
    messages: [{ role: "user", content: "Hello" }],
  },
];

describe("SidebarNav", () => {
  it("renders BlogMagica section links", () => {
    render(
      <MemoryRouter>
        <SidebarNav
          currentView="tasks"
          onViewChange={() => {}}
          onNewSession={() => {}}
          sessions={sessions}
          activeSessionId="1"
          onLoadSession={() => {}}
          onDeleteSession={() => {}}
          onRenameSession={() => {}}
          hasPreviewCode={false}
          onOpenSettings={() => {}}
          onLogout={() => {}}
          isDemoMode={true}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /Articles/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /New Article/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SEO Briefs/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Drafts/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Published/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Content Calendar/ })).toBeInTheDocument();
  });

  it("hides logout action in demo mode", () => {
    render(
      <MemoryRouter>
        <SidebarNav
          currentView="tasks"
          onViewChange={() => {}}
          onNewSession={() => {}}
          sessions={sessions}
          activeSessionId="1"
          onLoadSession={() => {}}
          onDeleteSession={() => {}}
          onRenameSession={() => {}}
          hasPreviewCode={false}
          onOpenSettings={() => {}}
          isDemoMode={true}
        />
      </MemoryRouter>
    );

    expect(screen.queryByTitle("Odhlásiť sa")).toBeNull();
    expect(screen.getByText("Demo/Admin Mode")).toBeInTheDocument();
  });
});
