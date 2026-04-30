import { FileText } from 'lucide-react';

const placeholders = [
  {
    title: "AI publishing workflow",
    status: "Draft",
    excerpt: "Návod na to, ako nastaviť predprodukčný proces pre obsah od briefu po publikáciu.",
  },
  {
    title: "PWA pre lokálny biznis",
    status: "Scheduled",
    excerpt: "Ako pripraviť inštalačný zážitok, ktorý si používateľ uloží do mobilu.",
  },
];

export default function BlogmagicaArticles() {
  return (
    <main className="min-h-screen bg-[#090b10] text-[#e9edf5] p-6">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[#9aa7bd]">BlogMagica</p>
          <h1 className="mt-2 text-2xl font-semibold">Articles</h1>
          <p className="mt-2 text-sm text-[#9aa7bd]">
            Zoznam článkov dostupných pre SEO workflow. V pilotnej verzii ide o placeholder dáta.
          </p>
        </header>

        <div className="grid gap-3">
          {placeholders.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[#273043] bg-[#11141b] p-5"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-[#3aa0ff]">{item.status}</p>
              <h2 className="mt-1 text-lg font-medium">{item.title}</h2>
              <p className="mt-2 text-sm text-[#9aa7bd]">{item.excerpt}</p>
            </article>
          ))}
        </div>

        <a
          href="/blogmagica/new"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#00d1b2]/45 bg-[#00d1b2]/15 px-4 py-2.5 text-sm font-medium text-[#d6fff7] hover:bg-[#00d1b2]/20"
        >
          <FileText className="h-4 w-4" />
          Open New Article
        </a>
      </section>
    </main>
  );
}
