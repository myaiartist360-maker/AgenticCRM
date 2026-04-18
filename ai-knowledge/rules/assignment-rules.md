# Assignment Rules

## Lead Assignment
- Default: round-robin across active sales reps
- Override: if company domain matches a rep's territory, assign directly
- If no reps available: assign to workspace owner

## Deal Ownership
- Deal owner = the sales rep who created or was assigned the deal
- Transfers: require approval from workspace admin or manager role
- When owner is deactivated: auto-reassign to their manager

## Task Assignment
- Tasks default to unassigned unless a contact/deal owner is identifiable
- Meeting follow-up tasks: auto-assign to the meeting attendee who is a workspace member
- Overdue tasks: escalate to manager after 48 hours (notify via in-app notification)

## Agent Behavior
- When creating tasks, suggest assigning to the relevant deal/contact owner
- When asked "who owns X?", check both direct ownership and role-based fallbacks
- Do not reassign deals without explicit user instruction
- Mention assignment in the response whenever creating a task or deal
