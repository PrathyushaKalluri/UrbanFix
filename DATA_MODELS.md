# UrbanFix - Data Models & Schema

Complete entity definitions, relationships, and database schema.

---

## 1. DATA MODEL OVERVIEW

```
User
├─ Authentication data (email, password_hash)
├─ Profile (name, phone, location)
└─ Roles: USER | EXPERT | ADMIN

Expert (extends User)
├─ Skills & Certifications
├─ Rating & History
├─ Availability Schedule
├─ Pricing Model
└─ Service Area (location + radius)

Job (Request)
├─ Description & Category
├─ Requirements (skills, experience)
├─ Timeline & Budget
├─ Status tracking
└─ Attachments

Skill
├─ Semantic attributes
├─ Expert associations
└─ Category hierarchy

Match
├─ Job ← → Expert
├─ Relevance scored
├─ Lifecycle (PROPOSED → ACCEPTED → COMPLETED)
└─ Reasoning

Feedback
├─ Rating & Comments
├─ Categorized scores
├─ Impact on Expert stats
└─ Quality metrics

Availability
├─ Schedule (weekly recurrence)
├─ Blackout dates
├─ Concurrent job limits
└─ Current status
```

---

## 2. ENTITY DEFINITIONS

### User Entity

**Database Table**: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  avatar_url VARCHAR(500),
  location JSONB NOT NULL, -- { latitude, longitude, street, city, zipCode, country }
  roles TEXT[] NOT NULL DEFAULT ARRAY['USER'], -- { 'USER', 'EXPERT', 'ADMIN' }
  
  -- Security & Verification
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMP,
  
  -- Account Status
  status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'DELETED', 'INACTIVE'
  status_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  -- Indexes
  CONSTRAINT email_not_deleted CHECK (deleted_at IS NULL OR email IS NOT NULL),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_roles (roles),
  INDEX idx_created_at (created_at DESC)
);
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | ✓ | Primary key |
| email | String | ✓ | Unique, lowercase |
| password_hash | String | ✓ | Bcrypt hashed |
| name | String | ✓ | Full name |
| phone | String | | E.164 format |
| bio | String | | User biography |
| avatar_url | String | | CDN URL |
| location | Location (JSON) | ✓ | Address + coordinates |
| roles | String[] | ✓ | One or more roles |
| email_verified | Boolean | | Email confirmation |
| status | String | ✓ | Account status |
| created_at | DateTime | ✓ | Auto-populated |
| updated_at | DateTime | ✓ | Auto-updated |
| deleted_at | DateTime | | Soft delete |

**Location Object**:
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

---

### Expert Entity

**Database Table**: `experts`

```sql
CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Professional Info
  bio TEXT,
  certifications JSONB[] NOT NULL DEFAULT ARRAY[]::JSONB[], -- Array of { name, issuer, expirationDate }
  portfolio_items JSONB[] NOT NULL DEFAULT ARRAY[]::JSONB[], -- { title, description, imageUrl }
  
  -- Skills & Experience
  skills JSONB[] NOT NULL, -- Array of { name, level, yearsExperience, endorsements }
  categories TEXT[] NOT NULL, -- { 'PLUMBING', 'ELECTRICAL', etc. }
  average_experience_months INT,
  
  -- Rating & Feedback
  rating JSONB NOT NULL, -- { average: float, count: int, trend: string, breakdown: {} }
  success_rate NUMERIC(3, 2) DEFAULT 0.5 CHECK (success_rate >= 0 AND success_rate <= 1),
  response_time_minutes INT DEFAULT 120,
  
  -- Availability
  availability_status VARCHAR(50) DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'BUSY', 'UNAVAILABLE'
  availability_data JSONB, -- { status, weeklySchedule, blackoutDates }
  
  -- Pricing
  pricing_model VARCHAR(50) NOT NULL DEFAULT 'HOURLY', -- 'HOURLY', 'FIXED', 'NEGOTIABLE'
  hourly_rate NUMERIC(10, 2),
  fixed_rate NUMERIC(10, 2),
  cost_category VARCHAR(50), -- 'BUDGET', 'STANDARD', 'PREMIUM'
  
  -- Service Area
  service_radius_km INT DEFAULT 15,
  
  -- Verification & Status
  is_verified BOOLEAN DEFAULT FALSE,
  verification_type VARCHAR(50), -- 'BACKGROUND_CHECK', 'LICENSE', 'REFERENCES'
  verification_date TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'ACTIVE',
  
  -- Stats
  total_jobs_completed INT DEFAULT 0,
  total_earnings NUMERIC(12, 2) DEFAULT 0,
  member_since TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_categories (categories),
  INDEX idx_rating (rating -> 'average'),
  INDEX idx_availability_status (availability_status),
  INDEX idx_verified (is_verified),
  INDEX idx_created_at (created_at DESC)
);
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | ✓ | Primary key |
| user_id | UUID | ✓ | FK to users (unique) |
| certifications | Certification[] | | { name, issuer, expirationDate } |
| portfolio_items | PortfolioItem[] | | { title, description, imageUrl } |
| skills | Skill[] | ✓ | { name, level, yearsExperience } |
| categories | String[] | ✓ | Service categories |
| rating | Rating (JSON) | ✓ | { average, count, trend, breakdown } |
| success_rate | Float | ✓ | 0-1 (completed vs cancelled) |
| response_time_minutes | Int | ✓ | Avg response time |
| availability_status | String | ✓ | Current status |
| pricing_model | String | ✓ | HOURLY \| FIXED |
| hourly_rate | Decimal | | If hourly |
| service_radius_km | Int | ✓ | Max service distance |
| is_verified | Boolean | ✓ | Verification status |
| total_jobs_completed | Int | ✓ | Career stats |

**Skill Object**:
```json
{
  "name": "Plumbing",
  "level": "EXPERT",
  "yearsExperience": 10,
  "endorsed": true,
  "endorsements": 23,
  "certification": "Licensed Plumber NY"
}
```

**Availability Object**:
```json
{
  "status": "AVAILABLE",
  "weeklySchedule": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "maxConcurrentJobs": 2
    }
  ],
  "blackoutDates": [
    {
      "startDate": "2025-05-01",
      "endDate": "2025-05-07",
      "reason": "VACATION"
    }
  ],
  "lastUpdated": "2025-04-17T10:00:00Z"
}
```

---

### Job Entity

**Database Table**: `jobs`

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Job Basics
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- 'URGENT', 'HIGH', 'MEDIUM', 'LOW'
  skills TEXT[] NOT NULL,
  
  -- Location
  location JSONB NOT NULL, -- { latitude, longitude, street, city, zipCode }
  
  -- Budget
  budget JSONB NOT NULL, -- { amount, currency, type, maxHourlyRate }
  
  -- Timeline
  timeline JSONB NOT NULL, -- { startDate, deadline, estimatedDuration }
  
  -- Requirements
  required_experience JSONB, -- { yearsRequired, level }
  required_certifications TEXT[],
  additional_requirements JSONB, -- Custom fields
  
  -- Attachments
  attachments JSONB[] DEFAULT ARRAY[]::JSONB[], -- { filename, url, type, size }
  
  -- Status & Lifecycle
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  assigned_expert_id UUID,
  
  -- Matching
  match_count INT DEFAULT 0,
  accepted_match_id UUID,
  
  -- Feedback
  feedback_id UUID,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_expert_id) REFERENCES experts(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_location (location),
  CHECK (status IN ('PENDING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | ✓ | Primary key |
| user_id | UUID | ✓ | FK to users |
| title | String | ✓ | 10-500 chars |
| description | String | ✓ | 20-5000 chars |
| category | String | ✓ | PLUMBING, ELECTRICAL, etc. |
| priority | String | ✓ | URGENT \| HIGH \| MEDIUM \| LOW |
| skills | String[] | ✓ | Required skills |
| location | Location | ✓ | Job location |
| budget | Budget | ✓ | { amount, currency, type } |
| timeline | Timeline | ✓ | { startDate, deadline, duration } |
| required_experience | Experience | | { yearsRequired, level } |
| status | String | ✓ | Job lifecycle status |
| assigned_expert_id | UUID | | Accepted expert |
| match_count | Int | ✓ | Number of matches found |
| created_at | DateTime | ✓ | Auto-populated |
| completed_at | DateTime | | When job finished |
| cancelled_at | DateTime | | Soft delete marker |

**Budget Object**:
```json
{
  "amount": 150.00,
  "currency": "USD",
  "type": "FIXED",
  "maxHourlyRate": null
}
```

**Timeline Object**:
```json
{
  "startDate": "2025-04-18T09:00:00Z",
  "deadline": "2025-04-20T17:00:00Z",
  "estimatedDuration": "PT2H30M"
}
```

---

### Match Entity

**Database Table**: `matches`

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  expert_id UUID NOT NULL,
  
  -- Matching Score
  confidence_score NUMERIC(3, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  scoring_breakdown JSONB NOT NULL, -- { skillScore, experienceScore, etc. }
  match_reasons JSONB[] NOT NULL, -- Array of { type, description, score }
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'PROPOSED', -- 'PROPOSED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'
  
  -- Timeline
  proposed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  respond_by_date TIMESTAMP,
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Counter Offers
  counter_offer JSONB, -- If expert proposed different terms
  
  -- Alternatives
  alternative_experts UUID[] DEFAULT ARRAY[]::UUID[], -- Top runners-up
  
  -- Assignment
  assignment_details JSONB, -- { startDate, estimatedEndDate, agreedPrice }
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (expert_id) REFERENCES experts(user_id),
  UNIQUE (job_id, expert_id), -- One match per job-expert pair
  INDEX idx_job_id (job_id),
  INDEX idx_expert_id (expert_id),
  INDEX idx_status (status),
  INDEX idx_proposed_at (proposed_at DESC),
  CHECK (status IN ('PROPOSED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'))
);
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | ✓ | Primary key |
| job_id | UUID | ✓ | FK to jobs |
| expert_id | UUID | ✓ | FK to experts |
| confidence_score | Float | ✓ | 0-1 (matching score) |
| scoring_breakdown | JSON | ✓ | Detailed score components |
| match_reasons | Reason[] | ✓ | Why this match |
| status | String | ✓ | Match lifecycle |
| proposed_at | DateTime | ✓ | When proposed |
| respond_by_date | DateTime | | Deadline to respond |
| accepted_at | DateTime | | When accepted |
| counter_offer | JSON | | If expert countered |
| assignment_details | JSON | | Final agreed terms |

**MatchReason Object**:
```json
{
  "type": "SKILL",
  "description": "Expert in leak detection and faucet repair",
  "weight": 0.40,
  "score": 0.95
}
```

**ScoringBreakdown Object**:
```json
{
  "skillMatch": { "score": 0.95, "weight": 0.40 },
  "experienceMatch": { "score": 1.0, "weight": 0.25 },
  "ratingScore": { "score": 0.96, "weight": 0.20 },
  "priceAlignment": { "score": 0.85, "weight": 0.10 },
  "locationProximity": { "score": 0.90, "weight": 0.05 },
  "availabilityMatch": { "score": 1.0, "weight": 0.05 },
  "totalScore": 0.945
}
```

---

### Feedback Entity

**Database Table**: `feedback`

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL UNIQUE,
  expert_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Rating & Comments
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 0.5 AND rating <= 5),
  comments TEXT NOT NULL,
  
  -- Categorized Feedback
  categorized_feedback JSONB[] NOT NULL, -- Array of { category, score, comment }
  would_recommend BOOLEAN NOT NULL DEFAULT TRUE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Attachments (photos)
  attachments JSONB[] DEFAULT ARRAY[]::JSONB[], -- { type, url, caption }
  
  -- Quality Flags
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason VARCHAR(100),
  review_notes TEXT,
  
  -- Visibility
  visibility VARCHAR(50) DEFAULT 'PUBLIC', -- 'PUBLIC', 'PRIVATE', 'ADMIN_ONLY'
  
  -- Helpfulness
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  
  -- Metadata
  submitted_by VARCHAR(50) NOT NULL, -- 'USER', 'EXPERT'
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (expert_id) REFERENCES experts(user_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_expert_id (expert_id),
  INDEX idx_job_id (job_id),
  INDEX idx_rating (rating),
  INDEX idx_flagged (flagged),
  INDEX idx_submitted_at (submitted_at DESC)
);
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | ✓ | Primary key |
| job_id | UUID | ✓ | FK to jobs (unique) |
| expert_id | UUID | ✓ | FK to experts |
| user_id | UUID | ✓ | FK to users |
| rating | Float | ✓ | 0.5-5 (increments of 0.5) |
| comments | String | ✓ | Max 2000 chars |
| categorized_feedback | Category[] | ✓ | { category, score, comment } |
| would_recommend | Boolean | ✓ | Yes/no |
| tags | String[] | | Pre-defined tags |
| flagged | Boolean | ✓ | Anomaly detection |
| flag_reason | String | | Why flagged |
| visibility | String | ✓ | PUBLIC \| PRIVATE |
| submitted_at | DateTime | ✓ | Auto-populated |

**CategoryFeedback Object**:
```json
{
  "category": "COMMUNICATION",
  "score": 5,
  "comment": "Very responsive to messages"
}
```

---

### Skill Entity

**Database Table**: `skills`

```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Embeddings (for semantic matching)
  embedding VECTOR(768), -- Using pgvector extension
  embedding_model VARCHAR(100), -- 'sentence-transformers/all-MiniLM-L6-v2'
  embedding_updated_at TIMESTAMP,
  
  -- Analytics
  usage_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE (name, category),
  INDEX idx_category (category),
  INDEX idx_embedding (embedding) USING ivfflat
);
```

**Pre-populated Skills** (by category):

**PLUMBING**:
- Faucet Repair
- Leak Detection
- Pipe Installation
- Water Heater Service
- Drain Cleaning
- Soldering
- Blueprint Reading

**ELECTRICAL**:
- Wiring Installation
- Circuit Breaker Repair
- Outlet/Switch Installation
- Lighting Design
- Panel Upgrade
- Troubleshooting

**CARPENTRY**:
- Framing
- Finishing
- Cabinet Building
- Flooring Installation
- Door/Window Installation

---

## 3. RELATIONSHIPS DIAGRAM

```
users (1) ─→ (many) experts
  │
  ├─→ (many) jobs
  │
  └─→ (many) feedback (as user)

experts (1) ─→ (many) skills
  │
  ├─→ (many) matches
  │
  └─→ (many) feedback (as expert)

jobs (1) ─→ (many) matches
  │
  ├─→ (1) feedback
  │
  └─→ (many) attachments

matches (1) ─→ (1) job
  │
  ├─→ (1) expert
  │
  └─→ (optional) feedback

feedback (1) ─→ (1) job [UNIQUE]
  │
  ├─→ (1) expert
  │
  └─→ (1) user
  
skills (many) ─→ (many) experts [junction table: expert_skills]
```

---

## 4. VALUE OBJECTS

### Rating
```json
{
  "average": 4.78,
  "count": 47,
  "trend": "STABLE",
  "distribution": {
    "5": 35,
    "4": 10,
    "3": 2,
    "2": 0,
    "1": 0
  },
  "categoryAverages": {
    "COMMUNICATION": 4.9,
    "QUALITY": 4.7,
    "TIMELINESS": 4.6,
    "EXPERTISE": 4.8
  }
}
```

### Experience Level
```
ENTRY (0-2 years)
MID (2-5 years)
SENIOR (5-10 years)
EXPERT (10+ years)
```

### Skill Level
```
BEGINNER (< 1 year)
INTERMEDIATE (1-3 years)
EXPERT (3+ years)
MASTER (10+ years, recognized expert)
```

### Cost Category
```
BUDGET (< $50/hr)
STANDARD ($50-100/hr)
PREMIUM (> $100/hr)
```

---

## 5. INDEXES & OPTIMIZATION

**Critical Indexes** (must-have):

```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Expert queries
CREATE INDEX idx_experts_categories ON experts USING GIN(categories);
CREATE INDEX idx_experts_location ON experts USING GIST(st_point(location->>'longitude', location->>'latitude'));
CREATE INDEX idx_experts_verified ON experts(is_verified);
CREATE INDEX idx_experts_rating_desc ON experts((rating->>'average') DESC);

-- Job queries
CREATE INDEX idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_pending ON jobs(id) WHERE status = 'PENDING';
CREATE INDEX idx_jobs_location ON jobs USING GIST(st_point(location->>'longitude', location->>'latitude'));

-- Match queries
CREATE INDEX idx_matches_job_expert ON matches(job_id, expert_id);
CREATE INDEX idx_matches_expert_status ON matches(expert_id, status);
CREATE INDEX idx_matches_confidence ON matches(confidence_score DESC);

-- Feedback queries
CREATE INDEX idx_feedback_expert_rating ON feedback(expert_id, rating DESC);
CREATE INDEX idx_feedback_flagged ON feedback(flagged) WHERE flagged = TRUE;

-- Full-text search
CREATE INDEX idx_jobs_description_fts ON jobs USING GIN(to_tsvector('english', description));
CREATE INDEX idx_experts_bio_fts ON experts USING GIN(to_tsvector('english', bio));
```

---

## 6. DATABASE MIGRATIONS

**Strategy**: Forward-only migrations with rollback capability

```
migrations/
├── 001_initial_schema.up.sql
├── 001_initial_schema.down.sql
├── 002_add_user_verification.up.sql
├── 002_add_user_verification.down.sql
├── 003_create_indexes.up.sql
├── 003_create_indexes.down.sql
└── ...
```

---

## 7. QUERY PATTERNS

### Find Matching Experts (for job)
```sql
SELECT e.*, 
       (e.rating->>'average')::float as rating_avg
FROM experts e
WHERE 
  -- Category + skill match
  e.categories && ARRAY[job.category]
  -- Location within radius
  AND st_dwithin(
    st_point(e.location->>'longitude', e.location->>'latitude'),
    st_point(job.location->>'longitude', job.location->>'latitude'),
    (e.service_radius_km * 1000)::double precision
  )
  -- Experience level
  AND e.average_experience_months >= (job.required_experience->>'yearsRequired')::int * 12
  -- Availability
  AND e.availability_status = 'AVAILABLE'
  -- Pricing within budget
  AND e.hourly_rate <= (job.budget->>'maxHourlyRate')::numeric
ORDER BY (e.rating->>'average')::float DESC
LIMIT 100;
```

### Get Expert Feedback Stats
```sql
SELECT 
  expert_id,
  AVG(rating) as avg_rating,
  COUNT(*) as feedback_count,
  SUM(upvotes) as total_upvotes,
  COUNT(CASE WHEN flagged THEN 1 END) as flagged_count
FROM feedback
WHERE expert_id = $1
  AND submitted_at >= NOW() - INTERVAL '12 months'
GROUP BY expert_id;
```

---

## 8. CACHING STRATEGY

**Cache Keys** (TTL in seconds):

```
// Expert pool for matching
experts:category:{category} → 3600
experts:location:{lat},{lon}:{radius} → 1800

// Expert profiles
expert:{expertId}:profile → 7200
expert:{expertId}:rating → 1800
expert:{expertId}:availability → 600

// Job details
job:{jobId} → 1800

// Skill embeddings (rarely changes)
skills:embeddings:all → 86400
skill:embedding:{skillId} → 86400

// Rankings
matches:job:{jobId}:ranked → 300
```

---

## 9. Data Types Summary

| Concept | SQL Type | Notes |
|---------|----------|-------|
| ID | UUID | Primary keys, foreign keys |
| Money | NUMERIC(12,2) | Precise decimal for prices |
| Decimal Score | NUMERIC(3,2) | 0.00-1.00 or 0.0-5.0 |
| List/Array | TEXT[] | Categories, tags |
| Complex Object | JSONB | Nested data (budget, timeline, etc.) |
| Geolocation | POINT (via PostGIS) or JSONB | Latitude/longitude |
| Vector (ML) | VECTOR(768) (pgvector) | Skill embeddings |
| Text Search | TEXT with GIN index | Full-text search support |
