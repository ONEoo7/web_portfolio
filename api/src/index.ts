import { Hono } from "hono";
import { serve } from "@hono/node-server";
import {
  CopilotRuntime,
  BuiltInAgent,
  convertMessagesToVercelAISDKMessages,
  createCopilotHonoHandler,
} from "@copilotkit/runtime/v2";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { config } from "./config.js";
import { systemPrompt } from "./prompt.js";
import { loadIndex, retrieve, formatContext, isLoaded } from "./rag/retriever.js";

await loadIndex();

const openaiProvider = createOpenAI({
  baseURL: `${config.litellmUrl}/v1`,
  apiKey: config.litellmApiKey || "sk-no-key",
});

const ragAgent = new BuiltInAgent({
  type: "aisdk",
  factory: async (ctx) => {
    const messages = ctx.input.messages ?? [];
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const userText =
      typeof lastUser?.content === "string" ? lastUser.content : "";

    let prompt = systemPrompt;
    if (userText.trim()) {
      const hits = await retrieve(userText);
      prompt = `${systemPrompt}\n\nRetrieved context:\n${formatContext(hits)}`;
    }

    const result = streamText({
      model: openaiProvider.chat(config.chatModel),
      system: prompt,
      messages: convertMessagesToVercelAISDKMessages(messages),
      abortSignal: ctx.abortSignal,
    });

    return { fullStream: result.fullStream };
  },
});

const runtime = new CopilotRuntime({
  agents: { default: ragAgent },
});

const copilotApp = createCopilotHonoHandler({
  runtime,
  basePath: "/copilotkit",
  mode: "single-route",
});

const app = new Hono();
app.get("/healthz", (c) =>
  isLoaded() ? c.text("ok") : c.text("indexing", 503)
);
app.route("/", copilotApp);

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[api] listening on http://0.0.0.0:${info.port}`);
  console.log(`[api] LiteLLM at ${config.litellmUrl}`);
  console.log(`[api] chat=${config.chatModel} embed=${config.embeddingModel}`);
});
