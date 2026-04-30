import { useEffect, useState } from "react";
import BuilderShellLayout from "./BuilderShellLayout";
import {
  BuilderPromptInput,
  BuilderOutput,
  BuilderGenerationResult,
  generateBuilderDraft,
  validateBuilderPrompts,
} from "@/lib/builder-component-generator";

type OutputMode = "react" | "html" | "wordpress" | "json";

const TAB_LABELS: Array<{ id: OutputMode; label: string }> = [
  { id: "react", label: "React" },
  { id: "html", label: "HTML" },
  { id: "wordpress", label: "WordPress Safe HTML" },
  { id: "json", label: "JSON" },
];

function resolveOutputText(result: BuilderGenerationResult, mode: OutputMode): string {
  switch (mode) {
    case "react":
      return result.outputs.react;
    case "wordpress":
      return result.outputs.wordpressHtml;
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

function previewFromSchema(schema: BuilderOutput) {
  return (
    <div className="space-y-4">
      {schema.sections.map((section, index) => (
        <section key={`${section.type}-${index}`} className="rounded-2xl border border-[#273043] bg-[#171c26] p-4">
          <h2 className="text-lg font-semibold text-[#9ccfff]">{section.headline}</h2>
          <p className="mt-2 text-sm text-[#c6d3e8]">{section.subheadline}</p>
          {section.items?.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {section.items.map((item) => (
                <li key={item} className="text-sm text-[#d6e4ff]">
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {section.primaryCta ? <p className="mt-3 text-sm text-[#6dd8ff]">{section.primaryCta}</p> : null}
        </section>
      ))}
    </div>
  );
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
  const [copyStatus, setCopyStatus] = useState<Record<OutputMode, boolean>>({
    react: false,
    html: false,
    wordpress: false,
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
      json: false,
    });
  };

  const onGenerate = () => {
    if (isGenerating) return;
    if (!validate()) return;
    setIsGenerating(true);
    setCopyStatus({ react: false, html: false, wordpress: false, json: false });
    setStartAt(Date.now());
    setTimerTick(0);

    const payload: BuilderPromptInput = {
      projectPrompt,
      audiencePrompt,
      sectionPrompt: sectionPrompt || "hero, features, cta",
      stylePrompt: stylePrompt || "dark SaaS",
    };
    window.localStorage.setItem("builder-workflow:last-input", JSON.stringify(payload));

    window.setTimeout(() => {
      const draft = generateBuilderDraft(payload);
      setResult(draft);
      setIsGenerating(false);
      setStartAt(null);

      if (draft.valid) {
        setActiveMode("react");
      }
    }, 350);
  };

  const onReset = () => {
    setProjectPrompt("");
    setAudiencePrompt("");
    setSectionPrompt("");
    setStylePrompt("");
    setErrors([]);
    setResult(null);
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

  const canSubmit = !isGenerating;

  return (
    <BuilderShellLayout>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-3xl border border-[#273043] bg-[#171c26] p-5">
          <h2 className="text-lg font-semibold text-[#e9edf5]">Builder: 4-prompt workflow</h2>
          <p className="mt-2 text-sm text-[#9aa7bd]">Vyplň 4 podkladové prompty a vygeneruj bezpečný komponentný draft.</p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              onGenerate();
            }}
            className="mt-6 space-y-4"
          >
            <label className="block space-y-2 text-sm">
              <span className="text-[#c8d8f2]">Čo ideš stavať?</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-[#273043] bg-[#11141b] px-3 py-2 text-sm text-[#e9edf5] outline-none focus:border-[#3aa0ff]"
                placeholder="Napr. landing page pre PWA storefront, kadernícky booking systém, AI dashboard, WordPress sekciu…"
                value={projectPrompt}
                onChange={(event) => setProjectPrompt(event.target.value)}
                disabled={isGenerating}
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-[#c8d8f2]">Pre koho to je?</span>
              <textarea
                className="min-h-20 w-full rounded-xl border border-[#273043] bg-[#11141b] px-3 py-2 text-sm text-[#e9edf5] outline-none focus:border-[#3aa0ff]"
                placeholder="Napr. lokálne služby, e-shop, developer, agentúra, startup founder…"
                value={audiencePrompt}
                onChange={(event) => setAudiencePrompt(event.target.value)}
                disabled={isGenerating}
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-[#c8d8f2]">Aké sekcie alebo komponenty chceš?</span>
              <textarea
                className="min-h-20 w-full rounded-xl border border-[#273043] bg-[#11141b] px-3 py-2 text-sm text-[#e9edf5] outline-none focus:border-[#3aa0ff]"
                placeholder="Napr. hero, feature grid, pricing, FAQ, CTA, testimonials, checklist, comparison table…"
                value={sectionPrompt}
                onChange={(event) => setSectionPrompt(event.target.value)}
                disabled={isGenerating}
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-[#c8d8f2]">Ako to má vyzerať a kam to pôjde?</span>
              <textarea
                className="min-h-20 w-full rounded-xl border border-[#273043] bg-[#11141b] px-3 py-2 text-sm text-[#e9edf5] outline-none focus:border-[#3aa0ff]"
                placeholder="Napr. dark SaaS, premium glass, WordPress-safe HTML, React component, Tailwind, Vite PWA…"
                value={stylePrompt}
                onChange={(event) => setStylePrompt(event.target.value)}
                disabled={isGenerating}
              />
            </label>

            {errors.length > 0 ? (
              <div className="rounded-xl border border-[#ff5d6c]/45 bg-[#ff5d6c]/10 p-3 text-sm text-[#ffd9de]">
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
                className="inline-flex items-center justify-center rounded-xl border border-[#3aa0ff]/70 bg-[#3aa0ff]/25 px-5 py-2.5 text-sm font-medium text-[#dcecff] transition hover:bg-[#3aa0ff]/35 disabled:cursor-not-allowed disabled:opacity-40"
                aria-disabled={!canSubmit}
              >
                {isGenerating ? "Generujem…" : "Generovať komponenty"}
              </button>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center justify-center rounded-xl border border-[#273043] bg-[#11141b] px-5 py-2.5 text-sm font-medium text-[#bfcdf0] transition hover:bg-[#ffffff10]"
              >
                Vyčistiť
              </button>
            </div>
          </form>

          {isGenerating ? (
            <div className="mt-6 rounded-xl border border-[#273043] bg-black/35 p-4">
              <p className="text-sm font-medium text-[#9ee6ff]">Import prijatý. BlogMagica pripravuje AI draft…</p>
              <p aria-live="polite" className="mt-1 text-sm text-[#d3def2]">
                Stav: {progressText(elapsedSeconds)}
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#273043]">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#3aa0ff] via-[#00d1b2] to-[#00d1b2] transition-all duration-500"
                  style={{ width: `${Math.min(95, (elapsedSeconds / 90) * 100)}%` }}
                />
              </div>
              {longRunningHint(elapsedSeconds) ? (
                <p className="mt-3 text-sm text-[#f8f9fb]">{longRunningHint(elapsedSeconds)}</p>
              ) : null}
              <p className="mt-3 text-xs text-[#9aa7bd]">
                Očakávaj orien­tačný priebeh (skutočné eventy budú pridané pri produkčnom backend konektore).
              </p>
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="rounded-3xl border border-[#273043] bg-[#171c26] p-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-[#e9edf5]">Výstup</h2>
              <p className="text-sm text-[#9aa7bd]">
                {result?.valid ? "Výstup je lokálny deterministic draft (pilotný režim)." : "Zatiaľ bez výsledku."}
              </p>
            </div>

            {!result ? (
              <p className="mt-3 text-sm text-[#9aa7bd]">Najprv vygeneruj komponenty.</p>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-[#c6d4ea]">
                  {result.schema.title} · {result.schema.sections.length} sekcií · štýl: {result.schema.style}
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-4">
                  {result.schema.warnings.map((warning) => (
                    <div
                      key={warning}
                      className="rounded-xl border border-[#ffb020]/45 bg-[#ffb020]/10 px-3 py-2 text-sm text-[#fff8de]"
                    >
                      {warning}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-[#d6e4ff]">Live preview</h3>
                  <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-[#273043] p-3">
                    {previewFromSchema(result.schema)}
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="mb-2 text-sm font-semibold text-[#d6e4ff]">Export</h3>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {TAB_LABELS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveMode(tab.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          activeMode === tab.id
                            ? "border-[#3aa0ff] bg-[#3aa0ff]/20 text-[#d8ecff]"
                            : "border-[#273043] bg-[#11141b] text-[#a5b5d1]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <pre
                      aria-label="generated output"
                      className="max-h-80 overflow-auto rounded-xl border border-[#273043] bg-black p-3 text-xs leading-relaxed text-[#d4e0f6]"
                    >
                      {resolveOutputText(result, activeMode)}
                    </pre>
                    <button
                      type="button"
                      onClick={() => onCopy(activeMode)}
                      className="absolute right-2 top-2 rounded-lg border border-[#3aa0ff] bg-[#3aa0ff]/20 px-2 py-1 text-xs text-[#dff1ff]"
                    >
                      {copyStatus[activeMode] ? "Skopírované" : "Skopírovať"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#273043] bg-[#171c26] p-5">
            <h2 className="text-sm font-semibold text-[#d8e4f8]">Validation summary</h2>
            <p className="mt-2 text-sm text-[#9aa7bd]">H1: 1 (zabudovaný z title)</p>
            <p className="text-sm text-[#9aa7bd]">
              H2: {result?.schema.sections.slice(0, 6).length ?? 0}/3 recommended
            </p>
            <p className="text-sm text-[#9aa7bd]">H3: max 3 · H4: max 3</p>
            <p className="mt-3 rounded-xl border border-[#00d1b2]/40 bg-[#00d1b2]/10 p-3 text-sm text-[#cefff0]">
              Draft je určený na preview. Pre produkčné nasadenie použime export do existujúceho workflow.
            </p>
          </div>
        </section>
      </div>
    </BuilderShellLayout>
  );
}
