# ETHCR Planner - Product Description

## Document Sequence: Phase 1 - Product Definition

This document is part of the planning sequence:
1. **Phase 1: Product Description** (this document) - Product definition, data model, features, and scope
2. **Phase 2: UI Design Specification** - Detailed UI/UX design, component structure, and user flows
3. **Phase 3: Technical Architecture** - Database schema, API design, and implementation plan
4. **Phase 4: UI Implementation** - Component library setup and initial UI construction

---

## Overview

ETHCR Planner is a simplified, event-focused project management and knowledge base application designed specifically for organizing Ethereum Costa Rica events. The application provides a Notion-like user experience but with a restricted, purpose-built feature set optimized for event planning, task management, and team collaboration.

## Core Purpose

The application serves as a centralized platform for:
- **Event Organization**: Manage event-related tasks, activities, and workflows
- **Project Management**: Track responsibilities, tasks, deadlines, and assignees
- **Knowledge Base**: Store meeting notes, templates, and event documentation
- **Team Collaboration**: Enable task execution tracking and status updates

## Target Users

1. **Project Managers**: Primary users who create tasks, assign responsibilities, track progress, and manage events
2. **Event Participants**: Team members who execute tasks and mark them as completed
3. **Track Leads**: Individuals who own and manage specific tracks; can create tasks within their tracks

## Core Data Model

### Hierarchy Structure

```
Event
  └── Track (owned by Lead)
      └── Responsibility (area of work)
          └── Task (assignable, with deadlines)
  └── Meeting
      └── Meeting Notes
```

### Entity Definitions

**Event**
- Top-level container for organizing related activities
- Examples: "Meetups", "ETH Pura Vida"
- Contains multiple tracks and meetings
- All events are public (visible to all users)

**Track**
- A thematic area or functional domain within an event
- Owned by a Track Lead (single owner)
- Contains multiple responsibilities
- Has participating individuals (multiple participants)
- Typical tracks: Venue, Speakers & Agenda, Sponsors, Marketing & Social Media, Web, Finances, Ticketing, Logistics, Multimedia/Video/Photos, Production of Swag & Decoration

**Responsibility**
- A defined area of work within a track
- Contains multiple tasks
- Represents a domain of accountability
- Primarily organizational (no separate owner)

**Task**
- Individual actionable item
- Properties:
  - Single Assignee (one-to-one relationship)
  - Deadline
  - Status: pending, in progress, blocked, completed
  - Support/Resources (optional - URLs, text notes)
  - Template association (for recurring tasks)
- Can be marked as "executed/completed" by anyone (no approval required)
- Can be created by Project Managers or Track Leads

**Meeting**
- Scheduled meeting associated with an event
- Contains meeting notes
- Used for knowledge base and documentation

**Meeting Notes**
- Documentation and notes from meetings
- Tied to a specific Meeting
- Can include follow-up actions and decisions

**Individual (User)**
- User of the system
- Can participate in tracks
- Can be assigned to tasks
- Can own tracks (as Track Lead)

## Key Features

### 1. Authentication & Access
- Simplified authentication via Google OAuth or Email/Password
- Role-based access (implicit through track ownership and task assignment)
- All events are public (all users can view all events)

### 2. Event Management
- Create and manage events
- Initial focus: Meetups and ETH Pura Vida
- Event-type templates (e.g., one "Meetups" template used for all meetups throughout the year)
- Templates pre-configure tracks, responsibilities, and task structures
- Apply templates when creating new events of a specific type

### 3. Task Management
- Create tasks with:
  - Title and description
  - Single assignee (one-to-one relationship)
  - Deadlines
  - Support resources/links (URLs, text notes)
  - Template association
- Task status tracking: pending, in progress, blocked, completed
- Task completion marking (anyone can mark tasks as done - no approval required)
- Multiple view options: Dashboard, List View, Kanban Board, Calendar View

### 4. Project Structure
- Hierarchical view: Event → Track → Responsibility → Task
- Track ownership management
- Participant assignment to tracks
- Responsibility organization

### 5. Knowledge Base
- Meeting notes storage (tied to Meetings)
- Meeting management (create, schedule, associate with events)
- Template library for event types and tasks
- Documentation per event/track/responsibility
- Search functionality (future consideration)

### 6. Notifications & Reminders
- **MVP**: Reminders feature deferred to future release
- **Future**: Email summary with self-defined cadence including:
  - Task assignments
  - Upcoming deadlines
  - Status updates
  - Customizable frequency and content
- Assignment notifications (future)
- Status update notifications (future)

### 7. Templates
- **Event-type templates**: Pre-configured structure for event types (e.g., one template for all "Meetups")
  - Include tracks, responsibilities, and initial tasks
  - Applied when creating new events of that type
- Task templates (reusable task definitions within event-type templates)
- Meeting note templates (optional structure for meeting notes)

### 8. Workflow

**Project Manager Workflow:**
1. Create/Select Event
2. Create Tracks and assign Leads
3. Define Responsibilities within Tracks
4. Create Tasks tied to Responsibilities
5. Assign Tasks to individuals
6. Set deadlines and add support resources
7. Monitor progress and task completion

**Track Lead Workflow:**
1. View owned tracks
2. Create tasks within owned tracks
3. Assign tasks to individuals
4. Monitor track progress and task completion

**Participant/Assignee Workflow:**
1. View assigned tasks (and all tasks in participating tracks)
2. Access task details, deadlines, and support resources
3. Mark tasks as executed/completed (no approval needed)
4. View track participation and responsibilities

## UI/UX Design Principles

- **Notion-like Aesthetics**: Clean, minimal, content-first design
- **Simplified Navigation**: Focus on event → track → responsibility → task hierarchy
- **Visual Clarity**: Clear status indicators, deadlines, and assignment information
- **Responsive Design**: Mobile-friendly for on-the-go task updates
- **Fast Loading**: Optimized for quick task status updates
- **Multiple View Options**: Dashboard, List View, Kanban Board, and Calendar View for tasks

## Technical Considerations

### Technology Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Authentication: NextAuth.js (for Google/Email)
- Database: To be determined (PostgreSQL/Supabase recommended)
- Email Service: To be determined (Resend/SendGrid recommended)

### Database Schema Considerations
- Events table
- Tracks table (with lead_id)
- Responsibilities table (with track_id)
- Tasks table (with responsibility_id, assignee_id, deadline, status)
- Users table
- Track Participants (many-to-many: tracks ↔ users)
- Meetings table (with event_id)
- Meeting Notes table (with meeting_id)
- Event-type Templates table (for recurring event structures)
- Task Templates table (within event-type templates)
- Email Summary Preferences table (future - for self-defined cadence)

## Initial Event Focus

### Meetups
- Regular Ethereum community meetups
- Single event-type template used for all meetups throughout the year
- Typical tracks: Venue, Speakers & Agenda, Sponsors, Marketing & Social Media, Web, Finances, Ticketing, Logistics, Multimedia/Video/Photos, Production of Swag & Decoration

### ETH Pura Vida
- Larger Ethereum event/conference
- Complex multi-track structure
- Multiple responsibilities and dependencies
- Same typical tracks as Meetups, potentially with additional specialized tracks

## Success Metrics

- Task completion rates
- Time to task completion
- User engagement (active users per event)
- Event execution success (measured qualitatively)
- Reduction in coordination overhead

## Future Considerations

- Calendar integration
- File attachments for tasks
- Comments/communication threads on tasks
- Reporting and analytics dashboards
- Multi-event views and cross-event resource allocation
- Advanced search and filtering

---

## Product Decisions Made

### 1. User Roles & Permissions
✅ **Track Leads can create tasks** within their owned tracks  
✅ **All events are public** - all users can view all events and tasks

### 2. Task Assignment & Execution
✅ **Tasks have single assignees** (one-to-one relationship)  
✅ **Task statuses**: pending, in progress, blocked, completed  
✅ **No approval required** - anyone can mark tasks as done/completed

### 3. Templates
✅ **Templates are per event-type** (e.g., one "Meetups" template used for all meetups)  
✅ Templates pre-configure tracks, responsibilities, and task structures

### 4. Email Reminders
⏸️ **Deferred to post-MVP**: Email summary feature with self-defined cadence including assignments, deadlines, and status updates

### 5. Meeting Notes
✅ **Meeting notes are tied to Meetings** (not directly to Events/Tracks/Responsibilities)  
✅ Meetings are associated with Events

### 6. Initial Setup - Typical Tracks
✅ Pre-defined tracks for event templates:
- Venue
- Speakers & Agenda
- Sponsors
- Marketing & Social Media
- Web
- Finances
- Ticketing
- Logistics
- Multimedia/Video/Photos
- Production of Swag & Decoration

### 7. UI/UX Views
✅ **All view types supported**: Dashboard, List View, Kanban Board, Calendar View

---

## MVP Scope

### Included in MVP
- Authentication (Google OAuth + Email/Password)
- Event creation and management
- Track management with leads and participants
- Responsibility organization
- Task creation, assignment, and status management
- Meeting creation and meeting notes
- Event-type templates
- Multiple view types (Dashboard, List, Kanban, Calendar)
- Public access to all events

### Deferred to Post-MVP
- Email reminders and summaries
- Advanced search
- File attachments
- Comments/communication threads
- Reporting and analytics
- Calendar integration

---

*Document Version: 2.0*  
*Last Updated: Updated with product decisions and MVP scope*

