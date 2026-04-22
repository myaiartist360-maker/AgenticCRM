# AgentCapabilityRuleDTO

**Type:** GraphQL ObjectType DTO
**File:** `packages/twenty-server/src/modules/agent-config/dtos/agent-capability-rule.dto.ts`
**Layer:** api

## What it does
The GraphQL output type for capability rule queries and mutations. Mirrors [[AgentCapabilityRuleEntity]] fields with class-validator decorators and `@Field()` GraphQL schema decorators.

## Key responsibilities
- Define the `AgentCapabilityRule` GraphQL type with all permission fields + timestamps
- Expose `agentId` as nullable UUID (workspace-wide rules have null agentId)

## Depends on
- `@nestjs/graphql` ObjectType decorators

## Used by
- [[AgentCapabilityResolver]] — return type for `agentCapabilityRules` query and `upsertAgentCapabilityRule` mutation
