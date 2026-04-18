<p align="center">
  <a href="https://www.twenty.com">
    <img src="./packages/twenty-website/public/images/core/logo.svg" width="100px" alt="Twenty logo" />
  </a>
</p>

<h1 align="center">Twenty AI — The AI-First Open-Source CRM</h1>

<p align="center">
  A fork of <a href="https://github.com/twentyhq/twenty">Twenty CRM</a> extended with a full AI agent layer: graph memory, semantic search, a Claude-style chat assistant, and a configurable LLM brain.
</p>

<p align="center">
  <a href="https://twenty.com">🌐 Upstream Website</a> ·
  <a href="https://docs.twenty.com">📚 Upstream Docs</a> ·
  <a href="https://github.com/twentyhq/twenty">⬆️ Original Repo</a>
</p>

<br />

<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-website/public/images/readme/github-cover-dark.png" />
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-website/public/images/readme/github-cover-light.png" />
      <img src="./packages/twenty-website/public/images/readme/github-cover-light.png" alt="Cover" />
    </picture>
</p>

<br />

---

## What is this fork?

This repository is **Twenty AI** — Twenty CRM with a complete AI-first layer bolted on. Every CRM record is synced to a graph database, every action is remembered, and a conversational agent can perform any CRM operation on behalf of the user.

The AI capabilities were built in five phases on top of the upstream Twenty codebase. Nothing from upstream was removed; everything new lives in dedicated modules.

---

## AI Features Added

### Phase 1 — Graph Database Layer

Every CRM entity (people, companies, opportunities, notes, tasks) is dual-written into a PostgreSQL-backed graph (`graphNode` + `graphEdge` tables). Relationships (WORKS_AT, LINKED_TO, ASSIGNED_TO, etc.) are inferred automatically from entity fields and stored as typed edges.

- `packages/twenty-server/src/modules/graph-db/` — `GraphDbService`, `GraphSyncListener`
- Recursive CTE traversal up to configurable depth
- pgvector IVFFlat cosine index for nearest-neighbour node search
- TypeORM migration in `core` schema: `graphNode`, `graphEdge`, `aiMemoryEpisode`, `aiKnowledgeChunk`, `agentCapabilityRule`

### Phase 2 — AI Memory Module

The agent has three kinds of memory:

| Memory type | What it stores | Where |
|---|---|---|
| **Episodic** | Conversation turns, tool calls, actions | `core.aiMemoryEpisode` + pgvector |
| **Semantic** | Entity graph embeddings, knowledge chunks | `core.aiKnowledgeChunk` + pgvector |
| **Knowledge base** | MD files in `ai-knowledge/` — workflows, rules, procedures | Chunked + indexed on server start |

- `packages/twenty-server/src/modules/ai-memory/`
- Knowledge loader auto-indexes `ai-knowledge/*.md` on `OnModuleInit`, skipping unchanged files
- `MemoryContextBuilderService` assembles graph context + recent actions + relevant KB chunks into a system-prompt section

**Knowledge base MD files** (`ai-knowledge/`):

```
workflows/   deal-progression.md, lead-qualification.md
rules/       data-validation.md, assignment-rules.md
settings/    agent-personality.md, capabilities.md, llm-providers.md
procedures/  create-contact.md, update-deal-stage.md, search-and-summarize.md
```

### Phase 3 — AI Chat Module & LLM Configuration

A Claude-style streaming chat pipeline accessible to any logged-in user:

- Multi-provider LLM support: **OpenAI**, **Anthropic Claude**, **OpenRouter**, **Ollama** (local)
- Providers and models defined in `ai-providers.json`; Ollama + OpenRouter added with `@ai-sdk/openai-compatible`
- SSE streaming via BullMQ `aiStreamQueue`
- CRM tool set: `searchEntities`, `createRecord`, `updateRecord`, `deleteRecord`, `stageChange`, `bulkUpdate`, `logNote`, `completeTask`, `getAuditLog`
- `MemoryContextBuilderService` injects graph + episodic + knowledge context into every system prompt

**Supported LLM providers:**

| Provider | Notes |
|---|---|
| OpenAI | GPT-4o, o3, o4-mini |
| Anthropic | Claude Sonnet 4.6, Claude Opus 4.7 |
| OpenRouter | Unified API: Claude, GPT-4o, Gemini, Llama, DeepSeek, Mistral |
| Ollama | Local: llama3.3, mistral, gemma3, qwen2.5, phi4, deepseek-r1 |

### Phase 4 — Frontend: Chat Widget & LLM Settings

- Full-screen chat widget available post-login (desktop + mobile)
- **Settings → AI → Brain tab**: active providers, model counts, Ollama/OpenRouter status dots, memory layer health (Graph DB, Episodic Memory, Knowledge Base, pgvector)
- **Settings → AI → Permissions tab**: capability matrix (read/write/delete/bulk toggles + rate/hr per entity type)
- **Settings → AI → Models tab**: select Smart / Fast model, enable/disable providers

### Phase 5 — Agent Governance

- **`AgentAuditService`**: every agent action is stored in episodic memory (`type='action'`) — dual-purpose audit trail and AI context
- **`AgentRateLimiterService`**: token-bucket rate limiting per entity type (`agent_rate:{workspace}:{user}:{entity}`) plus a global cap (200 actions/hr per user)
- **`AgentCapabilityResolver`**: GraphQL API to read and save the capability matrix per workspace
  - `agentCapabilityRules` query
  - `upsertAgentCapabilityRule` mutation
  - `deleteAgentCapabilityRule` mutation
  - `seedDefaultAgentCapabilityRules` mutation
- **Permissions tab** wired to the real GraphQL backend — loads on mount, saves on demand

---

## Environment Variables (new)

```env
# Ollama (local LLM)
OLLAMA_BASE_URL=http://localhost:11434/api

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# Embedding model (used for pgvector semantic search)
EMBEDDING_MODEL=text-embedding-3-small   # any OpenAI-compatible embedding endpoint
```

---

## Architecture

```
packages/
├── twenty-server/src/modules/
│   ├── graph-db/          # GraphDbService, GraphSyncListener, entities
│   ├── ai-memory/         # EpisodicMemoryService, SemanticMemoryService,
│   │                      #   KnowledgeLoaderService, MemoryContextBuilderService
│   └── agent-config/      # AgentCapabilityService, AgentCapabilityResolver,
│                          #   AgentAuditService, AgentRateLimiterService
│
├── twenty-front/src/
│   ├── modules/ai/        # Chat widget, hooks, GraphQL documents
│   ├── modules/agent-config/graphql/   # Capability rule queries + mutations
│   └── pages/settings/ai/
│       ├── components/SettingsAIBrainTab.tsx
│       ├── components/SettingsAIPermissionsTab.tsx
│       └── components/SettingsAIModelsTab.tsx
│
└── ai-knowledge/          # MD knowledge base (RAG source)
    ├── workflows/
    ├── rules/
    ├── settings/
    └── procedures/
```

### Data flow

```
User message
    │
    ▼
AgentChatPipeline
    │  ← MemoryContextBuilderService (graph + episodic + KB → system prompt)
    ▼
LLM (OpenAI / Claude / OpenRouter / Ollama)
    │
    ▼  tool_call?
AgentRateLimiterService.guardAction()   ← checks capability + rate limit
    │
    ▼
CRM Tool (search / create / update / delete / …)
    │
    ├──► GraphSyncListener (dual-write to graphNode / graphEdge)
    └──► AgentAuditService.logAction()  (episodic memory + audit log)
```

---

## Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Nx](https://nx.dev/) monorepo
- [NestJS](https://nestjs.com/) with [BullMQ](https://bullmq.io/), [PostgreSQL](https://www.postgresql.org/) + pgvector, [Redis](https://redis.io/)
- [React 18](https://reactjs.org/) with [Jotai](https://jotai.org/), [Linaria](https://linaria.dev/), [Lingui](https://lingui.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/) for streaming + multi-provider LLM

---

## Credits & Attribution

This project is a fork of **[Twenty CRM](https://github.com/twentyhq/twenty)** — a beautiful, open-source CRM built by the [Twenty team](https://twenty.com) and its [community contributors](https://github.com/twentyhq/twenty/graphs/contributors).

All original Twenty code remains intact and is governed by the upstream license. The AI extensions in this fork were built on top of Twenty's excellent foundation without modifying any upstream logic.

If you find value in this fork, please also **star the original repo** at [github.com/twentyhq/twenty](https://github.com/twentyhq/twenty) and consider contributing back to the upstream project.

---

## Installation

See the upstream docs — the setup process is identical:

- 🚀 [Self-hosting with Docker Compose](https://docs.twenty.com/developers/self-host/capabilities/docker-compose)
- 🖥️ [Local development setup](https://docs.twenty.com/developers/contribute/capabilities/local-setup)

After setup, set the additional env vars above and run:

```bash
# Reset DB to apply the AI schema migration
npx nx database:reset twenty-server

# Start everything
yarn start
```

---

## Thanks

<p align="center">
  <a href="https://www.chromatic.com/"><img src="./packages/twenty-website/public/images/readme/chromatic.png" height="30" alt="Chromatic" /></a>
  <a href="https://greptile.com"><img src="./packages/twenty-website/public/images/readme/greptile.png" height="30" alt="Greptile" /></a>
  <a href="https://sentry.io/"><img src="./packages/twenty-website/public/images/readme/sentry.png" height="30" alt="Sentry" /></a>
  <a href="https://crowdin.com/"><img src="./packages/twenty-website/public/images/readme/crowdin.png" height="30" alt="Crowdin" /></a>
  <a href="https://e2b.dev/"><img src="./packages/twenty-website/public/images/readme/e2b.svg" height="30" alt="E2B" /></a>
</p>

Thanks to the Twenty team for building the foundation, and to Chromatic, Greptile, Sentry, Crowdin, and E2B whose tooling Twenty relies on.
