# Database Setup – Local MySQL or cPanel

Use either **local MySQL (Docker)** for development or **cPanel MySQL** for production / shared hosting.

---

## Option A: Local MySQL (Docker)

Best for development on your machine. No cPanel needed.

### 1. Start MySQL

From the `backend` folder:

```bash
docker-compose up -d
```

Wait until MySQL is ready (usually ~10 seconds). Check with:

```bash
docker-compose ps
```

### 2. Configure environment

Ensure `backend/.env` uses the local DB values (these match `docker-compose.yml`):

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=wwc_local
DB_USER=wwc
DB_PASSWORD=wwc_local_secret
```

If you use `backend/.env.example`, the “LOCAL MYSQL” block already has these.

### 3. Run migrations

```bash
cd backend
npm run migrate
```

### 4. (Optional) Seed data

```bash
npm run seed
```

### 5. Start the backend

```bash
npm run dev
```

### Stopping local MySQL

```bash
docker-compose down
```

Data is kept in a Docker volume. **Docker must be running** for this option (e.g. start Docker Desktop).

### Local MySQL without Docker

If MySQL is already installed (e.g. Homebrew: `brew install mysql`), create the database and user yourself, then use the same env vars:

```sql
CREATE DATABASE wwc_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wwc'@'localhost' IDENTIFIED BY 'wwc_local_secret';
GRANT ALL PRIVILEGES ON wwc_local.* TO 'wwc'@'localhost';
FLUSH PRIVILEGES;
```

Use in `.env`: `DB_HOST=127.0.0.1` or `localhost`, `DB_NAME=wwc_local`, `DB_USER=wwc`, `DB_PASSWORD=wwc_local_secret`, then `npm run migrate`.

---

To reset the Docker database completely:

```bash
docker-compose down -v
docker-compose up -d
npm run migrate
```

---

## Option B: cPanel MySQL

Use when the backend runs on the same server as cPanel or when you connect from your machine to cPanel’s MySQL.

### 1. Create database and user in cPanel

1. Log in to **cPanel**.
2. Open **MySQL® Databases**.
3. **Create a database** (e.g. `username_wwcdb`).
4. **Create a user** (e.g. `username_wwcuser`) and set a strong password.
5. **Add the user to the database** and grant **ALL PRIVILEGES**.

### 2. Get connection details

- **Database name:** the one you created (e.g. `username_wwcdb`).
- **User:** the MySQL user (e.g. `username_wwcuser`).
- **Password:** the one you set for that user.
- **Host:**
  - If the **backend runs on the same server** as cPanel → use `localhost`.
  - If the **backend runs elsewhere** (e.g. your laptop) → use the host shown in **Remote MySQL®** (often your domain or the server hostname). Add your IP under “Access Hosts” if required.

### 3. Configure environment

In `backend/.env`, set:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_cpanel_db_name
DB_USER=your_cpanel_db_user
DB_PASSWORD=your_cpanel_db_password
```

For **remote** access, some hosts require SSL. In that case add:

```
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### 4. Run migrations

From the machine that will run the backend (same server as cPanel or your dev machine if remote MySQL is allowed):

```bash
cd backend
npm run migrate
```

If the database user cannot create databases, create the database manually in cPanel first; the migration will then create the tables.

### 5. Start the backend

```bash
npm run dev
```

---

## Switching between Local and cPanel

Edit only the DB_* variables in `backend/.env`:

- **Local:** use the “Local MySQL” block from `.env.example` (e.g. `DB_HOST=127.0.0.1`, `DB_NAME=wwc_local`, etc.).
- **cPanel:** use the values from cPanel and, if needed, `DB_SSL=true` and `DB_SSL_REJECT_UNAUTHORIZED=false`.

No code changes are required; the app reads everything from `.env`.
