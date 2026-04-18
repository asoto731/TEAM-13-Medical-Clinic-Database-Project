-- ============================================================
--  Audit Trail Health — Seed Data (Expanded v2)
--  Passwords meet strength requirements: 8+ chars, uppercase,
--  number, special character — all pre-hashed with bcrypt.
--
--  Demo credentials:
--    Patients   → email: their signup email              | password: Patient@123
--    Physicians → email: lastnameNNN@audittrailhealth.com | password: Doctor@123
--    Staff      → email: lastnameNNN@audittrailhealth.com | password: Staff@123
-- ============================================================

-- ─── Reference Tables ───────────────────────────────────────

INSERT IGNORE INTO appointment_status (status_id, status_name) VALUES
  (1, 'Scheduled'),
  (2, 'Completed'),
  (3, 'Cancelled'),
  (4, 'No-Show');

INSERT IGNORE INTO referral_status (referral_status_id, referral_status_name) VALUES
  (1, 'Requested'),
  (2, 'Issued'),
  (3, 'Accepted'),
  (4, 'Rejected'),
  (5, 'Scheduled'),
  (6, 'Completed'),
  (7, 'Expired');

-- ─── Insurance (5 providers) ────────────────────────────────

INSERT IGNORE INTO insurance (insurance_id, provider_name, policy_number, coverage_percentage, group_number, phone_number) VALUES
  (1, 'BlueCross BlueShield', 'BCB-100001', 80.00, 'GRP-001', '(800) 555-2583'),
  (2, 'Aetna',                'AET-200002', 75.00, 'GRP-002', '(800) 555-2386'),
  (3, 'UnitedHealth',         'UHC-300003', 85.00, 'GRP-003', '(800) 555-4822'),
  (4, 'Cigna',                'CIG-400004', 78.00, 'GRP-004', '(800) 555-2446'),
  (5, 'Humana',               'HUM-500005', 82.00, 'GRP-005', '(800) 555-4862');

-- ─── Clinics (8 locations across the US) ────────────────────

INSERT IGNORE INTO clinic (clinic_id, clinic_name, phone_number, street_address, city, state, zip_code) VALUES
  (1, 'Audit Trail Health Dallas',     '(214) 555-0200', '3001 Knox St Suite 200',       'Dallas',     'TX', '75205'),
  (2, 'Audit Trail Health Houston',    '(713) 555-0200', '2900 Weslayan St Suite 300',   'Houston',    'TX', '77027'),
  (3, 'Audit Trail Health Austin',     '(512) 555-0200', '3824 Medical Pkwy',            'Austin',     'TX', '78756'),
  (4, 'Audit Trail Health New York',   '(212) 555-0200', '245 E 54th St Suite 1200',     'New York',   'NY', '10022'),
  (5, 'Audit Trail Health Chicago',    '(312) 555-0200', '875 N Michigan Ave Suite 500', 'Chicago',    'IL', '60611'),
  (6, 'Audit Trail Health Los Angeles','(310) 555-0200', '8920 Wilshire Blvd Suite 300', 'Los Angeles','CA', '90211'),
  (7, 'Audit Trail Health Phoenix',    '(602) 555-0200', '2222 E Highland Ave Suite 100','Phoenix',    'AZ', '85016'),
  (8, 'Audit Trail Health Seattle',    '(206) 555-0200', '1200 5th Ave Suite 1800',      'Seattle',    'WA', '98101');

-- ─── Offices (one per clinic) ───────────────────────────────

INSERT IGNORE INTO office (office_id, clinic_id, phone_number, street_address, city, state, zip_code) VALUES
  (1, 1, '(214) 555-0200', '3001 Knox St Suite 200',       'Dallas',      'TX', '75205'),
  (2, 2, '(713) 555-0200', '2900 Weslayan St Suite 300',   'Houston',     'TX', '77027'),
  (3, 3, '(512) 555-0200', '3824 Medical Pkwy',            'Austin',      'TX', '78756'),
  (4, 4, '(212) 555-0200', '245 E 54th St Suite 1200',     'New York',    'NY', '10022'),
  (5, 5, '(312) 555-0200', '875 N Michigan Ave Suite 500', 'Chicago',     'IL', '60611'),
  (6, 6, '(310) 555-0200', '8920 Wilshire Blvd Suite 300', 'Los Angeles', 'CA', '90211'),
  (7, 7, '(602) 555-0200', '2222 E Highland Ave Suite 100','Phoenix',     'AZ', '85016'),
  (8, 8, '(206) 555-0200', '1200 5th Ave Suite 1800',      'Seattle',     'WA', '98101');

-- ─── Departments (3–4 per clinic: primary + specialist mix) ─

INSERT IGNORE INTO department (department_id, department_name, description, clinic_id) VALUES
  -- Dallas (clinic 1)
  (1,  'Internal Medicine', 'Chronic disease management, diagnostics, and preventive wellness',   1),
  (2,  'Orthopedics',       'Joint replacement, sports medicine, and spine care',                 1),
  (7,  'Family Medicine',   'Comprehensive primary care for all ages and conditions',              1),
  (8,  'Dermatology',       'Skin, hair, and nail conditions including cancer screening',          1),
  -- Houston (clinic 2)
  (3,  'Family Medicine',   'Comprehensive primary care for all ages and conditions',              2),
  (4,  'Cardiology',        'Heart disease prevention, diagnostics, and treatment',                2),
  (9,  'Internal Medicine', 'Chronic disease management, diagnostics, and preventive wellness',    2),
  (10, 'Gastroenterology',  'Digestive system disorders, endoscopy, and liver care',               2),
  -- Austin (clinic 3)
  (5,  'General Practice',  'Primary care and preventive medicine for all ages',                   3),
  (6,  'Neurology',         'Brain, spinal cord, and nervous system conditions',                   3),
  (11, 'Geriatrics',        'Specialized primary care for patients 65 and older',                  3),
  (12, 'Endocrinology',     'Diabetes, thyroid disorders, and hormonal conditions',                3),
  -- New York (clinic 4)
  (13, 'Family Medicine',   'Comprehensive primary care for all ages and conditions',              4),
  (14, 'Internal Medicine', 'Chronic disease management, diagnostics, and preventive wellness',    4),
  (15, 'Oncology',          'Cancer diagnosis, chemotherapy, radiation coordination, and care',    4),
  (16, 'Rheumatology',      'Arthritis, autoimmune diseases, and musculoskeletal disorders',       4),
  -- Chicago (clinic 5)
  (17, 'Family Medicine',   'Comprehensive primary care for all ages and conditions',              5),
  (18, 'General Practice',  'Primary care and preventive medicine for all ages',                   5),
  (19, 'Cardiology',        'Heart disease prevention, diagnostics, and treatment',                5),
  (20, 'Pulmonology',       'Lung disease, asthma, COPD, and respiratory care',                    5),
  -- Los Angeles (clinic 6)
  (21, 'Internal Medicine', 'Chronic disease management, diagnostics, and preventive wellness',    6),
  (22, 'Family Medicine',   'Comprehensive primary care for all ages and conditions',               6),
  (23, 'Orthopedics',       'Joint replacement, sports medicine, and spine care',                  6),
  (24, 'Urology',           'Kidney, bladder, and urinary tract conditions',                       6),
  -- Phoenix (clinic 7)
  (25, 'General Practice',  'Primary care and preventive medicine for all ages',                   7),
  (26, 'Family Medicine',   'Comprehensive primary care for all ages and conditions',               7),
  (27, 'Neurology',         'Brain, spinal cord, and nervous system conditions',                    7),
  -- Seattle (clinic 8)
  (28, 'Family Medicine',   'Comprehensive primary care for all ages and conditions',               8),
  (29, 'Internal Medicine', 'Chronic disease management, diagnostics, and preventive wellness',     8),
  (30, 'Pulmonology',       'Lung disease, asthma, COPD, and respiratory care',                     8);

-- ─── Physicians (30 total: ~2–3 primary + 1–2 specialist per city) ──

INSERT IGNORE INTO physician (physician_id, first_name, last_name, email, phone_number, specialty, department_id, hire_date, physician_type) VALUES
  -- Dallas (office 1)
  (1,  'Emily',      'Johnson',   'johnson101@audittrailhealth.com',   '(214) 555-0301', 'Internal Medicine', 1,  '2019-01-10', 'primary'),
  (2,  'Maria',      'Garcia',    'garcia102@audittrailhealth.com',    '(214) 555-0302', 'Orthopedics',       2,  '2018-03-15', 'specialist'),
  (7,  'Michael',    'Chen',      'chen107@audittrailhealth.com',      '(214) 555-0303', 'Family Medicine',   7,  '2020-06-01', 'primary'),
  (8,  'Sarah',      'Kim',       'kim108@audittrailhealth.com',       '(214) 555-0304', 'Internal Medicine', 1,  '2017-09-15', 'primary'),
  -- Houston (office 2)
  (3,  'Patricia',   'Moore',     'moore103@audittrailhealth.com',     '(713) 555-0301', 'Family Medicine',   3,  '2015-04-01', 'primary'),
  (4,  'Angela',     'White',     'white104@audittrailhealth.com',     '(713) 555-0302', 'Cardiology',        4,  '2016-09-01', 'specialist'),
  (9,  'James',      'Martinez',  'martinez109@audittrailhealth.com',  '(713) 555-0303', 'Family Medicine',   3,  '2021-02-15', 'primary'),
  (10, 'Karen',      'Thompson',  'thompson110@audittrailhealth.com',  '(713) 555-0304', 'Internal Medicine', 9,  '2018-11-01', 'primary'),
  -- Austin (office 3)
  (5,  'Robert',     'Davis',     'davis105@audittrailhealth.com',     '(512) 555-0301', 'General Practice',  5,  '2014-04-01', 'primary'),
  (6,  'Rachel',     'Foster',    'foster106@audittrailhealth.com',    '(512) 555-0302', 'Neurology',         6,  '2019-06-15', 'specialist'),
  (11, 'David',      'Lee',       'lee111@audittrailhealth.com',       '(512) 555-0303', 'Geriatrics',        11, '2016-03-01', 'primary'),
  (12, 'Susan',      'Nguyen',    'nguyen112@audittrailhealth.com',    '(512) 555-0304', 'General Practice',  5,  '2020-08-01', 'primary'),
  -- San Antonio (office 4)
  (13, 'Carlos',     'Rivera',    'rivera113@audittrailhealth.com',    '(210) 555-0301', 'Family Medicine',   13, '2017-05-01', 'primary'),
  (14, 'Amanda',     'Scott',     'scott114@audittrailhealth.com',     '(210) 555-0302', 'Internal Medicine', 14, '2019-03-15', 'primary'),
  (15, 'Thomas',     'Brown',     'brown115@audittrailhealth.com',     '(210) 555-0303', 'Oncology',          15, '2015-07-01', 'specialist'),
  (16, 'Nina',       'Patel',     'patel116@audittrailhealth.com',     '(210) 555-0304', 'Rheumatology',      16, '2018-01-10', 'specialist'),
  -- Fort Worth (office 5)
  (17, 'Jennifer',   'Hall',      'hall117@audittrailhealth.com',      '(817) 555-0301', 'Family Medicine',   17, '2016-10-01', 'primary'),
  (18, 'Kevin',      'Wright',    'wright118@audittrailhealth.com',    '(817) 555-0302', 'General Practice',  18, '2020-04-01', 'primary'),
  (19, 'Robert',     'Chan',      'chan119@audittrailhealth.com',      '(817) 555-0303', 'Cardiology',        19, '2017-08-15', 'specialist'),
  (20, 'Lisa',       'Monroe',    'monroe120@audittrailhealth.com',    '(817) 555-0304', 'Pulmonology',       20, '2019-11-01', 'specialist'),
  -- Plano (office 6)
  (21, 'Brian',      'Wilson',    'wilson121@audittrailhealth.com',    '(972) 555-0301', 'Internal Medicine', 21, '2018-06-01', 'primary'),
  (22, 'Michelle',   'Clark',     'clark122@audittrailhealth.com',     '(972) 555-0302', 'Family Medicine',   22, '2021-01-15', 'primary'),
  (23, 'Steven',     'Lewis',     'lewis123@audittrailhealth.com',     '(972) 555-0303', 'Orthopedics',       23, '2016-05-01', 'specialist'),
  (24, 'Priya',      'Sharma',    'sharma124@audittrailhealth.com',    '(972) 555-0304', 'Urology',           24, '2020-09-01', 'specialist'),
  -- El Paso (office 7)
  (25, 'Diana',      'Torres',    'torres125@audittrailhealth.com',    '(915) 555-0301', 'General Practice',  25, '2015-02-01', 'primary'),
  (26, 'Richard',    'Evans',     'evans126@audittrailhealth.com',     '(915) 555-0302', 'Family Medicine',   26, '2019-04-15', 'primary'),
  (27, 'Sandra',     'Collins',   'collins127@audittrailhealth.com',   '(915) 555-0303', 'Neurology',         27, '2017-10-01', 'specialist'),
  -- Corpus Christi (office 8)
  (28, 'Christopher','Hill',      'hill128@audittrailhealth.com',      '(361) 555-0301', 'Family Medicine',   28, '2018-08-01', 'primary'),
  (29, 'Patricia',   'Baker',     'baker129@audittrailhealth.com',     '(361) 555-0302', 'Internal Medicine', 29, '2020-03-01', 'primary'),
  (30, 'Joshua',     'Nelson',    'nelson130@audittrailhealth.com',    '(361) 555-0303', 'Pulmonology',       30, '2016-12-01', 'specialist');

-- ─── Work Schedules ──────────────────────────────────────────

INSERT IGNORE INTO work_schedule (schedule_id, physician_id, office_id, day_of_week, start_time, end_time) VALUES
  -- Existing (Dallas/Houston/Austin originals)
  (1,  1, 1, 'Monday',    '08:00:00', '17:00:00'),
  (2,  1, 1, 'Wednesday', '08:00:00', '17:00:00'),
  (3,  2, 1, 'Tuesday',   '08:00:00', '17:00:00'),
  (4,  2, 1, 'Thursday',  '08:00:00', '17:00:00'),
  (5,  3, 2, 'Monday',    '08:00:00', '17:00:00'),
  (6,  3, 2, 'Thursday',  '08:00:00', '17:00:00'),
  (7,  4, 2, 'Tuesday',   '08:00:00', '17:00:00'),
  (8,  4, 2, 'Friday',    '08:00:00', '17:00:00'),
  (9,  5, 3, 'Wednesday', '08:00:00', '17:00:00'),
  (10, 5, 3, 'Friday',    '08:00:00', '17:00:00'),
  (11, 6, 3, 'Monday',    '09:00:00', '17:00:00'),
  (12, 6, 3, 'Thursday',  '09:00:00', '17:00:00'),
  -- Dallas new physicians
  (13, 7, 1, 'Monday',    '08:00:00', '17:00:00'),
  (14, 7, 1, 'Wednesday', '08:00:00', '17:00:00'),
  (15, 7, 1, 'Friday',    '08:00:00', '17:00:00'),
  (16, 8, 1, 'Tuesday',   '08:00:00', '17:00:00'),
  (17, 8, 1, 'Thursday',  '08:00:00', '17:00:00'),
  -- Houston new physicians
  (18, 9,  2, 'Monday',    '08:00:00', '17:00:00'),
  (19, 9,  2, 'Wednesday', '08:00:00', '17:00:00'),
  (20, 10, 2, 'Tuesday',   '08:00:00', '17:00:00'),
  (21, 10, 2, 'Thursday',  '08:00:00', '17:00:00'),
  (22, 10, 2, 'Friday',    '08:00:00', '17:00:00'),
  -- Austin new physicians
  (23, 11, 3, 'Monday',    '09:00:00', '17:00:00'),
  (24, 11, 3, 'Tuesday',   '09:00:00', '17:00:00'),
  (25, 11, 3, 'Thursday',  '09:00:00', '17:00:00'),
  (26, 12, 3, 'Wednesday', '08:00:00', '17:00:00'),
  (27, 12, 3, 'Friday',    '08:00:00', '17:00:00'),
  -- San Antonio
  (28, 13, 4, 'Monday',    '08:00:00', '17:00:00'),
  (29, 13, 4, 'Wednesday', '08:00:00', '17:00:00'),
  (30, 13, 4, 'Friday',    '08:00:00', '17:00:00'),
  (31, 14, 4, 'Tuesday',   '08:00:00', '17:00:00'),
  (32, 14, 4, 'Thursday',  '08:00:00', '17:00:00'),
  (33, 15, 4, 'Monday',    '09:00:00', '17:00:00'),
  (34, 15, 4, 'Wednesday', '09:00:00', '17:00:00'),
  (35, 16, 4, 'Tuesday',   '09:00:00', '17:00:00'),
  (36, 16, 4, 'Friday',    '09:00:00', '17:00:00'),
  -- Fort Worth
  (37, 17, 5, 'Monday',    '08:00:00', '17:00:00'),
  (38, 17, 5, 'Wednesday', '08:00:00', '17:00:00'),
  (39, 17, 5, 'Friday',    '08:00:00', '17:00:00'),
  (40, 18, 5, 'Tuesday',   '08:00:00', '17:00:00'),
  (41, 18, 5, 'Thursday',  '08:00:00', '17:00:00'),
  (42, 19, 5, 'Wednesday', '09:00:00', '17:00:00'),
  (43, 19, 5, 'Friday',    '09:00:00', '17:00:00'),
  (44, 20, 5, 'Monday',    '09:00:00', '17:00:00'),
  (45, 20, 5, 'Thursday',  '09:00:00', '17:00:00'),
  -- Plano
  (46, 21, 6, 'Monday',    '08:00:00', '17:00:00'),
  (47, 21, 6, 'Wednesday', '08:00:00', '17:00:00'),
  (48, 21, 6, 'Friday',    '08:00:00', '17:00:00'),
  (49, 22, 6, 'Tuesday',   '08:00:00', '17:00:00'),
  (50, 22, 6, 'Thursday',  '08:00:00', '17:00:00'),
  (51, 23, 6, 'Monday',    '09:00:00', '17:00:00'),
  (52, 23, 6, 'Wednesday', '09:00:00', '17:00:00'),
  (53, 24, 6, 'Tuesday',   '09:00:00', '17:00:00'),
  (54, 24, 6, 'Thursday',  '09:00:00', '17:00:00'),
  -- El Paso
  (55, 25, 7, 'Monday',    '08:00:00', '17:00:00'),
  (56, 25, 7, 'Wednesday', '08:00:00', '17:00:00'),
  (57, 25, 7, 'Friday',    '08:00:00', '17:00:00'),
  (58, 26, 7, 'Tuesday',   '08:00:00', '17:00:00'),
  (59, 26, 7, 'Thursday',  '08:00:00', '17:00:00'),
  (60, 27, 7, 'Monday',    '09:00:00', '17:00:00'),
  (61, 27, 7, 'Wednesday', '09:00:00', '17:00:00'),
  -- Corpus Christi
  (62, 28, 8, 'Monday',    '08:00:00', '17:00:00'),
  (63, 28, 8, 'Wednesday', '08:00:00', '17:00:00'),
  (64, 28, 8, 'Friday',    '08:00:00', '17:00:00'),
  (65, 29, 8, 'Tuesday',   '08:00:00', '17:00:00'),
  (66, 29, 8, 'Thursday',  '08:00:00', '17:00:00'),
  (67, 30, 8, 'Monday',    '09:00:00', '17:00:00'),
  (68, 30, 8, 'Thursday',  '09:00:00', '17:00:00');

-- ─── Staff (8 members — one per city) ───────────────────────

INSERT IGNORE INTO staff (staff_id, first_name, last_name, date_of_birth, department_id, role, hire_date, phone_number, email, shift_start, shift_end) VALUES
  (1, 'Nicole',   'Adams',   '1990-04-12', 1,  'Medical Assistant',  '2021-01-10', '(214) 555-0401', 'adams201@audittrailhealth.com',    '08:00:00', '16:00:00'),
  (2, 'Jordan',   'Brooks',  '1988-09-23', 4,  'Billing Specialist', '2019-06-15', '(713) 555-0401', 'brooks202@audittrailhealth.com',   '09:00:00', '17:00:00'),
  (3, 'Morgan',   'Taylor',  '1993-02-17', 3,  'Receptionist',       '2020-03-01', '(512) 555-0401', 'taylor203@audittrailhealth.com',   '08:00:00', '16:00:00'),
  (4, 'Maria',    'Gomez',   '1991-07-22', 13, 'Receptionist',       '2021-05-10', '(210) 555-0401', 'gomez204@audittrailhealth.com',    '08:00:00', '16:00:00'),
  (5, 'David',    'Kim',     '1989-11-04', 17, 'Medical Assistant',  '2022-01-15', '(817) 555-0401', 'kim205@audittrailhealth.com',      '08:00:00', '16:00:00'),
  (6, 'Rachel',   'Lin',     '1994-03-30', 21, 'Billing Specialist', '2020-09-01', '(972) 555-0401', 'lin206@audittrailhealth.com',      '09:00:00', '17:00:00'),
  (7, 'Carlos',   'Mendez',  '1987-06-18', 25, 'Receptionist',       '2019-11-01', '(915) 555-0401', 'mendez207@audittrailhealth.com',   '08:00:00', '16:00:00'),
  (8, 'Brittany', 'Ross',    '1995-01-09', 28, 'Medical Assistant',  '2023-03-01', '(361) 555-0401', 'ross208@audittrailhealth.com',     '08:00:00', '16:00:00');

-- ─── Users (login accounts) ─────────────────────────────────
-- Passwords bcrypt-hashed (10 rounds)
-- Patient@123  → $2b$10$2BNnadEL3Jfi23zImdwLM.uDE.3W3.51V2Xa2FVIUfJIW40dhz2vy
-- Doctor@123   → $2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6
-- Staff@123    → $2b$10$1lOpxTZx1crCArWmk/jP6OPz40BsG3qPJeTQQP5WF6y0PveuhvnA6

INSERT IGNORE INTO users (user_id, email, password_hash, role, physician_id, staff_id) VALUES
  -- Patients (1–5)
  (1,  'alex.smith@email.com',    '$2b$10$2BNnadEL3Jfi23zImdwLM.uDE.3W3.51V2Xa2FVIUfJIW40dhz2vy', 'patient',   NULL, NULL),
  (2,  'taylor.jones@email.com',  '$2b$10$2BNnadEL3Jfi23zImdwLM.uDE.3W3.51V2Xa2FVIUfJIW40dhz2vy', 'patient',   NULL, NULL),
  (3,  'morgan.w@email.com',      '$2b$10$2BNnadEL3Jfi23zImdwLM.uDE.3W3.51V2Xa2FVIUfJIW40dhz2vy', 'patient',   NULL, NULL),
  (4,  'jordan.brown@email.com',  '$2b$10$2BNnadEL3Jfi23zImdwLM.uDE.3W3.51V2Xa2FVIUfJIW40dhz2vy', 'patient',   NULL, NULL),
  (5,  'casey.davis@email.com',   '$2b$10$2BNnadEL3Jfi23zImdwLM.uDE.3W3.51V2Xa2FVIUfJIW40dhz2vy', 'patient',   NULL, NULL),
  -- Physicians — original 6
  (6,  'johnson101@audittrailhealth.com',   '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 1,  NULL),
  (7,  'garcia102@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 2,  NULL),
  (8,  'moore103@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 3,  NULL),
  (9,  'white104@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 4,  NULL),
  (10, 'davis105@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 5,  NULL),
  (11, 'foster106@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 6,  NULL),
  -- Physicians — new
  (15, 'chen107@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 7,  NULL),
  (16, 'kim108@audittrailhealth.com',       '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 8,  NULL),
  (17, 'martinez109@audittrailhealth.com',  '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 9,  NULL),
  (18, 'thompson110@audittrailhealth.com',  '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 10, NULL),
  (19, 'lee111@audittrailhealth.com',       '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 11, NULL),
  (20, 'nguyen112@audittrailhealth.com',   '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 12, NULL),
  (21, 'rivera113@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 13, NULL),
  (22, 'scott114@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 14, NULL),
  (23, 'brown115@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 15, NULL),
  (24, 'patel116@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 16, NULL),
  (25, 'hall117@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 17, NULL),
  (26, 'wright118@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 18, NULL),
  (27, 'chan119@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 19, NULL),
  (28, 'monroe120@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 20, NULL),
  (29, 'wilson121@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 21, NULL),
  (30, 'clark122@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 22, NULL),
  (31, 'lewis123@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 23, NULL),
  (32, 'sharma124@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 24, NULL),
  (33, 'torres125@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 25, NULL),
  (34, 'evans126@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 26, NULL),
  (35, 'collins127@audittrailhealth.com',  '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 27, NULL),
  (36, 'hill128@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 28, NULL),
  (37, 'baker129@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 29, NULL),
  (38, 'nelson130@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 30, NULL),
  -- Staff — original 3
  (12, 'adams201@audittrailhealth.com',  '$2b$10$1lOpxTZx1crCArWmk/jP6OPz40BsG3qPJeTQQP5WF6y0PveuhvnA6', 'staff',     NULL, 1),
  (13, 'brooks202@audittrailhealth.com', '$2b$10$1lOpxTZx1crCArWmk/jP6OPz40BsG3qPJeTQQP5WF6y0PveuhvnA6', 'staff',     NULL, 2),
  (14, 'taylor203@audittrailhealth.com', '$2b$10$1lOpxTZx1crCArWmk/jP6OPz40BsG3qPJeTQQP5WF6y0PveuhvnA6', 'staff',     NULL, 3),
  -- Staff — new
  (39, 'gomez204@audittrailhealth.com',  '$2b$10$1lOpxTZx1crCArWmk/jP6OPz40BsG3qPJeTQQP5WF6y0PveuhvnA6', 'staff',     NULL, 4),
  (40, 'kim205@audittrailhealth.com',   '$2b$10$1lOpxTZx1crCArWmk/jP6OPz40BsG3qPJeTQQP5WF6y0PveuhvnA6', 'staff',     NULL, 5),
  (41, 'lin206@audittrailhealth.com',    '$2b$10$1lOpxTZx1crCArWmk/jP6OPz40BsG3qPJeTQQP5WF6y0PveuhvnA6', 'staff',     NULL, 6),
  (42, 'mendez207@audittrailhealth.com', '$2b$10$1lOpxTZx1crCArWmk/jP6OPz40BsG3qPJeTQQP5WF6y0PveuhvnA6', 'staff',     NULL, 7),
  (43, 'ross208@audittrailhealth.com',  '$2b$10$1lOpxTZx1crCArWmk/jP6OPz40BsG3qPJeTQQP5WF6y0PveuhvnA6', 'staff',     NULL, 8);

-- ─── Patients (5 — linked to user accounts) ─────────────────

INSERT IGNORE INTO patient (patient_id, user_id, first_name, last_name, date_of_birth, phone_number, email, street_address, city, state, zip_code, gender, emergency_contact_name, emergency_contact_phone, primary_physician_id, insurance_id) VALUES
  (1, 1, 'Alex',   'Smith',    '1992-05-14', '(214) 555-1001', 'alex.smith@email.com',   '123 Elm St',     'Dallas',  'TX', '75201', 'Male',   'Jamie Smith',  '(214) 555-1002', 1, 1),
  (2, 2, 'Taylor', 'Jones',    '1985-11-22', '(713) 555-1001', 'taylor.jones@email.com', '456 Oak Ave',    'Houston', 'TX', '77001', 'Female', 'Chris Jones',  '(713) 555-1002', 3, 2),
  (3, 3, 'Morgan', 'Williams', '1998-03-08', '(512) 555-1001', 'morgan.w@email.com',     '789 Pine Rd',    'Austin',  'TX', '78701', 'Female', 'Sam Williams', '(512) 555-1002', 5, 3),
  (4, 4, 'Jordan', 'Brown',    '1975-07-19', '(214) 555-1003', 'jordan.brown@email.com', '321 Maple Blvd', 'Dallas',  'TX', '75202', 'Male',   'Riley Brown',  '(214) 555-1004', 1, 1),
  (5, 5, 'Casey',  'Davis',    '2000-01-30', '(713) 555-1003', 'casey.davis@email.com',  '654 Cedar Lane', 'Houston', 'TX', '77002', 'Female', 'Quinn Davis',  '(713) 555-1004', 3, 2);

-- ─── Appointments ────────────────────────────────────────────

INSERT IGNORE INTO appointment (appointment_id, patient_id, physician_id, office_id, appointment_date, appointment_time, status_id, booking_method, reason_for_visit, appointment_type, duration_minutes) VALUES
  (1, 1, 1, 1, '2026-04-28', '09:00:00', 1, 'online',    'Annual physical exam',        'Physical',   60),
  (2, 1, 1, 1, '2025-12-05', '10:30:00', 2, 'phone',     'Follow-up on blood pressure', 'Follow-Up',  30),
  (3, 2, 3, 2, '2026-05-06', '11:00:00', 1, 'online',    'Routine checkup',             'General',    30),
  (4, 2, 3, 2, '2025-11-20', '14:00:00', 2, 'in-person', 'Hypertension management',     'Follow-Up',  30),
  (5, 2, 4, 2, '2026-05-13', '10:00:00', 1, 'online',    'Cardiology consultation',     'Specialist', 45),
  (6, 3, 5, 3, '2025-10-15', '09:00:00', 4, 'phone',     'Headache evaluation',         'General',    30),
  (7, 4, 1, 1, '2026-04-30', '14:00:00', 1, 'online',    'Diabetes management check',   'Follow-Up',  30),
  (8, 5, 3, 2, '2026-05-08', '13:00:00', 1, 'online',    'New patient visit',           'Physical',   60);

-- ─── Medical History ─────────────────────────────────────────

INSERT IGNORE INTO medical_history (medical_history_id, patient_id, physician_id, `condition`, diagnosis_date, status, notes) VALUES
  (1, 1, 1, 'Hypertension',    '2022-03-10', 'Active', 'Managed with lisinopril 10mg daily. Monitor BP monthly.'),
  (2, 1, 1, 'Type 2 Diabetes', '2023-07-15', 'Active', 'Diet-controlled. A1C checked quarterly. Last reading: 7.1'),
  (3, 2, 3, 'Hypertension',    '2021-04-05', 'Active', 'On amlodipine 5mg. BP consistently elevated at visits.'),
  (4, 3, 5, 'Migraine',        '2020-05-01', 'Active', 'Triggers: stress, dehydration. Prescribed sumatriptan PRN.'),
  (5, 4, 1, 'Type 2 Diabetes', '2019-11-30', 'Active', 'Metformin 1000mg twice daily. A1C: 7.8 — needs follow-up.'),
  (6, 3, 5, 'No-Show',         '2025-10-15', 'Active', 'Patient did not attend scheduled appointment on 2025-10-15');

-- ─── Diagnosis ───────────────────────────────────────────────

INSERT IGNORE INTO diagnosis (diagnosis_id, appointment_id, physician_id, diagnosis_code, diagnosis_description, diagnosis_date, severity, notes) VALUES
  (1, 2, 1, 'I10',   'Essential Hypertension', '2025-12-05', 'Moderate', 'BP 148/92 at visit. Adjusted lisinopril dosage.'),
  (2, 4, 3, 'I10',   'Essential Hypertension', '2025-11-20', 'Moderate', 'BP stable but still elevated. Continue current regimen.'),
  (3, 4, 3, 'E11.9', 'Type 2 Diabetes',        '2025-11-20', 'Mild',     'A1C within target range. Continue diet management.');

-- ─── Treatment ───────────────────────────────────────────────

INSERT IGNORE INTO treatment (treatment_id, diagnosis_id, treatment_plan, prescribed_medication, follow_up_date, notes) VALUES
  (1, 1, 'Continue antihypertensive therapy. Reduce sodium intake.',       'Lisinopril 10mg daily',       '2026-03-05', 'Return if BP exceeds 160/100'),
  (2, 2, 'Continue current antihypertensive. Increase physical activity.', 'Amlodipine 5mg daily',        '2026-02-20', 'Recheck in 3 months'),
  (3, 3, 'Monitor A1C every 3 months. Continue diet and exercise plan.',   'Metformin 500mg twice daily', '2026-02-20', 'Schedule nutritionist consult');

-- ─── Billing ─────────────────────────────────────────────────
-- insurance_paid = total * (coverage% / 100)
-- patient_owed   = total - insurance_paid

INSERT IGNORE INTO billing (bill_id, appointment_id, patient_id, insurance_id, total_amount, tax_amount, insurance_paid_amount, patient_owed, payment_status, payment_method, payment_date, due_date) VALUES
  (1, 2, 1, 1, 150.00, 0.00, 120.00, 30.00, 'Paid',   'credit card', '2025-12-06', '2026-01-05'),
  (2, 4, 2, 2, 150.00, 0.00, 112.50, 37.50, 'Paid',   'insurance',   '2025-11-25', '2025-12-20'),
  (3, 1, 1, 1, 200.00, 0.00, 160.00, 40.00, 'Unpaid', NULL,          NULL,         '2026-05-28'),
  (4, 3, 2, 2, 150.00, 0.00, 112.50, 37.50, 'Unpaid', NULL,          NULL,         '2026-06-06'),
  (5, 7, 4, 1, 150.00, 0.00, 120.00, 30.00, 'Unpaid', NULL,          NULL,         '2026-05-30');

-- ─── Referrals ───────────────────────────────────────────────

INSERT IGNORE INTO referral (referral_id, patient_id, primary_physician_id, specialist_id, date_issued, expiration_date, referral_status_id, referral_reason, specialist_appointment_id) VALUES
  (1, 2, 3, 4, '2026-04-20', '2026-07-20', 5, 'Persistent hypertension with possible cardiac involvement. Cardiology evaluation requested.', 5),
  (2, 1, 1, 2, '2026-04-25', '2026-07-25', 1, 'Knee pain on exertion for 3 months. Orthopedic assessment needed.', NULL);
-- ============================================================
--  Audit Trail Health — Seed Expansion
--  Adds more physicians per city, realistic specialty distribution,
--  and fixes area codes for non-Texas clinics.
--  Safe to re-run: uses INSERT IGNORE + UPDATE.
-- ============================================================

-- ─── Fix area codes for non-Texas physicians (13–30) ────────
UPDATE physician SET phone_number = '(212) 555-0305' WHERE physician_id = 13;
UPDATE physician SET phone_number = '(212) 555-0306' WHERE physician_id = 14;
UPDATE physician SET phone_number = '(212) 555-0307' WHERE physician_id = 15;
UPDATE physician SET phone_number = '(212) 555-0308' WHERE physician_id = 16;
UPDATE physician SET phone_number = '(312) 555-0305' WHERE physician_id = 17;
UPDATE physician SET phone_number = '(312) 555-0306' WHERE physician_id = 18;
UPDATE physician SET phone_number = '(312) 555-0307' WHERE physician_id = 19;
UPDATE physician SET phone_number = '(312) 555-0308' WHERE physician_id = 20;
UPDATE physician SET phone_number = '(310) 555-0305' WHERE physician_id = 21;
UPDATE physician SET phone_number = '(310) 555-0306' WHERE physician_id = 22;
UPDATE physician SET phone_number = '(310) 555-0307' WHERE physician_id = 23;
UPDATE physician SET phone_number = '(310) 555-0308' WHERE physician_id = 24;
UPDATE physician SET phone_number = '(602) 555-0305' WHERE physician_id = 25;
UPDATE physician SET phone_number = '(602) 555-0306' WHERE physician_id = 26;
UPDATE physician SET phone_number = '(602) 555-0307' WHERE physician_id = 27;
UPDATE physician SET phone_number = '(206) 555-0305' WHERE physician_id = 28;
UPDATE physician SET phone_number = '(206) 555-0306' WHERE physician_id = 29;
UPDATE physician SET phone_number = '(206) 555-0307' WHERE physician_id = 30;

-- ─── New Departments (IDs 31–44) ────────────────────────────
-- Real-world model: major hubs (NY, LA, Chicago) get broad specialist
-- coverage. Regional clinics get 1-2 common specialties only.
-- Rare specialties (Oncology, Rheumatology, Neurology) at 2-3 cities only.

INSERT IGNORE INTO department (department_id, department_name, description, clinic_id) VALUES
  -- Dallas additions
  (31, 'Cardiology',      'Heart disease prevention, diagnostics, and treatment',                 1),
  (32, 'Dermatology',     'Skin, hair, and nail conditions including cancer screening',            1),
  -- Houston additions
  (33, 'Oncology',        'Cancer diagnosis, chemotherapy, radiation coordination, and care',     2),
  (34, 'Gastroenterology','Digestive system disorders, endoscopy, and liver care',                2),
  -- New York additions (major hub — broad coverage)
  (35, 'Cardiology',      'Heart disease prevention, diagnostics, and treatment',                 4),
  (36, 'Gastroenterology','Digestive system disorders, endoscopy, and liver care',                4),
  (37, 'Neurology',       'Brain, spinal cord, and nervous system conditions',                    4),
  -- Chicago additions
  (38, 'Gastroenterology','Digestive system disorders, endoscopy, and liver care',                5),
  (39, 'Dermatology',     'Skin, hair, and nail conditions including cancer screening',            5),
  -- LA additions (major hub — broad coverage)
  (40, 'Dermatology',     'Skin, hair, and nail conditions including cancer screening',            6),
  (41, 'Endocrinology',   'Diabetes, thyroid disorders, and hormonal conditions',                 6),
  (42, 'Rheumatology',    'Arthritis, autoimmune diseases, and musculoskeletal disorders',        6),
  -- Phoenix additions
  (43, 'Endocrinology',   'Diabetes, thyroid disorders, and hormonal conditions',                 7),
  (44, 'Pulmonology',     'Lung disease, asthma, COPD, and respiratory care',                     7),
  -- Seattle additions
  (45, 'Oncology',        'Cancer diagnosis, chemotherapy, radiation coordination, and care',     8),
  (46, 'Neurology',       'Brain, spinal cord, and nervous system conditions',                    8);

-- ─── New Physicians (IDs 31–63) ─────────────────────────────
-- Distribution model:
--   Dallas/Houston/Austin: 6 primary + 2-3 specialist each
--   NY/Chicago/LA:         6 primary + 4-5 specialist each (major hubs)
--   Phoenix/Seattle:       5 primary + 2-3 specialist each

INSERT IGNORE INTO physician (physician_id, first_name, last_name, email, phone_number, specialty, department_id, hire_date, physician_type) VALUES
  -- Dallas additions (office 1)
  (31, 'Anthony',   'Reed',      'reed131@audittrailhealth.com',      '(214) 555-0305', 'Family Medicine',    7,  '2021-03-01', 'primary'),
  (32, 'Laura',     'Price',     'price132@audittrailhealth.com',     '(214) 555-0306', 'Internal Medicine',  1,  '2018-07-15', 'primary'),
  (33, 'Marcus',    'Allen',     'allen133@audittrailhealth.com',     '(214) 555-0307', 'Cardiology',         31, '2016-04-01', 'specialist'),
  (34, 'Stephanie', 'Cook',      'cook134@audittrailhealth.com',      '(214) 555-0308', 'Dermatology',        32, '2019-09-01', 'specialist'),
  -- Houston additions (office 2)
  (35, 'Daniel',    'Flores',    'flores135@audittrailhealth.com',    '(713) 555-0305', 'Family Medicine',    3,  '2020-11-01', 'primary'),
  (36, 'Nicole',    'Simmons',   'simmons136@audittrailhealth.com',   '(713) 555-0306', 'Internal Medicine',  9,  '2017-06-15', 'primary'),
  (37, 'Victor',    'Huang',     'huang137@audittrailhealth.com',     '(713) 555-0307', 'Oncology',           33, '2015-09-01', 'specialist'),
  (38, 'Melissa',   'Jordan',    'jordan138@audittrailhealth.com',    '(713) 555-0308', 'Gastroenterology',   34, '2018-02-01', 'specialist'),
  -- Austin additions (office 3)
  (39, 'Steven',    'Perry',     'perry139@audittrailhealth.com',     '(512) 555-0305', 'General Practice',   5,  '2022-01-10', 'primary'),
  (40, 'Kimberly',  'Ross',      'ross140@audittrailhealth.com',      '(512) 555-0306', 'Geriatrics',         11, '2019-05-01', 'primary'),
  -- New York additions (office 4) — major hub
  (41, 'Jonathan',  'Wallace',   'wallace141@audittrailhealth.com',   '(212) 555-0309', 'Family Medicine',    13, '2018-03-01', 'primary'),
  (42, 'Christine', 'Bennett',   'bennett142@audittrailhealth.com',   '(212) 555-0310', 'Internal Medicine',  14, '2020-07-01', 'primary'),
  (43, 'Raymond',   'Diaz',      'diaz143@audittrailhealth.com',      '(212) 555-0311', 'Family Medicine',    13, '2016-11-01', 'primary'),
  (44, 'Natalie',   'Wu',        'wu144@audittrailhealth.com',        '(212) 555-0312', 'Internal Medicine',  14, '2021-04-15', 'primary'),
  (45, 'Gregory',   'Vasquez',   'vasquez145@audittrailhealth.com',   '(212) 555-0313', 'Cardiology',         35, '2015-06-01', 'specialist'),
  (46, 'Helen',     'Nguyen',    'nguyen146@audittrailhealth.com',    '(212) 555-0314', 'Gastroenterology',   36, '2017-10-01', 'specialist'),
  (47, 'Patrick',   'Morales',   'morales147@audittrailhealth.com',   '(212) 555-0315', 'Neurology',          37, '2019-01-15', 'specialist'),
  -- Chicago additions (office 5)
  (48, 'Vanessa',   'Griffin',   'griffin148@audittrailhealth.com',   '(312) 555-0309', 'Family Medicine',    17, '2021-08-01', 'primary'),
  (49, 'Eric',      'Stone',     'stone149@audittrailhealth.com',     '(312) 555-0310', 'General Practice',   18, '2019-02-15', 'primary'),
  (50, 'Tamara',    'Owens',     'owens150@audittrailhealth.com',     '(312) 555-0311', 'Gastroenterology',   38, '2016-08-01', 'specialist'),
  (51, 'Derek',     'Murphy',    'murphy151@audittrailhealth.com',    '(312) 555-0312', 'Dermatology',        39, '2020-03-01', 'specialist'),
  -- LA additions (office 6) — major hub
  (52, 'Alicia',    'Castillo',  'castillo152@audittrailhealth.com',  '(310) 555-0309', 'Internal Medicine',  21, '2018-05-01', 'primary'),
  (53, 'Trevor',    'Hoffman',   'hoffman153@audittrailhealth.com',   '(310) 555-0310', 'Family Medicine',    22, '2020-10-01', 'primary'),
  (54, 'Jasmine',   'Reyes',     'reyes154@audittrailhealth.com',     '(310) 555-0311', 'Internal Medicine',  21, '2017-01-15', 'primary'),
  (55, 'Wesley',    'Cunningham','cunningham155@audittrailhealth.com','(310) 555-0312', 'Dermatology',        40, '2015-11-01', 'specialist'),
  (56, 'Olivia',    'Park',      'park156@audittrailhealth.com',      '(310) 555-0313', 'Endocrinology',      41, '2018-09-01', 'specialist'),
  (57, 'Brandon',   'Yates',     'yates157@audittrailhealth.com',     '(310) 555-0314', 'Rheumatology',       42, '2016-06-01', 'specialist'),
  -- Phoenix additions (office 7)
  (58, 'Erica',     'Watts',     'watts158@audittrailhealth.com',     '(602) 555-0308', 'General Practice',   25, '2021-06-01', 'primary'),
  (59, 'Marcus',    'Fleming',   'fleming159@audittrailhealth.com',   '(602) 555-0309', 'Family Medicine',    26, '2019-08-15', 'primary'),
  (60, 'Hannah',    'Cross',     'cross160@audittrailhealth.com',     '(602) 555-0310', 'Endocrinology',      43, '2017-04-01', 'specialist'),
  (61, 'Jerome',    'Tran',      'tran161@audittrailhealth.com',      '(602) 555-0311', 'Pulmonology',        44, '2020-01-15', 'specialist'),
  -- Seattle additions (office 8)
  (62, 'Audrey',    'Manning',   'manning162@audittrailhealth.com',   '(206) 555-0308', 'Family Medicine',    28, '2022-03-01', 'primary'),
  (63, 'Calvin',    'Holt',      'holt163@audittrailhealth.com',      '(206) 555-0309', 'Internal Medicine',  29, '2019-07-01', 'primary'),
  (64, 'Renee',     'Stanton',   'stanton164@audittrailhealth.com',   '(206) 555-0310', 'Oncology',           45, '2016-10-01', 'specialist'),
  (65, 'Miles',     'Egan',      'egan165@audittrailhealth.com',      '(206) 555-0311', 'Neurology',          46, '2018-12-01', 'specialist');

-- ─── New Work Schedules (IDs 69–142) ─────────────────────────
INSERT IGNORE INTO work_schedule (schedule_id, physician_id, office_id, day_of_week, start_time, end_time) VALUES
  -- Dallas new (31–34)
  (69,  31, 1, 'Monday',    '08:00:00', '17:00:00'),
  (70,  31, 1, 'Thursday',  '08:00:00', '17:00:00'),
  (71,  32, 1, 'Tuesday',   '08:00:00', '17:00:00'),
  (72,  32, 1, 'Friday',    '08:00:00', '17:00:00'),
  (73,  33, 1, 'Wednesday', '09:00:00', '17:00:00'),
  (74,  33, 1, 'Friday',    '09:00:00', '17:00:00'),
  (75,  34, 1, 'Tuesday',   '09:00:00', '17:00:00'),
  (76,  34, 1, 'Thursday',  '09:00:00', '17:00:00'),
  -- Houston new (35–38)
  (77,  35, 2, 'Monday',    '08:00:00', '17:00:00'),
  (78,  35, 2, 'Wednesday', '08:00:00', '17:00:00'),
  (79,  36, 2, 'Tuesday',   '08:00:00', '17:00:00'),
  (80,  36, 2, 'Thursday',  '08:00:00', '17:00:00'),
  (81,  37, 2, 'Wednesday', '09:00:00', '17:00:00'),
  (82,  37, 2, 'Friday',    '09:00:00', '17:00:00'),
  (83,  38, 2, 'Monday',    '09:00:00', '17:00:00'),
  (84,  38, 2, 'Thursday',  '09:00:00', '17:00:00'),
  -- Austin new (39–40)
  (85,  39, 3, 'Monday',    '08:00:00', '17:00:00'),
  (86,  39, 3, 'Friday',    '08:00:00', '17:00:00'),
  (87,  40, 3, 'Wednesday', '08:00:00', '17:00:00'),
  (88,  40, 3, 'Friday',    '08:00:00', '17:00:00'),
  -- New York new (41–47)
  (89,  41, 4, 'Monday',    '08:00:00', '17:00:00'),
  (90,  41, 4, 'Wednesday', '08:00:00', '17:00:00'),
  (91,  42, 4, 'Tuesday',   '08:00:00', '17:00:00'),
  (92,  42, 4, 'Thursday',  '08:00:00', '17:00:00'),
  (93,  43, 4, 'Monday',    '08:00:00', '17:00:00'),
  (94,  43, 4, 'Friday',    '08:00:00', '17:00:00'),
  (95,  44, 4, 'Tuesday',   '08:00:00', '17:00:00'),
  (96,  44, 4, 'Wednesday', '08:00:00', '17:00:00'),
  (97,  45, 4, 'Monday',    '09:00:00', '17:00:00'),
  (98,  45, 4, 'Thursday',  '09:00:00', '17:00:00'),
  (99,  46, 4, 'Tuesday',   '09:00:00', '17:00:00'),
  (100, 46, 4, 'Friday',    '09:00:00', '17:00:00'),
  (101, 47, 4, 'Wednesday', '09:00:00', '17:00:00'),
  (102, 47, 4, 'Friday',    '09:00:00', '17:00:00'),
  -- Chicago new (48–51)
  (103, 48, 5, 'Monday',    '08:00:00', '17:00:00'),
  (104, 48, 5, 'Thursday',  '08:00:00', '17:00:00'),
  (105, 49, 5, 'Tuesday',   '08:00:00', '17:00:00'),
  (106, 49, 5, 'Friday',    '08:00:00', '17:00:00'),
  (107, 50, 5, 'Monday',    '09:00:00', '17:00:00'),
  (108, 50, 5, 'Wednesday', '09:00:00', '17:00:00'),
  (109, 51, 5, 'Tuesday',   '09:00:00', '17:00:00'),
  (110, 51, 5, 'Thursday',  '09:00:00', '17:00:00'),
  -- LA new (52–57)
  (111, 52, 6, 'Monday',    '08:00:00', '17:00:00'),
  (112, 52, 6, 'Wednesday', '08:00:00', '17:00:00'),
  (113, 53, 6, 'Tuesday',   '08:00:00', '17:00:00'),
  (114, 53, 6, 'Thursday',  '08:00:00', '17:00:00'),
  (115, 54, 6, 'Wednesday', '08:00:00', '17:00:00'),
  (116, 54, 6, 'Friday',    '08:00:00', '17:00:00'),
  (117, 55, 6, 'Monday',    '09:00:00', '17:00:00'),
  (118, 55, 6, 'Thursday',  '09:00:00', '17:00:00'),
  (119, 56, 6, 'Tuesday',   '09:00:00', '17:00:00'),
  (120, 56, 6, 'Friday',    '09:00:00', '17:00:00'),
  (121, 57, 6, 'Wednesday', '09:00:00', '17:00:00'),
  (122, 57, 6, 'Friday',    '09:00:00', '17:00:00'),
  -- Phoenix new (58–61)
  (123, 58, 7, 'Monday',    '08:00:00', '17:00:00'),
  (124, 58, 7, 'Wednesday', '08:00:00', '17:00:00'),
  (125, 59, 7, 'Tuesday',   '08:00:00', '17:00:00'),
  (126, 59, 7, 'Thursday',  '08:00:00', '17:00:00'),
  (127, 60, 7, 'Monday',    '09:00:00', '17:00:00'),
  (128, 60, 7, 'Thursday',  '09:00:00', '17:00:00'),
  (129, 61, 7, 'Wednesday', '09:00:00', '17:00:00'),
  (130, 61, 7, 'Friday',    '09:00:00', '17:00:00'),
  -- Seattle new (62–65)
  (131, 62, 8, 'Monday',    '08:00:00', '17:00:00'),
  (132, 62, 8, 'Wednesday', '08:00:00', '17:00:00'),
  (133, 63, 8, 'Tuesday',   '08:00:00', '17:00:00'),
  (134, 63, 8, 'Thursday',  '08:00:00', '17:00:00'),
  (135, 64, 8, 'Monday',    '09:00:00', '17:00:00'),
  (136, 64, 8, 'Wednesday', '09:00:00', '17:00:00'),
  (137, 65, 8, 'Tuesday',   '09:00:00', '17:00:00'),
  (138, 65, 8, 'Friday',    '09:00:00', '17:00:00');

-- ─── New Users (IDs 44–77) ───────────────────────────────────
-- Doctor@123 → $2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6

INSERT IGNORE INTO users (user_id, email, password_hash, role, physician_id, staff_id) VALUES
  (44, 'reed131@audittrailhealth.com',       '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 31, NULL),
  (45, 'price132@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 32, NULL),
  (46, 'allen133@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 33, NULL),
  (47, 'cook134@audittrailhealth.com',       '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 34, NULL),
  (48, 'flores135@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 35, NULL),
  (49, 'simmons136@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 36, NULL),
  (50, 'huang137@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 37, NULL),
  (51, 'jordan138@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 38, NULL),
  (52, 'perry139@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 39, NULL),
  (53, 'ross140@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 40, NULL),
  (54, 'wallace141@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 41, NULL),
  (55, 'bennett142@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 42, NULL),
  (56, 'diaz143@audittrailhealth.com',       '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 43, NULL),
  (57, 'wu144@audittrailhealth.com',        '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 44, NULL),
  (58, 'vasquez145@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 45, NULL),
  (59, 'nguyen146@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 46, NULL),
  (60, 'morales147@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 47, NULL),
  (61, 'griffin148@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 48, NULL),
  (62, 'stone149@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 49, NULL),
  (63, 'owens150@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 50, NULL),
  (64, 'murphy151@audittrailhealth.com',     '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 51, NULL),
  (65, 'castillo152@audittrailhealth.com',   '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 52, NULL),
  (66, 'hoffman153@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 53, NULL),
  (67, 'reyes154@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 54, NULL),
  (68, 'cunningham155@audittrailhealth.com', '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 55, NULL),
  (69, 'park156@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 56, NULL),
  (70, 'yates157@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 57, NULL),
  (71, 'watts158@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 58, NULL),
  (72, 'fleming159@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 59, NULL),
  (73, 'cross160@audittrailhealth.com',      '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 60, NULL),
  (74, 'tran161@audittrailhealth.com',       '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 61, NULL),
  (75, 'manning162@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 62, NULL),
  (76, 'holt163@audittrailhealth.com',       '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 63, NULL),
  (77, 'stanton164@audittrailhealth.com',    '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 64, NULL),
  (78, 'egan165@audittrailhealth.com',       '$2b$10$iYtcOYwO7FI7XmaNKeVAYev4WdRcLNaYzcT08LtJoBxGdGXHElDk6', 'physician', 65, NULL);
