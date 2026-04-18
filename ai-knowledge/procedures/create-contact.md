# Procedure: Create Contact

## When to Use
When a user asks to add a person, create a contact, or log a new lead.

## Steps
1. Collect required information:
   - First name and last name (or full name)
   - Email address (strongly recommended)
   - Company association (ask if not provided)
2. Validate input per data-validation rules
3. Check for duplicates by email and name
   - If duplicate found: show existing record, ask user to confirm or merge
4. Create the contact record with provided fields
5. If company provided: ensure company exists (create if needed), link contact
6. Create a follow-up task: "Initial outreach to [Name]" due in 3 business days, assigned to the requesting user
7. Confirm creation to user with a link/reference to the new contact

## Output to User
"Created contact [Name] at [Company]. I've also created a follow-up task for [date]."

## Error Handling
- Missing name: ask "What's the person's name?"
- Invalid email: ask for correction, do not proceed with invalid email
- Duplicate: "A contact with this email already exists: [existing]. Would you like to update it instead?"
