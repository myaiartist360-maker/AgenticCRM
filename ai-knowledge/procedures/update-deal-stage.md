# Procedure: Update Deal Stage

## When to Use
When a user wants to move a deal to a new pipeline stage.

## Steps
1. Identify the deal (by name, company, or deal ID)
2. Show current stage and proposed new stage
3. Validate stage transition is allowed (per deal-progression workflow)
4. Ask for confirmation: "Move [Deal Name] from [Current Stage] to [New Stage]?"
5. On confirmation:
   a. Update deal stage
   b. Prompt for a brief note explaining the stage change
   c. Log note on the deal timeline
   d. Create next-step task based on new stage (per deal-progression workflow)
   e. Update probability if applicable
6. Confirm to user with summary

## Output to User
"Done. [Deal Name] is now in [New Stage]. I've created a task: [next action] due [date]."

## Error Handling
- Deal not found: search and show candidates, ask user to confirm
- Invalid transition: explain why (e.g., "Deals can't move from New directly to Customer — they need to go through Screening, Meeting, and Proposal first.")
- No note provided: proceed without note but mention it was skipped
