# AgentCapabilityService

**Type:** service (NestJS Injectable)
**File:** `packages/twenty-server/src/modules/agent-config/agent-capability.service.ts`
**Layer:** domain

## What it does
The permission resolution engine for agent actions. Given a workspace, entity type, and optional agent ID, it returns the effective `AgentPermission` object (read/write/delete/bulkOps/rateLimit). Falls back to `DEFAULT_PERMISSIONS` if no rule exists.

## Key responsibilities
- `getPermissions()` — returns effective permission, preferring agent-specific over workspace-wide rules
- `getAllRules()` — list all rules for a workspace (for the settings UI)
- `upsertRule()` — create or update a capability rule
- `deleteRule()` — remove a rule by ID
- `getWorkspaceCapabilityMatrix()` — returns `Record<entityType, AgentPermission>` for the admin UI
- `seedDefaultRules()` — seed sensible defaults for the six standard entity types on first workspace setup

## Depends on
- [[AgentCapabilityRuleEntity]] — TypeORM repository

## Used by
- [[AgentRateLimiterService]] — calls `getPermissions` to retrieve the per-entity rate limit
- [[AgentCapabilityResolver]] — delegates all GraphQL calls here

## Key logic
`getPermissions` does a `find({ where: [agentSpecific, workspaceWide] })` in one query, then picks agent-specific if present via `rules.find(r => r.agentId === agentId)`.

## Notes
`DEFAULT_PERMISSIONS` exported constant (`canRead:true`, others `false`, `rateLimit:50`) is imported by [[AgentRateLimiterService]] as the safe fallback.
