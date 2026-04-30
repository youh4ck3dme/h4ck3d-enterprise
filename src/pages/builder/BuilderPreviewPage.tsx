import { Link } from "react-router-dom";
import BuilderShellLayout from "./BuilderShellLayout";

export default function BuilderPreviewPage() {
  return (
    <BuilderShellLayout>
      <section className="space-y-4 rounded-3xl border border-[#273043] bg-[#171c26] p-6">
        <h1 className="text-2xl font-semibold text-[#e9edf5]">Preview</h1>
        <p className="text-sm text-[#9aa7bd]">
          Placeholder pre budúce uložené a porovnateľné previewy. Aktuálne sa náhľad zobrazí na hlavnej Builder stránke
          po vygenerovaní.
        </p>
        <div className="rounded-xl border border-[#273043] p-4 text-sm text-[#c9d8f3]">
          Ciele v ďalšom štádiu:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ukladať viacero draftov lokálne</li>
            <li>porovnanie React vs WordPress exportu</li>
            <li>príprava JSON pipeline pre deploy-like workflow</li>
          </ul>
        </div>
        <Link to="/builder" className="inline-flex rounded-xl border border-[#00d1b2]/60 bg-[#00d1b2]/20 px-4 py-2 text-sm text-[#d5fff8]">
          OTVORIŤ generátor
        </Link>
      </section>
    </BuilderShellLayout>
  );
}

