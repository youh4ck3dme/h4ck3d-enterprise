import { Link } from "react-router-dom";
import BuilderShellLayout from "./BuilderShellLayout";

export default function BuilderComponentsPage() {
  return (
    <BuilderShellLayout>
      <section className="space-y-4 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-black uppercase text-black">Builder components</h1>
        <p className="border-l-8 border-red-600 pl-4 text-sm font-bold text-gray-700">
          Toto je MVP placeholders sekcia pre výstupy jednotlivých komponentov. V budúcom kroku sa tu zobrazia
          knižnice, šablóny a správa exportov pre viac verzíí.
        </p>
        <div className="border-4 border-black p-4 text-sm font-bold">
          Predbežné ciele:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>hero, feature grid, benefits, pricing, FAQ</li>
            <li>vlastný exportný preset pre React/Tailwind/WordPress</li>
            <li>validácia component schema</li>
          </ul>
        </div>
        <Link to="/builder" className="inline-flex border-4 border-black bg-red-600 px-4 py-2 text-sm font-black uppercase text-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          Späť do builderu
        </Link>
      </section>
    </BuilderShellLayout>
  );
}
