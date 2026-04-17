-- ============================================================
--  Add Admin User
--  Run this once in MySQL Workbench (or Railway query editor)
--  Password: Admin@123  (bcrypt hash, 10 rounds)
-- ============================================================

INSERT INTO users (username, password_hash, role)
VALUES (
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWq',  -- Admin@123
  'admin'
);

-- Verify it was inserted:
-- SELECT user_id, username, role FROM users WHERE role = 'admin';
