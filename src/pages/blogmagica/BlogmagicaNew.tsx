import { PenLine, Rocket } from 'lucide-react';

export default function BlogmagicaNew() {
  return (
    <main className="min-h-screen bg-[#090b10] text-[#e9edf5] p-6">
      <section className="mx-auto max-w-4xl rounded-2xl border border-[#273043] bg-[#11141b] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#9aa7bd]">BlogMagica</p>
        <h1 className="mt-2 text-3xl font-semibold">New Article</h1>
        <p className="mt-2 text-sm text-[#9aa7bd]">
          Placeholder formulár pre pilotný režim. Neskôr sa sem napojí tvorba briefu do workflow.
        </p>

        <div className="mt-6 space-y-3 text-sm text-[#c6d4ec]">
          <label className="block">
            <span className="mb-1 block text-[#9aa7bd]">Title</span>
            <input
              type="text"
              placeholder="Nájdite chybu v štarte startupu?"
              disabled
              className="w-full rounded-lg border border-[#273043] bg-[#0f1218] px-3 py-2.5 text-[#e9edf5] disabled:opacity-70"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[#9aa7bd]">Target keyword</span>
            <input
              type="text"
              placeholder="AI publishing workflow"
              disabled
              className="w-full rounded-lg border border-[#273043] bg-[#0f1218] px-3 py-2.5 text-[#e9edf5] disabled:opacity-70"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3 text-xs text-[#9aa7bd]">
          <PenLine className="h-4 w-4" />
          UI input je zatiaľ read-only v pilotu.
          <Rocket className="h-4 w-4 ml-3" />
          Pripraví sa generator pre Draft pipeline.
        </div>
      </section>
    </main>
  );
}
