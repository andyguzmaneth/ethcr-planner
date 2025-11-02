# Event Template System

This system allows you to define reusable event templates that can be initialized to create complete events with tracks, responsibilities, and tasks.

## Overview

Templates are fixed structures that define:
- **Event Type** (Conference, Meetup, Custom)
- **Tracks** (Areas/Teams) with team members
- **Responsibilities** within each track
- **Tasks** with initial status, stages, and notes

Once initialized, templates generate:
- An **Event** with all metadata
- **Tracks** with assigned team members (leads and participants)
- **Responsibilities** for each track
- **Tasks** with mapped statuses and descriptions

## Data Structure

### Template Types

```typescript
EventTemplate {
  id: string
  name: string
  eventType: EventType
  tracks: TemplateTrack[]
}

TemplateTrack {
  name: string
  team?: TemplateTeamMember[]
  responsibilities: TemplateResponsibility[]
}

TemplateTask {
  title: string
  estado?: "Not Started" | "In Progress" | "Done"
  etapa?: string // e.g., "< 1 semana", "> 3 meses"
  notes?: string
}
```

### Status Mapping

Template `estado` values are mapped to Task `status`:
- `"Done"` → `"completed"`
- `"In Progress"` → `"in_progress"`
- `"Not Started"` → `"pending"`

## Usage

### 1. Loading Templates from JSON

The system can load templates from JSON files matching the structure in `ETH_Pura_Vida_Project_Structure_v2.json`:

```typescript
import { loadTemplateFromJson } from "./lib/templates";

const jsonData = JSON.parse(fs.readFileSync("template.json", "utf-8"));
const templates = loadTemplateFromJson(jsonData, "Conference");
```

### 2. Creating a Template from JSON

```typescript
import { initEthPuraVidaTemplate } from "./lib/init-template-from-json";

// Initialize the ETH Pura Vida template from JSON
const template = initEthPuraVidaTemplate();
```

### 3. Initializing an Event from a Template

```typescript
import { initializeEventFromTemplate } from "./lib/templates";
import { getTemplateById } from "./lib/data";

const template = getTemplateById("template-123");

const result = initializeEventFromTemplate(
  template,
  {
    name: "ETH Pura Vida 2025",
    description: "Annual Ethereum conference",
    startDate: "2025-06-15",
    endDate: "2025-06-17",
  },
  {
    assignTeamMembers: true, // Automatically assign team members to tracks
    defaultTaskStatus: "pending", // Optional override
  }
);

// result contains:
// - event: Event
// - tracks: Track[]
// - responsibilities: Responsibility[]
// - tasks: Task[]
```

### 4. Managing Templates

```typescript
import {
  getTemplates,
  getTemplateById,
  getTemplateByName,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "./lib/data";

// Get all templates
const templates = getTemplates();

// Find template by name
const template = getTemplateByName("ETH Pura Vida");

// Create new template
const newTemplate = createTemplate({
  name: "My Template",
  eventType: "Conference",
  tracks: [...],
});

// Update template
updateTemplate(template.id, {
  tracks: updatedTracks,
});

// Delete template
deleteTemplate(template.id);
```

## ETH Pura Vida Template

The ETH Pura Vida template is automatically loaded from `data/ETH_Pura_Vida_Project_Structure_v2.json`.

To initialize it:

```typescript
import { initEthPuraVidaTemplate } from "./lib/init-template-from-json";

// Create/update the template
initEthPuraVidaTemplate();
```

To create an event from it:

```typescript
import { initEventFromEthPuraVidaTemplate } from "./lib/init-template-from-json";

const result = initEventFromEthPuraVidaTemplate({
  name: "ETH Pura Vida 2025",
  startDate: "2025-06-15",
  endDate: "2025-06-17",
});
```

## Template Structure Conversion

The JSON structure is converted as follows:

```
JSON "Areas" → Template "Tracks"
  - "Equipo" → Track team members (lead + participants)
  - "Responsabilidades" → Template Responsibilities (one per responsibility name)
  - "Tareas" → Tasks within responsibilities
  - "Secciones" → Track sections (optional)
```

## Team Member Assignment

When `assignTeamMembers: true`:
1. First team member becomes the **track lead**
2. Remaining team members become **participants**
3. Users are found by email or name, or created if not found

## Notes

- Templates are stored in `data/templates.json`
- Tasks created from templates include a `templateId` reference
- Task descriptions combine `description` and `notes` fields
- Team members are automatically created as users if they don't exist

