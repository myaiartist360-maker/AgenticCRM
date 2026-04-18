# Data Validation Rules

## Contact (Person) Rules
- `firstName` + `lastName` OR `name`: at least one required
- `email`: must be valid email format if provided; deduplicate against existing contacts
- `phone`: store in E.164 format (+1XXXXXXXXXX)
- `jobTitle`: capitalize first letter of each word
- `companyId`: must reference an existing company in the workspace

## Company Rules
- `name`: required, minimum 2 characters
- `domainName`: must be valid domain (no protocol prefix, e.g. `acme.com` not `https://acme.com`)
- `employees`: positive integer only
- No duplicate company domains within a workspace

## Opportunity (Deal) Rules
- `name`: required
- `companyId`: required — a deal must always be linked to a company
- `amount`: positive number, currency stored separately
- `closeDate`: must be in the future when creating a new deal
- `stage`: must be one of the defined pipeline stages

## Task Rules
- `title`: required, minimum 3 characters
- `dueAt`: must be a valid future date/time for new tasks
- `assigneeId`: must reference an existing workspace member
- `status`: one of `TODO`, `IN_PROGRESS`, `DONE`

## General Rules
- Never hard-delete records — use soft delete (`deletedAt`)
- All timestamps in UTC
- UUIDs for all entity IDs

## Agent Behavior
- Before creating any record, validate against these rules
- If validation fails, explain the issue to the user and ask for correct data
- For duplicates: show the existing record and ask whether to merge or create new
- Never silently skip validation failures
