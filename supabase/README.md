# Database Schema Design

This document describes the database schema for the ETHCR Planner application using Supabase (PostgreSQL).

## Design Principles

1. **Simple & Scalable**: Normalized structure with clear relationships
2. **UUID Primary Keys**: All tables use UUIDs for better distributed system support
3. **Timestamps**: Automatic `created_at` and `updated_at` tracking
4. **Foreign Keys**: Proper referential integrity with CASCADE deletes where appropriate
5. **JSONB for Complex Data**: Used sparingly for flexible nested structures (recurrence, support resources, template data)

## Schema Overview

### Core Tables

#### `users`
Stores user information. Can be extended to integrate with Supabase Auth later.

#### `projects`
Main entity representing events, conferences, meetups, or property projects.
- Uses enums for `type` and `status`
- Has unique `slug` for URL-friendly identifiers
- Many-to-many relationship with users via `project_participants`

#### `areas`
Organizational units within a project (e.g., "Marketing", "Logistics").
- Belongs to a project
- Has a lead (user) and participants (many-to-many)
- Has `display_order` for sorting

#### `responsibilities`
Sub-units within areas (e.g., "Social Media", "Graphic Design" within Marketing).
- Belongs to an area

#### `tasks`
Work items that can belong to a project and optionally an area.
- Can be assigned to a user
- Supports dependencies (many-to-many self-referential)
- Supports recurring tasks via JSONB `recurrence` field
- `support_resources` stored as JSONB array

#### `meetings`
Scheduled meetings for a project.
- Many-to-many relationship with users (attendees)

#### `meeting_notes`
Notes taken during meetings.
- Belongs to a meeting
- Has structured fields (agenda, decisions, action items)

#### `project_templates`
Templates for creating new projects.
- Stores full template structure in JSONB for flexibility

## Relationships

```
projects
  ├── project_participants (many-to-many with users)
  ├── areas
  │     ├── area_participants (many-to-many with users)
  │     └── responsibilities
  ├── tasks
  │     └── task_dependencies (many-to-many self-referential)
  └── meetings
        ├── meeting_attendees (many-to-many with users)
        └── meeting_notes
```

## Key Design Decisions

### 1. Many-to-Many Relationships
All many-to-many relationships use junction tables:
- `project_participants`: Projects ↔ Users
- `area_participants`: Areas ↔ Users
- `meeting_attendees`: Meetings ↔ Users
- `task_dependencies`: Tasks ↔ Tasks (self-referential)

### 2. JSONB Usage
JSONB is used for:
- `tasks.support_resources`: Array of resource URLs/notes
- `tasks.recurrence`: Recurrence configuration object
- `meeting_notes.action_items`: Array of action item strings
- `project_templates.template_data`: Full template structure

This keeps the schema flexible while maintaining queryability.

### 3. Optional Relationships
- `tasks.area_id`: Optional - tasks can exist at project level
- `tasks.assignee_id`: Optional - tasks can be unassigned
- `areas.lead_id`: Optional - areas can exist without a lead

### 4. CASCADE Deletes
- Deleting a project cascades to all related data
- Deleting an area sets `area_id` to NULL in tasks (SET NULL)
- Deleting a user sets foreign keys to NULL where appropriate

### 5. Indexes
Indexes created on:
- Foreign keys (for JOIN performance)
- Frequently queried fields (slug, status, date)
- Composite queries (project_id + status, etc.)

## Usage

### Running Migrations

If using Supabase CLI:
```bash
supabase migration up
```

Or apply the SQL directly in Supabase Dashboard → SQL Editor.

### Row Level Security (RLS)

After creating the schema, you'll want to add RLS policies. Example:

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see projects they participate in
CREATE POLICY "Users can view projects they participate in"
  ON projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM project_participants
      WHERE user_id = auth.uid()
    )
  );
```

### Integration with Supabase Auth

To integrate with Supabase Auth, you can:

1. Link `users.id` to `auth.users.id`:
```sql
ALTER TABLE users 
  ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

2. Or create a separate `user_profiles` table that references `auth.users`.

## Future Considerations

1. **Full-text Search**: Add GIN indexes on text fields if search is needed
2. **Soft Deletes**: Add `deleted_at` columns if soft deletes are required
3. **Audit Logging**: Consider adding audit tables for change tracking
4. **File Attachments**: May need a separate `attachments` table
5. **Comments**: Could add a `task_comments` or generic `comments` table
6. **Notifications**: May need a `notifications` table for user alerts

