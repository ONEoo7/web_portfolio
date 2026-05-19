# Portfolio

Static portfolio (Vite + React + TypeScript) with a RAG-powered chat assistant
(CopilotKit + LiteLLM) wired through nginx and Docker Compose.

## Layout

```
.
├── web/                   # Vite + React + TS source — builds into ../app/
├── app/                   # nginx-served static output (Vite build target)
├── api/                   # Node CopilotKit runtime + RAG retriever
├── content/               # Markdown for both page sections AND RAG (edit this!)
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

The `content/` directory is **dual-purpose**: each markdown file is both
rendered as a page section (fetched at runtime by the frontend) *and* indexed
into the RAG embeddings the chatbot retrieves from. Editing a file updates
both, on different cadences — see "Editing site text and chatbot knowledge"
below.

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

## Editing site text and chatbot knowledge

All page copy lives in `content/*.md` — one file per section
(`hero.md`, `bio.md`, `experience.md`, `projects.md`, `skills.md`, `contact.md`).
Both the page and the chatbot read from these files, but they pick up changes
on different schedules:

| What you edited           | What you need to do                          |
| ------------------------- | -------------------------------------------- |
| Just the **page text**    | Refresh the browser. nginx serves `content/` live from a read-only bind mount. |
| Want the **chatbot** to know too | `docker compose restart api` — the api container re-indexes against the live `./content/` at startup. No image rebuild. |

The api container bind-mounts `./content` as `/app/content:ro`, so a restart
is sufficient to pick up any edits. You do **not** need to run
`docker compose build` for content changes.

To add a new section, create `content/<name>.md` and reference it from a new
React component (see `web/src/components/About.tsx` for the minimal pattern).
Adding a brand-new section *does* require a one-time `npm run build` in
`web/` to ship the new component; subsequent text edits to that section's
markdown file do not.

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
