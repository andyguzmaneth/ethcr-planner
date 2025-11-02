# ETHCR Planner - UI Design Specification

## Document Sequence: Phase 2 - UI Design Specification

This document is part of the planning sequence:
1. **Phase 1: Product Description** - Product definition, data model, features, and scope
2. **Phase 2: UI Design Specification** (this document) - Detailed UI/UX design, component structure, and user flows
3. **Phase 3: Technical Architecture** - Database schema, API design, and implementation plan
4. **Phase 4: UI Implementation** - Component library setup and initial UI construction

---

## Design System Overview

### Visual Identity
- **Aesthetic**: Notion-inspired, clean, minimal, content-first
- **Typography**: Sans-serif font family (Geist or Inter), clear hierarchy
- **Color Palette**: 
  - Light mode: White backgrounds, subtle grays, minimal color accents for status
  - Dark mode: Dark backgrounds, light text, high contrast
  - Status colors: Pending (gray), In Progress (blue), Blocked (red/orange), Completed (green)
- **Spacing**: Generous whitespace, 4px or 8px base unit
- **Borders**: Subtle, 1px borders, rounded corners (4-8px radius)
- **Shadows**: Minimal, soft shadows for elevation

### Interaction Patterns
- **Hover States**: Subtle background color changes, smooth transitions
- **Focus States**: Clear outline for accessibility
- **Loading States**: Skeleton loaders or subtle spinners
- **Empty States**: Helpful messages with clear CTAs
- **Error States**: Inline error messages, clear validation feedback

---

## Layout Structure

### Main Application Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header (Fixed Top)                                       │
│ ┌─────┐ ┌──────────┐ ┌─────────┐ ┌────────┐            │
│ │Logo │ │Nav Items │ │Search   │ │Profile │            │
│ └─────┘ └──────────┘ └─────────┘ └────────┘            │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │  Main Content Area                          │
│ (Fixed)  │                                              │
│          │  - Contextual based on route                │
│ Events   │  - Scrollable                               │
│ Tracks   │                                              │
│ Tasks    │                                              │
│ Meetings │                                              │
│          │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile**: < 768px - Collapsible sidebar, full-width content
- **Tablet**: 768px - 1024px - Collapsible sidebar, adjusted spacing
- **Desktop**: > 1024px - Fixed sidebar, full layout

---

## Navigation & Routing

### Primary Navigation Structure

```
/ (Dashboard)
├── /events
│   ├── /events/[eventId]
│   │   ├── /events/[eventId]/tracks
│   │   ├── /events/[eventId]/tasks
│   │   ├── /events/[eventId]/meetings
│   │   └── /events/[eventId]/overview
│   └── /events/new
├── /tracks
│   └── /tracks/[trackId]
├── /tasks
│   ├── /tasks (all tasks view)
│   ├── /tasks/[taskId]
│   └── /tasks/views/[viewType] (list/kanban/calendar)
├── /meetings
│   └── /meetings/[meetingId]
└── /templates
    └── /templates/[templateId]
```

### Sidebar Navigation Component

**Structure:**
- Logo/Brand at top
- Main navigation sections:
  - Dashboard
  - Events (expandable with event list)
  - Tracks (expandable with track list)
  - Tasks
  - Meetings
  - Templates (for admins/PMs)
- User profile section at bottom
- Collapse/expand toggle for mobile

**Visual Design:**
- Light gray background in light mode
- Subtle border-right
- Icon + text labels
- Active state: highlighted background, bold text
- Expandable sections with chevron indicators

---

## Page Designs

### 1. Dashboard (/)

**Purpose**: Overview of user's work, recent activity, quick actions

**Layout:**
- Welcome header with user name
- Quick stats cards (My Tasks, Overdue, Completed Today)
- Recent Activity feed
- Upcoming Deadlines widget
- My Tracks widget (if user is a track lead)

**Components:**
- StatsCard component (4-column grid on desktop, stacked on mobile)
- ActivityFeed component (list of recent actions)
- TaskListPreview component (upcoming tasks)
- TrackListPreview component (owned/participating tracks)

---

### 2. Events List (/events)

**Purpose**: Browse and filter all events

**Layout:**
- Page header: "Events" title + "New Event" button
- Filter bar: Status filter, search input
- Event grid/list toggle
- Event cards in grid or list view

**Event Card Component:**
- Event name (prominent)
- Event type badge
- Date range or status
- Track count / Task count summary
- Progress indicator (completed vs total tasks)
- Quick actions: View, Edit (if PM)

**Empty State:**
- "No events yet" message
- "Create your first event" CTA button

---

### 3. Event Detail (/events/[eventId])

**Purpose**: Comprehensive view of a single event

**Layout:**
- Event header section:
  - Event name (editable if PM)
  - Event type badge
  - Status indicator
  - Actions: Edit, Duplicate, Archive
- Tab navigation:
  - Overview
  - Tracks
  - Tasks
  - Meetings
- Tab content area (contextual content)

**Tab: Overview**
- Event summary stats
- Track overview cards
- Recent activity
- Upcoming deadlines

**Tab: Tracks**
- Track list/grid
- Each track shows:
  - Track name
  - Lead name/avatar
  - Participant count
  - Task count (by status)
  - Progress bar
- "Add Track" button (if PM)

**Tab: Tasks**
- Integrated task view (same as /tasks but filtered to event)
- View type toggle: List / Kanban / Calendar
- Filter by track, assignee, status

**Tab: Meetings**
- Meeting list
- Meeting cards showing:
  - Meeting title
  - Date/time
  - Attendees (avatars)
  - Notes status (has notes / no notes)
- "Schedule Meeting" button

---

### 4. Tracks List (/tracks)

**Purpose**: Browse all tracks across events

**Layout:**
- Filter by event, lead, status
- Track cards showing:
  - Track name
  - Event name
  - Lead avatar + name
  - Participant count
  - Task summary
  - Progress indicator

---

### 5. Track Detail (/tracks/[trackId])

**Purpose**: View and manage a single track

**Layout:**
- Track header:
  - Track name (editable if Lead)
  - Event link
  - Lead info (avatar + name)
  - Participants list (avatars + names)
- Responsibilities section:
  - List of responsibilities
  - Each shows task count
  - Expandable to see tasks
- Tasks section:
  - Filtered task list for this track
  - Same view options as main task view
- "Add Responsibility" button (if Lead/PM)
- "Add Task" button (if Lead/PM)

---

### 6. Tasks List (/tasks)

**Purpose**: Main task management interface

**Layout:**
- Header: "Tasks" title + "New Task" button (if PM/Lead)
- View type selector: List / Kanban / Calendar / Dashboard
- Filter bar:
  - Status filter (pending, in progress, blocked, completed)
  - Assignee filter
  - Event filter
  - Track filter
  - Date range filter
- Search input
- View content area (varies by view type)

---

### 7. Task Views

#### List View (/tasks?view=list)

**Table Structure:**
- Columns:
  - Checkbox (for bulk actions)
  - Status (badge)
  - Task title (clickable)
  - Assignee (avatar + name)
  - Deadline (formatted date, overdue highlighted)
  - Track (name, with event context)
  - Responsibility (name)
  - Actions (dropdown: Edit, Duplicate, Delete if PM/Lead)
- Sortable columns
- Row hover: highlight, show actions
- Empty state: "No tasks match your filters"

#### Kanban View (/tasks?view=kanban)

**Board Structure:**
- Columns: Pending | In Progress | Blocked | Completed
- Each column:
  - Column header (status name + task count)
  - Scrollable task cards
- Task cards:
  - Task title
  - Assignee avatar
  - Deadline (if set)
  - Track badge
  - Drag handle
- Drag & drop between columns
- Empty columns: "No tasks" message

#### Calendar View (/tasks?view=calendar)

**Calendar Structure:**
- Month view (default)
- Week view (toggle)
- Task markers on dates with deadlines
- Click date: show tasks for that day
- Color coding: Overdue (red), Due today (orange), Upcoming (blue), No deadline (gray)
- Legend showing status colors

#### Dashboard View (/tasks?view=dashboard)

**Grid Layout:**
- Cards organized by status
- Each card shows:
  - Task title
  - Assignee
  - Deadline
  - Quick status change buttons
- Grouped by track or assignee (toggle)

---

### 8. Task Detail (/tasks/[taskId])

**Purpose**: View and edit individual task

**Layout:**
- Task header:
  - Status badge (editable dropdown)
  - Task title (editable)
  - Actions: Edit, Duplicate, Delete (if PM/Lead)
- Task content (Notion-like editor):
  - Description (rich text, markdown support)
  - Properties panel:
    - Assignee (user selector)
    - Deadline (date picker)
    - Status (dropdown)
    - Track (read-only link)
    - Responsibility (read-only link)
    - Event (read-only link)
  - Support Resources section:
    - List of URLs/links
    - Add resource input
  - Activity log (status changes, assignments, etc.)
- Sidebar (optional):
  - Related tasks
  - Recent activity
  - Notes/comments (future)

**Design:**
- Clean, content-focused
- Inline editing where possible
- Save indicators
- Auto-save or explicit save button

---

### 9. Meeting List (/meetings)

**Purpose**: Browse all meetings

**Layout:**
- Header: "Meetings" + "Schedule Meeting" button
- Filter by event, date range
- Meeting cards:
  - Meeting title
  - Date/time
  - Event name
  - Attendees (avatars)
  - Notes status indicator
  - Link to meeting detail

---

### 10. Meeting Detail (/meetings/[meetingId])

**Purpose**: View and edit meeting notes

**Layout:**
- Meeting header:
  - Meeting title (editable)
  - Date/time (editable)
  - Event link
  - Attendees list (editable)
- Meeting notes editor:
  - Notion-like rich text editor
  - Sections for:
    - Agenda
    - Discussion points
    - Decisions
    - Action items (with task creation links)
- Save button or auto-save indicator

---

### 11. Templates (/templates)

**Purpose**: Manage event-type templates (PM only)

**Layout:**
- Template list
- Template cards showing:
  - Template name
  - Event type
  - Track count
  - Task count
  - Last used date
- "Create Template" button
- "Edit Template" action per card

---

### 12. Template Detail (/templates/[templateId])

**Purpose**: Create/edit event-type templates

**Layout:**
- Template header (name, event type)
- Tracks section:
  - List of tracks included
  - For each track: responsibilities and initial tasks
- Tree/outline view of structure
- Save/Publish button

---

## Component Library

### Core Components

#### 1. Button
- Variants: Primary, Secondary, Ghost, Danger
- Sizes: Small, Medium, Large
- States: Default, Hover, Active, Disabled, Loading
- Icons: Optional left/right icons

#### 2. Input / TextField
- Text input with label
- Validation states: Error, Success
- Helper text
- Prefix/suffix support

#### 3. Select / Dropdown
- Single select
- Searchable
- Clearable
- With icons/avatars

#### 4. Badge / StatusBadge
- Status variants: Pending, In Progress, Blocked, Completed
- Color coding
- With icons

#### 5. Card
- Container with shadow/border
- Header, body, footer sections
- Hover states
- Clickable variant

#### 6. Avatar
- Circular image
- Fallback initials
- Size variants
- Group avatars (stacked)

#### 7. DatePicker
- Calendar popup
- Date range support
- Time picker (for meetings)

#### 8. Modal / Dialog
- Overlay
- Centered content
- Close button
- Action buttons

#### 9. Tabs
- Horizontal tab navigation
- Active state
- Responsive (scrollable on mobile)

#### 10. Tooltip
- Hover-triggered
- Position variants
- Rich content support

#### 11. Skeleton Loader
- Loading placeholder
- Matches content structure

#### 12. Empty State
- Icon/illustration
- Message
- Optional CTA button

### Complex Components

#### 1. TaskCard
- Status indicator
- Title
- Assignee avatar
- Deadline display
- Track/responsibility context
- Quick actions menu

#### 2. EventCard
- Event name
- Type badge
- Progress indicator
- Stats (tracks, tasks)
- Quick actions

#### 3. TrackCard
- Track name
- Lead info
- Participants
- Task summary
- Progress bar

#### 4. UserSelector
- Searchable user list
- Avatar display
- Multi-select support
- Selected users display

#### 5. RichTextEditor
- Notion-like editing
- Markdown support
- Formatting toolbar
- Link insertion

#### 6. FilterBar
- Multiple filter inputs
- Active filters display
- Clear all button
- Saved filters (future)

#### 7. ViewToggle
- Icon buttons for view types
- Active state
- Tooltips

---

## User Flows

### Flow 1: Create New Event from Template

1. User clicks "New Event" button
2. Modal opens: Select event type (Meetups, ETH Pura Vida, Custom)
3. If template selected:
   - Show preview of tracks/responsibilities/tasks
   - Option to customize before creating
4. User enters event name, date
5. Click "Create Event"
6. Redirect to new event detail page
7. Event created with all template structure

**UI Elements:**
- Modal dialog
- Template selector
- Template preview component
- Form inputs
- Confirmation state

---

### Flow 2: Create and Assign Task

1. User (PM or Track Lead) navigates to track or event
2. Clicks "Add Task" button
3. Modal opens with task form:
   - Title (required)
   - Description (rich text)
   - Responsibility selector (if in track context)
   - Assignee selector
   - Deadline picker
   - Support resources (add links)
4. User fills form
5. Clicks "Create Task"
6. Task appears in task list
7. Assignee receives notification (future)
8. Task visible in all relevant views

**UI Elements:**
- Modal dialog
- Form inputs
- User selector component
- Date picker
- Link input component

---

### Flow 3: Mark Task as Complete

1. User views task (in any view)
2. In List View: Click checkbox
3. In Kanban: Drag to "Completed" column
4. In Task Detail: Click status dropdown, select "Completed"
5. Status updates immediately
6. Visual feedback: Checkmark animation, color change
7. Task moves to completed state
8. Progress indicators update

**UI Elements:**
- Checkbox
- Status dropdown
- Drag & drop (Kanban)
- Animation states
- Progress indicators

---

### Flow 4: View Tasks by Track

1. User navigates to event detail
2. Clicks "Tracks" tab
3. Sees list of tracks
4. Clicks on a track card
5. Navigates to track detail page
6. Sees filtered task list for that track
7. Can switch view types (List/Kanban/Calendar)
8. Can filter further by status, assignee

**UI Elements:**
- Tab navigation
- Track cards
- Filtered task views
- View toggle

---

### Flow 5: Create Meeting Notes

1. User navigates to event
2. Clicks "Meetings" tab
3. Clicks "Schedule Meeting" or existing meeting
4. Meeting detail page opens
5. User edits meeting notes using rich text editor
6. Auto-saves or manual save
7. Notes are saved
8. Meeting card shows "Has Notes" indicator

**UI Elements:**
- Meeting form
- Rich text editor
- Save indicator
- Notes status badge

---

## Responsive Design

### Mobile Adaptations

- **Sidebar**: Collapses to hamburger menu
- **Navigation**: Bottom navigation bar option
- **Cards**: Full width, stacked
- **Tables**: Converted to cards or horizontal scroll
- **Kanban**: Horizontal scroll for columns
- **Modals**: Full screen on mobile
- **Filters**: Collapsible filter panel
- **Actions**: Icon-only buttons, grouped in menus

### Tablet Adaptations

- **Sidebar**: Collapsible, overlay on small tablets
- **Grids**: 2-column layouts
- **Cards**: Medium size, readable

---

## Accessibility Considerations

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Clear focus states
- **Alt Text**: All images have alt text
- **Form Labels**: All inputs have associated labels
- **Error Messages**: Clear, helpful error messages

---

## Animation & Transitions

- **Page Transitions**: Smooth fade/translate (200-300ms)
- **Modal Opening**: Fade in + scale up
- **Status Changes**: Color transition (300ms)
- **Drag & Drop**: Smooth drag preview, snap to position
- **Loading States**: Skeleton fade in
- **Hover Effects**: Subtle background color change (150ms)
- **Button Clicks**: Subtle scale down (100ms)

---

## Design Tokens

### Colors
```typescript
// Status Colors
pending: gray-400
inProgress: blue-500
blocked: red-500 / orange-500
completed: green-500

// UI Colors
background: white / gray-950 (dark)
surface: gray-50 / gray-900
border: gray-200 / gray-800
text: gray-900 / gray-50
textSecondary: gray-600 / gray-400
```

### Typography
```typescript
fontFamily: 'Geist Sans', system-ui, sans-serif
fontSizes: {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem'
}
```

### Spacing
```typescript
spacing: {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  12: '3rem',    // 48px
  16: '4rem'     // 64px
}
```

### Border Radius
```typescript
radius: {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem'    // 12px
}
```

---

## Implementation Priority

### Phase 1: Core Layout & Navigation
1. Main layout structure
2. Header component
3. Sidebar navigation
4. Basic routing setup

### Phase 2: Core Pages
1. Dashboard page
2. Events list page
3. Event detail page (tabs structure)
4. Tasks list page (list view)

### Phase 3: Task Management
1. Task detail page
2. Task creation modal/form
3. Task card component
4. Status management

### Phase 4: Advanced Views
1. Kanban view
2. Calendar view
3. Dashboard view
4. View toggles

### Phase 5: Track & Event Management
1. Track detail page
2. Track cards
3. Event creation flow
4. Template system

### Phase 6: Meetings
1. Meeting list
2. Meeting detail
3. Meeting notes editor

### Phase 7: Polish
1. Responsive improvements
2. Animations
3. Loading states
4. Empty states
5. Error handling

---

*Document Version: 1.0*  
*Last Updated: Initial creation for UI planning phase*

