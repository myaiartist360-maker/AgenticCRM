# SemanticMemoryService

**Type:** service (NestJS Injectable)
**File:** `packages/twenty-server/src/modules/ai-memory/semantic-memory.service.ts`
**Layer:** domain

## What it does
The unified semantic search layer. Searches both the CRM entity graph (via [[GraphDbService]]) and the MD knowledge base chunks (via [[AiKnowledgeChunkEntity]]) using pgvector cosine similarity, returning a merged, similarity-sorted result list.

## Key responsibilities
- `searchEntities()` — ANN over graph node embeddings, filtered by entity type
- `searchKnowledge()` — ANN over knowledge chunk embeddings, with workspace scoping
- `search()` — combined call returning entities + knowledge sorted by similarity score

## Depends on
- [[GraphDbService]] — calls `findSimilarNodes`
- [[AiKnowledgeChunkEntity]] — direct repository query for chunk cosine search

## Used by
- AI chat pipeline (indirectly via [[MemoryContextBuilderService]] or tool calls) for "find similar contacts" / "what's our process for X?" queries

## Design rationale
Two separate search targets (graph nodes and knowledge chunks) are merged in one result set so the caller (LLM tool) doesn't need to know which backing store is relevant. Both methods degrade gracefully without pgvector.

## Notes
Workspace filter for knowledge search includes `OR workspaceId IS NULL` to always include global knowledge alongside workspace-specific chunks.
