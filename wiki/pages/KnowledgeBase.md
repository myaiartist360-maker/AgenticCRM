# KnowledgeBase

**Type:** concept / file collection
**File:** `ai-knowledge/` directory (root of repo)
**Layer:** config

## What it does
The agent's long-term procedural and rules memory. A set of 9 Markdown files that define how the agent should behave, what CRM workflows look like, and what it is and isn't allowed to do. Loaded and chunked at server startup by [[KnowledgeLoaderService]] into [[AiKnowledgeChunkEntity]] rows.

## Key responsibilities
Define the agent's:
- **Workflows** — deal progression stages, lead qualification (BANT scoring)
- **Rules** — data validation per entity, assignment logic
- **Settings** — agent personality (tone, format, memory use), capabilities (what it can/can't do), LLM provider admin guide
- **Procedures** — step-by-step guides for create-contact, update-deal-stage, search-and-summarize

## Structure
```
ai-knowledge/
├── workflows/  deal-progression.md, lead-qualification.md
├── rules/      data-validation.md, assignment-rules.md
├── settings/   agent-personality.md, capabilities.md, llm-providers.md
└── procedures/ create-contact.md, update-deal-stage.md, search-and-summarize.md
```

## Used by
- [[KnowledgeLoaderService]] — indexes all files on server start
- [[MemoryContextBuilderService]] — loads `agent-personality.md` and `capabilities.md` into every system prompt
- [[MemoryContextBuilderService]].`getRelevantKnowledge()` — keyword-searches for query-relevant procedures

## Notes
To update agent behaviour, edit these MD files and restart the server. No code changes required. The loader will detect the `mtime` change and re-chunk automatically.
