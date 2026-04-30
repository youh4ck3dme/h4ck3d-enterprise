import { CalendarCheck2 } from 'lucide-react';

export default function BlogmagicaCalendar() {
  return (
    <main className="min-h-screen bg-[#090b10] text-[#e9edf5] p-6">
      <section className="mx-auto max-w-4xl rounded-2xl border border-[#273043] bg-[#11141b] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#9aa7bd]">BlogMagica</p>
        <h1 className="mt-2 text-3xl font-semibold">Content Calendar</h1>
        <p className="mt-2 text-sm text-[#9aa7bd]">
          Placeholder rozhranie pre plánovanie SEO obsahu a pilotný prehľad publikácií.
        </p>

        <article className="mt-6 flex items-start gap-3 rounded-xl border border-[#273043] bg-[#0f131b] p-4">
          <CalendarCheck2 className="mt-0.5 h-5 w-5 text-[#3aa0ff]" />
          <div>
            <p className="text-sm font-medium">Nadchádzajúce kroky</p>
            <p className="mt-1 text-xs text-[#9aa7bd]">
              V nasledujúcich iteráciách sem dorobíme drag&drop plánovanie, stavové šablóny a napojenie na Drafty.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
