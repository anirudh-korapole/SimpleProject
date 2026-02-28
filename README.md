# SimpleProject — Full-Stack TypeScript App

React · Node/Express · SQL Server

---

## Project Structure

```
SimpleProject/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts               # SQL Server connection pool
│   │   ├── controllers/
│   │   │   └── entry.controller.ts # HTTP layer
│   │   ├── repositories/
│   │   │   └── entry.repository.ts # Database queries
│   │   ├── routes/
│   │   │   └── entry.routes.ts     # Express router
│   │   ├── services/
│   │   │   └── entry.service.ts    # Business logic
│   │   ├── types/
│   │   │   └── entry.types.ts      # Shared TypeScript interfaces
│   │   └── server.ts               # App entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── entryApi.ts         # Fetch wrapper
│   │   ├── components/
│   │   │   └── EntryForm.tsx       # Form component
│   │   ├── types/
│   │   │   └── api.types.ts        # Response interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── database/
    └── setup.sql                   # One-time DB + table creation
```

---

## 1 — Database Setup

Run `database/setup.sql` against your SQL Server instance (SSMS, Azure Data Studio, or sqlcmd):

```bash
sqlcmd -S localhost -U sa -P YourStrong!Passw0rd -i database/setup.sql
```

---

## 2 — Backend

```bash
cd backend

# Install dependencies
npm install

# Copy the example env file and fill in your credentials
cp .env.example .env

# Start the dev server (auto-reloads on change)
npm run dev
```

The API is now available at `http://localhost:4000`.

### Environment variables (`.env`)

| Variable       | Default              | Description                              |
|----------------|----------------------|------------------------------------------|
| PORT           | 4000                 | Express listening port                   |
| DB_SERVER      | localhost            | SQL Server hostname / IP                 |
| DB_PORT        | 1433                 | SQL Server port                          |
| DB_USER        | sa                   | Login username                           |
| DB_PASSWORD    | —                    | Login password                           |
| DB_NAME        | SimpleProjectDB      | Target database                          |
| DB_ENCRYPT     | false                | Set `true` for Azure SQL                 |
| DB_TRUST_CERT  | true                 | Set `false` in production with real cert |

---

## 3 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

Vite proxies `/api/*` to the backend automatically — no CORS issues during development.

---

## Request Flow

```
Browser form submit
  → EntryForm.handleSubmit()          [frontend: component]
  → entryApi.submitEntry()            [frontend: api layer]
  → POST http://localhost:5173/api/submit
  → Vite proxy → http://localhost:4000/api/submit
  → entry.routes.ts                   [backend: router]
  → entry.controller.ts               [backend: HTTP layer]
  → entry.service.ts                  [backend: business logic / validation]
  → entry.repository.ts               [backend: SQL INSERT]
  → SQL Server Entries table
  → row returned via OUTPUT INSERTED.*
  → 201 JSON response bubbles back
  → EntryForm shows success message
```
