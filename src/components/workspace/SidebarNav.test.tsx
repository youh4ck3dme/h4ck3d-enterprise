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
  it("renders BlogMagica section links", async () => {
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

    expect(await screen.findByText("Articles")).toBeInTheDocument();
    expect(screen.getByText("New Article")).toBeInTheDocument();
    expect(screen.getByText("SEO Briefs")).toBeInTheDocument();
    expect(screen.getByText("Drafts")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("Content Calendar")).toBeInTheDocument();
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
