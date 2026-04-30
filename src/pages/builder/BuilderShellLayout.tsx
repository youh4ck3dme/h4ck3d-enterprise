import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface BuilderShellLayoutProps {
  children: ReactNode;
}

const MAIN_LINKS = [
  { label: "Dashboard", to: "/builder" },
  { label: "Builder", to: "/builder" },
  { label: "Components", to: "/builder/components" },
  { label: "Preview", to: "/builder/preview" },
  { label: "Projects", to: "/builder" },
];

const BLOGMAGICA_LINKS = [
  { label: "Articles", to: "/blogmagica" },
  { label: "New Article", to: "/blogmagica/new" },
  { label: "SEO Briefs", to: "/blogmagica/seo" },
  { label: "Drafts", to: "/blogmagica/drafts" },
  { label: "Published", to: "/blogmagica/published" },
  { label: "Content Calendar", to: "/blogmagica/calendar" },
];

const SYSTEM_LINKS = [
  { label: "Settings", to: "/dashboard" },
  { label: "Docs", to: "/privacy" },
  { label: "Diagnostics", to: "/dashboard" },
];

export default function BuilderShellLayout({ children }: BuilderShellLayoutProps) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e9edf5]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-4 px-3 py-4 lg:px-6">
        <aside className="hidden w-full max-w-[300px] shrink-0 rounded-3xl border border-[#273043] bg-[#11141b] p-4 lg:block">
          <div className="mb-6 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#9aa7bd]">
            Main
          </div>
          {MAIN_LINKS.map((link) => {
            const active = path === link.to;
            return (
              <Link
                key={`${link.label}-${link.to}`}
                to={link.to}
                className={`mb-1 block rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[#3aa0ff]/20 text-[#d7e8ff]"
                    : "text-[#c4d0e4] hover:bg-[#ffffff0f] hover:text-[#f2f6ff]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-8 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#9aa7bd]">
            BlogMagica
          </div>
          {BLOGMAGICA_LINKS.map((link) => (
            <Link
              key={`${link.label}-${link.to}`}
              to={link.to}
              className="mb-1 block rounded-xl px-3 py-2 text-sm font-medium text-[#c4d0e4] transition hover:bg-[#ffffff0f] hover:text-[#f2f6ff]"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-8 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#9aa7bd]">
            System
          </div>
          {SYSTEM_LINKS.map((link) => (
            <Link
              key={`${link.label}-${link.to}`}
              to={link.to}
              className="mb-1 block rounded-xl px-3 py-2 text-sm font-medium text-[#c4d0e4] transition hover:bg-[#ffffff0f] hover:text-[#f2f6ff]"
            >
              {link.label}
            </Link>
          ))}
        </aside>
        <main className="flex-1">
          <div className="mb-4 rounded-3xl border border-[#273043] bg-[#11141b] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9aa7bd]">Builder Cockpit</p>
            <h1 className="mt-1 text-xl font-semibold text-[#e9edf5]">Builder workspace</h1>
          </div>
          <div className="rounded-3xl border border-[#273043] bg-[#11141b] p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

