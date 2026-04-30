import { ArrowRight, FileText, Sparkles } from 'lucide-react';

export default function BlogmagicaDashboard() {
  return (
    <div className="min-h-screen bg-[#090b10] text-[#e9edf5] p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-[#273043] bg-[#11141b]/95 px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#9aa7bd]">BlogMagica</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">
            SEO-ready article operations dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[#9aa7bd]">
            Stredisko pre plánovanie článkov, tvorbu drafts, SEO metadata a prehľad publikácie.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[#273043] bg-[#11141b] p-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#00d1b2]/35 bg-[#00d1b2]/12 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#b8f4e5]">
              <Sparkles className="h-3.5 w-3.5" />
              v2 workflow
            </p>
            <h2 className="mt-3 text-lg font-medium text-[#e9edf5]">Workflow overview</h2>
            <p className="mt-2 text-sm text-[#9aa7bd]">
              Tvorba SEO briefu, draft článku, metadát, kontrola publish-ready a následná publikácia.
            </p>
          </article>

          <article className="rounded-2xl border border-[#273043] bg-[#11141b] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9aa7bd]">Pilot scope</p>
            <ul className="mt-3 space-y-2 text-sm text-[#c7d4eb]">
              <li>- Generovanie titulku, slugu a snippetu</li>
              <li>- Validácia heading štruktúry</li>
              <li>- Príprava draftov a publikovaných položiek</li>
            </ul>
          </article>
        </section>

        <a
          href="/blogmagica/new"
          className="inline-flex items-center gap-2 rounded-xl border border-[#3aa0ff]/45 bg-[#3aa0ff]/15 px-4 py-2.5 text-sm font-semibold text-[#d8eeff] hover:bg-[#3aa0ff]/20"
        >
          <FileText className="h-4 w-4" />
          New SEO article brief
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
