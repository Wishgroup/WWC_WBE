# Run Wish Waves Club with Docker

**Prerequisite:** Start Docker Desktop (or your Docker daemon) first.

## Full stack (MySQL + backend + frontend)

From the `WWC_WBE` folder:

```bash
# Build and start all services
docker-compose up -d --build

# Run database migration (first time only)
docker-compose exec backend npm run migrate
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:3001  
- **MySQL:** localhost:3306 (user `wwc`, password `wwc_local_secret`, database `wwc_local`)

## Useful commands

```bash
# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove database volume (reset DB)
docker-compose down -v
```

## Optional: backend-only with Docker MySQL

If you prefer to run backend and frontend on your machine and only MySQL in Docker:

```bash
cd backend
docker-compose up -d
npm run migrate
npm run dev
```

Then in another terminal, from `WWC_WBE`:

```bash
npm run dev
```

Use this when `backend/.env` has `DB_HOST=127.0.0.1` (or `localhost`).
