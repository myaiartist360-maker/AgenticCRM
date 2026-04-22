# Wiki Log

## 2026-04-22 | Initial build — graphify ingest

- Source: `D:/ClaudeCode Projects/twenty4` (AgenticCRM fork of Twenty CRM)
- Scope: AgenticCRM-specific modules (graph-db, ai-memory, agent-config, settings/ai frontend)
- Files read: 28 source files + 9 MD knowledge files
- Pages written: 19
- Layers identified: infra, domain, api, config

### Modules covered
- `packages/twenty-server/src/modules/graph-db/` — 5 files → 4 pages
- `packages/twenty-server/src/modules/ai-memory/` — 7 files → 7 pages
- `packages/twenty-server/src/modules/agent-config/` — 8 files → 7 pages (incl. DTOs)
- `packages/twenty-front/src/pages/settings/ai/` — 3 files → 3 pages
- `packages/twenty-server/src/modules/modules.module.ts` → 1 page
- `ai-knowledge/` directory → 1 concept page

### Notes
- Upstream Twenty modules (Messaging, Calendar, ConnectedAccount, Workflow) deliberately excluded — this wiki covers only the AgenticCRM additions
- `AgentCapabilityRuleDTO` and `UpsertCapabilityRuleInput` grouped into one page since they are thin DTOs
- pgvector embedding columns stored as `text` in TypeORM — noted in entity pages as intentional
- `KnowledgeLoaderService` path resolution via `process.cwd()` flagged as Docker risk in overview
- Audit failure swallowing noted as suggested question #5 in `_overview.md`
