# AiMemoryModule

**Type:** NestJS module
**File:** `packages/twenty-server/src/modules/ai-memory/ai-memory.module.ts`
**Layer:** infra

## What it does
NestJS DI container for all three memory layers. Imports TypeORM features for both memory entities, and exports all four services so the AI chat module and agent config module can use them.

## Key responsibilities
- Register and export: [[EpisodicMemoryService]], [[SemanticMemoryService]], [[KnowledgeLoaderService]], [[MemoryContextBuilderService]]
- Import [[GraphDbModule]] so [[SemanticMemoryService]] and [[MemoryContextBuilderService]] can inject [[GraphDbService]]

## Depends on
- `TypeOrmModule.forFeature([AiMemoryEpisodeEntity, AiKnowledgeChunkEntity])`
- [[GraphDbModule]] — needed by [[SemanticMemoryService]] and [[MemoryContextBuilderService]]

## Used by
- [[ModulesModule]] — imports AiMemoryModule at top level
- [[AgentConfigModule]] — imports AiMemoryModule to get [[EpisodicMemoryService]]
