import { useEffect, useState } from "react";
import BuilderShellLayout from "./BuilderShellLayout";
import {
  BuilderPromptInput,
  BuilderGenerationResult,
  generateBuilderDraft,
  validateBuilderPrompts,
} from "@/lib/builder-component-generator";
import { buildWordPressThemeZip, WORDPRESS_THEME_SLUG } from "@/lib/wordpress-theme-zip";
import IframePreview from "./IframePreview";
import { ParsedAIOutput } from "@/schema/ai-output";
import { requestAtomicBuilderOutput } from "@/lib/atomic-builder-client";
import {
  buildAtomicBuilderMessages,
  buildAtomicBuilderSystemOverride,
  getBuilderGatewayConfig,
  getSelectedBuilderModel,
} from "@/lib/builder-ai";

type OutputMode = "react" | "html" | "wordpress" | "partials" | "css" | "theme" | "json";
const BUILDER_REMOTE_TIMEOUT_MS = 6000;

const TAB_LABELS: Array<{ id: OutputMode; label: string }> = [
  { id: "react", label: "React" },
  { id: "html", label: "HTML" },
  { id: "wordpress", label: "WordPress Safe HTML" },
  { id: "partials", label: "Partial Files" },
  { id: "css", label: "CSS Manifest" },
  { id: "theme", label: "theme.json" },
  { id: "json", label: "JSON" },
];

function resolveOutputText(result: BuilderGenerationResult, mode: OutputMode): string {
  switch (mode) {
    case "react":
      return result.outputs.react;
    case "wordpress":
      return result.outputs.wordpressHtml;
    case "partials":
      return Object.entries(result.outputs.partials)
        .map(([fileName, content]) => `<!-- ${fileName} -->\n${content}`)
        .join("\n\n");
    case "css":
      return result.outputs.cssManifest;
    case "theme":
      return result.outputs.wordpressThemeJson;
    case "json":
      return result.outputs.json;
    default:
      return result.outputs.html;
  }
}

function progressText(elapsedSeconds: number): string {
  if (elapsedSeconds <= 20) return "Importujem obsah…";
  if (elapsedSeconds <= 60) return "Generujem AI draft…";
  return "Pripravujem SEO metadata…";
}

function longRunningHint(elapsedSeconds: number): string | null {
  if (elapsedSeconds >= 90) {
    return "Ak sa náhľad ešte nezobrazí automaticky, otvorte Drafts a skontrolujte stav spracovania.";
  }

  if (elapsedSeconds >= 45) {
    return "AI generovanie môže trvať 1–2 minúty. Nezatváraj okno a neposielaj import znova.";
  }

  return null;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function normalizeAiPartials(partials: Record<string, string>): Record<string, string> {
  const normalized = { ...partials };
  const values = Object.values(partials).filter((value) => value.trim().length > 0);

  if (!normalized["Header.html"]) {
    normalized["Header.html"] = partials.header || partials.hero || values[0] || "";
  }

  if (!normalized["Features.html"]) {
    normalized["Features.html"] =
      partials.features || partials.pricing || partials.faq || values.slice(1, -1).join("\n\n") || values[1] || normalized["Header.html"];
  }

  if (!normalized["Footer.html"]) {
    normalized["Footer.html"] = partials.footer || partials.finalCta || partials.cta || values.at(-1) || normalized["Features.html"];
  }

  return normalized;
}

function buildHtmlDocument(title: string, cssManifest: string, partials: Record<string, string>): string {
  return [
    "<!doctype html>",
    "<html>",
    "  <head>",
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `    <title>${title}</title>`,
    "    <style>",
    cssManifest,
    "    </style>",
    "  </head>",
    '  <body class="bg-surface">',
    partials["Header.html"],
    partials["Features.html"],
    partials["Footer.html"],
    "  </body>",
    "</html>",
  ].join("\n");
}

function buildRemoteResult(payload: BuilderPromptInput, aiOutput: ParsedAIOutput): BuilderGenerationResult {
  const localDraft = generateBuilderDraft(payload);
  if (!localDraft.valid) {
    return localDraft;
  }

  const partials = normalizeAiPartials(aiOutput.partials);
  const wordpressHtml = [partials["Header.html"], partials["Features.html"], partials["Footer.html"]]
    .filter((value) => value.trim().length > 0)
    .join("\n\n");

  return {
    ...localDraft,
    source: "remote-ai",
    schema: {
      ...localDraft.schema,
      atomicPlan: {
        atoms: aiOutput.atomicPlan.atoms.length > 0 ? aiOutput.atomicPlan.atoms : localDraft.schema.atomicPlan.atoms,
        molecules:
          aiOutput.atomicPlan.molecules.length > 0
            ? aiOutput.atomicPlan.molecules
            : localDraft.schema.atomicPlan.molecules,
        organisms:
          aiOutput.atomicPlan.sections.length > 0
            ? aiOutput.atomicPlan.sections
            : localDraft.schema.atomicPlan.organisms,
      },
      warnings: [
        "Vystup bol vygenerovany cez AI gateway.",
        ...aiOutput.warnings,
      ],
    },
    outputs: {
      ...localDraft.outputs,
      react: aiOutput.reactComponent,
      tailwindReact: aiOutput.reactComponent,
      html: buildHtmlDocument(localDraft.schema.title, aiOutput.cssManifest, partials),
      wordpressHtml,
      partials,
      cssManifest: aiOutput.cssManifest,
      wordpressThemeJson: JSON.stringify(aiOutput.themeJson, null, 2),
      json: JSON.stringify(aiOutput, null, 2),
    },
  };
}

function appendFallbackWarning(result: BuilderGenerationResult, message: string): BuilderGenerationResult {
  if (!result.valid) {
    return result;
  }

  return {
    ...result,
    schema: {
      ...result.schema,
      warnings: [...result.schema.warnings, message],
    },
  };
}

export default function BuilderPage() {
  const [projectPrompt, setProjectPrompt] = useState("");
  const [audiencePrompt, setAudiencePrompt] = useState("");
  const [sectionPrompt, setSectionPrompt] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [, setTimerTick] = useState(0);
  const [result, setResult] = useState<BuilderGenerationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeMode, setActiveMode] = useState<OutputMode>("react");
  const [zipStatus, setZipStatus] = useState<"idle" | "building" | "ready" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<Record<OutputMode, boolean>>({
    react: false,
    html: false,
    wordpress: false,
    partials: false,
    css: false,
    theme: false,
    json: false,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (startAt) {
        setTimerTick((value) => value + 1);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [startAt]);

  const elapsedSeconds = startAt ? Math.floor((Date.now() - startAt) / 1000) : 0;

  const validate = () => {
    const nextErrors = validateBuilderPrompts({
      projectPrompt,
      audiencePrompt,
      sectionPrompt: sectionPrompt || "hero, features, cta",
      stylePrompt: stylePrompt || "dark SaaS",
    });
    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const clearCopyStatus = () => {
    setCopyStatus({
      react: false,
      html: false,
      wordpress: false,
      partials: false,
      css: false,
      theme: false,
      json: false,
    });
  };

  const onGenerate = async () => {
    if (isGenerating) return;
    if (!validate()) return;
    setIsGenerating(true);
    setCopyStatus({ react: false, html: false, wordpress: false, partials: false, css: false, theme: false, json: false });
    setStartAt(Date.now());
    setTimerTick(0);

    const payload: BuilderPromptInput = {
      projectPrompt,
      audiencePrompt,
      sectionPrompt: sectionPrompt || "hero, features, cta",
      stylePrompt: stylePrompt || "dark SaaS",
    };
    window.localStorage.setItem("builder-workflow:last-input", JSON.stringify(payload));

    try {
      const gatewayConfig = getBuilderGatewayConfig();

      let draft: BuilderGenerationResult;
      if (gatewayConfig) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), BUILDER_REMOTE_TIMEOUT_MS);

        try {
        const aiOutput = await requestAtomicBuilderOutput({
          ...gatewayConfig,
          messages: buildAtomicBuilderMessages(payload),
          systemOverride: buildAtomicBuilderSystemOverride(payload),
          model: getSelectedBuilderModel(),
          signal: controller.signal,
        });
        draft = buildRemoteResult(payload, aiOutput);
        } finally {
          window.clearTimeout(timeout);
        }
      } else {
        await wait(350);
        draft = generateBuilderDraft(payload);
      }

      setResult(draft);
      setZipStatus("idle");

      if (draft.valid) {
        setActiveMode("react");
      }
    } catch (error) {
      await wait(350);
      const message = error instanceof Error ? error.message : "AI gateway bola nedostupna.";
      const fallbackDraft = appendFallbackWarning(
        generateBuilderDraft(payload),
        `AI gateway zlyhala, zobrazeny je bezpecny lokalny draft. Dovod: ${message}`,
      );
      setResult(fallbackDraft);
      setZipStatus("idle");
      setActiveMode("react");
    } finally {
      setIsGenerating(false);
      setStartAt(null);
    }
  };

  const onReset = () => {
    setProjectPrompt("");
    setAudiencePrompt("");
    setSectionPrompt("");
    setStylePrompt("");
    setErrors([]);
    setResult(null);
    setZipStatus("idle");
    clearCopyStatus();
  };

  const onCopy = async (mode: OutputMode) => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(resolveOutputText(result, mode));
      setCopyStatus((prev) => ({ ...prev, [mode]: true }));
      window.setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [mode]: false }));
      }, 1400);
    } catch {
      setCopyStatus((prev) => ({ ...prev, [mode]: false }));
    }
  };

  const onDownloadWordPressZip = async () => {
    if (!result || !result.valid || zipStatus === "building") return;

    try {
      setZipStatus("building");
      const { saveAs } = await import("file-saver");
      const blob = await buildWordPressThemeZip(result);
      saveAs(blob, `${WORDPRESS_THEME_SLUG}.zip`);
      setZipStatus("ready");
      window.setTimeout(() => setZipStatus("idle"), 1800);
    } catch {
      setZipStatus("error");
    }
  };

  const canSubmit = !isGenerating;

  return (
    <BuilderShellLayout>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <section className="border-4 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase text-black">Builder: 4-prompt workflow</h2>
          <p className="mt-2 border-l-8 border-red-600 pl-4 text-sm font-bold text-gray-700">Vyplň 4 podkladové prompty a vygeneruj bezpečný komponentný draft.</p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              onGenerate();
            }}
            className="mt-6 space-y-4"
          >
            <label className="block space-y-2 text-sm">
              <span className="font-black uppercase text-black">Čo ideš stavať?</span>
              <textarea
                className="min-h-24 w-full border-4 border-black bg-white px-3 py-2 text-sm font-bold text-black outline-none focus:bg-yellow-50"
                placeholder="Napr. landing page pre PWA storefront, kadernícky booking systém, AI dashboard, WordPress sekciu…"
                value={projectPrompt}
                onChange={(event) => setProjectPrompt(event.target.value)}
                disabled={isGenerating}
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-black uppercase text-black">Pre koho to je?</span>
              <textarea
                className="min-h-20 w-full border-4 border-black bg-white px-3 py-2 text-sm font-bold text-black outline-none focus:bg-yellow-50"
                placeholder="Napr. lokálne služby, e-shop, developer, agentúra, startup founder…"
                value={audiencePrompt}
                onChange={(event) => setAudiencePrompt(event.target.value)}
                disabled={isGenerating}
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-black uppercase text-black">Aké sekcie alebo komponenty chceš?</span>
              <textarea
                className="min-h-20 w-full border-4 border-black bg-white px-3 py-2 text-sm font-bold text-black outline-none focus:bg-yellow-50"
                placeholder="Napr. hero, feature grid, pricing, FAQ, CTA, testimonials, checklist, comparison table…"
                value={sectionPrompt}
                onChange={(event) => setSectionPrompt(event.target.value)}
                disabled={isGenerating}
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-black uppercase text-black">Ako to má vyzerať a kam to pôjde?</span>
              <textarea
                className="min-h-20 w-full border-4 border-black bg-white px-3 py-2 text-sm font-bold text-black outline-none focus:bg-yellow-50"
                placeholder="Napr. dark SaaS, premium glass, WordPress-safe HTML, React component, Tailwind, Vite PWA…"
                value={stylePrompt}
                onChange={(event) => setStylePrompt(event.target.value)}
                disabled={isGenerating}
              />
            </label>

            {errors.length > 0 ? (
              <div className="border-4 border-black bg-yellow-400 p-3 text-sm font-black text-black">
                <ul className="list-disc space-y-1 pl-5">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center justify-center border-4 border-black bg-red-600 px-5 py-2.5 text-sm font-black uppercase text-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                aria-disabled={!canSubmit}
              >
                {isGenerating ? "Generujem…" : "Generovať komponenty"}
              </button>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center justify-center border-4 border-black bg-white px-5 py-2.5 text-sm font-black uppercase text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-400"
              >
                Vyčistiť
              </button>
            </div>
          </form>

          {isGenerating ? (
            <div className="mt-6 border-4 border-black bg-black p-4 text-white">
              <p className="text-sm font-black uppercase text-yellow-400">Import prijatý. BlogMagica pripravuje AI draft…</p>
              <p aria-live="polite" className="mt-1 text-sm font-bold text-white">
                Stav: {progressText(elapsedSeconds)}
              </p>
              <div className="mt-3 h-3 w-full overflow-hidden border-2 border-white bg-black">
                <div
                  className="h-full bg-red-600 transition-all duration-500"
                  style={{ width: `${Math.min(95, (elapsedSeconds / 90) * 100)}%` }}
                />
              </div>
              {longRunningHint(elapsedSeconds) ? (
                <p className="mt-3 text-sm font-bold text-white">{longRunningHint(elapsedSeconds)}</p>
              ) : null}
              <p className="mt-3 text-xs font-bold text-white/70">
                Očakávaj orien­tačný priebeh (skutočné eventy budú pridané pri produkčnom backend konektore).
              </p>
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="border-4 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(252,211,77,1)]">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black uppercase text-black">Výstup</h2>
              <p className="text-sm font-bold text-gray-700">
                {result?.valid
                  ? result.source === "remote-ai"
                    ? "Výstup bol vygenerovaný cez AI gateway."
                    : "Výstup je lokálny deterministic draft (pilotný režim)."
                  : "Zatiaľ bez výsledku."}
              </p>
            </div>

            {!result ? (
              <p className="mt-3 text-sm font-bold text-gray-700">Najprv vygeneruj komponenty.</p>
            ) : (
              <div className="mt-3">
                <p className="text-sm font-bold text-gray-700">
                  {result.schema.title} · {result.schema.sections.length} sekcií · štýl: {result.schema.style}
                </p>
                <div className="mt-3 border-4 border-black bg-yellow-400 p-3 text-sm font-black text-black">
                  Atomic plan: {result.schema.atomicPlan.atoms.length} atómov · {result.schema.atomicPlan.molecules.length} molekúl · {result.schema.atomicPlan.organisms.length} organizmov
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-4">
                  {result.schema.warnings.map((warning) => (
                    <div
                      key={warning}
                      className="border-2 border-black bg-yellow-400 px-3 py-2 text-sm font-black text-black"
                    >
                      {warning}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <h3 className="text-sm font-black uppercase text-black">Live preview</h3>
                  <div className="mt-3">
                    <IframePreview partials={result.outputs.partials} cssManifest={result.outputs.cssManifest} />
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="mb-2 text-sm font-black uppercase text-black">Export</h3>
                  <div className="mb-4 border-4 border-black bg-white p-3">
                    <p className="text-xs font-black uppercase text-black">WordPress FSE ZIP</p>
                    <p className="mt-1 text-xs font-bold text-gray-700">
                      Stiahne kompletnú tému so súbormi style.css, theme.json, templates/index.html a parts/*.html.
                    </p>
                    <button
                      type="button"
                      onClick={onDownloadWordPressZip}
                      disabled={!result.valid || zipStatus === "building"}
                      aria-label="Stiahnuť WordPress FSE ZIP"
                      className="mt-3 inline-flex items-center justify-center border-4 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {zipStatus === "building"
                        ? "Balím ZIP…"
                        : zipStatus === "ready"
                          ? "ZIP pripravený"
                          : zipStatus === "error"
                            ? "ZIP zlyhal"
                            : "Stiahnuť pre WordPress (FSE)"}
                    </button>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {TAB_LABELS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveMode(tab.id)}
                        className={`border-2 border-black px-3 py-1.5 text-xs font-black uppercase transition ${
                          activeMode === tab.id
                            ? "bg-red-600 text-white"
                            : "bg-white text-black hover:bg-yellow-400"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <pre
                      aria-label="generated output"
                      className="max-h-80 overflow-auto border-4 border-black bg-black p-3 text-xs leading-relaxed text-white"
                    >
                      {resolveOutputText(result, activeMode)}
                    </pre>
                    <button
                      type="button"
                      onClick={() => onCopy(activeMode)}
                      className="absolute right-2 top-2 border-2 border-black bg-yellow-400 px-2 py-1 text-xs font-black uppercase text-black"
                    >
                      {copyStatus[activeMode] ? "Skopírované" : "Skopírovať"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-4 border-black bg-white p-5">
            <h2 className="text-sm font-black uppercase text-black">Validation summary</h2>
            <p className="mt-2 text-sm font-bold text-gray-700">H1: 1 (zabudovaný z title)</p>
            <p className="text-sm font-bold text-gray-700">
              H2: {result?.schema.sections.slice(0, 6).length ?? 0}/3 recommended
            </p>
            <p className="text-sm font-bold text-gray-700">H3: max 3 · H4: max 3</p>
            <p className="mt-3 border-4 border-black bg-yellow-400 p-3 text-sm font-black text-black">
              Draft je určený na preview. Pre produkčné nasadenie použime export do existujúceho workflow.
            </p>
          </div>
        </section>
      </div>
    </BuilderShellLayout>
  );
}
