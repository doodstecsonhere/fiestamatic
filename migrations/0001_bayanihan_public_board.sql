CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  owner_hash TEXT NOT NULL,
  author_name TEXT NOT NULL CHECK(length(author_name) BETWEEN 2 AND 80),
  post_type TEXT NOT NULL CHECK(post_type IN ('carpool', 'shared_table', 'general')),
  barangay TEXT NOT NULL,
  message TEXT NOT NULL CHECK(length(message) BETWEEN 10 AND 500),
  contact_info TEXT CHECK(contact_info IS NULL OR length(contact_info) <= 120),
  seats_available INTEGER CHECK(seats_available IS NULL OR seats_available BETWEEN 1 AND 20),
  status TEXT NOT NULL DEFAULT 'visible' CHECK(status IN ('visible', 'hidden', 'deleted')),
  report_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS community_posts_visible_created
  ON community_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS community_posts_owner_created
  ON community_posts(owner_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS community_reports (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  reporter_hash TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT CHECK(details IS NULL OR length(details) <= 300),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, reporter_hash)
);

CREATE INDEX IF NOT EXISTS community_reports_post ON community_reports(post_id);

CREATE TABLE IF NOT EXISTS moderation_events (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);
