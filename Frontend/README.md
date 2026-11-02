# Taskspace frontend

A JavaScript React application built with Vite. This is the frontend foundation: it includes responsive navigation, a placeholder dashboard, routing, an Axios client, and TanStack Query setup. Authentication and project/task features are not wired up yet.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Install and run

From this folder, install dependencies and start Vite:

```powershell
npm install
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`).

To configure the backend API URL, copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL`. The default is `http://localhost:3000/api/v1`, matching the backend API reference. Vite variables are included in browser code, so do not put secrets in them.

## Production build

```powershell
npm run build
npm run preview
```

## Main folders

- `src/components` — shared interface pieces
- `src/context` — future app-wide React context
- `src/hooks` — future reusable hooks
- `src/layouts` — page layouts
- `src/pages` — route pages
- `src/services` — API client and service calls
- `src/utils` — small shared helpers
