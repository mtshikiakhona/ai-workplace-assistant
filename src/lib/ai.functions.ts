import { createServerFn } from "@tanstack/react-start";
import { streamText, Output } from "ai";
import { z } from "zod";
import { getGateway, CHAT_MODEL } from "./ai-gateway.server";

const ToolInput = z.object({
  tool: z.enum(["email", "planner", "research"]),
  prompt: z.string().min(1),
  tone: z.string().optional(),
  audience: z.string().optional(),
  horizon: z.string().optional(),
});

const SYSTEM = {
  email:
    "You are a workplace email writing assistant. Return a complete, ready-to-send email in plain text. Start with a 'Subject:' line, then greeting, body paragraphs, a short bulleted list of asks when useful, and a sign-off. No commentary, no markdown code fences.",
  planner:
    "You are a work planning assistant. Turn the raw task list into a prioritized schedule in plain text. Group by day (or by week if a weekly plan is requested), give each task a time block, an urgency tag in square brackets — [URGENT], [HIGH], [MEDIUM], [LOW] — and an estimated duration. End with a short 'Notes' section on trade-offs and what to drop if time runs short.",
  research:
    "You are a research analyst. Read the supplied material and return plain text with three clearly labelled sections: 'KEY TAKEAWAYS' (5-7 concise bullets), 'STRUCTURED INSIGHTS' (short thematic groupings with one or two sentences each), and 'PRACTICAL RECOMMENDATIONS' (numbered, action-oriented, each naming an owner-type and a timeframe). Be specific and avoid filler.",
} as const;

export const runTool = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ToolInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();

    let user = data.prompt;
    if (data.tool === "email") {
      user = `Tone: ${data.tone ?? "Formal"}\nAudience: ${data.audience ?? "Client"}\n\nKey points:\n${data.prompt}`;
    }
    if (data.tool === "planner") {
      user = `Planning horizon: ${data.horizon ?? "Daily"}\n\nRaw tasks:\n${data.prompt}`;
    }

    const result = streamText({
      model: gateway(CHAT_MODEL),
      system: SYSTEM[data.tool],
      prompt: user,
    });

    return { text: await result.text };
  });

const SummarySchema = z.object({
  overview: z.string(),
  actionItems: z.array(z.string()),
  decisions: z.array(z.string()),
  deadlines: z.array(z.string()),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ transcript: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();

    const result = streamText({
      model: gateway(CHAT_MODEL),
      system:
        "You summarize workplace meeting transcripts. Be concise and concrete. Action items name an owner when one is identifiable. Deadlines include the date or timeframe mentioned. Keep the overview to 3-4 sentences.",
      prompt: `Transcript:\n\n${data.transcript}`,
      output: Output.object({ schema: SummarySchema }),
    });

    return await result.output;
  });

const ChatInput = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
});

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();

    const result = streamText({
      model: gateway(CHAT_MODEL),
      system:
        "You are a workplace productivity assistant. Answer daily work questions clearly and briefly, in markdown-free plain text with short paragraphs or bullets. Be practical and specific.",
      messages: data.messages,
    });

    return { text: await result.text };
  });
