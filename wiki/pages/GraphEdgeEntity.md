# GraphEdgeEntity

**Type:** entity (TypeORM)
**File:** `packages/twenty-server/src/modules/graph-db/graph-edge.entity.ts`
**Layer:** infra

## What it does
Represents a directed, typed relationship between two [[GraphNodeEntity]] records. Edges carry a `relationshipType` string (e.g. WORKS_AT, BELONGS_TO, ASSIGNED_TO) and an optional JSONB properties bag. Cascade-deletes when either endpoint node is deleted.

## Key responsibilities
- Encode CRM relationships as first-class typed edges in `core.graphEdge`
- Enable graph traversal by providing the adjacency list structure
- Support JSONB properties for future edge metadata (e.g. start date, strength)

## Depends on
- [[GraphNodeEntity]] — ManyToOne FK for both `sourceNode` and `targetNode` with `CASCADE` delete

## Used by
- [[GraphDbService]] — creates/queries edges; resolves source and target IDs for traversal
- [[MemoryContextBuilderService]] — reads outgoing/incoming edges to construct the entity context section of the LLM prompt

## Design rationale
Cascade delete on both FKs ensures no orphan edges when a CRM record is hard-deleted. All four columns `(workspaceId, sourceNodeId, targetNodeId, relationshipType)` must match for a duplicate check before insert.
