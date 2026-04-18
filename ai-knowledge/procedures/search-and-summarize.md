# Procedure: Search and Summarize

## When to Use
When a user asks general questions like:
- "Tell me about [Company]"
- "What's going on with [Deal]?"
- "Show me all deals for [Company]"
- "Who is [Name]?"

## Steps
1. Identify the entity type and search query from the user's message
2. Search CRM records (full-text + semantic similarity)
3. If multiple matches: show a short list, ask user to pick one
4. Retrieve full entity + related data via graph traversal:
   - For a company: contacts, open deals, recent notes, tasks
   - For a contact: company, deals they're associated with, notes, tasks
   - For a deal: company, contact, stage history, notes, tasks
5. Compose a structured summary:
   - Entity header (name, key fields)
   - Relationship summary (e.g., "3 open deals, 2 contacts")
   - Recent activity (last 5 notes/tasks)
   - Notable flags (overdue tasks, stale deals, missing data)
6. Offer follow-up actions: "Would you like to [update/create/log]...?"

## Output Format
```
**[Company Name]** · [Industry] · [Employees] employees
Domain: [domain]

**Deals (2 open)**
- [Deal 1]: $50k · Proposal stage · Close date: June 15
- [Deal 2]: $20k · Meeting stage · 8 days in stage ⚠️

**Contacts (3)**
- [Name] · CTO · [email]
- [Name] · CFO · [email]

**Recent Activity**
- [Date]: Note by [user] — "Call went well, sending proposal"
- [Date]: Task completed — "Follow up on RFP"
```
