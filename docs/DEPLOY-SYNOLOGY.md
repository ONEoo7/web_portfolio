# Deploying to a Synology NAS (DS920+, DSM 7)

This stack runs on the DS920+ (Intel Celeron J4125, x86-64) under **Container
Manager**. DSM terminates TLS via its **reverse proxy + Let's Encrypt**, so the
stack itself runs plain HTTP on one internal port — no certbot, no port 80/443
conflict with DSM.

```
Internet ──443──▶ Router ──443──▶ NAS (DSM reverse proxy, TLS)
                                      └──http──▶ portfolio-nginx :8088
                                                    ├─▶ app   (static site)
                                                    ├─▶ api   (chat + resume)
                                                    ├─▶ /content  (live markdown)
                                                    └─▶ /analytics (GoAccess)
                                            api ──LAN──▶ Windows PC :4000 (LiteLLM/LM Studio)
```

The chatbot's model still runs on your **Windows PC** (LM Studio + LiteLLM on the
Intel iGPU). The NAS api reaches it over the LAN. The PC must be on for the chat
to work; everything else (site, resume PDFs, analytics) is fully NAS-hosted.

---

## 1. Prerequisites on the NAS

- DSM 7.2+ with **Container Manager** installed (Package Center).
- **SSH** temporarily enabled (Control Panel → Terminal & SNMP → Enable SSH) for
  the one-time setup commands below. You can disable it again afterward.
- A shared folder for the project, e.g. `/volume1/docker/web_portfolio`.

## 2. Build the frontend and copy the project

`app/` (the Vite build) is gitignored and the NAS has no Node build environment,
so build it on your dev machine first, then copy the **whole project including
`app/`** to the NAS.

```powershell
# on the Windows dev machine
cd web; npm run build; cd ..
```

Copy the project to `/volume1/docker/web_portfolio` (File Station drag-and-drop,
`rsync`, or a network drive). Make sure these are included:
`app/  api/  content/  prompts/  scripts/  nginx/  nginx-nas/  docker-compose.nas.yml`

## 3. Configure `.env`

Copy `.env.example` to `.env` and set, at minimum:

```ini
# LiteLLM/LM Studio on the Windows PC — use its LAN IP, NOT host.docker.internal
LITELLM_URL=http://192.168.1.50:4000
LITELLM_MASTER_KEY=sk-...your-key...
COPILOT_MODEL=lmstudio_qwen3.5-2b@q8_0
EMBEDDING_MODEL=lmstudio-text-embedding-qwen3-0.6b

SITE_URL=your-ddns-hostname.synology.me
RESUME_NAME=Stefan Ghitescu
```

> Find the Windows PC's LAN IP with `ipconfig` (IPv4 Address). On the PC, make
> sure **LiteLLM/LM Studio listens on `0.0.0.0:4000`** (not just localhost) and
> that **Windows Firewall allows inbound TCP 4000** from the LAN. A static DHCP
> reservation for the PC keeps the IP from changing.

## 4. One-time setup over SSH

```bash
cd /volume1/docker/web_portfolio

# Analytics dashboard credentials (pick your own password):
mkdir -p nginx/auth
docker run --rm httpd:2.4-alpine htpasswd -nbB admin 'YOUR-PASSWORD' \
  > nginx/auth/htpasswd

# geoip/ is created and populated automatically by the geoip-updater container
# on first run — no manual download needed (geo panels appear within a minute).
mkdir -p geoip analytics
```

## 5. Bring up the stack

Either via SSH:

```bash
docker compose -f docker-compose.nas.yml up -d --build
```

…or in **Container Manager → Project → Create**: set the path to the project
folder and choose `docker-compose.nas.yml` as the compose file. The first build
pulls images and compiles the api (a few minutes on the J4125).

Verify locally on the NAS:

```bash
curl -s http://localhost:8088/healthz        # → ok
curl -sI http://localhost:8088/api/resume/short.pdf | head -1   # → 200
```

## 6. DSM reverse proxy (TLS + hostname)

**Control Panel → Login Portal → Advanced → Reverse Proxy → Create:**

| Field | Source | Destination |
| ----- | ------ | ----------- |
| Protocol | HTTPS | HTTP |
| Hostname | `your-ddns-hostname` | `localhost` |
| Port | `443` | `8088` |

- **Enable HTTP/2** on the source.
- Under **Custom Header → Create → WebSocket**, add the WebSocket headers (also
  helps keep streaming connections alive).
- **Important for the chat (SSE streaming):** DSM's reverse proxy buffers
  responses by default, which can stall the chat stream. If chat replies arrive
  all-at-once or hang, add a custom header `X-Accel-Buffering: no`, or SSH in and
  add `proxy_buffering off;` to the generated proxy conf under
  `/etc/nginx/sites-enabled/`. The resume/static paths are unaffected.

## 7. DSM certificate (Let's Encrypt)

**Control Panel → Security → Certificate → Add → Add a new certificate → Get a
certificate from Let's Encrypt.** Enter your DDNS hostname and email. Then
**Settings** → assign that certificate to the reverse-proxy service you just
created. DSM auto-renews it.

## 8. Router

Forward **TCP 443 → the NAS IP** on your router. (Port 80 only if you also want
HTTP→HTTPS redirect handled by DSM.) You do **not** forward 8088 — that's
internal to the NAS, reached only by DSM's reverse proxy.

Your DDNS already resolves to your public IP; confirm it points at the NAS's
network and that the cert hostname matches.

---

## Day-to-day

- **Edit page text:** change `content/*.md` on the NAS share → refresh the
  browser. (Same live-edit behavior as the dev box; nginx serves `content/`
  from the bind mount.)
- **Update the chatbot's knowledge:** `docker compose -f docker-compose.nas.yml
  restart api` (re-indexes from the live `content/`).
- **Update the resume:** nothing to do — PDFs are generated per request from the
  live markdown.
- **Deploy site/code changes:** rebuild `app/` locally, copy it over, and for api
  changes run `docker compose -f docker-compose.nas.yml up -d --build api`.
- **Analytics:** `https://<your-hostname>/analytics/` (user `admin`, the password
  from step 4).

## Notes / gotchas

- **Build RAM:** the api build is fine on 4 GB, but if Container Manager's build
  is slow or OOMs, build the image on the dev machine and transfer it with
  `docker save portfolio-api | gzip > api.tgz` → copy → `docker load < api.tgz`,
  then remove the `build:` block usage by tagging the image as
  `web_portfolio-api`.
- **PC dependency:** if the Windows PC is off, the chat returns an error but the
  site, resume downloads, and analytics keep working. To make the NAS fully
  self-contained, switch `LITELLM_URL` to a cloud LiteLLM/provider later.
- **Real visitor IPs:** the NAS nginx recovers them from DSM's `X-Forwarded-For`
  (`set_real_ip_from 172.20.0.0/24`), so GeoIP/analytics show real clients, not
  the proxy.
