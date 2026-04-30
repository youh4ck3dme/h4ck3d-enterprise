import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

vi.mock("./components/InstallPrompt", () => ({
  default: () => null,
}));

vi.mock("./components/LoginScreen", () => ({
  default: () => <div>Auth screen</div>,
}));

vi.mock("./components/Toaster", () => ({
  default: () => null,
}));

vi.mock("./components/ui/sonner", () => ({
  Toaster: () => null,
}));

vi.mock("./pages/Dashboard", () => ({
  default: () => <div>Builder workspace root</div>,
}));

vi.mock("./pages/builder/BuilderPage", () => ({
  default: () => <div>Four prompt builder workflow</div>,
}));

vi.mock("./pages/builder/BuilderComponentsPage", () => ({
  default: () => <div>Builder components route</div>,
}));

vi.mock("./pages/builder/BuilderPreviewPage", () => ({
  default: () => <div>Builder preview route</div>,
}));

vi.mock("./pages/blogmagica/BlogmagicaDashboard", () => ({
  default: () => <div>Blogmagica section</div>,
}));

vi.mock("./pages/blogmagica/BlogmagicaArticles", () => ({
  default: () => <div>Blogmagica Articles</div>,
}));

vi.mock("./pages/blogmagica/BlogmagicaNew", () => ({
  default: () => <div>Blogmagica New</div>,
}));

vi.mock("./pages/blogmagica/BlogmagicaSeo", () => ({
  default: () => <div>Blogmagica SEO</div>,
}));

vi.mock("./pages/blogmagica/BlogmagicaDrafts", () => ({
  default: () => <div>Blogmagica Drafts</div>,
}));

vi.mock("./pages/blogmagica/BlogmagicaPublished", () => ({
  default: () => <div>Blogmagica Published</div>,
}));

vi.mock("./pages/blogmagica/BlogmagicaCalendar", () => ({
  default: () => <div>Blogmagica Calendar</div>,
}));

vi.mock("./pages/LandingPage", () => ({
  default: () => <div>Landing page</div>,
}));

vi.mock("./pages/Pricing", () => ({
  default: () => <div>Pricing</div>,
}));

vi.mock("./pages/PrivacyPolicy", () => ({
  default: () => <div>Privacy</div>,
}));

vi.mock("./pages/TermsOfService", () => ({
  default: () => <div>Terms</div>,
}));

vi.mock("./pages/ResetPassword", () => ({
  default: () => <div>Reset</div>,
}));

vi.mock("./pages/AuthCallback", () => ({
  default: () => <div>Auth callback</div>,
}));

vi.mock("./pages/NotFound", () => ({
  default: () => <div>Not found</div>,
}));

describe("App routing entry", () => {
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
  };

  it("keeps the original landing page on root without showing login blocker", async () => {
    navigateTo("/");
    render(<App />);

    expect(await screen.findByText("Landing page")).toBeInTheDocument();
    expect(screen.queryByText("Auth screen")).not.toBeInTheDocument();
  });

  it("renders builder workflow routes", async () => {
    const routes = [
      ["/builder", "Four prompt builder workflow"],
      ["/components", "Builder components route"],
      ["/preview", "Builder preview route"],
      ["/builder/components", "Builder components route"],
      ["/builder/preview", "Builder preview route"],
    ] as const;

    for (const [path, text] of routes) {
      cleanup();
      navigateTo(path);
      render(<App />);
      expect(await screen.findByText(text)).toBeInTheDocument();
    }
  });

  it("keeps auth flow accessible via dedicated auth route", async () => {
    navigateTo("/auth/login");
    render(<App />);

    expect(await screen.findByText("Auth screen")).toBeInTheDocument();
  });

  it("renders blogmagica placeholder routes", async () => {
    navigateTo("/blogmagica/articles");
    render(<App />);

    expect(await screen.findByText("Blogmagica Articles")).toBeInTheDocument();
  });

  it("renders all required blogmagica placeholder routes", async () => {
    const routes = [
      ["/blogmagica", "Blogmagica section"],
      ["/blogmagica/new", "Blogmagica New"],
      ["/blogmagica/seo", "Blogmagica SEO"],
      ["/blogmagica/drafts", "Blogmagica Drafts"],
      ["/blogmagica/published", "Blogmagica Published"],
      ["/blogmagica/calendar", "Blogmagica Calendar"],
    ] as const;

    for (const [path, text] of routes) {
      cleanup();
      navigateTo(path);
      render(<App />);
      expect(await screen.findByText(text)).toBeInTheDocument();
    }
  });
});
