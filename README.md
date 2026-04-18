<p align="center">
  <img src="./packages/twenty-website/public/images/core/logo.svg" width="80px" alt="AgenticCRM logo" />
</p>

<h1 align="center">AgenticCRM</h1>

<p align="center"><strong>The AI-First Open-Source CRM</strong></p>

<p align="center">
  A conversational AI agent that lives inside your CRM — reads, writes, and reasons over your deals, contacts, and pipelines. Built on top of <a href="https://github.com/twentyhq/twenty">Twenty CRM</a>.
</p>

<p align="center">
  <a href="#-run-locally">Local</a> ·
  <a href="#-github-codespaces">Codespaces</a> ·
  <a href="#-docker-self-hosted">Docker</a> ·
  <a href="#-deploy-on-aws">AWS</a> ·
  <a href="#-ai-features">Features</a> ·
  <a href="#-credits">Credits</a>
</p>

<br />

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-website/public/images/readme/github-cover-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-website/public/images/readme/github-cover-light.png" />
    <img src="./packages/twenty-website/public/images/readme/github-cover-light.png" alt="AgenticCRM" />
  </picture>
</p>

---

## AI Features

### What the agent can do

- **Search & summarize** — "Show me all open deals above $50k"
- **Create & update records** — "Create a contact named Sarah at Acme Corp"
- **Move pipeline stages** — "Move TechCorp deal to Proposal Sent"
- **Bulk operations** — "Mark all overdue tasks as complete"
- **Log notes** — "Log a note: called John, follow up in 2 weeks"
- **Audit trail** — every action is logged and searchable

### How memory works

| Layer | What it stores |
|---|---|
| **Graph DB** | Every CRM entity as a node; relationships as typed edges (WORKS_AT, LINKED_TO, ASSIGNED_TO…) |
| **Episodic memory** | Conversation turns + agent actions with pgvector embeddings |
| **Knowledge base** | MD files in `ai-knowledge/` — workflows, rules, procedures — auto-indexed on startup |

### LLM providers supported

| Provider | Models |
|---|---|
| OpenAI | GPT-4o, o3, o4-mini |
| Anthropic | Claude Sonnet 4.6, Claude Opus 4.7 |
| OpenRouter | Claude, GPT-4o, Gemini 2.5 Pro, Llama 3.3, DeepSeek R1 |
| Ollama (local) | llama3.3, mistral, gemma3, qwen2.5, phi4, deepseek-r1 |

---

## Run Locally

### Prerequisites

- Node.js 20+
- Yarn 4 (`corepack enable && corepack prepare yarn@4.6.0 --activate`)
- PostgreSQL 15+ with the `vector` extension (`CREATE EXTENSION vector;`)
- Redis 7+

### 1. Clone

```bash
git clone https://github.com/myaiartist360-maker/AgenticCRM.git
cd AgenticCRM
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Configure environment

```bash
cp packages/twenty-server/.env.example packages/twenty-server/.env
```

Open `packages/twenty-server/.env` and set at minimum:

```env
# Required
DATABASE_URL=postgres://postgres:postgres@localhost:5432/agenticcrm
REDIS_URL=redis://localhost:6379
APP_SECRET=your-random-secret-here        # openssl rand -hex 32
SERVER_URL=http://localhost:3000
FRONT_BASE_URL=http://localhost:3001

# AI — pick at least one
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# OPENROUTER_API_KEY=sk-or-...
# OLLAMA_BASE_URL=http://localhost:11434/api
```

### 4. Set up the database

```bash
# Create DB and run all migrations (includes AI schema)
npx nx database:reset twenty-server
```

### 5. Start

```bash
yarn start
# Frontend → http://localhost:3001
# Backend  → http://localhost:3000
```

### 6. First login

Go to `http://localhost:3001` → click **Continue with Email** → use the pre-filled demo credentials.

Then: **Settings → AI → Models** to pick your LLM provider.

---

## GitHub Codespaces

The fastest way to try AgenticCRM — no local setup needed.

### 1. Open in Codespaces

Click **Code → Codespaces → Create codespace on main** on the repo page, or:

```
https://codespaces.new/myaiartist360-maker/AgenticCRM
```

Codespaces automatically provisions a machine with Node, Postgres, and Redis.

### 2. Run the setup script

```bash
bash packages/twenty-utils/setup-dev-env.sh
```

This detects the Codespaces environment, starts Postgres + Redis, creates databases, and copies `.env` files.

### 3. Add your AI key

```bash
echo "OPENAI_API_KEY=sk-..." >> packages/twenty-server/.env
```

### 4. Start

```bash
yarn start
```

Codespaces will prompt you to open the forwarded ports (3000 and 3001) in your browser.

---

## Docker (Self-Hosted)

### Quick start — single command

```bash
# Clone
git clone https://github.com/myaiartist360-maker/AgenticCRM.git
cd AgenticCRM/packages/twenty-docker

# Copy and edit env
cp .env.example .env
# Edit .env: set SERVER_URL, APP_SECRET, OPENAI_API_KEY (or other provider)

# Start everything
docker compose up -d
```

This starts: `server`, `worker`, `db` (Postgres 15 + pgvector), `redis`.

Frontend + backend both served from port **3000**.

### docker-compose env variables

```env
# .env (packages/twenty-docker/.env)
TAG=latest
SERVER_URL=http://localhost:3000
APP_SECRET=                        # openssl rand -hex 32
PG_DATABASE_PASSWORD=postgres

# AI
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# OPENROUTER_API_KEY=sk-or-...
```

### Run database migrations

```bash
docker compose exec server yarn database:migrate:prod
```

### Check logs

```bash
docker compose logs -f server
docker compose logs -f worker
```

### Stop

```bash
docker compose down           # keep data
docker compose down -v        # wipe data too
```

---

## Deploy on AWS

### Option A — EC2 (simplest)

**1. Launch an EC2 instance**

- AMI: Ubuntu 24.04 LTS
- Instance type: `t3.medium` minimum (`t3.large` recommended for LLM workloads)
- Storage: 30 GB gp3
- Security group: open ports 22 (SSH), 80, 443, 3000

**2. Install dependencies on the instance**

```bash
# Connect
ssh -i your-key.pem ubuntu@<EC2_IP>

# Docker
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker ubuntu && newgrp docker
```

**3. Clone and configure**

```bash
git clone https://github.com/myaiartist360-maker/AgenticCRM.git
cd AgenticCRM/packages/twenty-docker
cp .env.example .env
nano .env   # set SERVER_URL=http://<EC2_IP>:3000, APP_SECRET, OPENAI_API_KEY
```

**4. Start**

```bash
docker compose up -d
```

Visit `http://<EC2_IP>:3000`.

**5. (Optional) Add HTTPS with nginx + Certbot**

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
# Point your domain A record to EC2_IP, then:
sudo certbot --nginx -d your-domain.com
```

Update `SERVER_URL` and `FRONT_BASE_URL` in `.env` to `https://your-domain.com`, then `docker compose restart server`.

---

### Option B — AWS ECS with RDS + ElastiCache (production)

**Architecture:**
```
ALB (HTTPS 443)
  └── ECS Fargate
        ├── agenticcrm-server  (port 3000)
        └── agenticcrm-worker
RDS PostgreSQL 15  (with pgvector extension enabled)
ElastiCache Redis 7
S3 bucket          (file storage)
```

**Step-by-step:**

**1. Enable pgvector on RDS**

```sql
-- In your RDS Postgres instance:
CREATE EXTENSION IF NOT EXISTS vector;
```

> Use RDS PostgreSQL 15.4+ — pgvector is available as a supported extension.

**2. Build and push Docker image**

```bash
# In repo root
aws ecr create-repository --repository-name agenticcrm --region us-east-1
aws ecr get-login-password | docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com

docker build -f packages/twenty-server/Dockerfile -t agenticcrm-server .
docker tag agenticcrm-server:latest <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/agenticcrm:latest
docker push <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/agenticcrm:latest
```

**3. Create ECS Task Definition**

Key environment variables for the task:

```json
[
  { "name": "DATABASE_URL",      "value": "postgres://...rds.amazonaws.com/agenticcrm" },
  { "name": "REDIS_URL",         "value": "redis://...cache.amazonaws.com:6379" },
  { "name": "SERVER_URL",        "value": "https://your-domain.com" },
  { "name": "STORAGE_TYPE",      "value": "s3" },
  { "name": "STORAGE_S3_REGION", "value": "us-east-1" },
  { "name": "STORAGE_S3_NAME",   "value": "agenticcrm-files" },
  { "name": "APP_SECRET",        "valueFrom": "arn:aws:secretsmanager:..." },
  { "name": "OPENAI_API_KEY",    "valueFrom": "arn:aws:secretsmanager:..." }
]
```

> Store secrets (APP_SECRET, API keys) in **AWS Secrets Manager** and reference via `valueFrom`.

**4. Run migrations as a one-off ECS task**

```bash
aws ecs run-task \
  --cluster agenticcrm \
  --task-definition agenticcrm-migrate \
  --overrides '{"containerOverrides":[{"name":"server","command":["yarn","database:migrate:prod"]}]}'
```

**5. Create ECS Service + ALB**

- Create an Application Load Balancer with HTTPS listener (ACM certificate)
- Target group: port 3000, health check path `/healthz`
- ECS Service: 1 server task + 1 worker task (separate task definitions)

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `APP_SECRET` | Yes | Random 32-char secret for JWT signing |
| `SERVER_URL` | Yes | Public URL of the backend |
| `FRONT_BASE_URL` | Local only | Frontend URL (defaults to SERVER_URL in prod) |
| `OPENAI_API_KEY` | AI | OpenAI key for GPT models + embeddings |
| `ANTHROPIC_API_KEY` | AI | Anthropic key for Claude models |
| `OPENROUTER_API_KEY` | AI | OpenRouter key (Claude, GPT-4o, Gemini, etc.) |
| `OLLAMA_BASE_URL` | AI | Ollama base URL (e.g. `http://localhost:11434/api`) |
| `STORAGE_TYPE` | Prod | `local` or `s3` |
| `STORAGE_S3_REGION` | S3 | AWS region |
| `STORAGE_S3_NAME` | S3 | S3 bucket name |

---

## Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Nx](https://nx.dev/) monorepo
- [NestJS](https://nestjs.com/) · [BullMQ](https://bullmq.io/) · [PostgreSQL 15 + pgvector](https://github.com/pgvector/pgvector) · [Redis](https://redis.io/)
- [React 18](https://reactjs.org/) · [Jotai](https://jotai.org/) · [Linaria](https://linaria.dev/) · [Lingui](https://lingui.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/) for streaming multi-provider LLM

---

## Credits

AgenticCRM is built on top of **[Twenty CRM](https://github.com/twentyhq/twenty)** — an open-source CRM crafted by the [Twenty team](https://twenty.com) and its [community contributors](https://github.com/twentyhq/twenty/graphs/contributors).

All original Twenty code is intact and governed by the [upstream license](https://github.com/twentyhq/twenty/blob/main/LICENSE). The AI layer (graph DB, memory, chat agent, capability governance) was added as new modules without modifying upstream logic.

If this project is useful to you, please also **star the original** at [github.com/twentyhq/twenty](https://github.com/twentyhq/twenty).

<p align="center">
  <a href="https://www.chromatic.com/"><img src="./packages/twenty-website/public/images/readme/chromatic.png" height="28" alt="Chromatic" /></a>&nbsp;&nbsp;
  <a href="https://greptile.com"><img src="./packages/twenty-website/public/images/readme/greptile.png" height="28" alt="Greptile" /></a>&nbsp;&nbsp;
  <a href="https://sentry.io/"><img src="./packages/twenty-website/public/images/readme/sentry.png" height="28" alt="Sentry" /></a>&nbsp;&nbsp;
  <a href="https://crowdin.com/"><img src="./packages/twenty-website/public/images/readme/crowdin.png" height="28" alt="Crowdin" /></a>&nbsp;&nbsp;
  <a href="https://e2b.dev/"><img src="./packages/twenty-website/public/images/readme/e2b.svg" height="28" alt="E2B" /></a>
</p>
