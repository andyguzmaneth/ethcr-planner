# Common Query Examples

This document provides examples of common queries you'll need when building the API layer.

## Projects

### Get all projects with participants
```sql
SELECT 
  p.*,
  json_agg(DISTINCT jsonb_build_object(
    'id', u.id,
    'name', u.name,
    'email', u.email,
    'initials', u.initials
  )) FILTER (WHERE u.id IS NOT NULL) as participants
FROM projects p
LEFT JOIN project_participants pp ON p.id = pp.project_id
LEFT JOIN users u ON pp.user_id = u.id
GROUP BY p.id;
```

### Get a project by slug with all related data
```sql
-- Project with participants
SELECT 
  p.*,
  COALESCE(
    json_agg(DISTINCT u.*) FILTER (WHERE u.id IS NOT NULL),
    '[]'::json
  ) as participants
FROM projects p
LEFT JOIN project_participants pp ON p.id = pp.project_id
LEFT JOIN users u ON pp.user_id = u.id
WHERE p.slug = $1
GROUP BY p.id;
```

## Areas

### Get all areas for a project with participants
```sql
SELECT 
  a.*,
  json_build_object(
    'id', lead.id,
    'name', lead.name,
    'initials', lead.initials
  ) as lead,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'id', u.id,
      'name', u.name,
      'initials', u.initials
    )) FILTER (WHERE u.id IS NOT NULL),
    '[]'::json
  ) as participants
FROM areas a
LEFT JOIN users lead ON a.lead_id = lead.id
LEFT JOIN area_participants ap ON a.id = ap.area_id
LEFT JOIN users u ON ap.user_id = u.id
WHERE a.project_id = $1
GROUP BY a.id, lead.id
ORDER BY a.display_order;
```

## Tasks

### Get all tasks for a project with assignee
```sql
SELECT 
  t.*,
  json_build_object(
    'id', u.id,
    'name', u.name,
    'initials', u.initials
  ) as assignee
FROM tasks t
LEFT JOIN users u ON t.assignee_id = u.id
WHERE t.project_id = $1
ORDER BY t.created_at DESC;
```

### Get tasks with dependencies
```sql
SELECT 
  t.*,
  COALESCE(
    json_agg(DISTINCT td.depends_on_task_id) FILTER (WHERE td.depends_on_task_id IS NOT NULL),
    '[]'::json
  ) as depends_on
FROM tasks t
LEFT JOIN task_dependencies td ON t.id = td.task_id
WHERE t.project_id = $1
GROUP BY t.id;
```

### Get tasks for an area
```sql
SELECT 
  t.*,
  json_build_object(
    'id', u.id,
    'name', u.name,
    'initials', u.initials
  ) as assignee
FROM tasks t
LEFT JOIN users u ON t.assignee_id = u.id
WHERE t.area_id = $1
ORDER BY t.created_at DESC;
```

### Get tasks by status
```sql
SELECT * FROM tasks
WHERE project_id = $1 AND status = $2
ORDER BY deadline ASC NULLS LAST;
```

## Meetings

### Get meetings for a project with attendees
```sql
SELECT 
  m.*,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'id', u.id,
      'name', u.name,
      'initials', u.initials
    )) FILTER (WHERE u.id IS NOT NULL),
    '[]'::json
  ) as attendees
FROM meetings m
LEFT JOIN meeting_attendees ma ON m.id = ma.meeting_id
LEFT JOIN users u ON ma.user_id = u.id
WHERE m.project_id = $1
GROUP BY m.id
ORDER BY m.date, m.time;
```

### Get meeting with notes
```sql
SELECT 
  m.*,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'id', mn.id,
      'content', mn.content,
      'agenda', mn.agenda,
      'decisions', mn.decisions,
      'action_items', mn.action_items,
      'created_by', json_build_object(
        'id', creator.id,
        'name', creator.name,
        'initials', creator.initials
      ),
      'created_at', mn.created_at
    )) FILTER (WHERE mn.id IS NOT NULL),
    '[]'::json
  ) as notes
FROM meetings m
LEFT JOIN meeting_notes mn ON m.id = mn.meeting_id
LEFT JOIN users creator ON mn.created_by = creator.id
WHERE m.id = $1
GROUP BY m.id;
```

## User Queries

### Get all projects a user participates in
```sql
SELECT p.*
FROM projects p
INNER JOIN project_participants pp ON p.id = pp.project_id
WHERE pp.user_id = $1
ORDER BY p.created_at DESC;
```

### Get all tasks assigned to a user
```sql
SELECT 
  t.*,
  json_build_object(
    'id', p.id,
    'name', p.name,
    'slug', p.slug
  ) as project
FROM tasks t
INNER JOIN projects p ON t.project_id = p.id
WHERE t.assignee_id = $1
ORDER BY t.deadline ASC NULLS LAST;
```

## Complex Queries

### Get full project structure (project + areas + tasks)
```sql
WITH project_data AS (
  SELECT 
    p.*,
    COALESCE(
      json_agg(DISTINCT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'initials', u.initials
      )) FILTER (WHERE u.id IS NOT NULL),
      '[]'::json
    ) as participants
  FROM projects p
  LEFT JOIN project_participants pp ON p.id = pp.project_id
  LEFT JOIN users u ON pp.user_id = u.id
  WHERE p.id = $1
  GROUP BY p.id
),
areas_data AS (
  SELECT 
    a.*,
    json_build_object(
      'id', lead.id,
      'name', lead.name,
      'initials', lead.initials
    ) as lead,
    COALESCE(
      json_agg(DISTINCT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'initials', u.initials
      )) FILTER (WHERE u.id IS NOT NULL),
      '[]'::json
    ) as participants
  FROM areas a
  LEFT JOIN users lead ON a.lead_id = lead.id
  LEFT JOIN area_participants ap ON a.id = ap.area_id
  LEFT JOIN users u ON ap.user_id = u.id
  WHERE a.project_id = $1
  GROUP BY a.id, lead.id
)
SELECT 
  json_build_object(
    'project', (SELECT row_to_json(pd.*) FROM project_data pd),
    'areas', (SELECT json_agg(row_to_json(ad.*)) FROM areas_data ad ORDER BY ad.display_order)
  ) as result;
```

## Insert Examples

### Create a project with participants
```sql
-- Insert project
INSERT INTO projects (name, slug, type, status, description)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- Add participants
INSERT INTO project_participants (project_id, user_id)
VALUES 
  ($1, $2),
  ($1, $3);
```

### Create a task with dependencies
```sql
-- Insert task
INSERT INTO tasks (project_id, area_id, title, description, assignee_id, status)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- Add dependencies
INSERT INTO task_dependencies (task_id, depends_on_task_id)
VALUES 
  ($1, $2),
  ($1, $3);
```

## Update Examples

### Update task status and set completed_at
```sql
UPDATE tasks
SET 
  status = $2,
  completed_at = CASE 
    WHEN $2 = 'completed' THEN NOW()
    ELSE NULL
  END,
  updated_at = NOW()
WHERE id = $1
RETURNING *;
```

### Reorder areas
```sql
UPDATE areas
SET display_order = CASE id
  WHEN $1 THEN 1
  WHEN $2 THEN 2
  WHEN $3 THEN 3
  -- ... etc
END,
updated_at = NOW()
WHERE project_id = $4;
```

## Delete Examples

### Delete a project (cascades to all related data)
```sql
DELETE FROM projects WHERE id = $1;
```

### Remove a participant from a project
```sql
DELETE FROM project_participants
WHERE project_id = $1 AND user_id = $2;
```

### Remove task dependencies
```sql
DELETE FROM task_dependencies
WHERE task_id = $1 AND depends_on_task_id = $2;
```

