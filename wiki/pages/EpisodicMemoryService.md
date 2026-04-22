# EpisodicMemoryService

**Type:** service (NestJS Injectable)
**File:** `packages/twenty-server/src/modules/ai-memory/episodic-memory.service.ts`
**Layer:** domain

## What it does
Manages the agent's short-term and action memory. Provides append-only storage of conversation turns, tool results, and agent actions, plus semantic (pgvector) retrieval of similar past episodes. The agent uses this to maintain continuity across messages in a thread and to recall relevant past interactions.

## Key responsibilities
- `store()` — append an episode to `core.aiMemoryEpisode`
- `getThreadHistory()` — ordered list of episodes for a thread (for LLM context)
- `getRecentActions()` — last N `type='action'` episodes for a user (for recent-context prompt section)
- `findSimilarEpisodes()` — pgvector cosine ANN over episodes with optional thread filter
- `storeWithEmbedding()` — store + set embedding in one step
- `pruneOldEpisodes()` — keep only the most recent N episodes per thread

## Depends on
- [[AiMemoryEpisodeEntity]] — TypeORM repository

## Used by
- [[AgentAuditService]] — calls `store()` with `type='action'` for every agent action
- [[MemoryContextBuilderService]] — calls `getRecentActions()` to inject recent action history into LLM prompt

## Key logic
`findSimilarEpisodes` uses raw SQL with `<=>` cosine distance. Falls back to empty array with a warning log if pgvector is unavailable — the agent degrades gracefully to keyword-only memory.

## Notes
Thread pruning should be called after storing to prevent unbounded growth, but is not yet called automatically on every store — this is a known TODO.
