import { Link } from "react-router-dom";
import BuilderShellLayout from "./BuilderShellLayout";

export default function BuilderPreviewPage() {
  return (
    <BuilderShellLayout>
      <section className="space-y-4 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(252,211,77,1)]">
        <h1 className="text-3xl font-black uppercase text-black">Preview</h1>
        <p className="border-l-8 border-red-600 pl-4 text-sm font-bold text-gray-700">
          Placeholder pre budúce uložené a porovnateľné previewy. Aktuálne sa náhľad zobrazí na hlavnej Builder stránke
          po vygenerovaní.
        </p>
        <div className="border-4 border-black p-4 text-sm font-bold text-black">
          Ciele v ďalšom štádiu:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ukladať viacero draftov lokálne</li>
            <li>porovnanie React vs WordPress exportu</li>
            <li>príprava JSON pipeline pre deploy-like workflow</li>
          </ul>
        </div>
        <Link to="/builder" className="inline-flex border-4 border-black bg-red-600 px-4 py-2 text-sm font-black uppercase text-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          OTVORIŤ generátor
        </Link>
      </section>
    </BuilderShellLayout>
  );
}
