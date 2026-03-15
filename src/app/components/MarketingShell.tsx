import { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

const marketingLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

function isActivePath(currentPath: string, targetPath: string) {
  if (targetPath === "/") {
    return currentPath === "/";
  }

  return currentPath.startsWith(targetPath);
}

export function MarketingHeader() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link to="/" aria-label="Go to homepage" className="shrink-0">
          <img
            src="/images/logomain.png"
            alt="AgroTechSolution"
            width={300}
            height={80}
            className="h-14 w-auto max-w-[220px] object-contain md:h-[80px] md:max-w-[300px]"
          />
        </Link>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3 lg:gap-6">
          <nav className="hidden md:flex flex-wrap items-center gap-2 text-sm font-medium text-black/70 lg:gap-4">
            {marketingLinks.map((link) => {
              const active = isActivePath(location.pathname, link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-3 py-2 transition ${active ? "bg-green-100 text-green-800" : "hover:bg-green-50 hover:text-black"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-green-600 hover:bg-green-700">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="bg-black text-white/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <img src="/images/logomain.png" alt="SmithAgro" className="h-12 w-auto object-contain" />
            <p className="text-sm text-white/65">
              A practical digital platform for crop planning, farm support, smart weather awareness, and fresh produce trade.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Support</h3>
            <ul className="space-y-2 text-sm text-white/65">
              <li>support@smithagro.com</li>
              <li>+1-876-555-2000</li>
              <li>Mon to Fri, 8:00 AM to 5:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-white/45">
          <p>&copy; 2026 SmithAgro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function MarketingPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black">
      <MarketingHeader />
      <main>
        <section className="border-b border-green-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_55%,#ffffff_100%)]">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="max-w-3xl space-y-5">
              <span className="inline-flex rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-800">
                {eyebrow}
              </span>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
              <p className="text-lg text-black/70 md:text-xl">{description}</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">{children}</section>
      </main>
      <MarketingFooter />
    </div>
  );
}