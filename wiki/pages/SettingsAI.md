# SettingsAI

**Type:** React page component
**File:** `packages/twenty-front/src/pages/settings/ai/SettingsAI.tsx`
**Layer:** api

## What it does
The top-level AI settings page. Renders a tab bar with 7 tabs: Models, Skills, Tools, Usage, More, Brain, Permissions. Routes to the appropriate sub-component based on the active tab. Also handles the "New Skill" and "New Tool" action buttons in the top bar.

## Key responsibilities
- Render `TabList` with 7 tabs using `SETTINGS_AI_TABS` constants
- Conditionally render: `SettingsAIModelsTab`, `SettingsAgentSkills`, `SettingsAgentToolsTab`, `SettingsAIUsageTab`, `SettingsAIMoreTab`, [[SettingsAIBrainTab]], [[SettingsAIPermissionsTab]]
- Handle "New Tool" creation via `usePersistLogicFunction` with navigation to the tool detail page
- Provide "New Skill" link to `SettingsPath.AINewSkill`

## Depends on
- [[SettingsAIBrainTab]] — Brain tab content
- [[SettingsAIPermissionsTab]] — Permissions tab content
- `SETTINGS_AI_TABS` constants — tab IDs and component instance ID

## Used by
- Twenty frontend router — mounted at the `/settings/ai` path

## Notes
Brain and Permissions tabs were added by AgenticCRM. The other 5 tabs (Models, Skills, Tools, Usage, More) are upstream Twenty features.
