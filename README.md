# Spring Boot + React App

This workspace contains a TypeScript React frontend and a Spring Boot backend with JWT authentication.

## Stack

- **Frontend:** React, Vite, React Router, TypeScript, localStorage JWT session
- **Backend:** Spring Boot, Spring Security, JWT, Spring Data JPA, Validation
- **Database:** PostgreSQL

## Project Structure

- `frontend/` — route-based React app
- `backend/` — Spring Boot REST API with feature-based packages

## Frontend Structure

- `src/pages/home/` — home/landing page
- `src/pages/login/` — login page
- `src/pages/signup/` — signup pages for `USER` and `EXPERT`
- `src/pages/dashboard/` — authenticated dashboard
- `src/components/` — shared UI helpers like page shells and auth tabs
- `src/routes/` — route definitions
- `src/hooks/` — shared auth session hook
- `src/types/` — TypeScript shared types

## Backend Structure

- `backend/src/main/java/com/example/backend/auth/` — auth entities, DTOs, repository, services, controller, security filter
- `backend/src/main/java/com/example/backend/config/` — security configuration
- `backend/src/main/java/com/example/backend/web/` — API controllers and exception handling

## Prerequisites

- Node.js 18+
- Java 21+
- Maven 3.9+

## Roles

- `USER` — customer who raises home service requests
- `EXPERT` — technician who receives and manages those requests

## Routes

- `/` or `/home` — landing page
- `/login` — shared login page
- `/signup/user` — customer signup page
- `/signup/expert` — expert signup page
- `/dashboard` — authenticated landing page

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend during development.

## Backend

### PostgreSQL Setup (Docker Compose - Recommended)

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:

- DB: `urbanfix_db`
- User: `urbanfix_user`
- Password: `urbanfix_pass`

Stop it with:

```bash
docker compose down
```

### PostgreSQL Setup (macOS)

```bash
brew install postgresql@16
brew services start postgresql@16
psql postgres
```

```sql
CREATE DATABASE urbanfix_db;
CREATE USER urbanfix_user WITH ENCRYPTED PASSWORD 'urbanfix_pass';
GRANT ALL PRIVILEGES ON DATABASE urbanfix_db TO urbanfix_user;
\q
```

### Optional environment variables

```bash
export DB_URL=jdbc:postgresql://localhost:5432/urbanfix_db
export DB_USERNAME=urbanfix_user
export DB_PASSWORD=urbanfix_pass
```

### Run backend

```bash
cd backend
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`.

## API

- `POST /api/auth/register/user` creates a `USER` account
- `POST /api/auth/register/expert` creates an `EXPERT` account and expert profile details
- `POST /api/auth/login` returns a JWT token and user profile
- `GET /api/auth/me` returns the authenticated profile (and expert metadata for experts)
- `GET /api/hello` returns a simple sample response

### Expert Registration Payload

`POST /api/auth/register/expert` supports these additional fields:

- `primaryExpertise`
- `yearsOfExperience`
- `expertiseAreas` (array)
- `bio`
- `available`
- `servesAsResident`

If these fields are omitted, sensible defaults are used so existing clients continue to work.

## Database

The backend uses PostgreSQL with environment-configurable datasource properties.

Expert-specific information is stored separately from base users in dedicated tables:

- `expert_profiles`
- `expert_expertise`

## Notes

- The frontend stores the JWT in local storage.
- The role selected at signup determines which dashboard view the user sees later.
