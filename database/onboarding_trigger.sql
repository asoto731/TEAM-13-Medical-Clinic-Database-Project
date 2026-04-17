-- ──────────────────────────────────────────────────────────────────
-- Patient Onboarding Trigger — Team 13
-- Run ONCE on Railway console AFTER onboarding_schema.sql
-- ──────────────────────────────────────────────────────────────────

DELIMITER $$

-- When a "New Patient" appointment is created, auto-create the intake form task
-- and mark the patient as pending intake.
CREATE TRIGGER after_new_patient_appointment
AFTER INSERT ON appointment
FOR EACH ROW
BEGIN
  IF NEW.appointment_type = 'New Patient' THEN

    -- Only create intake record if one doesn't already exist for this appointment
    IF NOT EXISTS (
      SELECT 1 FROM patient_intake WHERE appointment_id = NEW.appointment_id
    ) THEN
      INSERT INTO patient_intake (patient_id, appointment_id, status)
      VALUES (NEW.patient_id, NEW.appointment_id, 'Pending');
    END IF;

    -- Update patient onboarding_status so portal shows intake banner
    UPDATE patient
    SET onboarding_status = 'Intake Pending'
    WHERE patient_id = NEW.patient_id;

  END IF;
END$$

DELIMITER ;

-- ──────────────────────────────────────────────────────────────────
-- Demo: how to verify the trigger fired
-- After staff onboards a patient + books 'New Patient' appointment:
--   SELECT * FROM patient_intake ORDER BY intake_id DESC LIMIT 5;
--   SELECT patient_id, first_name, onboarding_status FROM patient ORDER BY patient_id DESC LIMIT 5;
-- ──────────────────────────────────────────────────────────────────
