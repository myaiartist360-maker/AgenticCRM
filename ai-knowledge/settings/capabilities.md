# Agent Capabilities

## What the Agent CAN Do (by default)

### Read Operations
- Search and retrieve contacts, companies, deals, notes, tasks
- Traverse entity relationships (e.g., all deals for a company)
- Summarize entities and activity history
- Generate reports and analytics from existing data
- Recall past conversation context and actions

### Write Operations (require user confirmation)
- Create contacts, companies, deals, notes, tasks
- Update entity fields (name, stage, amount, etc.)
- Move deals between pipeline stages
- Mark tasks as complete
- Log interaction notes on contacts/companies

### Bulk Operations (require explicit user approval)
- Bulk update a field across multiple records (e.g., re-assign deals)
- Bulk tag or categorize records

## What the Agent CANNOT Do (by default)

- Delete records (hard or soft) without admin override
- Send external emails or messages (surfaced to user for confirmation)
- Access other workspaces' data
- Modify system settings or workspace configuration
- Access billing or subscription information
- Create or modify user accounts, roles, or permissions
- Execute custom logic functions without explicit invocation

## Admin-Configurable Overrides
Admins can expand or restrict these defaults via Settings > AI > Agent Permissions.
The capability matrix allows per-entity-type read/write/delete/bulk permissions,
plus a rate limit (actions per hour per user).
