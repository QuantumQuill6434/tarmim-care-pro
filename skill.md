---
name: shift-handover-logbook
description: Build and maintain a simple internal shift handover logbook for dental clinics. Use this skill when the user wants an internal admin app for reception handover, unresolved tasks, callbacks, cash notes, complaints, and owner visibility. Do not use for EMR, prescriptions, patient records, or regulated medical data.
---

# Shift Handover Logbook Skill

## Purpose
Build a lightweight internal app for dental clinics that helps front desk staff pass unresolved tasks from one shift to the next. The app must be simple, fast, mobile-friendly, and safe for Saudi clinics. It is an administrative workflow tool only.

## Core problem
Dental reception staff lose important operational notes during shift changes because they rely on memory, paper, and WhatsApp. This causes missed callbacks, forgotten follow-ups, unresolved cash issues, delayed complaint handling, and poor owner visibility.

## What the app must do
- Let staff create handover notes quickly.
- Let staff mark items as open, in progress, or completed.
- Show unresolved items first.
- Let owners view all branches and all unresolved items.
- Keep a timestamped audit trail.
- Support simple filters by branch, shift, category, priority, and status.
- Be easy to use on mobile.
- Avoid regulated medical data completely.

## What the app must not do
- Do not build EMR features.
- Do not store patient records.
- Do not store prescriptions.
- Do not build insurance adjudication.
- Do not build clinical notes.
- Do not build a patient portal.
- Do not add unnecessary features.

## Target users
1. Receptionist.
2. Branch manager.
3. Clinic owner.

## MVP scope
Build only the first useful version:
- Login.
- Role-based access.
- Dashboard.
- Create handover item.
- Item detail page.
- Owner view.
- Filters.
- Activity log.
- Seed demo data.

## Data model
Create these tables:
- users
- branches
- handover_items
- item_comments
- item_activity_log

Suggested fields for `handover_items`:
- id
- title
- details
- category
- priority
- status
- branch_id
- created_by
- assigned_to
- shift_name
- follow_up_date
- created_at
- updated_at
- completed_at

Suggested categories:
- Callback
- Follow-up
- Cash / payment
- Complaint
- Supplies
- Insurance admin
- Urgent
- Other

Suggested statuses:
- Open
- In Progress
- Completed

## UX rules
- Clean and calm interface.
- Large readable text.
- Simple buttons.
- Fast scanning of unresolved items.
- Mobile responsive.
- Arabic-friendly and RTL-ready if possible.
- Avoid clutter.

## Dashboard rules
The dashboard should show:
- Open items count.
- In progress count.
- Completed count.
- Overdue items.
- Category breakdown.
- Priority breakdown.
- Recent activity.
- Branch filter.

## Item creation rules
The create form should include:
- Title.
- Details.
- Category.
- Priority.
- Branch.
- Shift.
- Assigned to.
- Follow-up date optional.
- Internal comment optional.

## Owner view rules
The owner should be able to:
- See all branches.
- See only unresolved items by default.
- Filter by date, branch, category, priority, status.
- See who created and who completed each item.
- See a clear audit trail.
- See overdue tasks highlighted.

## Security rules
- Require authentication.
- Restrict access by role.
- Receptionists can only manage their branch.
- Owners can view everything.
- Managers can view branch-level items.
- Keep data administrative only.

## Build order
1. Create project structure.
2. Set up database schema.
3. Implement authentication.
4. Build dashboard.
5. Build create item flow.
6. Build item detail and status updates.
7. Build owner view.
8. Seed demo data.
9. Polish UI.
10. Write README and setup instructions.

## Implementation preferences
- Use a modern full-stack stack such as Next.js, TypeScript, Tailwind CSS, and Supabase or equivalent.
- Keep the codebase small.
- Prefer reusable components.
- Keep state simple.
- Avoid over-engineering.
- Write maintainable code.

## Verification checklist
Before finalizing, confirm:
- Login works.
- Items can be created.
- Status can be updated.
- Filters work.
- Owner sees all branches.
- Audit log records changes.
- App is responsive on mobile.
- No regulated medical data is included.

## Output expected from the agent
When asked to build this app, first produce:
- A short implementation plan.
- Folder structure.
- Database schema.
- User roles.
- Main screens.
- Then generate the code in small steps.

## Notes
This skill is for a clinic operations tool. It is not a medical product.