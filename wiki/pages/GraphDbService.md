# GraphDbService

**Type:** service (NestJS Injectable)
**File:** `packages/twenty-server/src/modules/graph-db/graph-db.service.ts`
**Layer:** infra

## What it does
The central API for the PostgreSQL-backed graph layer. Provides upsert, delete, traversal (recursive CTE), nearest-neighbour vector search, and relationship resolution. Everything the AI pipeline needs to read and write the graph lives here.

## Key responsibilities
- `upsertNode()` — idempotent node creation/update, merging properties
- `upsertEdge()` — creates typed directed edge after verifying both nodes exist
- `deleteNode()` — removes node; cascade deletes all edges via FK
- `traverseGraph()` — recursive CTE up to `maxDepth` hops, with optional relationship type filter and cycle detection via path array
- `findSimilarNodes()` — pgvector cosine ANN (`<=>` operator) over `embedding` column
- `getNodeWithRelationships()` — fetch node + all outgoing + all incoming edges in two parallel queries
- `updateNodeEmbedding()` — raw SQL update to set the vector column after embedding is generated

## Depends on
- [[GraphNodeEntity]] — TypeORM repository
- [[GraphEdgeEntity]] — TypeORM repository

## Used by
- [[GraphSyncListener]] — calls `upsertNode` and `upsertEdge` on every CRM event
- [[SemanticMemoryService]] — calls `findSimilarNodes` for entity semantic search
- [[MemoryContextBuilderService]] — calls `getNodeWithRelationships` to build graph context for LLM prompts

## Key logic
The recursive CTE in `traverseGraph` uses `ARRAY[n.id]` as a visited-path guard, appending each node's ID and checking `NOT (target.id = ANY(gw.path))` to prevent cycles. Depth is limited by `$3`.

## Notes
`findSimilarNodes` and `traverseGraph` require pgvector extension and the IVFFlat index created by the Phase 1 migration. Both methods degrade gracefully (empty results, warning log) if pgvector is unavailable.
