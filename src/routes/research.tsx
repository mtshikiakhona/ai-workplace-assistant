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
import { runTool } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Lagoon AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Paste long articles or reports and get key takeaways, structured insights and practical recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant — Lagoon" },
      {
        property: "og:description",
        content: "Distill long reports into takeaways, insights and recommended actions.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const generate = useServerFn(runTool);
  const { loading, run } = useAsyncAction<{ text: string }>();
  const [source, setSource] = useState("");
  const [analysis, setAnalysis] = useState("");

  function onGenerate() {
    if (!source.trim()) return;
    run(
      () => generate({ data: { tool: "research", prompt: source } }),
      (res) => setAnalysis(res.text),
    );
  }

  return (
    <AppShell title="AI Research Assistant">
      <PageIntro
        heading="Read less, decide faster."
        sub="Paste an article or report and get takeaways, structured insights and recommendations."
        badge={
          source.trim() ? `${source.trim().split(/\s+/).length} words in` : "Awaiting source text"
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Pane label="(a) Source material">
          <Field label="Article, report or research notes">
            <TextArea
              value={source}
              onChange={setSource}
              rows={18}
              placeholder="Paste the full text you want analyzed…"
            />
          </Field>
          <div className="mt-4 flex items-center gap-2">
            <PrimaryButton onClick={onGenerate} disabled={loading || !source.trim()}>
              {loading ? "Analyzing…" : "Analyze source"}
            </PrimaryButton>
            <GhostButton
              onClick={() => {
                setSource("");
                setAnalysis("");
              }}
            >
              Clear
            </GhostButton>
          </div>
        </Pane>

        <Pane
          label="(b) Analysis — editable"
          actions={<OutputActions text={analysis} filename="research-analysis.txt" />}
        >
          <textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            placeholder="Key takeaways, structured insights and practical recommendations will appear here."
            className="min-h-[440px] w-full resize-y rounded-xl border border-line bg-background p-4 text-[13.5px] leading-[1.75] outline-none transition placeholder:text-muted-foreground/60 focus:border-lagoon/50 focus:ring-2 focus:ring-ring"
          />
        </Pane>
      </div>
    </AppShell>
  );
}
