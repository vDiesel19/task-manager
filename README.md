# Task Manager

A full-stack task management app with a .NET API backend and a React frontend. Users sign in with a display name, then create and organize tasks on a kanban-style board.

## Prerequisites

| Tool | Version |
|------|---------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 10.0+ |
| [Node.js](https://nodejs.org/) | 20.19.0 (see `.nvmrc`) |

## Getting Started

The server and client run as separate processes. Start the API first, then the frontend.

### Server

```bash
cd server
dotnet restore
dotnet run
```

The API listens on **http://localhost:5062**. On first run, EF Core creates a `tasks.db` SQLite file in the `server` directory.

To run the server tests:

```bash
cd server.Tests
dotnet test
```

### Client

```bash
cd client
npm install
npm run dev
```

The app is available at **http://localhost:5173**. Vite proxies API calls to the server using the default base URL `http://localhost:5062`. To point at a different API, set `VITE_API_URL` in a `.env` file inside `client/`:

```
VITE_API_URL=http://localhost:5062
```

Other useful client scripts:

```bash
npm run build    # production build
npm run test     # run Vitest unit tests
npm run lint     # ESLint
```

## Technical Decisions

### SQLite instead of EF Core InMemory

The server uses **EF Core with SQLite** (`tasks.db`) rather than the InMemory provider.

- **Persistence** — Tasks and users survive server restarts. InMemory data is lost as soon as the process exits.
- **Production-like behavior** — SQLite executes real SQL, enforces constraints, and respects indexes (e.g. the unique index on user names). InMemory skips much of this and can hide bugs that only appear against a real database.
- **Consistent testing story** — Server tests use SQLite as well (an in-memory SQLite connection via `TestDb`), so test and runtime code paths share the same provider and query behavior.
- **Zero infrastructure** — No external database server to install or configure; a single file on disk is enough for local development and demos.

### Service classes (server and client)

Both sides encapsulate data access behind dedicated service classes rather than scattering fetch or EF calls through route handlers and components. This follows the principles of information hiding and driving complexity downward.

**Server** — `TaskService` and `UserService` implement `ITaskService` and `IUserService`. They are registered in DI and consumed by minimal API route handlers.

- Business logic (validation, error mapping) lives in one place, separate from HTTP concerns.
- Interfaces make services easy to unit test in isolation, this was one of the biggest considerations.
- Scoped lifetime aligns with the EF Core `DbContext` per request.

**Client** — `TasksService` wraps all `fetch` calls to the API behind typed methods (`getTasks`, `createTask`, `resolveUser`, etc.).

- Components stay focused on UI; they do not need to know URL shapes or error parsing.
- The constructor accepts a `baseUrl`, so tests can instantiate the class against a mock server without touching global state.
- A single exported instance (`tasksService`) is used at runtime, keeping configuration in one spot.

### React vs Vue
- The frontend was built with React. While I have professional experience with both React and Vue, I've primarily worked with React over the past two years and chose it to deliver the strongest implementation rather than spending time switching contexts between frameworks.
- Although their syntax differs, React and Vue offer many of the same core features, including reusable components, reactive updates, routing, and TypeScript support.

### ShadCN UI components and custom components

The client uses [shadcn/ui](https://ui.shadcn.com/) for foundational UI primitives (`Button`, `Input`, `Dialog`, `Card`, `Select`, etc.) under `client/src/components/ui/`. Domain-specific components (`TaskBoard`, `TaskCard`, `Login`, `DashboardHeader`, and others) live alongside them and compose those primitives.

**Why shadcn/ui**

- Built on Radix UI, so dialogs, selects, and form controls are accessible by default.
- Components are copied into the repo, not locked behind an opaque npm package — styling and behavior can be changed directly.
- Tailwind-based tokens keep spacing, color, and typography consistent across the app.
- There's no need to reinvent the wheel for trickier UI features, especially forms

**Why custom components on top**

- Task management UI (kanban columns, drag targets, empty states) is specific to this app and does not belong in a generic library.
- Custom components own domain logic (e.g. grouping tasks by status, wiring edit/delete actions) while delegating look-and-feel to shadcn primitives.
- The split keeps reusable styling in `ui/` and application behavior in named feature components, which makes the codebase easier to navigate as it grows.

### Login logic in a custom `useAuth` hook

Authentication is handled by `useAuth` in `client/src/hooks/use-auth.ts` rather than inline state inside `App.tsx`.

- **Separation of concerns** — Session storage, validation on mount, and login/logout transitions are isolated from task-fetching and board rendering.
- **Reusable interface** — Any component can consume `{ userId, userName, isLoggedIn, isValidating, login, logout }` without duplicating localStorage reads or API validation.
- **Session restoration** — On load, the hook validates stored credentials against the API (`getUser` / `resolveUser`) and exposes an `isValidating` state so the UI can show a loading skeleton instead of flashing the login screen.
- **Testability** — Auth behavior can be tested independently of the dashboard, and `App` stays a thin orchestrator that branches on `isLoggedIn` and `isValidating`.
