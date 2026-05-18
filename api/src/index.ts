import { Hono } from "hono";
import { serve } from "@hono/node-server";
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { config } from "./config.js";
import { systemPrompt } from "./prompt.js";
import { loadIndex, retrieve, formatContext, isLoaded } from "./rag/retriever.js";

await loadIndex();

const openai = new OpenAI({
  baseURL: `${config.litellmUrl}/v1`,
  apiKey: config.litellmApiKey || "sk-no-key",
});

const serviceAdapter = new OpenAIAdapter({
  openai,
  model: config.chatModel,
});

const runtime = new CopilotRuntime({
  middleware: {
    onBeforeRequest: async ({ inputMessages }: any) => {
      const lastUser = [...inputMessages]
        .reverse()
        .find((m: any) => m?.role === "user" || m?.textMessage?.role === "user");

      const userText: string =
        lastUser?.content ??
        lastUser?.textMessage?.content ??
        "";

      if (!userText) return;

      const hits = await retrieve(String(userText));
      const context = formatContext(hits);

      inputMessages.unshift({
        role: "system",
        content: `${systemPrompt}\n\nRetrieved context:\n${context}`,
      });
    },
  },
});

const app = new Hono();

app.get("/healthz", (c) =>
  isLoaded() ? c.text("ok") : c.text("indexing", 503)
);

app.all("/copilotkit/*", async (c) => {
  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: "/copilotkit",
    runtime,
    serviceAdapter,
  });
  // @ts-expect-error — handler is a Node http handler; Hono exposes raw req/res
  return handler(c.env.incoming, c.env.outgoing);
});

app.all("/copilotkit", async (c) => {
  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: "/copilotkit",
    runtime,
    serviceAdapter,
  });
  // @ts-expect-error — same as above
  return handler(c.env.incoming, c.env.outgoing);
});

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[api] listening on http://0.0.0.0:${info.port}`);
  console.log(`[api] LiteLLM at ${config.litellmUrl}`);
  console.log(`[api] chat=${config.chatModel} embed=${config.embeddingModel}`);
});
