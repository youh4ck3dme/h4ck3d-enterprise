import { SearchCheck } from 'lucide-react';

const focusItems = [
  "Meta title",
  "Meta description",
  "Canonical a OG",
  "Internal links",
  "Readability checks",
];

export default function BlogmagicaSeo() {
  return (
    <main className="min-h-screen bg-[#090b10] text-[#e9edf5] p-6">
      <section className="mx-auto max-w-4xl rounded-2xl border border-[#273043] bg-[#11141b] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#9aa7bd]">BlogMagica</p>
        <h1 className="mt-2 text-3xl font-semibold">SEO Briefs</h1>
        <p className="mt-2 text-sm text-[#9aa7bd]">
          Placeholder rozhranie pre pripravovanie SEO kontrol pri draftoch.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {focusItems.map((item) => (
            <article
              key={item}
              className="flex items-start gap-3 rounded-xl border border-[#273043] bg-[#0f131b] p-4"
            >
              <SearchCheck className="mt-0.5 h-4 w-4 text-[#00d1b2]" />
              <div>
                <p className="text-sm font-medium">{item}</p>
                <p className="text-xs text-[#9aa7bd]">
                  V pilotnom móde sa vypĺňa manuálne a exportuje sa do workflow.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
