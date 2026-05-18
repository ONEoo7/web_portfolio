import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);

export const config = {
  port: Number(process.env.PORT ?? 8080),
  litellmUrl: process.env.LITELLM_URL ?? "http://litellm:4000",
  litellmApiKey: process.env.LITELLM_API_KEY ?? "",
  chatModel: process.env.COPILOT_MODEL ?? "chat",
  embeddingModel: process.env.EMBEDDING_MODEL ?? "embeddings",
  contentDir:
    process.env.CONTENT_DIR ?? path.resolve(here, "../../content"),
  indexPath:
    process.env.INDEX_PATH ?? path.resolve(here, "../index.json"),
  topK: Number(process.env.RAG_TOP_K ?? 4),
};
