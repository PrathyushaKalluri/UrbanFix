# UrbanFix

UrbanFix is an expert matching platform that connects users with qualified service providers. It features real-time messaging, semantic expert search, and intelligent matching algorithms.

---

## Architecture

UrbanFix runs a **dual-backend** architecture:

```
Frontend (React + Vite)
    │
    ▼
Vite Dev Proxy
    │
    ├──▶ Spring Boot (Port 8080)
    │       Auth, Messaging REST API, WebSocket, Basic Expert List
    │
    └──▶ Python/FastAPI (Port 8000)
            Expert Search, Matching Engine, Expert Detail
    │
    ▼
PostgreSQL (Port 5432)  ←── Shared database
    │
    ▼
Redis (Port 6379)       ←── Caching, Presence, Offline Queue
```

Both backends connect to the **same** PostgreSQL database. The Spring Boot backend auto-creates the JPA schema, and the Python backend auto-creates its SQLAlchemy schema on startup.

---

## Quick Start

### Prerequisites

- **Docker Desktop** (for PostgreSQL + Redis)
- **Node.js** 18+
- **Python** 3.10+
- **Java** 21+ & **Maven** 3.8+

### 1. Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL 16 and Redis 7. The database **auto-seeds** on first startup from `database_migration/init/01_seed_data.sql`.

> If you have a local PostgreSQL running, stop it first to avoid port conflicts: `brew services stop postgresql@16`

### 2. Install Java Dependencies

Spring Boot uses Maven. Dependencies auto-download on first run:

```bash
cd backend
./mvnw clean install -DskipTests
```

> **Prerequisites**: Java 21+ and Maven 3.8+ must be installed. Maven Wrapper (`./mvnw`) is included.

### 3. Start Spring Boot Backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`. Handles authentication, messaging, and WebSocket.

### 4. Install Python Dependencies

The FastAPI backend requires a virtual environment. All Python packages are listed in `backend/requirements.txt`:

```bash
cd backend

# Create virtual environment (first time only)
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

> **Required**: Do not skip the venv step. The Python backend will fail without its dependencies.

**Key Python dependencies** (`backend/requirements.txt`):

- `fastapi` — Web framework
- `uvicorn` — ASGI server
- `psycopg[binary]` — PostgreSQL driver
- `redis` — Redis client
- `python-jose` — JWT handling
- `bcrypt` — Password hashing

### 5. Start Python Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Runs on `http://localhost:8000`. Handles expert search and matching.

### 6. Install Frontend Dependencies

```bash
cd frontend

# Install Node.js dependencies (first time only)
npm install
```

> **Prerequisites**: Node.js 18+ must be installed.

### 7. Start Frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Backend Routing

The Vite dev server proxies API requests to the appropriate backend:

| Path                  | Backend        | Port |
| --------------------- | -------------- | ---- |
| `/api/auth/*`         | Spring Boot    | 8080 |
| `/api/messages/*`     | Spring Boot    | 8080 |
| `/ws/*`               | Spring Boot    | 8080 |
| `/api/experts/all`    | Spring Boot    | 8080 |
| `/api/experts/search` | Python/FastAPI | 8000 |
| `/api/matching/*`     | Python/FastAPI | 8000 |

---

## Project Structure

```
UrbanFix/
├── backend/                  # Spring Boot + Python backends
│   ├── src/main/java/        # Java source (Spring Boot)
│   ├── app/                  # Python FastAPI source
│   ├── pom.xml               # Maven config
│   └── requirements.txt      # Python deps
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   └── vite.config.ts
├── src/                      # Python matching engine core
│   ├── matching_engine/
│   ├── routing_engine/
│   └── event_bus/
├── database_migration/       # DB migration scripts
│   └── init/                 # Docker auto-seed scripts
├── docker-compose.yml        # PostgreSQL + Redis
```

---

## Key Features

- **Real-time Messaging**: WebSocket/STOMP with read receipts, delivery tracking, and presence indicators
- **Expert Search**: Semantic search across expert skills, locations, and availability
- **Matching Engine**: Intelligent expert-job matching with multi-criteria scoring
- **Dual Backend**: Spring Boot for auth/messaging, Python/FastAPI for search/matching
- **Dockerized Infrastructure**: One-command setup with auto-seeded database
