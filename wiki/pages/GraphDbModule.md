# GraphDbModule

**Type:** NestJS module
**File:** `packages/twenty-server/src/modules/graph-db/graph-db.module.ts`
**Layer:** infra

## What it does
NestJS DI container for the graph database layer. Registers [[GraphDbService]] and [[GraphSyncListener]] and exports [[GraphDbService]] for use by memory and agent modules.

## Key responsibilities
- Register `TypeOrmModule.forFeature([GraphNodeEntity, GraphEdgeEntity])`
- Register [[GraphDbService]] and [[GraphSyncListener]] as providers
- Export [[GraphDbService]]

## Depends on
- [[GraphNodeEntity]], [[GraphEdgeEntity]] — TypeORM entities

## Used by
- [[ModulesModule]] — imports GraphDbModule
- [[AiMemoryModule]] — imports GraphDbModule to access [[GraphDbService]]
