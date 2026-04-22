# AgentCapabilityResolver

**Type:** GraphQL resolver (NestJS, MetadataResolver)
**File:** `packages/twenty-server/src/modules/agent-config/agent-capability.resolver.ts`
**Layer:** api

## What it does
Exposes the agent capability matrix to the frontend via the metadata GraphQL API. Provides queries to read rules and mutations to upsert/delete/seed them. Protected by `WorkspaceAuthGuard` + `NoPermissionGuard` (workspace-level auth, no role restriction).

## Key responsibilities
- `agentCapabilityRules` query — returns all rules for the current workspace
- `upsertAgentCapabilityRule` mutation — create or update a rule from `UpsertCapabilityRuleInput`
- `deleteAgentCapabilityRule` mutation — remove a rule by ID
- `seedDefaultAgentCapabilityRules` mutation — seed sensible defaults for the six entity types

## Depends on
- [[AgentCapabilityService]] — all business logic delegated here
- `WorkspaceAuthGuard`, `NoPermissionGuard` — auth decorators from Twenty engine
- `@AuthWorkspace` decorator — injects workspace from JWT

## Used by
- [[SettingsAIPermissionsTab]] — frontend loads rules on mount and saves via mutations
- [[AgentCapabilityRuleDTO]] — return type for queries and mutations
- [[UpsertCapabilityRuleInput]] — input type for upsert mutation

## Notes
Uses `@MetadataResolver` (not plain `@Resolver`) so it registers on the metadata API endpoint (same as other settings-level resolvers like CommandMenuItemResolver). This means it uses the metadata Apollo client on the frontend.
