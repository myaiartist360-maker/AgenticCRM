# AgentAuditService

**Type:** service (NestJS Injectable)
**File:** `packages/twenty-server/src/modules/agent-config/agent-audit.service.ts`
**Layer:** domain

## What it does
Logs every agent action to episodic memory with `type='action'`, creating a dual-purpose audit trail that also feeds back into the agent's context. The formatted log entry includes timestamp, actor (user or agent), action type, entity type/ID, and a human-readable summary.

## Key responsibilities
- `logAction(entry)` — formats and stores an `AgentAuditEntry` into [[EpisodicMemoryService]]
- `getAuditLog()` — retrieves past action episodes filtered by optional userId, threadId, entityType
- `formatAuditContent()` — builds the string `[ISO_TS] actor performed actionType on entityType:entityId — summary`

## Depends on
- [[EpisodicMemoryService]] — `store()` and `getThreadHistory()` / `getRecentActions()`

## Used by
- Agent CRM tool handlers — call `logAction` after every successful create/update/delete/bulkOp
- Settings audit log viewer (frontend) — queries via `getAuditLog`

## Design rationale
Audit logging is wrapped in try/catch so a failed episodic write (e.g. DB timeout) never blocks the main CRM action. The agent "forgets" this action but the user's operation still succeeds.

## Notes
`AgentActionType` union: `search | create | update | delete | stage_change | bulk_update | task_complete | note_log`. New action types require adding to this union.
