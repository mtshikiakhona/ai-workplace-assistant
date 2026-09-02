import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageIntro, GhostButton, copyText, useAsyncAction } from "@/components/ToolPanels";
import { chatReply } from "@/lib/ai.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot Interface — Lagoon AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Ask everyday workplace questions and iterate in conversation with the Lagoon AI assistant.",
      },
      { property: "og:title", content: "AI Chatbot Interface — Lagoon" },
      {
        property: "og:description",
        content: "A conversational assistant for daily workplace questions.",
      },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How should I structure a 15-minute budget review brief?",
  "Draft a polite nudge for an overdue deliverable.",
  "What should I prioritise if two deadlines collide?",
] as const;

function ChatPage() {
  const send = useServerFn(chatReply);
  const { loading, run } = useAsyncAction<{ text: string }>();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    run(
      () => send({ data: { messages: next } }),
      (res) => setMessages([...next, { role: "assistant", content: res.text }]),
    );
  }

  return (
    <AppShell title="AI Chatbot Interface">
      <PageIntro
        heading="Ask anything about your working day."
        sub="A conversational assistant for quick decisions, wording and next steps."
        badge={loading ? "Thinking…" : "Online"}
      />

      <div className="mx-auto flex max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-surface ring-1 ring-foreground/[0.02]">
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-5">
          <span className="label-mono">Conversation</span>
          <GhostButton small onClick={() => setMessages([])}>
            Clear
          </GhostButton>
        </div>

        <div className="flex min-h-[380px] flex-col gap-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="m-auto max-w-md text-center">
              <p className="text-[13px] text-muted-foreground">
                Start with a question, or try one of these:
              </p>
              <div className="mt-4 grid gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-xl border border-line bg-background px-3 py-2 text-left text-[12.5px] text-muted-foreground transition hover:border-lagoon/30 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="max-w-[85%] self-end">
                <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-lagoon to-lagoon-deep px-4 py-2.5 text-[13.5px] leading-relaxed text-primary-foreground">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="max-w-[90%] self-start">
                <div className="label-mono mb-1">Lagoon AI</div>
                <div className="whitespace-pre-wrap text-[13.5px] leading-[1.7] text-foreground">
                  {m.content}
                </div>
                <button
                  onClick={() => copyText(m.content)}
                  className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
                >
                  Copy
                </button>
              </div>
            ),
          )}

          {loading && (
            <div className="self-start font-mono text-[11px] text-muted-foreground">Thinking…</div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-end gap-2 border-t border-line p-3"
        >
          <textarea
            value={input}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Ask about meetings, drafts, priorities…"
            className="max-h-40 min-h-[38px] flex-1 resize-y rounded-xl border border-line bg-background px-3 py-2 text-[13.5px] outline-none transition placeholder:text-muted-foreground/60 focus:border-lagoon/50 focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-lagoon to-lagoon-deep text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
