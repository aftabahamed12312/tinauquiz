# Deployment Guide

This project supports two deployment environments:

1. Docker Compose for local development and production-like hosting.
2. Vercel for frontend hosting and optional backend REST API proxying.

---

## Docker Compose (recommended for full app)

This is the best option for the complete Tinau Quiz app because it includes:
- MongoDB
- backend API
- frontend UI
- Socket.io support
- media uploads via mounted volume

### Start locally

```bash
cd tinau-quiz-app
docker compose up --build
```

### Access the app

- Frontend / public board: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

### Environment

The Docker Compose setup already configures the backend and frontend environment variables.
If you need to override values, create a `.env` file next to `docker-compose.yml` and use:

```dotenv
JWT_SECRET=your_secret_here
ADMIN_EMAIL=ADMIN@tinau.com
ADMIN_PASS=tebs@2056
CLIENT_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Notes

- Backend uploads are saved in the Docker volume `backend_uploads`.
- Mongo data is persisted in the `mongo_data` volume.

---

## Vercel (frontend + REST API proxy)

The repository includes a `vercel.json` file and a Vercel API entrypoint at `api/index.js`.
This setup is intended for frontend deployment and proxying REST API requests to `/api`.

### Recommended Vercel configuration

1. Connect the repository to Vercel.
2. Ensure the project root contains `vercel.json` and `api/index.js`.
3. Set any required Vercel environment variables if you deploy the backend APIs:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASS`

### Build settings

Vercel should use the default settings from `vercel.json`:
- Install command: `pnpm install`
- Build command: `pnpm --dir frontend build`
- Output directory: `frontend/dist`

### Important caveats

- The backend API can be served as a Vercel function for basic REST routes, but Vercel serverless functions do not support persistent Socket.io websocket connections.
- Socket.io requires a long-running socket server, so full realtime support should use Docker Compose or another container runtime where your backend stays online continuously.
- If you run the frontend on Vercel and backend elsewhere, set environment variables:
  - `VITE_API_URL=https://your-backend-url/api`
  - `VITE_SOCKET_URL=https://your-backend-url`
- The frontend uses relative `/api` URLs by default for same-origin Vercel hosting.

---

## pnpm local development

If you want to run each part separately without Docker:

```bash
pnpm install --recursive

cd backend
cp ../.env.example .env
pnpm dev

cd ../frontend
pnpm dev
```

### Frontend env override

Set `VITE_API_URL` and `VITE_SOCKET_URL` when running locally if you want to connect to a different backend:

```bash
VITE_API_URL=http://localhost:5000/api VITE_SOCKET_URL=http://localhost:5000 pnpm dev
```

---

## Summary

- Use Docker Compose for the full experience.
- Use Vercel for frontend hosting and basic REST API proxying.
- Use local `pnpm` only for development.
