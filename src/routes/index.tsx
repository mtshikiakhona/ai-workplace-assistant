import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, BookOpen, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/ToolPanels";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard Overview — Lagoon AI Workplace Assistant" },
      {
        name: "description",
        content:
          "See every AI workplace tool in one console: email drafting, meeting summaries, task planning, research and chat.",
      },
      { property: "og:title", content: "Dashboard Overview — Lagoon AI Workplace Assistant" },
      {
        property: "og:description",
        content: "One console for AI-assisted work: email, meetings, planning, research and chat.",
      },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/email",
    icon: Mail,
    name: "Smart Email Generator",
    desc: "Turn bullet points into a tone-matched, ready-to-send draft.",
    stat: "1,284 drafts this month",
  },
  {
    to: "/notes",
    icon: FileText,
    name: "Meeting Notes Summarizer",
    desc: "Extract overview, action items, decisions and deadlines from a transcript.",
    stat: "96 meetings parsed",
  },
  {
    to: "/planner",
    icon: ListChecks,
    name: "AI Task Planner",
    desc: "Sequence a raw task list into a prioritized day or week with urgency tags.",
    stat: "312 plans generated",
  },
  {
    to: "/research",
    icon: BookOpen,
    name: "AI Research Assistant",
    desc: "Distill long articles and reports into takeaways and recommendations.",
    stat: "74 reports analyzed",
  },
  {
    to: "/chat",
    icon: MessageSquare,
    name: "AI Chatbot Interface",
    desc: "Ask day-to-day workplace questions and iterate in conversation.",
    stat: "Always available",
  },
] as const;

const ACTIVITY = [
  {
    tool: "Smart Email Generator",
    detail: "Client renewal draft exported to clipboard",
    time: "12:04",
    dot: "bg-lagoon",
  },
  {
    tool: "Meeting Notes Summarizer",
    detail: "4 action items extracted from sprint retro",
    time: "10:31",
    dot: "bg-coral",
  },
  {
    tool: "AI Task Planner",
    detail: "Weekly schedule regenerated · 9 tasks, 3 urgent",
    time: "09:12",
    dot: "bg-lagoon-deep",
  },
] as const;

function Dashboard() {
  return (
    <AppShell title="Dashboard Overview">
      <PageIntro
        heading="Your workday, assisted end to end."
        sub="Pick a tool to move a task forward. Every output stays editable before you copy or export it."
        badge="5 tools ready"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className="group rounded-2xl border border-line bg-surface p-5 ring-1 ring-foreground/[0.02] transition hover:-translate-y-0.5 hover:border-lagoon/30"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-[10px] bg-lagoon-soft text-secondary-foreground">
                <tool.icon className="size-4" />
              </span>
              <span className="font-mono text-[10px] text-muted-foreground opacity-0 transition group-hover:opacity-100">
                Open →
              </span>
            </div>
            <h3 className="mt-4 text-[14px] font-semibold tracking-tight">{tool.name}</h3>
            <p className="mt-1 text-pretty text-[12px] leading-relaxed text-muted-foreground">
              {tool.desc}
            </p>
            <div className="mt-4 font-mono text-[10px] text-muted-foreground">{tool.stat}</div>
          </Link>
        ))}
      </div>

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold tracking-tight">Recent activity</h3>
          <span className="font-mono text-[11px] text-muted-foreground">Today</span>
        </div>
        <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {ACTIVITY.map((item) => (
            <div key={item.time} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={`size-2 rounded-full ${item.dot}`} />
                <div>
                  <div className="text-[13px] font-medium">{item.tool}</div>
                  <div className="text-[11px] text-muted-foreground">{item.detail}</div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
