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

    expect(screen.getByRole("link", { name: "Articles" })).toHaveAttribute("href", "/blogmagica");
    expect(screen.getByRole("link", { name: "New Article" })).toHaveAttribute("href", "/blogmagica/new");
    expect(screen.getByRole("link", { name: "SEO Briefs" })).toHaveAttribute("href", "/blogmagica/seo");
    expect(screen.getByRole("link", { name: "Drafts" })).toHaveAttribute("href", "/blogmagica/drafts");
    expect(screen.getByRole("link", { name: "Published" })).toHaveAttribute("href", "/blogmagica/published");
    expect(screen.getByRole("link", { name: "Content Calendar" })).toHaveAttribute("href", "/blogmagica/calendar");
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
