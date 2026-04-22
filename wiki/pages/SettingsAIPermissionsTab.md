# SettingsAIPermissionsTab

**Type:** React component
**File:** `packages/twenty-front/src/pages/settings/ai/components/SettingsAIPermissionsTab.tsx`
**Layer:** api

## What it does
The frontend capability matrix editor. Displays a grid of entity rows (People, Companies, Opportunities, Notes, Tasks, Team Members) × permission columns (Read, Write, Delete, Bulk, Rate/hr). Loads live rules from the backend on mount and saves changes via the `upsertAgentCapabilityRule` mutation. Also shows a Global Rate Limit card and a Dangerous Actions panel.

## Key responsibilities
- `useQuery(GET_AGENT_CAPABILITY_RULES)` — fetch workspace rules on mount
- Merge fetched rules with `DEFAULT_CAPS` to show defaults when no rule exists
- `handleToggle` / `handleRateLimitChange` — local state updates on interaction
- `handleSave` — fires `upsertAgentCapabilityRule` for all 6 entity types in parallel
- Display "Unsaved changes — Save now" banner when `isDirty`

## Depends on
- `GET_AGENT_CAPABILITY_RULES` GraphQL query — `@/agent-config/graphql/queries/getAgentCapabilityRules`
- `UPSERT_AGENT_CAPABILITY_RULE` GraphQL mutation — `@/agent-config/graphql/mutations/upsertAgentCapabilityRule`
- Apollo Client `useQuery`, `useMutation`

## Used by
- [[SettingsAI]] — rendered when `PERMISSIONS` tab is active

## Notes
The Global Rate Limit input (200 actions/hr) is currently display-only — it doesn't persist. The hardcoded limit lives in [[AgentRateLimiterService]]. Wiring this to a backend setting is a follow-up TODO.
