CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('USER', 'EXPERT', 'ADMIN')),
  PRIMARY KEY (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expert_profiles (
  user_id INTEGER PRIMARY KEY,
  primary_expertise VARCHAR(120) NOT NULL,
  years_of_experience INTEGER NOT NULL CHECK (years_of_experience >= 0),
  bio TEXT,
  is_available BOOLEAN NOT NULL DEFAULT 1,
  serves_as_resident BOOLEAN NOT NULL DEFAULT 0,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  total_jobs INTEGER NOT NULL DEFAULT 0,
  city VARCHAR(120),
  latitude REAL,
  longitude REAL,
  region_bucket VARCHAR(64),
  shard_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expert_expertise (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  skill VARCHAR(120) NOT NULL,
  UNIQUE (user_id, skill),
  FOREIGN KEY (user_id) REFERENCES expert_profiles(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expert_metrics (
  user_id INTEGER PRIMARY KEY,
  acceptance_rate NUMERIC(5,2) DEFAULT 0.00,
  completion_rate NUMERIC(5,2) DEFAULT 0.00,
  cancellation_rate NUMERIC(5,2) DEFAULT 0.00,
  avg_response_time_sec INTEGER DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES expert_profiles(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS async_jobs (
  job_id VARCHAR(64) PRIMARY KEY,
  job_type VARCHAR(80) NOT NULL,
  status VARCHAR(30) NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRY')),
  user_id INTEGER,
  payload_json TEXT NOT NULL,
  result_json TEXT,
  error_message TEXT,
  region_bucket VARCHAR(64),
  shard_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  channel VARCHAR(30) NOT NULL DEFAULT 'IN_APP',
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_expert_profiles_available ON expert_profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_primary_expertise ON expert_profiles(primary_expertise);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_available_experience ON expert_profiles(is_available, years_of_experience DESC);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_updated_at ON expert_profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_region_bucket ON expert_profiles(region_bucket);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_shard_id ON expert_profiles(shard_id);
CREATE INDEX IF NOT EXISTS idx_expert_expertise_skill ON expert_expertise(skill);
CREATE INDEX IF NOT EXISTS idx_expert_expertise_user_skill ON expert_expertise(user_id, skill);
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_async_jobs_user_status ON async_jobs(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_async_jobs_status_updated ON async_jobs(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
