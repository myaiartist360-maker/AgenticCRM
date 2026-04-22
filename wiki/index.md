# Wiki Index

> Last updated: 2026-04-22 · 19 pages · AgenticCRM — `D:/ClaudeCode Projects/twenty4`

## By layer

### infra — Persistence & DI wiring
- [[GraphNodeEntity]] — CRM record node in `core.graphNode`; JSONB properties + pgvector embedding
- [[GraphEdgeEntity]] — typed directed relationship between two nodes; cascade-deletes with FK
- [[AiMemoryEpisodeEntity]] — conversation turns + agent actions in `core.aiMemoryEpisode`; also audit log
- [[AiKnowledgeChunkEntity]] — chunked MD knowledge base content in `core.aiKnowledgeChunk`
- [[AgentCapabilityRuleEntity]] — per-entity-type permission flags + rate limit in `core.agentCapabilityRule`
- [[GraphDbModule]] — NestJS DI container for GraphDbService + GraphSyncListener
- [[AiMemoryModule]] — NestJS DI container for all 4 memory services; imports GraphDbModule
- [[AgentConfigModule]] — NestJS DI container for all governance services + resolver
- [[ModulesModule]] — root aggregator; imports GraphDb + AiMemory + AgentConfig + upstream modules

### domain — Business logic & memory
- [[GraphDbService]] — upsert/traverse/vector-search over graph nodes and edges ⭐ god node
- [[GraphSyncListener]] — dual-write bridge: CRM DB events → graph via @OnDatabaseBatchEvent
- [[EpisodicMemoryService]] — append-only episode storage + pgvector semantic recall ⭐ god node
- [[SemanticMemoryService]] — combined entity + knowledge pgvector search
- [[KnowledgeLoaderService]] — auto-indexes ai-knowledge/ MD files on server startup
- [[MemoryContextBuilderService]] — assembles LLM system-prompt context from all memory layers ⭐ god node
- [[AgentCapabilityService]] — permission resolution engine for agent actions ⭐ god node
- [[AgentAuditService]] — logs agent actions to episodic memory (non-blocking)
- [[AgentRateLimiterService]] — token-bucket rate limiting; per-entity + global 200/hr cap

### api — GraphQL & frontend
- [[AgentCapabilityResolver]] — GraphQL queries/mutations for capability rules
- [[AgentCapabilityRuleDTO]] — GraphQL output type for capability rules
- [[SettingsAI]] — top-level AI settings page (7 tabs)
- [[SettingsAIBrainTab]] — read-only AI infrastructure health dashboard
- [[SettingsAIPermissionsTab]] — capability matrix editor wired to real GraphQL API

### config — Agent behaviour
- [[KnowledgeBase]] — 9 Markdown files defining workflows, rules, procedures, personality

---

## Sources

| Path | Wiki pages |
|---|---|
| `modules/graph-db/graph-node.entity.ts` | [[GraphNodeEntity]] |
| `modules/graph-db/graph-edge.entity.ts` | [[GraphEdgeEntity]] |
| `modules/graph-db/graph-db.service.ts` | [[GraphDbService]] |
| `modules/graph-db/graph-sync.listener.ts` | [[GraphSyncListener]] |
| `modules/graph-db/graph-db.module.ts` | [[GraphDbModule]] |
| `modules/ai-memory/ai-memory-episode.entity.ts` | [[AiMemoryEpisodeEntity]] |
| `modules/ai-memory/ai-knowledge-chunk.entity.ts` | [[AiKnowledgeChunkEntity]] |
| `modules/ai-memory/episodic-memory.service.ts` | [[EpisodicMemoryService]] |
| `modules/ai-memory/semantic-memory.service.ts` | [[SemanticMemoryService]] |
| `modules/ai-memory/knowledge-loader.service.ts` | [[KnowledgeLoaderService]] |
| `modules/ai-memory/memory-context-builder.service.ts` | [[MemoryContextBuilderService]] |
| `modules/ai-memory/ai-memory.module.ts` | [[AiMemoryModule]] |
| `modules/agent-config/agent-capability-rule.entity.ts` | [[AgentCapabilityRuleEntity]] |
| `modules/agent-config/agent-capability.service.ts` | [[AgentCapabilityService]] |
| `modules/agent-config/agent-audit.service.ts` | [[AgentAuditService]] |
| `modules/agent-config/agent-rate-limiter.service.ts` | [[AgentRateLimiterService]] |
| `modules/agent-config/agent-capability.resolver.ts` | [[AgentCapabilityResolver]] |
| `modules/agent-config/agent-config.module.ts` | [[AgentConfigModule]] |
| `modules/modules.module.ts` | [[ModulesModule]] |
| `pages/settings/ai/SettingsAI.tsx` | [[SettingsAI]] |
| `pages/settings/ai/components/SettingsAIBrainTab.tsx` | [[SettingsAIBrainTab]] |
| `pages/settings/ai/components/SettingsAIPermissionsTab.tsx` | [[SettingsAIPermissionsTab]] |
| `ai-knowledge/` (9 MD files) | [[KnowledgeBase]] |
