import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import {
  PageIntro,
  Pane,
  Field,
  Select,
  TextArea,
  PrimaryButton,
  GhostButton,
  OutputActions,
  useAsyncAction,
} from "@/components/ToolPanels";
import { runTool } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Lagoon AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Generate structured, tone-matched workplace emails from a few bullet points, then edit, copy or export.",
      },
      { property: "og:title", content: "Smart Email Generator — Lagoon" },
      {
        property: "og:description",
        content: "Tone- and audience-aware AI email drafting for client, manager and team messages.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;
const AUDIENCES = ["Client", "Manager", "Team"] as const;

function EmailPage() {
  const generate = useServerFn(runTool);
  const { loading, run } = useAsyncAction<{ text: string }>();
  const [tone, setTone] = useState<string>("Formal");
  const [audience, setAudience] = useState<string>("Client");
  const [points, setPoints] = useState("");
  const [draft, setDraft] = useState("");

  function onGenerate() {
    if (!points.trim()) return;
    run(
      () => generate({ data: { tool: "email", prompt: points, tone, audience } }),
      (res) => setDraft(res.text),
    );
  }

  return (
    <AppShell title="Smart Email Generator">
      <PageIntro
        heading="Compose, refine, and ship at a calm pace."
        sub="Draft a structured message from your bullet points, then edit it before exporting."
        badge={`${tone} · ${audience}`}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Pane
          label="(a) Input"
          meta={<span className="font-mono text-[10px] text-muted-foreground">3 fields</span>}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tone">
              <Select value={tone} onChange={setTone} options={TONES} />
            </Field>
            <Field label="Audience">
              <Select value={audience} onChange={setAudience} options={AUDIENCES} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Key bullet points">
              <TextArea
                value={points}
                onChange={setPoints}
                rows={9}
                placeholder={"• Confirm the launch timeline before Friday\n• Request updated brand assets\n• Flag the Q3 performance review"}
              />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <PrimaryButton onClick={onGenerate} disabled={loading || !points.trim()}>
              {loading ? "Generating…" : "Generate draft"}
            </PrimaryButton>
            <GhostButton
              onClick={() => {
                setPoints("");
                setDraft("");
              }}
            >
              Clear
            </GhostButton>
          </div>
        </Pane>

        <Pane
          label="(b) Draft — editable"
          actions={<OutputActions text={draft} filename="email-draft.txt" />}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Your generated email will appear here, fully editable."
            className="min-h-[320px] w-full resize-y rounded-xl border border-line bg-background p-4 text-[14px] leading-[1.7] outline-none transition placeholder:text-muted-foreground/60 focus:border-lagoon/50 focus:ring-2 focus:ring-ring"
          />
          <div className="mt-3 font-mono text-[10px] text-muted-foreground">
            {draft.trim() ? `${draft.trim().split(/\s+/).length} words` : "No draft yet"} · {tone}
          </div>
        </Pane>
      </div>
    </AppShell>
  );
}
