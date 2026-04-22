# Architecture Overview — AgenticCRM

## What this system does
AgenticCRM is Twenty CRM extended with a full AI agent layer. Every CRM record is mirrored into a PostgreSQL-backed graph database; every agent action is remembered in episodic memory; a knowledge base of Markdown files defines the agent's personality, workflows, and rules. The agent can read, write, delete, and bulk-operate on CRM data through a conversational interface — subject to a configurable capability matrix and per-entity rate limits.

The fork adds three NestJS modules (GraphDb, AiMemory, AgentConfig) and a handful of React settings components to the upstream Twenty codebase, without modifying any upstream logic.

## Layer map

| Layer | Components | Role |
|---|---|---|
| **infra** | [[GraphNodeEntity]], [[GraphEdgeEntity]], [[AiMemoryEpisodeEntity]], [[AiKnowledgeChunkEntity]], [[AgentCapabilityRuleEntity]], [[GraphDbModule]], [[AiMemoryModule]], [[AgentConfigModule]], [[ModulesModule]] | Persistence, DI wiring, DB tables |
| **domain** | [[GraphDbService]], [[GraphSyncListener]], [[EpisodicMemoryService]], [[SemanticMemoryService]], [[KnowledgeLoaderService]], [[MemoryContextBuilderService]], [[AgentCapabilityService]], [[AgentAuditService]], [[AgentRateLimiterService]] | Business logic, memory, graph, governance |
| **api** | [[AgentCapabilityResolver]], [[AgentCapabilityRuleDTO]], [[SettingsAI]], [[SettingsAIBrainTab]], [[SettingsAIPermissionsTab]] | GraphQL surface, settings UI |
| **config** | [[KnowledgeBase]] | Agent behaviour definition (MD files) |

## God nodes
Highest-connectivity components — everything flows through these:

- **[[GraphDbService]]** — called by GraphSyncListener (writes), SemanticMemoryService (reads), MemoryContextBuilderService (reads). Every CRM data event and every AI query touches this node.
- **[[MemoryContextBuilderService]]** — orchestrates EpisodicMemoryService + KnowledgeLoaderService + GraphDbService to assemble the LLM system prompt. The central "brain assembly" step before every agent response.
- **[[AgentCapabilityService]]** — called by both AgentRateLimiterService and AgentCapabilityResolver. Single source of truth for what the agent is allowed to do.
- **[[EpisodicMemoryService]]** — written by AgentAuditService (audit), read by MemoryContextBuilderService (context). Dual-purpose audit + memory store.

## Surprising connections
- [[AgentAuditService]] and [[EpisodicMemoryService]] share the same table (`aiMemoryEpisode`) — audit is a subset of episodic memory, not a separate system.
- [[KnowledgeLoaderService]] runs on `OnModuleInit` — it silently indexes files at server start. If `ai-knowledge/` is missing, it logs a warning and continues (no crash).
- [[AgentRateLimiterService]] depends on BOTH [[AgentCapabilityService]] (for the per-entity limit) AND the upstream `ThrottlerService` (for Redis token buckets) — it's the only new service that reaches into upstream infrastructure.
- [[GraphSyncListener]] creates stub nodes for relationship targets that don't exist yet — this means the graph may contain empty placeholder nodes until the target record is synced.

## Main data flow — agent answers "move TechCorp deal to Proposal Sent"

1. User sends message → frontend `AIChatTab` → GraphQL `sendChatMessage` mutation
2. Backend queues message on `aiStreamQueue` (BullMQ)
3. Agent turn handler calls **[[MemoryContextBuilderService]]**.`buildMemorySection()`:
   - Fetches TechCorp deal node + relationships from **[[GraphDbService]]**
   - Fetches last 5 actions from **[[EpisodicMemoryService]]**
   - Loads `agent-personality.md` + `capabilities.md` from **[[KnowledgeLoaderService]]**
4. System prompt assembled: entity graph + recent actions + personality
5. LLM (OpenAI / Claude / Ollama) called with full context → returns `stageChange` tool call
6. **[[AgentRateLimiterService]]**.`guardAction()` called:
   - **[[AgentCapabilityService]]**.`getPermissions()` → checks `canWrite` for `opportunity`
   - `ThrottlerService.tokenBucketThrottleOrThrow()` → per-entity + global buckets consumed
7. CRM tool executes: GraphQL mutation updates the deal stage in the workspace schema
8. **[[GraphSyncListener]]** fires `onOpportunityUpdated` → **[[GraphDbService]]**.`upsertNode()` updates the graph node
9. **[[AgentAuditService]]**.`logAction()` → **[[EpisodicMemoryService]]**.`store()` records `type='action'`
10. SSE stream delivers the assistant's confirmation message to the browser

## Suggested questions
1. What happens to the graph if a CRM record is deleted — are all its edges cleaned up automatically, and what about the episodic memory entries that reference it?
2. Why does MemoryContextBuilderService only inject 2 of the 9 knowledge files into every prompt — when are the other 7 procedure/rule files actually used?
3. If the global rate limit (200/hr) needs to be configurable per workspace, what is the minimal change required and which files need to change?
4. KnowledgeLoaderService uses `process.cwd()` to find `ai-knowledge/` — what breaks in a Docker container where the working directory is different, and how should it be fixed?
5. AgentAuditService wraps logAction in try/catch so audit never blocks the main flow — but this means failed audits are silently swallowed. Is there a dead-letter queue or alerting for audit failures?
