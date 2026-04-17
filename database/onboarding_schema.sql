-- ──────────────────────────────────────────────────────────────────
-- Patient Onboarding Schema — Team 13
-- Run ONCE on Railway console before deploying the onboarding feature
-- ──────────────────────────────────────────────────────────────────

-- 1. Pre-visit intake form (created by trigger, filled by patient)
CREATE TABLE IF NOT EXISTS patient_intake (
  intake_id             INT AUTO_INCREMENT PRIMARY KEY,
  patient_id            INT NOT NULL,
  appointment_id        INT NOT NULL,
  status                ENUM('Pending','Submitted','Reviewed') DEFAULT 'Pending',
  hipaa_signed          BOOLEAN DEFAULT FALSE,
  hipaa_signed_at       DATETIME,
  chief_complaint       VARCHAR(500),
  past_diagnoses        TEXT,
  past_surgeries        TEXT,
  current_medications   TEXT,
  known_allergies       TEXT,
  family_history        TEXT,
  social_history        TEXT,
  financial_consent     BOOLEAN DEFAULT FALSE,
  submitted_at          DATETIME,
  reviewed_by           INT,
  reviewed_at           DATETIME,
  FOREIGN KEY (patient_id)     REFERENCES patient(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE CASCADE
);

-- 2. Physician: flag whether accepting new patients (default TRUE)
ALTER TABLE physician ADD COLUMN accepting_new_patients BOOLEAN DEFAULT TRUE;

-- 3. Patient: onboarding pipeline status
ALTER TABLE patient ADD COLUMN onboarding_status
  ENUM('Incomplete','Intake Pending','Intake Submitted','Active') DEFAULT 'Incomplete';
