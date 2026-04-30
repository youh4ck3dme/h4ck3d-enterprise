import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface BuilderShellLayoutProps {
  children: ReactNode;
}

const links = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Builder", to: "/builder" },
  { label: "Components", to: "/components" },
  { label: "Preview", to: "/preview" },
  { label: "BlogMagica", to: "/blogmagica" },
];

export default function BuilderShellLayout({ children }: BuilderShellLayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-black bg-white px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border-2 border-black bg-black text-xs font-black text-white shadow-[4px_4px_0px_0px_rgba(255,10,10,1)]">
              H4
            </div>
            <span className="text-xl font-black uppercase italic tracking-tighter">
              H4CK3D<span className="text-red-600">.AI</span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`border-2 border-black px-3 py-2 text-xs font-black uppercase transition ${
                  pathname === link.to
                    ? "bg-red-600 text-white"
                    : "bg-white text-black hover:bg-yellow-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}

