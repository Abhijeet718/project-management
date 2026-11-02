# Taskspace frontend

Taskspace is a JavaScript React application built with Vite. The frontend includes account login and registration, a project dashboard, project CRUD, task CRUD, and subtask management.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- The backend and MongoDB running for API features

## Start the frontend

From this folder, install packages and start the development server:

```powershell
npm install
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

The frontend uses `http://localhost:3000/api/v1` by default. To change it, copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL`. Vite variables are visible in browser code, so do not put secrets in them.

For local cookie-based login, configure the backend CORS origin to allow `http://localhost:5173`. Registration also requires the backend email delivery settings to be configured.

## Useful commands

```powershell
npm test
npm run lint
npm run build
npm run preview
```

## Main folders

- `src/components` — shared navigation, forms, and route checks
- `src/context` — authentication state
- `src/layouts` — application and authentication layouts
- `src/pages` — dashboard, project, task, and account pages
- `src/services` — Axios API calls
- `src/utils` — shared task status labels and styles
