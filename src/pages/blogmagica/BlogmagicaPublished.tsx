import { CheckCircle2 } from 'lucide-react';

export default function BlogmagicaPublished() {
  return (
    <main className="min-h-screen bg-[#090b10] text-[#e9edf5] p-6">
      <section className="mx-auto max-w-4xl rounded-2xl border border-[#273043] bg-[#11141b] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#9aa7bd]">BlogMagica</p>
        <h1 className="mt-2 text-3xl font-semibold">Published</h1>
        <p className="mt-2 text-sm text-[#9aa7bd]">Placeholder pre zoznam publikovaných článkov.</p>

        <ul className="mt-6 space-y-3">
          <li className="rounded-2xl border border-[#273043] bg-[#0f131b] p-4">
            <p className="text-sm font-medium">turn-github-repo-into-pwa-store-rubberduck</p>
            <p className="mt-1 text-xs text-[#9aa7bd]">Status: <span className="text-[#00d1b2]">Published</span></p>
          </li>
        </ul>

        <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#00d1b2]/35 bg-[#00d1b2]/12 px-3 py-2 text-xs text-[#baf7eb]">
          <CheckCircle2 className="h-4 w-4" />
          Ready for public indexing and SEO checks after approval.
        </div>
      </section>
    </main>
  );
}
