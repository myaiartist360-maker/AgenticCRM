# ModulesModule

**Type:** NestJS module
**File:** `packages/twenty-server/src/modules/modules.module.ts`
**Layer:** infra

## What it does
The root aggregator module for all feature modules in the Twenty server. Imports upstream Twenty modules (Messaging, Calendar, ConnectedAccount, Workflow, WorkspaceMember) alongside the three AgenticCRM modules (GraphDb, AiMemory, AgentConfig).

## Key responsibilities
- Wire [[GraphDbModule]], [[AiMemoryModule]], [[AgentConfigModule]] into the NestJS application graph
- Ensure all these modules' providers are available in the DI container

## Depends on
- [[GraphDbModule]]
- [[AiMemoryModule]]
- [[AgentConfigModule]]
- Upstream: MessagingModule, CalendarModule, ConnectedAccountModule, WorkflowModule, WorkspaceMemberModule

## Used by
- `AppModule` (Twenty server root) — imports ModulesModule

## Notes
This is the single file that "activates" all AgenticCRM features. Adding a new AI module requires only adding its import here.
