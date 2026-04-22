# KnowledgeLoaderService

**Type:** service (NestJS Injectable, OnModuleInit)
**File:** `packages/twenty-server/src/modules/ai-memory/knowledge-loader.service.ts`
**Layer:** infra

## What it does
Auto-indexes the `ai-knowledge/` markdown knowledge base into [[AiKnowledgeChunkEntity]] rows on every server startup. Uses modification-time comparison to skip unchanged files. Chunks text at 800 characters with 100-char overlap, preserving heading context per chunk.

## Key responsibilities
- `onModuleInit()` → `loadKnowledgeBase()` — scans `ai-knowledge/` recursively for `.md` files
- `loadFile()` — checks `updatedAt` vs `fs.stat.mtime`, re-chunks and re-inserts only if changed
- `chunkText()` — splits content into overlapping windows, carrying the last seen `#heading` into each chunk's metadata
- `keywordSearch()` — ILIKE fallback search when pgvector embeddings aren't populated
- `getChunksForContext()` — fetch all chunks for a specific file path (used by [[MemoryContextBuilderService]])

## Depends on
- [[AiKnowledgeChunkEntity]] — TypeORM repository
- Node.js `fs` module — reads files from the filesystem at `../../ai-knowledge` relative to `process.cwd()`

## Used by
- [[MemoryContextBuilderService]] — calls `getChunksForContext` for `settings/agent-personality.md` and `settings/capabilities.md`
- [[MemoryContextBuilderService]] — calls `keywordSearch` for query-time relevant procedure lookup

## Key logic
On `loadFile`: if `existingChunk.updatedAt >= lastModified` → skip. Otherwise delete all chunks for the file and batch-insert the freshly parsed set. This ensures stale chunks never accumulate.

## Notes
The knowledge base root is hardcoded as `path.resolve(process.cwd(), '../../ai-knowledge')`. This works in the Nx workspace (server CWD is `packages/twenty-server`) but will need adjustment if the server is run from a different directory (e.g. inside Docker).
