# AgentConfigModule

**Type:** NestJS module
**File:** `packages/twenty-server/src/modules/agent-config/agent-config.module.ts`
**Layer:** infra

## What it does
NestJS DI container for all agent governance services and the capability GraphQL resolver. Imports TypeORM feature for [[AgentCapabilityRuleEntity]], [[ThrottlerModule]] for Redis token buckets, and [[AiMemoryModule]] for episodic memory access.

## Key responsibilities
- Register [[AgentCapabilityService]], [[AgentCapabilityResolver]], [[AgentAuditService]], [[AgentRateLimiterService]] as providers
- Export the three services so other modules (e.g. the AI chat module) can inject them

## Depends on
- `TypeOrmModule.forFeature([AgentCapabilityRuleEntity])`
- `ThrottlerModule` — provides `ThrottlerService`
- [[AiMemoryModule]] — provides [[EpisodicMemoryService]]

## Used by
- [[ModulesModule]] — imports AgentConfigModule at the top level

## Notes
[[AgentCapabilityResolver]] is a provider not an export — resolvers don't need to be exported since GraphQL auto-discovers them from the DI container.
