# Deal Progression Workflow

## Overview
Defines how opportunities move through the sales pipeline stages.

## Stages
1. **New** — Lead identified, no qualification yet
2. **Screening** — Initial contact made, qualification in progress
3. **Meeting** — Meeting scheduled or completed
4. **Proposal** — Proposal sent to prospect
5. **Customer** — Deal won, contract signed
6. **Churned** — Deal lost or customer left

## Transition Rules

### New → Screening
- Requirements: Contact information verified, company identified
- Action: Assign to sales rep, log initial note, set follow-up task (3 days)

### Screening → Meeting
- Requirements: Qualification criteria met (budget, authority, need, timeline)
- Action: Schedule meeting, create meeting task, update stage probability to 30%

### Meeting → Proposal
- Requirements: Meeting notes logged, pain points documented
- Action: Create proposal draft task, set close date, update probability to 50%

### Proposal → Customer
- Requirements: Proposal accepted, contract signed
- Action: Create onboarding task, notify customer success team, update ARR

### Any Stage → Churned
- Requirements: Prospect declined or contact lost
- Action: Log reason, update stage, optionally schedule re-engagement (90 days)

## Agent Behavior
- When user asks about a deal, always include current stage, next action, and days in current stage
- Proactively flag deals that have been in the same stage for >14 days
- When moving a deal stage, always ask for confirmation before executing
- Log a note with context whenever a stage change is made
