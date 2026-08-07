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
2. Run `vercel link` in your project root to link the local repo to the Vercel project.
3. Pull the latest Vercel environment variables locally with `vercel env pull`.
4. Ensure the project root contains `vercel.json` and `api/index.js`.
5. Set any required Vercel environment variables if you deploy the backend APIs:
   - `MONGO_URI` or `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASS`

#### MongoDB Atlas notes
- Use an Atlas URI like:
  `mongodb+srv://<username>:<password>@cluster0.mongodb.net/tinau_quiz?retryWrites=true&w=majority`
- If your password has special characters, URL-encode them before placing the value in the URI.
- Ensure the Atlas user has read/write access to the `tinau_quiz` database.
- Add Atlas network access for your environment:
  - for testing: `0.0.0.0/0` temporarily
  - for Vercel: configure the Atlas access list for Vercel or use `0.0.0.0/0` while validating

### Build settings

Vercel should use the default settings from `vercel.json`:
- Install command: `pnpm install`
- Build command: `pnpm --dir frontend build`
- Output directory: `frontend/dist`

### Important caveats

- This repository is a Vite + Express app, not a Next.js starter. If you want a Next.js example with MongoDB, use `npx create-next-app --example with-mongodb <project-name>`.
- The backend API can be served as a Vercel function for basic REST routes, but Vercel serverless functions do not support persistent Socket.io websocket connections.
- Socket.io requires a long-running socket server, so full realtime support should use Docker Compose or another container runtime where your backend stays online continuously.
- If you run the frontend on Vercel and backend elsewhere, set environment variables:
  - `VITE_API_URL=https://your-backend-url/api`
  - `VITE_SOCKET_URL=https://your-backend-url`
- The frontend uses relative `/api` URLs by default for same-origin Vercel hosting.
- For MongoDB on Vercel Functions, connection pool management is important to avoid leaking serverless connections. This project already uses a singleton-like DB connection cache in `backend/src/config/db.js`.

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
