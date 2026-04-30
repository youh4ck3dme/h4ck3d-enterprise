import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const isAuthFlowDisabled = (() => {
  const value = import.meta.env.VITE_AUTH_DISABLED;
  return value === undefined || value === '' || value.toLowerCase() === 'true' || value === '1';
})();

const features = [
  "Prehľadný workspace pre build plán, repo kontext a preview flow",
  "Guest režim bez loginu pre rýchly pilotný workflow",
  "Pripravené na kontrolovaný pilot, nie na nekontrolovaný self-serve chaos"
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#090b10] text-[#e9edf5]">
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#11141b] via-[#0d1016] to-[#090b10] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3aa0ff]/40 bg-[#3aa0ff]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#9ccfff]">
              <Sparkles className="h-4 w-4" />
              Googla Builder 1S
            </div>
            <button
              type="button"
              onClick={() => navigate("/pricing")}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-[#dce7ff] transition hover:bg-white/10"
            >
              View pricing
            </button>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Build with your repo, ship with control.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-[#9aa7bd] md:text-lg">
                Googla-builder1s je kontrolovaný pilot pre AI builder workflow. Z verejného vstupu prejdeš do
                zabezpečeného dashboardu, kde vieš plánovať build kroky, sledovať stav a držať bezpečné hranice.
              </p>

              <div className="mt-8 grid gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-[#c8d3e8] md:text-base">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#00d1b2]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3aa0ff]/55 bg-[#3aa0ff]/20 px-5 py-3 text-sm font-semibold text-[#dbeeff] transition hover:bg-[#3aa0ff]/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Open workspace
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00d1b2]/50 bg-[#00d1b2]/15 px-5 py-3 text-sm font-semibold text-[#d6fff7] transition hover:bg-[#00d1b2]/25"
                >
                  View demo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {isAuthFlowDisabled ? (
                <div className="mt-4 rounded-xl border border-[#00d1b2]/35 bg-[#00d1b2]/10 px-4 py-3 text-sm text-[#c9fff7]">
                  Auth is temporarily disabled. Pilot runs in guest mode.
                </div>
              ) : null}
            </div>

            <aside className="rounded-2xl border border-white/10 bg-black/25 p-6">
              <h2 className="text-lg font-semibold">Pilot safety notice</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#9aa7bd]">
                Tento produkt je v režime kontrolovaného pilotu. Produkčné auto-deploy a shell execution nie sú
                povolené bez explicitného schválenia a audit trailu.
              </p>

              <div className="mt-6 rounded-xl border border-[#00d1b2]/30 bg-[#00d1b2]/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#c9fff7]">
                  <ShieldCheck className="h-4 w-4" />
                  Security baseline
                </div>
                <ul className="mt-3 space-y-2 text-sm text-[#b5c4dc]">
                  <li>- OAuth secrets sú držané mimo frontend kódu.</li>
                  <li>- Chyby sa zobrazujú sanitizovane bez stack trace.</li>
                  <li>- Prístup ide cez kontrolované auth providery.</li>
                </ul>
              </div>

              <div className="mt-6 text-sm text-[#9aa7bd]">
                Need onboarding help?{" "}
                <a href="/pricing" className="font-medium text-[#7ebcff] hover:text-[#9bcfff]">
                  Learn more
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
