# Data Structure

Esta carpeta contiene archivos JSON que actúan como base de datos temporal durante el desarrollo frontend.

## Archivos de Datos

### `users.json`
Lista de usuarios del sistema. Cada usuario tiene:
- `id`: Identificador único
- `name`: Nombre completo
- `email`: Correo electrónico
- `avatar`: URL de avatar (opcional)
- `initials`: Iniciales para mostrar
- `createdAt`, `updatedAt`: Timestamps

### `events.json`
Lista de eventos. Cada evento tiene:
- `id`: Identificador único
- `name`: Nombre del evento
- `type`: Tipo (Meetup, Conference, Custom)
- `status`: Estado (In Planning, Active, Completed, Cancelled)
- `description`: Descripción opcional
- `startDate`, `endDate`: Fechas del evento
- `createdAt`, `updatedAt`: Timestamps

### `tracks.json`
Lista de tracks (áreas temáticas) dentro de eventos. Cada track tiene:
- `id`: Identificador único
- `eventId`: ID del evento al que pertenece
- `name`: Nombre del track
- `description`: Descripción opcional
- `leadId`: ID del usuario líder del track
- `participantIds`: Array de IDs de participantes
- `createdAt`, `updatedAt`: Timestamps

### `responsibilities.json`
Lista de responsabilidades dentro de tracks. Cada responsabilidad tiene:
- `id`: Identificador único
- `trackId`: ID del track al que pertenece
- `name`: Nombre de la responsabilidad
- `description`: Descripción opcional
- `createdAt`, `updatedAt`: Timestamps

### `tasks.json`
Lista de tareas. Cada tarea tiene:
- `id`: Identificador único
- `responsibilityId`: ID de la responsabilidad
- `trackId`: ID del track
- `eventId`: ID del evento
- `title`: Título de la tarea
- `description`: Descripción opcional
- `assigneeId`: ID del usuario asignado (opcional)
- `deadline`: Fecha límite (opcional)
- `status`: Estado (pending, in_progress, blocked, completed)
- `supportResources`: Array de URLs o notas de apoyo
- `templateId`: ID de template si fue creada desde uno (opcional)
- `createdAt`, `updatedAt`, `completedAt`: Timestamps

### `meetings.json`
Lista de reuniones. Cada reunión tiene:
- `id`: Identificador único
- `eventId`: ID del evento
- `title`: Título de la reunión
- `date`: Fecha de la reunión
- `time`: Hora de la reunión
- `attendeeIds`: Array de IDs de asistentes
- `createdAt`, `updatedAt`: Timestamps

### `meeting-notes.json`
Notas de reuniones. Cada nota tiene:
- `id`: Identificador único
- `meetingId`: ID de la reunión
- `content`: Contenido principal (markdown o texto enriquecido)
- `agenda`: Agenda de la reunión (opcional)
- `decisions`: Decisiones tomadas (opcional)
- `actionItems`: Array de items de acción
- `createdAt`, `updatedAt`: Timestamps
- `createdBy`: ID del usuario que creó las notas

## Uso

Las funciones helper están en `lib/data.ts` y proporcionan operaciones CRUD para cada entidad:

```typescript
import { getEvents, createEvent, updateEvent } from "@/lib/data";

// Obtener todos los eventos
const events = getEvents();

// Obtener evento por ID
const event = getEventById("1");

// Crear nuevo evento
const newEvent = createEvent({
  name: "Nuevo Evento",
  type: "Meetup",
  status: "In Planning",
});

// Actualizar evento
const updated = updateEvent("1", { status: "Active" });
```

## Migración Futura

Cuando implementes el backend, simplemente reemplaza las funciones en `lib/data.ts` con llamadas a tu API. Los tipos TypeScript en `lib/types/index.ts` pueden reutilizarse.


