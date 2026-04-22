# AgentRateLimiterService

**Type:** service (NestJS Injectable)
**File:** `packages/twenty-server/src/modules/agent-config/agent-rate-limiter.service.ts`
**Layer:** domain

## What it does
Token-bucket rate limiting for agent actions. Enforces two independent limits per mutating call: a per-entity-type limit (from the capability rule) and a global cap of 200 actions/hr per user across all entity types. Read operations bypass rate limiting entirely.

## Key responsibilities
- `checkAndConsume()` — consumes one token from the per-entity bucket and one from the global bucket; throws `ThrottlerException` if either is exhausted
- `getRemainingTokens()` — returns `{ entityRemaining, globalRemaining }` for status display
- `guardAction()` — combined permission check + rate limit: verifies `canRead/canWrite/canDelete/canBulkOps`, then calls `checkAndConsume` for non-read actions

## Depends on
- `ThrottlerService` — Redis-backed token bucket, already in the Twenty engine
- [[AgentCapabilityService]] — fetches `rateLimit` from the capability rule

## Used by
- Agent CRM tool handlers — call `guardAction` before executing any tool

## Key logic
Two Redis keys per mutating call:
- `agent_rate:{workspaceId}:{userId}:{entityType}` — per-entity bucket
- `agent_rate_global:{workspaceId}:{userId}` — workspace-wide global bucket (200/hr hardcoded)

## Notes
`GLOBAL_RATE_LIMIT = 200` is hardcoded. In the future this should be a capability rule of its own (workspace-level setting). `guardAction` throws `ThrottlerException` with `LIMIT_REACHED` code for both permission denial and rate exhaustion — callers may want to distinguish these.
