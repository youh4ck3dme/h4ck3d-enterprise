import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useMemo, useState } from "react";

type PreviewDevice = "desktop" | "tablet" | "mobile";

type IframePreviewProps = {
  partials: Record<string, string>;
  cssManifest: string;
};

const DEVICE_WIDTHS: Record<PreviewDevice, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const DEVICE_LABELS: Record<PreviewDevice, string> = {
  desktop: "Desktop preview",
  tablet: "Tablet preview",
  mobile: "Mobile preview",
};

const FALLBACK_UTILITY_CSS = `
* { box-sizing: border-box; }
html { min-height: 100%; background: #f3f4f6; }
body { margin: 0; min-height: 100%; background: var(--gb-surface, #f8fafc); color: var(--gb-ink, #111827); font-family: var(--gb-font-sans, system-ui, sans-serif); -webkit-font-smoothing: antialiased; }
a { color: inherit; }
img, svg { max-width: 100%; height: auto; }
section { max-width: 1120px; margin-inline: auto; }
.container, .max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl, .max-w-2xl { width: min(100% - 2rem, 1120px); margin-inline: auto; }
.max-w-7xl { max-width: 80rem; }
.max-w-6xl { max-width: 72rem; }
.max-w-5xl { max-width: 64rem; }
.max-w-4xl { max-width: 56rem; }
.max-w-2xl { max-width: 42rem; }
.mx-auto { margin-inline: auto; }
.text-center { text-align: center; }
.flex { display: flex; }
.grid { display: grid; }
.hidden { display: none; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.flex-col { flex-direction: column; }
.gap-2 { gap: .5rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
.space-y-2 > * + * { margin-top: .5rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.p-4, .p-md { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.px-4 { padding-inline: 1rem; }
.px-6 { padding-inline: 1.5rem; }
.py-6 { padding-block: 1.5rem; }
.py-12 { padding-block: 3rem; }
.py-16 { padding-block: 4rem; }
.py-20 { padding-block: 5rem; }
.mb-2 { margin-bottom: .5rem; }
.mb-3 { margin-bottom: .75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-12 { margin-bottom: 3rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }
.pt-8 { padding-top: 2rem; }
.rounded, .rounded-lg { border-radius: .75rem; }
.border { border: 1px solid var(--gb-border, #d1d5db); }
.border-t { border-top: 1px solid var(--gb-border, #d1d5db); }
.w-full { width: 100%; }
.min-h-screen { min-height: 100vh; }
.list-disc { list-style: disc; }
.pl-5 { padding-left: 1.25rem; }
.text-xs { font-size: .75rem; }
.text-sm { font-size: .875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: clamp(1.875rem, 2vw, 2.25rem); }
.text-4xl { font-size: clamp(2.25rem, 5vw, 3rem); }
.text-6xl { font-size: clamp(3rem, 7vw, 4.5rem); }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-black { font-weight: 900; }
.uppercase { text-transform: uppercase; }
.tracking-wide { letter-spacing: .025em; }
.bg-white { background: #fff; }
.text-white { color: #fff; }
.text-black { color: #000; }
.text-green-500 { color: #22c55e; }
.bg-blue-600 { background: #2563eb; }
.bg-green-600 { background: #16a34a; }
.bg-gray-600 { background: #4b5563; }
.hover\\:text-primary:hover { color: var(--gb-primary, #dc2626); }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
@media (min-width: 640px) {
  .sm\\:flex-row { flex-direction: row; }
}
@media (min-width: 768px) {
  .md\\:flex { display: flex; }
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .md\\:text-4xl { font-size: clamp(2.25rem, 4vw, 3rem); }
  .md\\:text-6xl { font-size: clamp(3rem, 7vw, 4.5rem); }
}
@media (min-width: 1024px) {
  .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
`;

function stripExternalStylesheetLinks(html: string): string {
  return html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, "").trim();
}

function orderedPartials(partials: Record<string, string>): string {
  const preferred = ["Header.html", "header", "Hero.html", "hero", "Features.html", "features", "Footer.html", "footer"];
  const used = new Set<string>();
  const chunks: string[] = [];

  for (const key of preferred) {
    const value = partials[key];
    if (value) {
      used.add(key);
      chunks.push(stripExternalStylesheetLinks(value));
    }
  }

  for (const [key, value] of Object.entries(partials)) {
    if (!used.has(key) && value) {
      chunks.push(stripExternalStylesheetLinks(value));
    }
  }

  return chunks.join("\n\n");
}

function buildPreviewDocument(partials: Record<string, string>, cssManifest: string): string {
  return `<!doctype html>
<html lang="sk">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
${FALLBACK_UTILITY_CSS}

${cssManifest}
    </style>
  </head>
  <body>
${orderedPartials(partials)}
  </body>
</html>`;
}

export default function IframePreview({ partials, cssManifest }: IframePreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const htmlContent = useMemo(() => buildPreviewDocument(partials, cssManifest), [partials, cssManifest]);

  return (
    <div className="overflow-hidden border-4 border-black bg-neutral-100">
      <div className="flex items-center justify-center gap-2 border-b-4 border-black bg-white p-2">
        {(["desktop", "tablet", "mobile"] as const).map((nextDevice) => {
          const Icon = nextDevice === "desktop" ? Monitor : nextDevice === "tablet" ? Tablet : Smartphone;
          return (
            <button
              key={nextDevice}
              type="button"
              onClick={() => setDevice(nextDevice)}
              aria-label={DEVICE_LABELS[nextDevice]}
              aria-pressed={device === nextDevice}
              className={`border-2 border-black p-2 transition ${
                device === nextDevice ? "bg-red-600 text-white" : "bg-white text-black hover:bg-yellow-400"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="flex justify-center overflow-auto bg-neutral-200 p-4">
        <div
          data-testid="preview-device-frame"
          className="shrink-0 transition-all duration-300"
          style={{
            width: DEVICE_WIDTHS[device],
            flex: `0 0 ${DEVICE_WIDTHS[device]}`,
            maxWidth: "100%",
          }}
        >
          <iframe
            title="Live Preview"
            srcDoc={htmlContent}
            sandbox=""
            className="block w-full border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{
              height: "620px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
