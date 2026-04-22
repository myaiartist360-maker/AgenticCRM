# AgentCapabilityRuleEntity

**Type:** entity (TypeORM)
**File:** `packages/twenty-server/src/modules/agent-config/agent-capability-rule.entity.ts`
**Layer:** infra

## What it does
Persists the capability matrix that governs what the AI agent is allowed to do per entity type. A NULL `agentId` means the rule applies to all agents in the workspace. Agent-specific rules take precedence over workspace-wide rules.

## Key responsibilities
- Store per-entity-type permission flags: `canRead`, `canWrite`, `canDelete`, `canBulkOps`
- Store `rateLimit` (integer, actions per hour) per entity type
- Support both workspace-wide (`agentId IS NULL`) and agent-specific rules

## Depends on
- TypeORM decorators

## Used by
- [[AgentCapabilityService]] — CRUD over rules, permission resolution
- [[AgentCapabilityResolver]] — exposes rules via GraphQL

## Design rationale
Unique index on `(workspaceId, agentId, entityType)` prevents duplicate rules for the same combination. NULL agentId is included in the unique constraint, which in PostgreSQL means multiple NULLs are allowed — so only one workspace-wide rule per entityType is enforced at the application layer.
