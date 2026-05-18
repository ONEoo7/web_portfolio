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
├── docker-compose.yml     # nginx, certbot, app, api
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
Each user message is handled by a CopilotKit `BuiltInAgent` (AI SDK factory
mode) on the server, which retrieves the top-K relevant chunks from `content/`
and injects them as the system prompt before calling the LLM. The LLM call
itself goes through an externally-managed LiteLLM proxy, so the upstream
provider can be swapped in your LiteLLM config without touching application
code.

> LiteLLM is **not** part of this compose stack — it's expected to be running
> separately and reachable from the api container at `LITELLM_URL` (see
> `.env.example`).

## Local development

### 1. Configure environment

```bash
cp .env.example .env
# Set DOMAIN, CERTBOT_EMAIL, LITELLM_URL, LITELLM_MASTER_KEY,
# COPILOT_MODEL, EMBEDDING_MODEL to match your LiteLLM proxy.
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

### 4. LiteLLM (external)

LiteLLM is **not** managed by this repo's compose file. Run it however you
prefer (host service, separate compose project, k8s, etc.) and point
`LITELLM_URL` at it. From the dockerized api container, the host machine is
reachable at `host.docker.internal:<port>`; from `npm run dev` on the host
shell, use `localhost:<port>`. The proxy must expose the model aliases set in
`COPILOT_MODEL` and `EMBEDDING_MODEL`.

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

Edit your LiteLLM proxy's own config to remap the `chat` / `embeddings` model
aliases (or whatever you've set in `COPILOT_MODEL` / `EMBEDDING_MODEL`) to a
different upstream. For example, with the standard LiteLLM YAML schema:

```yaml
model_list:
  - model_name: chat
    litellm_params:
      model: anthropic/claude-haiku-4-5
      api_key: os.environ/ANTHROPIC_API_KEY
```

Restart LiteLLM; no changes needed in this repo.
