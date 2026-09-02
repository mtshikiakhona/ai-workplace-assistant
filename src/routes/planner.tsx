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

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Lagoon AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Paste a raw task list and get a prioritized daily or weekly schedule with urgency tags and time blocks.",
      },
      { property: "og:title", content: "AI Task Planner — Lagoon" },
      {
        property: "og:description",
        content: "Turn scattered tasks into a prioritized schedule with urgency tags.",
      },
    ],
  }),
  component: PlannerPage,
});

const HORIZONS = ["Daily", "Weekly"] as const;

function PlannerPage() {
  const generate = useServerFn(runTool);
  const { loading, run } = useAsyncAction<{ text: string }>();
  const [horizon, setHorizon] = useState<string>("Daily");
  const [tasks, setTasks] = useState("");
  const [plan, setPlan] = useState("");

  function onGenerate() {
    if (!tasks.trim()) return;
    run(
      () => generate({ data: { tool: "planner", prompt: tasks, horizon } }),
      (res) => setPlan(res.text),
    );
  }

  return (
    <AppShell title="AI Task Planner">
      <PageIntro
        heading="A sequenced plan instead of a scattered list."
        sub="Drop in everything on your plate and get an ordered schedule with urgency tags."
        badge={`${horizon} plan`}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Pane label="(a) Input">
          <Field label="Planning horizon">
            <Select value={horizon} onChange={setHorizon} options={HORIZONS} />
          </Field>
          <div className="mt-4">
            <Field label="Raw task list">
              <TextArea
                value={tasks}
                onChange={setTasks}
                rows={14}
                placeholder={"Finish Q3 budget deck\nReply to vendor contract email\nInterview two candidates\nFix the reporting bug (blocking support)"}
              />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <PrimaryButton onClick={onGenerate} disabled={loading || !tasks.trim()}>
              {loading ? "Planning…" : "Build schedule"}
            </PrimaryButton>
            <GhostButton
              onClick={() => {
                setTasks("");
                setPlan("");
              }}
            >
              Clear
            </GhostButton>
          </div>
        </Pane>

        <Pane
          label="(b) Schedule — editable"
          actions={<OutputActions text={plan} filename="task-plan.txt" />}
        >
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Your prioritized schedule will appear here, fully editable."
            className="min-h-[380px] w-full resize-y rounded-xl border border-line bg-background p-4 font-mono text-[12.5px] leading-[1.75] outline-none transition placeholder:font-sans placeholder:text-muted-foreground/60 focus:border-lagoon/50 focus:ring-2 focus:ring-ring"
          />
        </Pane>
      </div>
    </AppShell>
  );
}
