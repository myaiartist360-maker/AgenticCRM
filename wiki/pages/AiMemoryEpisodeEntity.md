# AiMemoryEpisodeEntity

**Type:** entity (TypeORM)
**File:** `packages/twenty-server/src/modules/ai-memory/ai-memory-episode.entity.ts`
**Layer:** infra

## What it does
The persistence unit for episodic (short-term + action) memory. Every conversation turn, agent action, tool result, and observation is stored as a row here. The same table serves as the agent audit log — actions are stored with `type='action'`.

## Key responsibilities
- Store conversation history per `threadId` for LLM context window management
- Serve as audit log for all agent actions (dual purpose)
- Hold `embedding` (text cast to vector) for semantic recall of past episodes

## Depends on
- TypeORM decorators — `@Entity`, `@Column`, `@Index`, `@CreateDateColumn`

## Used by
- [[EpisodicMemoryService]] — CRUD and vector search over episodes
- [[AgentAuditService]] — writes `type='action'` episodes for audit trail

## Design rationale
Combining audit log and episodic memory avoids a separate table and gives the AI agent automatic awareness of its own past actions without extra queries. `type` field disambiguates use case.

## Notes
No `UpdateDateColumn` — episodes are append-only. Pruning is done by [[EpisodicMemoryService]].`pruneOldEpisodes()`.
