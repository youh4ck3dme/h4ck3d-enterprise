import { Link } from "react-router-dom";
import BuilderShellLayout from "./BuilderShellLayout";

export default function BuilderComponentsPage() {
  return (
    <BuilderShellLayout>
      <section className="space-y-4 rounded-3xl border border-[#273043] bg-[#171c26] p-6">
        <h1 className="text-2xl font-semibold text-[#e9edf5]">Builder components</h1>
        <p className="text-sm text-[#9aa7bd]">
          Toto je MVP placeholders sekcia pre výstupy jednotlivých komponentov. V budúcom kroku sa tu zobrazia
          knižnice, šablóny a správa exportov pre viac verzíí.
        </p>
        <div className="rounded-xl border border-[#273043] p-4 text-sm">
          Predbežné ciele:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>hero, feature grid, benefits, pricing, FAQ</li>
            <li>vlastný exportný preset pre React/Tailwind/WordPress</li>
            <li>validácia component schema</li>
          </ul>
        </div>
        <Link to="/builder" className="inline-flex rounded-xl border border-[#3aa0ff]/60 bg-[#3aa0ff]/20 px-4 py-2 text-sm text-[#dbeeff]">
          Späť do builderu
        </Link>
      </section>
    </BuilderShellLayout>
  );
}

