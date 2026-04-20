-- ─── Add demo appointments for today (2026-04-18) ───────────────────────────
-- Run this on Railway to make the Staff "Today's Schedule" feature show data
-- without needing to fully re-seed. Safe to run multiple times (INSERT IGNORE).

INSERT IGNORE INTO appointment
  (appointment_id, patient_id, physician_id, office_id,
   appointment_date, appointment_time, status_id,
   booking_method, reason_for_visit, appointment_type, duration_minutes)
VALUES
  (9,  1, 1, 1, '2026-04-18', '10:00:00', 1, 'online',    'Blood pressure recheck',     'Follow-Up',  30),
  (10, 4, 1, 1, '2026-04-18', '11:30:00', 1, 'phone',     'Diabetes management review', 'Follow-Up',  30),
  (11, 5, 3, 2, '2026-04-18', '09:30:00', 1, 'online',    'Routine wellness checkup',   'General',    30),
  (12, 3, 5, 3, '2026-04-18', '14:00:00', 1, 'in-person', 'Migraine consultation',      'Specialist', 45);
