# AiKnowledgeChunkEntity

**Type:** entity (TypeORM)
**File:** `packages/twenty-server/src/modules/ai-memory/ai-knowledge-chunk.entity.ts`
**Layer:** infra

## What it does
Stores chunked content from the `ai-knowledge/` markdown files. Each row is a 800-character text chunk with 100-character overlap, tagged with its source file path and chunk index. `workspaceId` is NULL for global knowledge (applies to all workspaces).

## Key responsibilities
- Persist the chunked knowledge base in `core.aiKnowledgeChunk`
- Support both global (NULL workspaceId) and workspace-scoped knowledge
- Hold `embedding` for pgvector semantic similarity search over the knowledge base

## Depends on
- TypeORM decorators

## Used by
- [[KnowledgeLoaderService]] — writes chunks on server startup
- [[SemanticMemoryService]] — searches chunks by vector similarity
- [[MemoryContextBuilderService]] — loads personality/capabilities chunks for system prompt

## Notes
The `updatedAt` column is used by [[KnowledgeLoaderService]] to skip re-indexing unchanged files (compared against `fs.stat.mtime`).
