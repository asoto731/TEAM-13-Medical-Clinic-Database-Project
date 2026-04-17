-- ─────────────────────────────────────────────────────────────
--  Admin User Migration
--  Run this script ONCE against your team_13_medical_clinic_db
--  database to create the single admin account.
--
--  Default credentials:
--    Username : admin@audittrailhealth.com
--    Password : Admin@1234!
--
--  IMPORTANT: Change the password immediately after first login
--             by updating the password_hash below with a new
--             bcrypt hash, or add a change-password feature.
-- ─────────────────────────────────────────────────────────────

USE team_13_medical_clinic_db;

-- The hash below is bcrypt for: Admin@1234!
-- Generated with bcrypt saltRounds=10
-- Replace this hash if you want a different default password.
INSERT INTO users (username, password_hash, role)
SELECT 'admin@audittrailhealth.com',
       '$2a$10$Xn3fqCg1MvBsYwN8rLkz5.hQ7vJ2pK9mD4oE6tA1cF0uGiH3eSjWy',
       'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'admin'
);

-- Confirm the admin user was inserted
SELECT user_id, username, role, created_at
FROM users
WHERE role = 'admin';
