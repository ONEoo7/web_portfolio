# Portfolio

Static portfolio (Vite + React + TypeScript) with a RAG-powered chat assistant
(CopilotKit + LiteLLM) wired through nginx and Docker Compose.

## Layout

```
.
├── web/                   # Vite + React + TS source — builds into ../app/
├── app/                   # nginx-served static output (Vite build target)
├── api/                   # Node CopilotKit runtime + RAG retriever
├── content/               # Markdown knowledge base for RAG (edit this!)
├── litellm_config.yaml    # LiteLLM model routing
├── docker-compose.yml     # nginx, certbot, app, api, litellm
├── nginx.conf
├── default.conf           # HTTP → HTTPS + ACME challenge
├── portfolio.conf         # HTTPS server + /api/copilotkit proxy
├── ssl-params.conf
└── .env.example
```

> The compose file mounts nginx config from `./nginx/`, `./nginx/conf.d/`, and
> `./nginx/ssl/`. Before first run, move the root-level `*.conf` files into
> that layout (`nginx/nginx.conf`, `nginx/conf.d/{default,portfolio}.conf`,
> `nginx/ssl/ssl-params.conf`).

## Architecture

```
Browser ──HTTPS──▶ nginx ──┬──▶ app   (static Vite build)
                           └──▶ api   (CopilotKit + RAG)
                                  │
                                  └──▶ litellm ──▶ OpenAI / Anthropic / ...
```

The chat widget (`<CopilotPopup>`) is mounted bottom-right on every page.
Each user message is intercepted by a CopilotKit middleware on the server,
which retrieves the top-K relevant chunks from `content/` and injects them
as system context before the LLM call. The LLM call itself is routed through
LiteLLM so the upstream provider can be swapped in `litellm_config.yaml`
without touching application code.

## Local development

### 1. Configure environment

```bash
cp .env.example .env
# fill in OPENAI_API_KEY and set LITELLM_MASTER_KEY
```

### 2. Frontend

```bash
cd web
npm install
npm run dev      # http://localhost:5173, proxies /api → :8080
```

### 3. Backend

```bash
cd api
npm install

# One-time: build the RAG index. Requires the LiteLLM proxy running OR
# point LITELLM_URL at your own OpenAI-compatible endpoint.
LITELLM_URL=http://localhost:4000 \
LITELLM_API_KEY=$LITELLM_MASTER_KEY \
  npm run index

npm run dev      # http://localhost:8080
```

### 4. LiteLLM (local)

You can either run the full stack via `docker compose up litellm`, or run
LiteLLM directly:

```bash
docker run --rm -p 4000:4000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e LITELLM_MASTER_KEY=$LITELLM_MASTER_KEY \
  -v $(pwd)/litellm_config.yaml:/app/config.yaml:ro \
  ghcr.io/berriai/litellm:main-stable \
  --config /app/config.yaml --port 4000
```

## Production build (Docker Compose)

```bash
# Build the static site into ./app/
cd web && npm install && npm run build && cd ..

# Bring up the stack (api will build its image and re-index on start)
docker compose up -d --build
```

## Editing the chat knowledge base

Edit any file in `content/` and re-run indexing:

```bash
cd api && npm run index
# or rebuild the api container: docker compose up -d --build api
```

The index is rebuilt automatically each time the api container starts.

## Swapping the LLM provider

Edit `litellm_config.yaml`. Example — switch the chat model to Anthropic:

```yaml
model_list:
  - model_name: chat
    litellm_params:
      model: anthropic/claude-haiku-4-5
      api_key: os.environ/ANTHROPIC_API_KEY
```

Then add `ANTHROPIC_API_KEY=...` to `.env` and restart the `litellm` service.
No application code changes required.
