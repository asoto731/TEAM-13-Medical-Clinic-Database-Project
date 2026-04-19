-- ============================================================
--  Insurance Analytics Triggers
--  Run ONCE in Railway query console after running the main schema.
--
--  Trigger: after_billing_insert_check_threshold
--    Fires after every INSERT on billing.
--    If the claim's actual reimbursement % is below the clinic's
--    contracted threshold for that payer → inserts a payer_alert row.
--    Those alerts surface as the warning banner on the admin
--    Insurance dashboard.
-- ============================================================

DELIMITER $$

DROP TRIGGER IF EXISTS after_billing_insert_check_threshold$$

CREATE TRIGGER after_billing_insert_check_threshold
AFTER INSERT ON billing
FOR EACH ROW
BEGIN
  DECLARE v_threshold DECIMAL(5,2) DEFAULT NULL;
  DECLARE v_actual    DECIMAL(5,2) DEFAULT NULL;
  DECLARE v_clinic_id INT          DEFAULT NULL;

  -- Resolve which clinic this appointment belongs to
  SELECT o.clinic_id INTO v_clinic_id
  FROM appointment a
  JOIN office o ON a.office_id = o.office_id
  WHERE a.appointment_id = NEW.appointment_id
  LIMIT 1;

  -- Look up the contracted reimbursement floor for this payer + clinic
  IF NEW.insurance_id IS NOT NULL AND v_clinic_id IS NOT NULL THEN
    SELECT reimbursement_threshold_pct INTO v_threshold
    FROM clinic_accepted_insurance
    WHERE insurance_id = NEW.insurance_id
      AND clinic_id    = v_clinic_id
      AND is_active    = TRUE
    LIMIT 1;

    -- Compare actual rate to threshold; fire alert if below
    IF v_threshold IS NOT NULL AND NEW.total_amount > 0 THEN
      SET v_actual = (NEW.insurance_paid_amount / NEW.total_amount) * 100;

      IF v_actual < v_threshold THEN
        INSERT INTO payer_alert (insurance_id, clinic_id, alert_type, alert_message)
        VALUES (
          NEW.insurance_id,
          v_clinic_id,
          'BELOW_THRESHOLD',
          CONCAT(
            'Bill #', NEW.bill_id,
            ': reimbursement of ', ROUND(v_actual, 1),
            '% is below the contracted threshold of ', v_threshold,
            '% for this payer.'
          )
        );
      END IF;
    END IF;
  END IF;
END$$

DELIMITER ;
