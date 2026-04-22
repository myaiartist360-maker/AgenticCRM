# GraphSyncListener

**Type:** event listener (NestJS Injectable)
**File:** `packages/twenty-server/src/modules/graph-db/graph-sync.listener.ts`
**Layer:** infra

## What it does
The dual-write bridge between the Twenty CRM relational database and the graph layer. Listens to workspace-scoped batch database events for the six tracked entity types and mirrors every create/update/delete into [[GraphDbService]]. Relationship edges are inferred from foreign-key fields on the records.

## Key responsibilities
- Subscribe to `CREATED`, `UPDATED`, `DELETED` batch events for `person`, `company`, `opportunity`, `note`, `task`, `workspaceMember` via `@OnDatabaseBatchEvent`
- Call `graphDbService.upsertNode()` with a clean property snapshot per entity type
- Infer and upsert relationship edges using `RELATIONSHIP_MAP`:
  - person → company: `WORKS_AT`
  - opportunity → company: `BELONGS_TO`
  - opportunity → person: `OWNED_BY`
  - note → company: `ABOUT_COMPANY`
  - task → workspaceMember: `ASSIGNED_TO`
- Call `graphDbService.deleteNode()` on delete events (cascade removes edges)

## Depends on
- [[GraphDbService]] — all graph writes
- `@OnDatabaseBatchEvent` decorator — Twenty's workspace event emitter infrastructure

## Used by
- Implicitly invoked by the NestJS event emitter when workspace records change
- [[GraphDbModule]] — registers this as a provider

## Design rationale
Property extraction is explicit per entity type (not a generic field dump) to avoid polluting the graph with internal Twenty fields. Each event handler is its own method to make the subscription surface clear in logs.

## Notes
If a target node referenced by a relationship doesn't exist yet (e.g. company created after person), an empty stub node is upserted first to satisfy the FK requirement on the edge.
