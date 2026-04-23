# UrbanFix

UrbanFix is an expert matching platform that connects users with qualified service providers. It features real-time messaging, intelligent expert search, and multi-criteria matching algorithms.

---

## Architecture

UrbanFix uses a **single-backend** architecture:

```
Frontend (React + Vite + TypeScript)
    │
    ▼
Traefik (Reverse Proxy)
    │
    ▼
Spring Boot (Port 8080)
    Auth, Messaging REST API, WebSocket, Expert Search, Matching
    │
    ▼
PostgreSQL (Port 5432)  ←── Primary database
    │
    ▼
Redis (Port 6379)       ←── Caching, Presence, Offline Queue
    │
    ▼
MinIO (Port 9000)       ←── Chat attachments
```

---

## Quick Start

### Prerequisites

- **Docker Desktop** (for PostgreSQL, Redis, MinIO, Traefik, Prometheus, Grafana)
- **Node.js** 20+
- **Java** 21+ & **Maven** 3.8+

### 1. Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL 16, Redis 7, MinIO, Traefik, Prometheus, Grafana, and the OpenTelemetry Collector. The database **auto-seeds** on first startup from `database_migration/init/01_seed_data.sql`.

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

Runs on `http://localhost:8080`. Handles authentication, messaging, WebSocket, expert search, and matching.

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

> **Prerequisites**: Node.js 20+ must be installed.

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Backend Routing

The Vite dev server proxies all API requests to Spring Boot:

| Path              | Backend     | Port |
| ----------------- | ----------- | ---- |
| `/api/auth/*`     | Spring Boot | 8080 |
| `/api/messages/*` | Spring Boot | 8080 |
| `/api/experts/*`  | Spring Boot | 8080 |
| `/api/matching/*` | Spring Boot | 8080 |
| `/ws/*`           | Spring Boot | 8080 |

---

## Project Structure

```
UrbanFix/
├── backend/                  # Spring Boot backend
│   ├── src/main/java/        # Java source
│   ├── src/test/java/        # Java tests
│   ├── pom.xml               # Maven config
│   └── src/main/resources/application.properties
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   ├── e2e/                  # Playwright E2E tests
│   ├── vitest.config.ts
│   └── playwright.config.ts
├── database_migration/       # DB migration scripts
│   └── init/                 # Docker auto-seed scripts
├── observability/            # Prometheus, Grafana, OTel configs
├── docker-compose.yml        # Full infrastructure stack
└── .github/workflows/ci.yml  # GitHub Actions CI
```

---

## Key Features

- **Real-time Messaging**: WebSocket/STOMP with read receipts, delivery tracking, and presence indicators
- **Expert Search**: Full-text search across expert skills, locations, and availability with pagination
- **Matching Engine**: Intelligent expert-job matching with multi-criteria scoring (skill, experience, availability, location)
- **Single Backend**: Spring Boot handles auth, messaging, search, and matching
- **Dockerized Infrastructure**: One-command setup with auto-seeded database
- **Observability**: Prometheus metrics, Grafana dashboards, and OpenTelemetry tracing
- **Object Storage**: MinIO for chat message attachments

---

## Testing

### Backend

```bash
cd backend
./mvnw test
```

Uses JUnit 5, Mockito, and Testcontainers for integration tests.

### Frontend

```bash
cd frontend
npm run test       # Vitest unit tests
npm run test:e2e   # Playwright E2E tests
```

---

## Observability

- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3000` (admin / admin)
- **Traefik Dashboard**: `http://traefik.localhost:8080`
- **MinIO Console**: `http://minio.localhost:9001`
