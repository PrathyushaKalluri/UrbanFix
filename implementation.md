# Task 4: Implementation & Analysis

This section covers the development of the UrbanFix prototype and provides a comparative analysis of the implemented architecture against a simpler alternative.

## Prototype Development

UrbanFix is a home-services platform that connects users with service experts based on service type, location, and current availability. The prototype was developed as a hybrid system with a React frontend, a Spring Boot application for authentication and expert profile management, and a Python FastAPI service for expert search and recommendation logic.

The prototype intentionally focuses on one non-trivial end-to-end functionality rather than the full product: **expert registration, availability management, and user-side expert discovery**. The implemented flow covers the most important path in the system:
- experts register their service profile and working area,
- the platform stores and updates expert availability,
- users search for experts by service and Hyderabad area,
- and the system returns ranked expert cards for direct contact.

The current implementation uses PostgreSQL as the shared persistence layer for expert and authentication data. This helps keep user-facing availability and expert profile updates synchronized across the stack.

## Core Functionality & Architectural Design

The UrbanFix prototype demonstrates the following core functionality, aligned with the implemented architecture:

### Authentication & Role-Based Access
The system supports separate user roles for residents and experts. Spring Boot handles secure sign-up, login, and session profile retrieval, while the React application renders different experiences based on the authenticated role.

### Expert Registration & Profile Management
Experts can register with their primary expertise, years of experience, service area, and expertise tags. The profile is persisted in PostgreSQL and exposed to both the expert dashboard and the user-facing expert directory.

### Area-Aware Expert Discovery
Users search by service type and select a Hyderabad area from a dropdown. The frontend then requests matching experts using the selected area’s coordinates, allowing the system to rank nearby experts more meaningfully.

### Availability Management
Experts can pause or resume availability from the expert dashboard. The availability change is written to the backend and reflected in the same shared database, so user-facing cards can show whether an expert is currently accepting jobs.

### Expert Ranking & Recommendation
The Python matching service scores experts using a combination of skill overlap, years of experience, availability, reputation metrics, response time, and location proximity. This produces ranked recommendations that are presented as expert cards in the user dashboard.

### Responsive Dashboard Experience
The React frontend provides a clean dashboard layout for users and experts. It renders horizontal expert cards, live status badges, and role-specific views for search, chat entry points, and expert operations.

## Architectural Design Highlights

### Hybrid Service Architecture
UrbanFix uses a hybrid architecture rather than a single codebase for all responsibilities:
- **React + Vite** for the frontend UI,
- **Spring Boot** for authentication and expert profile operations,
- **Python FastAPI** for matching and search logic.

### Shared PostgreSQL Source of Truth
The live expert profile and availability data are read from and written to PostgreSQL. This is important because it prevents the user dashboard and expert dashboard from drifting apart when availability changes.

### Separation of Concerns
The implementation separates the major responsibilities into distinct layers:
- UI rendering and user interactions in the frontend,
- account/session/profile management in Spring Boot,
- ranking and expert discovery in Python,
- and persistence in PostgreSQL.

### Cache and Snapshot Support
The Python service includes cache and shard-store abstractions for performance and offline-style lookups. These are useful for optimization, but the current implementation keeps PostgreSQL as the live source for expert availability so the UI remains consistent.

## Architectural Deployment Figure

The following figure summarizes the implemented UrbanFix deployment and compares it with a single monolithic alternative.

![Figure 24: Different components involved in deployment for UrbanFix](docs/figures/urbanfix-deployment-architecture.svg)

🗒 Observation

The hybrid UrbanFix deployment keeps authentication/profile management and matching logic separated, while still relying on PostgreSQL as the shared live data source. This gives better separation of concerns than a monolith without introducing multiple live databases.

## Non-Functional Requirement Evaluation

To satisfy the architectural analysis requirement, UrbanFix can be evaluated using at least two measurable non-functional requirements: **response time** and **throughput**. The goal is not to benchmark the entire production system, but to measure the implemented prototype under repeatable local test conditions.

#### 1. Response Time (Measured using curl)

**Endpoint tested:** `GET /api/experts/search?page=1&pageSize=20&search=plumbing`  
**Environment:** Local machine (macOS), backend running on `localhost:8000`  
**Samples collected:** 30 (after warm-up)

**Commands used**
```bash
for i in {1..5}; do
  curl -s -o /dev/null "http://localhost:8000/api/experts/search?page=1&pageSize=20&search=plumbing"
done

for i in {1..30}; do
  curl -s -o /dev/null -w "%{time_total}\n" \
  "http://localhost:8000/api/experts/search?page=1&pageSize=20&search=plumbing"
done > times.txt

awk '{sum+=$1} END {printf "Average: %.4f sec\n", sum/NR}' times.txt
sort -n times.txt | head -n 1
sort -n times.txt | tail -n 1
count=$(wc -l < times.txt)
p95_index=$(( (95 * count + 99) / 100 ))
sort -n times.txt | sed -n "${p95_index}p"
```

**Calculation summary**

| Metric | Value (seconds) | Value (ms) |
|---|---:|---:|
| Average | 0.0229 | 22.9 |
| Min | 0.014491 | 14.491 |
| Max | 0.061008 | 61.008 |
| P95 | 0.057868 | 57.868 |

**P95 calculation**
- Sort all response times ascending.
- Compute index: `ceil(0.95 * N)` where `N` is number of samples.
- With `N = 30`, index = `29`.
- 29th value in sorted list = `0.057868 sec` (P95).

**Evidence (terminal execution screenshot)**
![Response time measurement using curl](docs/figures/response-time-execution.png)

**Observation**
Average latency is low (~22.9 ms), while P95 is ~57.9 ms, indicating stable response with a small tail under local test conditions.

#### 2. Throughput (Measured using curl)

**Endpoint tested:** `GET /api/experts/search?page=1&pageSize=20&search=plumbing`  
**Environment:** Local machine (macOS), backend at `localhost:8000`  
**Load profile:** `TOTAL=200`, `CONCURRENCY=20`

**Execution summary**
- Elapsed time: **3.035551 s**
- Total requests: **200**
- Successful requests (HTTP 200): **110**
- Failed requests (HTTP 429): **90**
- Throughput: **36.24 req/s**
- Error rate: **45.00%**

**Latency on successful requests only (HTTP 200)**
- Average: **0.202714 s** (202.714 ms)
- Min: **0.020769 s** (20.769 ms)
- Max: **0.530151 s** (530.151 ms)
- P95: **0.487314 s** (487.314 ms)

**Formula used**
\[
\text{Throughput}=\frac{\text{Successful Requests}}{\text{Elapsed Time}}
=\frac{110}{3.035551}=36.24\ \text{req/s}
\]

\[
\text{Error Rate}=\frac{\text{Failed Requests}}{\text{Total Requests}}\times100
=\frac{90}{200}\times100=45.00\%
\]

**Observation**
At concurrency 20, the system handled ~36 requests/second but returned many HTTP 429 responses. This indicates throttling/rate-limiting or saturation under burst load. The architecture can serve requests quickly when accepted, but reliability drops at this load level.

**Trade-off discussion**
- Higher concurrency improves raw request pressure but increases rejection/error rate.
- Strict throttling protects service stability, but reduces perceived availability under bursts.
- For UrbanFix, correctness and stability are prioritized over accepting all burst traffic, which is suitable for production safety but impacts peak throughput.
## Key Workflows

The prototype showcases the following key workflows that are essential to UrbanFix’s operation:

### User Signup & Login Workflow
1. A user or expert opens the signup page.
2. The frontend submits the form to the Spring Boot authentication API.
3. Spring Boot creates the account and stores the profile data in PostgreSQL.
4. The user receives a JWT session token.
5. The frontend stores the token and loads the role-specific dashboard.

### Expert Registration Workflow
1. An expert signs up with name, email, password, expertise, and service area.
2. Spring Boot normalizes the expert data.
3. The expert profile is saved to PostgreSQL.
4. The expert dashboard is loaded with the persisted profile state.

### Availability Toggle Workflow
1. The expert clicks pause or resume availability on the dashboard.
2. The frontend sends a `PATCH` request to the backend.
3. Spring Boot updates the expert profile record in PostgreSQL.
4. The updated availability is returned to the frontend.
5. The user-facing expert directory reads the same updated value.

### Service Search & Expert Matching Workflow
1. A resident enters a service request such as plumbing or electrical work.
2. The frontend sends the query and selected Hyderabad area coordinates.
3. The Python matching service fetches expert data from PostgreSQL.
4. Experts are filtered and ranked by relevance, distance, and availability.
5. The frontend displays the returned experts as cards with availability badges.

### Expert Directory Display Workflow
1. The frontend calls the expert directory or matching endpoint.
2. The response is normalized into a common `ExpertListing` shape.
3. Availability is rendered as either “Accepting jobs” or “Not accepting jobs”.
4. The resident can then open the expert profile or start a chat flow.

## Technologies & Tools

### Frontend Technologies
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React icons

### Backend Technologies
- Java
- Spring Boot
- Spring Security
- Hibernate / JPA
- Python
- FastAPI
- PostgreSQL

### Data & Infrastructure
- PostgreSQL for shared application data
- Docker Compose for local database setup


### Development Tools
- VS Code
- Git and GitHub
- Postman or browser dev tools for API inspection
- Maven for Spring Boot builds
- npm for the frontend build

## Architecture Analysis

This page provides a detailed analysis of the UrbanFix architecture, comparing it with simpler alternatives and evaluating its suitability for the current prototype.

### Hybrid Architecture vs. Single Full-Stack Monolith

We compared the implemented hybrid architecture against a single monolithic application to evaluate the trade-offs and validate the design.

| Aspect | Hybrid Architecture (Implemented) | Single Monolithic Application (Alternative) |
|---|---|---|
| Development complexity | Higher, because the system spans React, Spring Boot, and Python | Lower, because all logic sits in one codebase |
| Scalability | Individual services can evolve and scale independently | Entire application scales together |
| Deployment | Separate backend components can be deployed independently | One deployment unit for the whole app |
| Technology fit | Each service uses the most suitable tool for its job | One technology stack must handle everything |
| Fault isolation | Issues in one layer do not automatically break all layers | A failure can affect the whole application |
| Team coordination | Frontend, auth, and matching work can move in parallel | More coupled development process |
| Maintenance | Clearer ownership per service, but more integration points | Simpler structure, but harder to evolve safely |

🗒 Observation

The hybrid architecture introduces additional integration effort, but it gives UrbanFix a better fit for expert matching, authentication, and dashboard UX than a single monolith would.

### PostgreSQL as a Shared Database vs. Separate Datastores

UrbanFix was designed to keep expert availability and profile data in one shared PostgreSQL source of truth.

| Aspect | Shared PostgreSQL (Implemented) | Separate Datastores (Alternative) |
|---|---|---|
| Data consistency | Higher, because all services read the same live records | Lower, because data can drift between stores |
| Availability updates | Changes appear across dashboards and matching results consistently | Updates may show in one service but not another |
| Operational simplicity | Easier to reason about and debug | More moving parts and synchronization risk |
| Performance tuning | Can still use caching around the shared DB | Separate stores can optimize different access patterns |
| Maintenance | Simpler schema management | Schema duplication and sync logic are required |

🗒 Observation

Using one authoritative PostgreSQL database for live expert state is the safest choice for UrbanFix because it prevents the exact discrepancy where experts pause availability but users still see them as accepting jobs.

### Python Matching Reads vs. Cached Shard Snapshot Reads

The Python matching layer originally had a shard-store snapshot path for faster lookups. For live expert availability, however, the implementation now uses the PostgreSQL repository so the displayed status reflects the most recent update.

| Aspect | Live PostgreSQL Reads (Implemented) | Snapshot-Based Reads (Alternative) |
|---|---|---|
| Freshness | Always reflects the latest update | Can become stale until resynced |
| Consistency | Stronger consistency across dashboards | Risk of different views showing different states |
| Debugging | Easier to trace source of truth | More difficult because data may live in multiple layers |
| Performance | Slightly more expensive than a local snapshot | Faster for repeated reads |

🗒 Observation

For a user-facing availability flag, freshness matters more than local snapshot speed. That is why the live PostgreSQL path is preferred for UrbanFix’s current prototype.

## Performance & Implementation Notes

The prototype was built to keep the most important user journeys lightweight:
- expert cards are rendered directly from normalized API payloads,
- matching results are ranked and filtered before rendering,
- and the expert dashboard updates availability optimistically to keep the interface responsive.

At this stage, the implementation focuses on correctness and consistency more than heavy optimization. Future improvements can add stronger cache invalidation, richer analytics, and more advanced search ranking.

## Decision Rationale

After reviewing the prototype implementation, the following design choices were adopted:

- **Single live PostgreSQL source of truth**: keeps availability and profile data consistent across services.
- **Spring Boot for auth and profile updates**: provides secure session handling and structured account management.
- **Python FastAPI for matching**: keeps the expert ranking logic isolated and easier to evolve.
- **React + Vite for the frontend**: gives a fast and flexible dashboard experience.
- **Hyderabad area-based matching**: improves relevance without requiring live GPS tracking.

🗒 Conclusion

UrbanFix’s current architecture balances practical implementation speed with clean separation of responsibilities. The system is intentionally hybrid, but it remains consistent by relying on PostgreSQL as the shared live store for expert state.

