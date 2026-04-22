# GraphNodeEntity

**Type:** entity (TypeORM)
**File:** `packages/twenty-server/src/modules/graph-db/graph-node.entity.ts`
**Layer:** infra

## What it does
Represents a single CRM record in the graph database. Every person, company, opportunity, note, task, and workspace member gets a corresponding node. Stores entity type, the original relational DB ID (`entityId`), a JSONB properties snapshot, and an optional pgvector embedding for semantic search.

## Key responsibilities
- Serve as the node table for the entire graph (`core.graphNode`)
- Hold a denormalised property snapshot so graph queries don't need to JOIN the workspace schema
- Store the `embedding` column (text, cast to vector in SQL) for pgvector cosine similarity

## Depends on
- TypeORM decorators — `@Entity`, `@Column`, `@Index`, `@PrimaryGeneratedColumn`

## Used by
- [[GraphDbService]] — upserts, queries, and embedding updates
- [[GraphEdgeEntity]] — foreign key reference via `sourceNode`/`targetNode`
- [[GraphSyncListener]] — writes nodes on every CRM create/update event

## Design rationale
Embedding stored as `text` not a native vector type to avoid TypeORM schema conflicts; all vector operations are done with raw SQL casting `$1::vector`.

## Notes
Unique index on `(workspaceId, entityType, entityId)` prevents duplicates during dual-write.
