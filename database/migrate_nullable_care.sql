-- Run this once on the production database to allow new patients without a pre-assigned physician/insurance
ALTER TABLE patient MODIFY primary_physician_id INT NULL DEFAULT NULL;
ALTER TABLE patient MODIFY insurance_id INT NULL DEFAULT NULL;
