# SettingsAIBrainTab

**Type:** React component
**File:** `packages/twenty-front/src/pages/settings/ai/components/SettingsAIBrainTab.tsx`
**Layer:** api

## What it does
Read-only dashboard showing the AI infrastructure health. Displays active LLM provider cards (with model counts), the selected Smart/Fast model, Ollama and OpenRouter connection status (green/red indicator dots), and the memory layer status (Graph DB, Episodic Memory, Knowledge Base, pgvector).

## Key responsibilities
- Query `GET_ADMIN_AI_MODELS` and `GET_AI_PROVIDERS` to get enabled models/providers
- Render provider cards with model counts
- Indicate Ollama/OpenRouter presence by checking environment/provider config
- Show memory layer status indicators for Graph DB, Episodic Memory, Knowledge Base, and pgvector availability

## Depends on
- Apollo Client — `useQuery` for model/provider data
- Linaria `styled` — all layout via CSS-in-JS

## Used by
- [[SettingsAI]] — rendered when `BRAIN` tab is active

## Notes
This tab is purely informational. It doesn't allow configuration — LLM selection is on the Models tab. Infrastructure health checks are currently static indicators based on provider configuration, not live pings.
