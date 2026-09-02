import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";

const NAV = [
  {
    group: "Workspace",
    items: [
      { to: "/", label: "Dashboard Overview" },
      { to: "/email", label: "Smart Email Generator" },
      { to: "/notes", label: "Meeting Notes Summarizer" },
    ],
  },
  {
    group: "AI Assistants",
    items: [
      { to: "/planner", label: "AI Task Planner" },
      { to: "/research", label: "AI Research Assistant" },
      { to: "/chat", label: "AI Chatbot Interface" },
    ],
  },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lagoon-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("lagoon-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle colour theme"
      className="inline-flex size-8 items-center justify-center rounded-lg border border-line text-muted-foreground transition hover:bg-foreground/[0.03]"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <div className="grid size-8 place-items-center rounded-[9px] bg-gradient-to-br from-lagoon to-lagoon-deep text-[11px] font-bold tracking-tight text-primary-foreground">
          LC
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold">Lagoon</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Productivity
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 text-[13px] font-medium">
        {NAV.map((section) => (
          <div key={section.group}>
            <div className="px-2 pb-1.5 pt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground first:pt-0">
              {section.group}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                activeOptions={{ exact: item.to === "/" }}
                className="mt-0.5 flex items-center rounded-lg px-2.5 py-2 text-muted-foreground transition hover:bg-foreground/[0.03]"
                activeProps={{
                  className:
                    "mt-0.5 flex items-center rounded-lg px-2.5 py-2 bg-lagoon-soft text-secondary-foreground ring-1 ring-lagoon/20",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="rounded-xl border border-line bg-lagoon-soft/50 p-3">
          <div className="text-[12px] font-semibold text-secondary-foreground">Monthly plan</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-lagoon/15">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-lagoon to-lagoon-deep" />
          </div>
          <div className="mt-1.5 font-mono text-[10px] text-muted-foreground">
            6,400 / 8,000 credits
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-line md:block">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-64 border-r border-line">
              <Sidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-line bg-background/85 px-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-line text-muted-foreground md:hidden"
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
              <div className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
                Workspace
              </div>
              <span className="hidden text-muted-foreground/40 sm:block">/</span>
              <h1 className="truncate text-[15px] font-semibold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <span className="size-2 rounded-full bg-coral shadow-[0_0_8px] shadow-coral/60" />
              <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-lagoon to-lagoon-deep text-[11px] font-semibold text-primary-foreground">
                RK
              </div>
            </div>
          </header>

          <main className="lagoon-enter flex-1 px-4 py-7 sm:px-6">{children}</main>

          <footer className="border-t border-line px-4 py-4 sm:px-6">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-coral" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-medium">Responsible AI Disclaimer:</span> AI outputs are
                generated to assist productivity and should be reviewed for accuracy before
                professional use.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
