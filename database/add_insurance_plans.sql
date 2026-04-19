-- ─── Add additional insurance providers ────────────────────────────────────
-- Run this on Railway to expand the insurance dropdown without full reseed.
-- Safe to run multiple times (INSERT IGNORE skips duplicates).

INSERT IGNORE INTO insurance (insurance_id, provider_name, policy_number, coverage_percentage, group_number, phone_number) VALUES
  (6,  'Kaiser Permanente',  'KAI-600006', 88.00, 'GRP-006', '(800) 555-5774'),
  (7,  'Anthem Blue Cross',  'ANT-700007', 79.00, 'GRP-007', '(800) 555-8742'),
  (8,  'Molina Healthcare',  'MOL-800008', 72.00, 'GRP-008', '(800) 555-6654'),
  (9,  'WellCare',           'WLC-900009', 70.00, 'GRP-009', '(800) 555-9355'),
  (10, 'Medicare',           'MED-100010', 80.00, 'GRP-010', '(800) 555-1800'),
  (11, 'Medicaid',           'MCD-110011', 90.00, 'GRP-011', '(800) 555-7200'),
  (12, 'Oscar Health',       'OSC-120012', 77.00, 'GRP-012', '(855) 555-6727');
