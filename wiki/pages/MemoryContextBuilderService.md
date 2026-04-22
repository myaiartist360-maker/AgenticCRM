# MemoryContextBuilderService

**Type:** service (NestJS Injectable)
**File:** `packages/twenty-server/src/modules/ai-memory/memory-context-builder.service.ts`
**Layer:** domain

## What it does
The "brain assembly" service. Before each LLM call, it pulls together graph relationships, recent agent actions, and core knowledge-base content into a structured Markdown block that is prepended to the system prompt under the heading `## CRM Intelligence Context`. This is what makes the agent context-aware.

## Key responsibilities
- `buildMemorySection(options)` — orchestrates all three sub-sections, returns a single Markdown string
- `buildGraphContext()` — fetches the current entity's node + up to 10 outgoing and incoming edges
- `buildRecentActionsSection()` — last 5 `type='action'` episodes for the user
- `buildKnowledgeSection()` — loads `settings/agent-personality.md` and `settings/capabilities.md` as the agent's persistent persona
- `getRelevantKnowledge(query)` — keyword fallback for fetching procedure/rule chunks relevant to the current user query

## Depends on
- [[EpisodicMemoryService]] — `getRecentActions`
- [[KnowledgeLoaderService]] — `getChunksForContext`, `keywordSearch`
- [[GraphDbService]] — `getNodeWithRelationships`

## Used by
- AI chat pipeline / agent turn handler — injects the returned string into the LLM system prompt before each completion call

## Key logic
All three sub-sections are built with `try/catch` — a failure in any one (e.g. pgvector down) produces a warning log but doesn't crash the chat turn. The agent degrades gracefully to the base LLM without context.

## Notes
`buildKnowledgeSection` only loads the two core personality/capability files, not all 9 knowledge files. The rest are fetched on-demand via `getRelevantKnowledge`. This keeps the context window lean while ensuring the agent always knows its persona.
