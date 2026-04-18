# LLM Provider Configuration

## Available Providers

### Built-in Cloud Providers
- **Anthropic** — Claude models (Sonnet, Opus, Haiku). Set `ANTHROPIC_API_KEY`.
- **OpenAI** — GPT models. Set `OPENAI_API_KEY`.
- **Google** — Gemini models. Set `GOOGLE_GENERATIVE_AI_API_KEY`.
- **Mistral** — Mistral models. Set `MISTRAL_API_KEY`.
- **xAI** — Grok models. Set `XAI_API_KEY`.
- **Amazon Bedrock** — AWS-hosted models. Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.

### OpenRouter (Multi-Provider Gateway)
Route to hundreds of models from a single API key.
- Set `OPENROUTER_API_KEY` in your `.env`
- Default base URL: `https://openrouter.ai/api/v1`
- Activate in Admin → Settings → AI → Providers

### Ollama (Local / Self-Hosted)
Run open-source models locally with no API costs.
- Install Ollama: https://ollama.ai
- Pull a model: `ollama pull llama3.3`
- Default base URL: `http://localhost:11434/v1`
- Set `OLLAMA_BASE_URL` if running on a different host/port
- Activate in Admin → Settings → AI → Providers

## Environment Variables

```env
# Cloud providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
MISTRAL_API_KEY=...
XAI_API_KEY=...

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434/v1

# pgvector (for semantic memory / RAG)
# Enabled automatically when PostgreSQL has vector extension installed
```

## Admin Configuration
After setting env vars:
1. Go to Settings → Admin Panel → AI
2. Find the provider in the "Providers" list
3. Enable models you want available to workspace users
4. Set default Smart and Fast models under "Default Models"

## Agent Brain Settings (per workspace)
Admins can configure per-workspace AI behavior:
- Settings → AI → Brain — choose default model for agents
- Settings → AI → Permissions — control what agents can do

## Notes
- Ollama models are free (local compute) — ideal for privacy-sensitive deployments
- OpenRouter allows fallback chains: if your primary model is rate-limited, route to a backup
- All provider credentials are stored encrypted in the database (via keyValuePair config)
