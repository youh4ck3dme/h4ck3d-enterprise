import { ClipboardList } from 'lucide-react';

export default function BlogmagicaDrafts() {
  return (
    <main className="min-h-screen bg-[#090b10] text-[#e9edf5] p-6">
      <section className="mx-auto max-w-4xl rounded-2xl border border-[#273043] bg-[#11141b] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#9aa7bd]">BlogMagica</p>
        <h1 className="mt-2 text-3xl font-semibold">Drafts</h1>
        <p className="mt-2 text-sm text-[#9aa7bd]">
          Zoznam pripravovaných draftov pre kontrolný proces.
        </p>

        <article className="mt-6 rounded-2xl border border-[#273043] bg-[#0f131b] p-4 text-sm text-[#c7d6ef]">
          <div className="mb-2 flex items-center gap-2 text-[#9fd6ff]">
            <ClipboardList className="h-4 w-4" />
            V pilotnej verzii nie sú drafty trvalo uložené v UI.
          </div>
          <p>
            Po napojení backendu sa zobrazí stav spracovania, schvaľovania a metriky readiness.
          </p>
        </article>
      </section>
    </main>
  );
}
