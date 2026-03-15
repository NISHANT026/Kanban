# Kanban Board — Jira-Style Project Management

A lightweight Jira-style project management system with multi-project support, sprints, epics, real-time updates, and role-based access control.

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Frontend       | React 19 + TypeScript + Vite        |
| Styling        | TailwindCSS v4                      |
| State          | Zustand                             |
| Routing        | React Router v7                     |
| Drag & Drop    | @dnd-kit/core + @dnd-kit/sortable   |
| Real-Time      | Socket.io                           |
| Backend        | Express + TypeScript                |
| Auth           | JWT (jsonwebtoken + bcryptjs)       |
| Database       | PostgreSQL + Prisma ORM             |
| Validation     | Zod                                 |
| Monorepo       | npm workspaces                      |

## Features

- **Authentication** — JWT-based signup/login/logout with protected routes
- **Multi-Project** — Create and switch between multiple projects
- **Kanban Board** — 5 columns (Backlog, Todo, In Progress, Review, Done) with drag-and-drop
- **Backlog View** — List view of all tasks grouped by status
- **Epics** — Group tasks under epics with sidebar filtering
- **Sprints** — Plan/active/completed sprints with task assignment and filtering
- **Story Points** — Fibonacci estimation (1, 2, 3, 5, 8, 13) displayed on cards
- **Role-Based Access** — Admin and Member roles per project
- **Real-Time Updates** — Socket.io broadcasts task changes to all connected users
- **Optimistic UI** — Instant drag feedback with server sync and rollback on failure

## Project Structure

```
├── apps/
│   ├── backend/
│   │   ├── prisma/              # Schema, migrations, seed
│   │   └── src/
│   │       ├── config.ts
│   │       ├── index.ts         # Express + Socket.io server
│   │       ├── lib/             # Prisma client, Socket.io setup
│   │       ├── middleware/      # auth, projectAuth, validate, errorHandler
│   │       ├── repositories/   # Data access layer (Prisma queries)
│   │       ├── routes/          # Express route handlers
│   │       ├── services/        # Business logic
│   │       └── validation/      # Zod schemas
│   └── frontend/
│       └── src/
│           ├── components/      # Board, Column, TaskCard, Sidebar, Modal, etc.
│           ├── hooks/           # useSocket
│           ├── lib/             # API client, utilities
│           ├── pages/           # Login, Signup, Home, Board, Backlog, NewProject
│           └── store/           # Zustand stores (auth, project, task, sprint, epic)
└── packages/
    └── types/                   # Shared TypeScript types and enums
```

## Database Schema

```
User ──< ProjectMember >── Project
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                  Epic     Sprint     Task
                    │         │         │
                    └─────────┴─── Task ┘
```

- **User** — id, name, email, passwordHash
- **Project** — id, name, key, description, createdBy
- **ProjectMember** — projectId, userId, role (ADMIN/MEMBER)
- **Epic** — id, title, description, projectId
- **Sprint** — id, name, projectId, startDate, endDate, status
- **Task** — id, title, description, status, priority, storyPoints, projectId, assigneeId, epicId, sprintId, createdById

## API Endpoints

### Auth
| Method | Endpoint       | Description       |
| ------ | -------------- | ----------------- |
| POST   | /auth/signup   | Register          |
| POST   | /auth/login    | Login             |
| GET    | /auth/me       | Current user      |

### Projects
| Method | Endpoint                          | Access  |
| ------ | --------------------------------- | ------- |
| GET    | /projects                         | Member  |
| POST   | /projects                         | Any     |
| GET    | /projects/:id                     | Member  |
| PATCH  | /projects/:id                     | Admin   |
| DELETE | /projects/:id                     | Admin   |
| POST   | /projects/:id/members             | Admin   |
| DELETE | /projects/:id/members/:userId     | Admin   |

### Tasks (scoped to project)
| Method | Endpoint                              | Description       |
| ------ | ------------------------------------- | ----------------- |
| GET    | /projects/:id/tasks?sprintId&epicId   | List (filterable) |
| POST   | /projects/:id/tasks                   | Create            |
| PATCH  | /projects/:id/tasks/:taskId           | Update            |
| DELETE | /projects/:id/tasks/:taskId           | Delete            |

### Epics & Sprints (same pattern under /projects/:id/)

## Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL running locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp apps/backend/.env.example apps/backend/.env
# Edit .env if your PostgreSQL credentials differ
```

### 3. Create the database
```bash
createdb kanban
```

### 4. Run migrations
```bash
npm run db:migrate
```
Enter a migration name like `init` when prompted.

### 5. Seed sample data
```bash
npm run db:seed
```
This creates 3 users, 1 project, 2 epics, 2 sprints, and 8 tasks.

**Login credentials:** `alice@example.com` / `password123`

### 6. Start development servers
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Architecture Decisions

- **Repository pattern** separates Prisma queries from business logic, making the data layer testable and swappable
- **Shared types package** ensures frontend and backend stay in sync at compile time
- **Optimistic updates** on drag-and-drop give instant feedback; the store rolls back if the API call fails
- **Socket.io rooms** per project mean users only receive events for the project they're viewing
- **Vite proxy** forwards `/api/*` and `/socket.io` to the backend, avoiding CORS in development
- **Project-scoped routes** (`/projects/:id/tasks`) enforce access control at the middleware level before any handler runs
