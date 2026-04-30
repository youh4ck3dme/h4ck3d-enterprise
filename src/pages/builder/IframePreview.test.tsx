import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import IframePreview from "./IframePreview";

const partials = {
  "Header.html": '<link rel="stylesheet" href="./style-manifest.css" /><header class="gb-card"><h2>Header</h2></header>',
  "Features.html": '<section class="gb-card"><h2>Features</h2></section>',
  "Footer.html": '<footer class="gb-card"><p>Footer</p></footer>',
};

describe("IframePreview", () => {
  it("renders a styled isolated iframe preview", () => {
    render(<IframePreview partials={partials} cssManifest=".gb-card { border: 4px solid black; }" />);

    const iframe = screen.getByTitle("Live Preview") as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute("sandbox")).toBe("");
    expect(iframe.getAttribute("srcdoc")).toContain(".gb-card { border: 4px solid black; }");
    expect(iframe.getAttribute("srcdoc")).toContain("<header");
    expect(iframe.getAttribute("srcdoc")).not.toContain("cdn.tailwindcss.com");
    expect(iframe.getAttribute("srcdoc")).not.toContain("<script");
    expect(iframe.getAttribute("srcdoc")).not.toContain("style-manifest.css");
  });

  it("switches preview width by device", () => {
    render(<IframePreview partials={partials} cssManifest="" />);

    const frame = screen.getByTestId("preview-device-frame");
    expect(frame.style.width).toBe("100%");

    fireEvent.click(screen.getByRole("button", { name: "Mobile preview" }));
    expect(frame.style.width).toBe("375px");

    fireEvent.click(screen.getByRole("button", { name: "Tablet preview" }));
    expect(frame.style.width).toBe("768px");
  });
});
