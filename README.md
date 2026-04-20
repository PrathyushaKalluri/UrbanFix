# UrbanFix Backend System Design

Professional backend architecture for a scalable expert matching platform.

## 📚 Documentation Overview

This design documents the complete backend system for **UrbanFix** — a platform that matches users with problems to qualified expert service providers.

### Key Design Principles

- ✅ **Modularity**: Clear separation of concerns
- ✅ **Testability**: Core logic independently testable
- ✅ **Extensibility**: Easy to add new features
- ✅ **Scalability**: Path to horizontal scaling
- ✅ **Maintainability**: Clean code, clear responsibilities

---

## 📖 Documentation Files

### 1. **[DATA_MODELS.md](DATA_MODELS.md)**

**Database schema & entity definitions**

- Entity definitions (User, Expert, Job, Match, Feedback, etc.)
- Database tables (SQL)
- Relationships diagram
- Value objects
- Indexes & optimization
- Query patterns

### 2. **Source Code**

Core implementation is under [src](src):

- [src/matching_engine](src/matching_engine): matching pipeline and scoring strategies
- [src/routing_engine](src/routing_engine): fallback assignment routing using Chain of Responsibility
- [src/event_bus](src/event_bus): event bus abstraction with Kafka/in-memory support
- [src/services](src/services): query publisher, matching consumer, notification consumer

### 3. **Examples**

Runnable examples are under [examples](examples):

- [examples/matching_example.py](examples/matching_example.py): direct matching pipeline
- [examples/routing_example.py](examples/routing_example.py): ranked experts -> fallback assignment flow
- [examples/event_driven_flow_example.py](examples/event_driven_flow_example.py): RequestCreated -> MatchFound -> Notification flow

### 4. **Tests**

Tests are under [tests](tests):

- [tests/test_event_flow.py](tests/test_event_flow.py)
- [tests/test_matching_performance.py](tests/test_matching_performance.py)

---

## 🎯 Quick Navigation

### 💻 For Developers

1. Read: [DATA_MODELS.md](DATA_MODELS.md) → Understand entities and schema
2. Implement in: [src/matching_engine](src/matching_engine) and [src/services](src/services)
3. Validate with: [tests](tests)
4. Run examples from: [examples](examples)

### 🏗️ For Architects

1. Review domain models in [DATA_MODELS.md](DATA_MODELS.md)
2. Review implementation boundaries in [src](src)
3. Validate decoupling in [src/event_bus](src/event_bus)

### 🔧 For DevOps/Deployment

1. Check runtime modules in [src](src)
2. Use examples in [examples](examples) for smoke testing
3. Keep environment values in `.env` (not committed)

### 🧪 For QA/Testing

1. Run test suite under [tests](tests)
2. Validate scoring behavior in [tests/test_strategies.py](tests/test_strategies.py)
3. Validate event flow in [tests/test_event_flow.py](tests/test_event_flow.py)

---

## 🏗️ Architecture at a Glance

### System Layers

```
┌─────────────────────────────────────────────────────┐
│  API Layer (Routes, Controllers)                    │
│  - HTTP request handling                            │
│  - Request validation                               │
│  - Response formatting                              │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  Service Layer (Business Orchestration)             │
│  - Coordinates domain logic                         │
│  - Manages transactions                             │
│  - Publishes events                                 │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  Domain Layer (★ CORE BUSINESS LOGIC)               │
│  - Matching Engine (independent, testable)          │
│  - Ranking Engine                                   │
│  - Routing Engine                                   │
│  - Feedback Processor                               │
│  - Pure algorithms, no I/O                          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  Repository Layer (Data Abstraction)                │
│  - User Repository                                  │
│  - Expert Repository                                │
│  - Job Repository                                   │
│  - Match Repository                                 │
│  - Feedback Repository                              │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  Infrastructure Layer (Abstractions)                │
│  - Cache Provider (Redis, in-memory)                │
│  - Event Bus (Kafka, RabbitMQ, in-memory)          │
│  - Database Client                                  │
│  - Logger                                           │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  External Systems                                   │
│  - PostgreSQL Database                              │
│  - Redis Cache                                      │
│  - Kafka/RabbitMQ Message Queue                     │
│  - AWS/External APIs                                │
└─────────────────────────────────────────────────────┘
```

### Key Modules

#### 🔍 **Matching Engine** (Core)

- Finds semantically similar experts to a job
- Scores relevance based on skills, experience, ratings
- Ranks by multi-criteria algorithm
- **Isolated**: No HTTP/DB, 100% testable

#### 📍 **Routing Engine**

- Consumes ranked experts and routes top-3 with fallback handling
- Uses Chain of Responsibility so each expert handler can accept or pass along
- Assigns first accepting expert and cancels remaining outstanding candidates
- Simulates acceptance/rejection behavior for deterministic tests and demos

#### ⭐ **Ranking System**

- 3-layer pipeline:
    1. **Hard Filters**: Eliminate incompatible experts
    2. **Soft Scoring**: Relevance calculation
    3. **Business Rules**: Context-specific adjustments

#### 📝 **Feedback System**

- Collects ratings & reviews
- Aggregates quality metrics
- Detects anomalies
- Updates expert reputation

---

## 🔑 Key Concepts

### Performance & Scalability

- Radius filtering now uses a two-step approach: bounding-box prefilter, then exact Haversine.
- For large expert pools, index-assisted lookup is auto-enabled (sorted-latitude by default, quadtree for production-scale spatial lookup).
- Complexity shifts from full scan $O(n)$ toward $O(\log n + k)$ candidate lookup (where $k$ is nearby experts returned).
- Matching responses are cached by normalized query signature (location, skills, radius, experience, top-k) to avoid recomputation for repeated requests.
- Target path for production: Redis-backed cache + geospatial index (QuadTree) to keep p95 matching latency under 150ms at scale.

Example factory configuration for production:

```python
from matching_engine import build_default_engine

engine = build_default_engine(
    enable_result_cache=True,
    cache_backend="redis",
    redis_url="redis://localhost:6379/0",
    spatial_index_backend="quadtree",
    spatial_index_threshold=2000,
)
```

Install Redis Python client when using Redis cache provider:

```bash
pip install redis
```

Run synthetic benchmark and report p50/p95/p99 latency:

```bash
python scripts/benchmark_matching.py --experts 20000 --queries 1000 --warmup 100 --index-backend quadtree
```

### Modular Design

Each module has:

- **Interface** (contract)
- **Implementation** (logic)
- **Tests** (isolated, no infrastructure)
- **Dependency Injection** (mockable)

### Testability

```
Unit Tests       (ms)   - Algorithm tests, no DB
Integration Tests (s)   - Service coordination
E2E Tests        (10s+) - Full workflows
```

### Extensibility

- Swap matching algorithms without changing API
- Add new cache/event providers easily
- Extract services to microservices later
- ML model replaces entire engine if needed

### Scalability Path

1. **Phase 1** (Now): Monolith with modular code
2. **Phase 2**: Async workers + event bus
3. **Phase 3**: Extract to microservices
4. **Phase 4**: ML-enhanced matching

---

## 📊 Core Entities

| Entity       | Purpose            | Key Fields                                    |
| ------------ | ------------------ | --------------------------------------------- |
| **User**     | Problem submitter  | id, email, location, roles                    |
| **Expert**   | Service provider   | id, skills, categories, rating, availability  |
| **Job**      | Problem/request    | id, title, category, budget, timeline, status |
| **Match**    | Expert-Job pairing | jobId, expertId, confidenceScore, status      |
| **Feedback** | Rating & review    | jobId, expertId, rating, comments             |
| **Skill**    | Expertise area     | name, category, embedding (for matching)      |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Python 3.10+
- PostgreSQL 14+
- Redis 7+
- Docker (recommended)

### Quick Start

```bash
# 1. Clone & install
git clone <repo>
npm install

# 2. Setup environment
cp .env.example .env

# 3. Start infrastructure
docker-compose up

# 4. Run migrations
npm run db:migrate

# 5. Seed sample data
npm run db:seed

# 6. Start server
npm run dev
```

Server runs on `http://localhost:3000`

---

## 📋 Implementation Checklist

- [ ] **Phase 1: Core Setup**
    - [ ] Folder structure created
    - [ ] Database schema created
    - [ ] Base interfaces defined
    - [ ] Dependency injection configured

- [ ] **Phase 2: Matching Engine**
    - [ ] Skill matcher implemented
    - [ ] Relevance scorer implemented
    - [ ] Ranking engine implemented
    - [ ] Filter engine implemented
    - [ ] Unit tests ≥ 80% coverage

- [ ] **Phase 3: APIs**
    - [ ] POST /match endpoint
    - [ ] GET /match/:id endpoint
    - [ ] POST /feedback endpoint
    - [ ] Integration tests

- [ ] **Phase 4: Infrastructure**
    - [ ] Cache layer working
    - [ ] Event bus working
    - [ ] Logging configured
    - [ ] Error handling

- [ ] **Phase 5: Polish**
    - [ ] Performance tuning
    - [ ] Security audit
    - [ ] Documentation
    - [ ] Deployment guides

---

## 🔐 Security Considerations

- JWT authentication for all endpoints
- Password hashing with bcrypt
- SQL injection prevention (parameterized queries)
- CORS configuration
- Rate limiting (1000 requests/hour for auth, 10 for matching)
- Input validation on all endpoints
- Secrets in environment variables (never committed)

Follow standard secret management practices: never commit secrets, use environment variables and secret stores.

---

## 📈 Monitoring & Observability

### Key Metrics

- Matching time (p95, p99)
- Cache hit rate
- Database query performance
- Event bus lag
- Expert utilization
- Service uptime

### Logging Strategy

```
[TIMESTAMP] [COMPONENT] [LEVEL] Message | {Context}
[2025-04-18 10:30:15] [MatchService] INFO Finding matches | {jobId, categoryCount: 3}
```

### Health Checks

```
GET /health
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "cache": "ok",
    "eventBus": "ok"
  }
}
```

---

## 🤝 Contributing

When adding new features:

1. **Check architecture** - Fits into existing layers?
2. **Define interface** - Add under [src/event_bus](src/event_bus) or module contracts under [src/matching_engine](src/matching_engine)
3. **Add tests** - Unit test in isolation
4. **Document** - Update this README or inline module docstrings
5. **Get review** - Architecture review before implementation

---

## 📞 Support

| Question                    | Reference                            |
| --------------------------- | ------------------------------------ |
| What does X entity have?    | Check DATA_MODELS.md                 |
| How does matching work?     | Check src/matching_engine            |
| How does event flow work?   | Check src/event_bus and src/services |
| How do I run examples?      | Check examples                       |
| How do I validate behavior? | Check tests                          |

---

## 📝 License

© 2025 UrbanFix Project. All rights reserved.

---

**Last Updated**: April 18, 2025
**Status**: Design Complete, Ready for Implementation
**Version**: 1.0.0

---

## Quick Links

- 🗄️ [Data Models & Schema](DATA_MODELS.md)
- 🧠 [Matching Engine Source](src/matching_engine)
- 📨 [Event Bus Source](src/event_bus)
- ⚙️ [Service Consumers/Publishers](src/services)
- 🧪 [Tests](tests)
- ▶️ [Examples](examples)
