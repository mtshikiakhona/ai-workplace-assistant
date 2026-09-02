import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import {
  PageIntro,
  Pane,
  Field,
  TextArea,
  PrimaryButton,
  GhostButton,
  OutputActions,
  useAsyncAction,
} from "@/components/ToolPanels";
import { summarizeMeeting } from "@/lib/ai.functions";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Lagoon AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Paste a raw meeting transcript and get an overview, action items, decisions and deadlines you can edit and export.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Lagoon" },
      {
        property: "og:description",
        content: "Turn raw transcripts into structured summaries, decisions and deadlines.",
      },
    ],
  }),
  component: NotesPage,
});

type Summary = {
  overview: string;
  actionItems: string[];
  decisions: string[];
  deadlines: string[];
};

const EMPTY: Summary = { overview: "", actionItems: [], decisions: [], deadlines: [] };

function toPlainText(s: Summary) {
  const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");
  return [
    "OVERVIEW SUMMARY",
    s.overview,
    "",
    "ACTION ITEMS",
    list(s.actionItems),
    "",
    "DECISIONS",
    list(s.decisions),
    "",
    "DEADLINES",
    list(s.deadlines),
  ].join("\n");
}

function SectionCard({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-background p-4">
      <div className="label-mono">{title}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(3, value.split("\n").length)}
        placeholder="—"
        className="mt-2 w-full resize-y bg-transparent text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

function NotesPage() {
  const summarize = useServerFn(summarizeMeeting);
  const { loading, run } = useAsyncAction<Summary>();
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState<Summary>(EMPTY);

  const set = (key: keyof Summary, text: string) =>
    setSummary((prev) =>
      key === "overview"
        ? { ...prev, overview: text }
        : { ...prev, [key]: text.split("\n").filter((l) => l.trim()) },
    );

  function onGenerate() {
    if (!transcript.trim()) return;
    run(
      () => summarize({ data: { transcript } }) as Promise<Summary>,
      (res) => setSummary({ ...EMPTY, ...res }),
    );
  }

  const hasOutput =
    summary.overview ||
    summary.actionItems.length ||
    summary.decisions.length ||
    summary.deadlines.length;

  return (
    <AppShell title="Meeting Notes Summarizer">
      <PageIntro
        heading="From raw transcript to a decision record."
        sub="Paste the transcript, review the structured cards, and edit anything before sharing."
        badge={hasOutput ? "Summary ready" : "Awaiting transcript"}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Pane label="(a) Transcript">
          <Field label="Raw meeting transcript">
            <TextArea
              value={transcript}
              onChange={setTranscript}
              rows={16}
              placeholder="Paste the full transcript or your rough notes here…"
            />
          </Field>
          <div className="mt-4 flex items-center gap-2">
            <PrimaryButton onClick={onGenerate} disabled={loading || !transcript.trim()}>
              {loading ? "Summarizing…" : "Summarize meeting"}
            </PrimaryButton>
            <GhostButton
              onClick={() => {
                setTranscript("");
                setSummary(EMPTY);
              }}
            >
              Clear
            </GhostButton>
          </div>
        </Pane>

        <Pane
          label="(b) Summary — editable"
          actions={<OutputActions text={toPlainText(summary)} filename="meeting-summary.txt" />}
        >
          <div className="grid gap-3">
            <SectionCard
              title="Overview summary"
              value={summary.overview}
              onChange={(v) => set("overview", v)}
            />
            <SectionCard
              title="Action items"
              value={summary.actionItems.join("\n")}
              onChange={(v) => set("actionItems", v)}
            />
            <SectionCard
              title="Decisions"
              value={summary.decisions.join("\n")}
              onChange={(v) => set("decisions", v)}
            />
            <SectionCard
              title="Deadlines"
              value={summary.deadlines.join("\n")}
              onChange={(v) => set("deadlines", v)}
            />
          </div>
        </Pane>
      </div>
    </AppShell>
  );
}
