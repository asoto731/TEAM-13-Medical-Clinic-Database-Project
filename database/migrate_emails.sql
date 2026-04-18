-- ============================================================
--  Email Migration — lastnameNNN@audittrailhealth.com
--  Run ONCE in the Railway query console.
--  Steps:
--    1. Update users.username values to email format
--    2. Update physician.email + staff.email to match
--    3. Rename users.username column to users.email
--    4. Add FK: physician.email → users.email
--    5. Add FK: staff.email    → users.email
-- ============================================================

-- ─── 1. Update users.username for all physicians ─────────────
UPDATE users SET username = 'johnson101@audittrailhealth.com'  WHERE physician_id = 1;
UPDATE users SET username = 'garcia102@audittrailhealth.com'   WHERE physician_id = 2;
UPDATE users SET username = 'moore103@audittrailhealth.com'    WHERE physician_id = 3;
UPDATE users SET username = 'white104@audittrailhealth.com'    WHERE physician_id = 4;
UPDATE users SET username = 'davis105@audittrailhealth.com'    WHERE physician_id = 5;
UPDATE users SET username = 'foster106@audittrailhealth.com'   WHERE physician_id = 6;
UPDATE users SET username = 'chen107@audittrailhealth.com'     WHERE physician_id = 7;
UPDATE users SET username = 'kim108@audittrailhealth.com'      WHERE physician_id = 8;
UPDATE users SET username = 'martinez109@audittrailhealth.com' WHERE physician_id = 9;
UPDATE users SET username = 'thompson110@audittrailhealth.com' WHERE physician_id = 10;
UPDATE users SET username = 'lee111@audittrailhealth.com'      WHERE physician_id = 11;
UPDATE users SET username = 'nguyen112@audittrailhealth.com'   WHERE physician_id = 12;
UPDATE users SET username = 'rivera113@audittrailhealth.com'   WHERE physician_id = 13;
UPDATE users SET username = 'scott114@audittrailhealth.com'    WHERE physician_id = 14;
UPDATE users SET username = 'brown115@audittrailhealth.com'    WHERE physician_id = 15;
UPDATE users SET username = 'patel116@audittrailhealth.com'    WHERE physician_id = 16;
UPDATE users SET username = 'hall117@audittrailhealth.com'     WHERE physician_id = 17;
UPDATE users SET username = 'wright118@audittrailhealth.com'   WHERE physician_id = 18;
UPDATE users SET username = 'chan119@audittrailhealth.com'     WHERE physician_id = 19;
UPDATE users SET username = 'monroe120@audittrailhealth.com'   WHERE physician_id = 20;
UPDATE users SET username = 'wilson121@audittrailhealth.com'   WHERE physician_id = 21;
UPDATE users SET username = 'clark122@audittrailhealth.com'    WHERE physician_id = 22;
UPDATE users SET username = 'lewis123@audittrailhealth.com'    WHERE physician_id = 23;
UPDATE users SET username = 'sharma124@audittrailhealth.com'   WHERE physician_id = 24;
UPDATE users SET username = 'torres125@audittrailhealth.com'   WHERE physician_id = 25;
UPDATE users SET username = 'evans126@audittrailhealth.com'    WHERE physician_id = 26;
UPDATE users SET username = 'collins127@audittrailhealth.com'  WHERE physician_id = 27;
UPDATE users SET username = 'hill128@audittrailhealth.com'     WHERE physician_id = 28;
UPDATE users SET username = 'baker129@audittrailhealth.com'    WHERE physician_id = 29;
UPDATE users SET username = 'nelson130@audittrailhealth.com'   WHERE physician_id = 30;
UPDATE users SET username = 'reed131@audittrailhealth.com'     WHERE physician_id = 31;
UPDATE users SET username = 'price132@audittrailhealth.com'    WHERE physician_id = 32;
UPDATE users SET username = 'allen133@audittrailhealth.com'    WHERE physician_id = 33;
UPDATE users SET username = 'cook134@audittrailhealth.com'     WHERE physician_id = 34;
UPDATE users SET username = 'flores135@audittrailhealth.com'   WHERE physician_id = 35;
UPDATE users SET username = 'simmons136@audittrailhealth.com'  WHERE physician_id = 36;
UPDATE users SET username = 'huang137@audittrailhealth.com'    WHERE physician_id = 37;
UPDATE users SET username = 'jordan138@audittrailhealth.com'   WHERE physician_id = 38;
UPDATE users SET username = 'perry139@audittrailhealth.com'    WHERE physician_id = 39;
UPDATE users SET username = 'ross140@audittrailhealth.com'     WHERE physician_id = 40;
UPDATE users SET username = 'wallace141@audittrailhealth.com'  WHERE physician_id = 41;
UPDATE users SET username = 'bennett142@audittrailhealth.com'  WHERE physician_id = 42;
UPDATE users SET username = 'diaz143@audittrailhealth.com'     WHERE physician_id = 43;
UPDATE users SET username = 'wu144@audittrailhealth.com'       WHERE physician_id = 44;
UPDATE users SET username = 'vasquez145@audittrailhealth.com'  WHERE physician_id = 45;
UPDATE users SET username = 'nguyen146@audittrailhealth.com'   WHERE physician_id = 46;
UPDATE users SET username = 'morales147@audittrailhealth.com'  WHERE physician_id = 47;
UPDATE users SET username = 'griffin148@audittrailhealth.com'  WHERE physician_id = 48;
UPDATE users SET username = 'stone149@audittrailhealth.com'    WHERE physician_id = 49;
UPDATE users SET username = 'owens150@audittrailhealth.com'    WHERE physician_id = 50;
UPDATE users SET username = 'murphy151@audittrailhealth.com'   WHERE physician_id = 51;
UPDATE users SET username = 'castillo152@audittrailhealth.com' WHERE physician_id = 52;
UPDATE users SET username = 'hoffman153@audittrailhealth.com'  WHERE physician_id = 53;
UPDATE users SET username = 'reyes154@audittrailhealth.com'    WHERE physician_id = 54;
UPDATE users SET username = 'cunningham155@audittrailhealth.com' WHERE physician_id = 55;
UPDATE users SET username = 'park156@audittrailhealth.com'     WHERE physician_id = 56;
UPDATE users SET username = 'yates157@audittrailhealth.com'    WHERE physician_id = 57;
UPDATE users SET username = 'watts158@audittrailhealth.com'    WHERE physician_id = 58;
UPDATE users SET username = 'fleming159@audittrailhealth.com'  WHERE physician_id = 59;
UPDATE users SET username = 'cross160@audittrailhealth.com'    WHERE physician_id = 60;
UPDATE users SET username = 'tran161@audittrailhealth.com'     WHERE physician_id = 61;
UPDATE users SET username = 'manning162@audittrailhealth.com'  WHERE physician_id = 62;
UPDATE users SET username = 'holt163@audittrailhealth.com'     WHERE physician_id = 63;
UPDATE users SET username = 'stanton164@audittrailhealth.com'  WHERE physician_id = 64;
UPDATE users SET username = 'egan165@audittrailhealth.com'     WHERE physician_id = 65;

-- ─── 2. Update users.username for all staff ──────────────────
UPDATE users SET username = 'adams201@audittrailhealth.com'    WHERE staff_id = 1;
UPDATE users SET username = 'brooks202@audittrailhealth.com'   WHERE staff_id = 2;
UPDATE users SET username = 'taylor203@audittrailhealth.com'   WHERE staff_id = 3;
UPDATE users SET username = 'gomez204@audittrailhealth.com'    WHERE staff_id = 4;
UPDATE users SET username = 'kim205@audittrailhealth.com'      WHERE staff_id = 5;
UPDATE users SET username = 'lin206@audittrailhealth.com'      WHERE staff_id = 6;
UPDATE users SET username = 'mendez207@audittrailhealth.com'   WHERE staff_id = 7;
UPDATE users SET username = 'ross208@audittrailhealth.com'     WHERE staff_id = 8;

-- ─── 3. Sync physician.email to match login email ─────────────
UPDATE physician ph
JOIN users u ON u.physician_id = ph.physician_id
SET ph.email = u.username;

-- ─── 4. Sync staff.email to match login email ─────────────────
UPDATE staff s
JOIN users u ON u.staff_id = s.staff_id
SET s.email = u.username;

-- ─── 5. Rename users.username → users.email ──────────────────
ALTER TABLE users CHANGE COLUMN username email VARCHAR(150) NOT NULL;

-- ─── 6. Add FK: physician.email → users.email (ON UPDATE CASCADE) ──
--  Ensures physician.email always matches a valid users.email.
--  ON UPDATE CASCADE: if the login email ever changes, the physician
--  row updates automatically.
ALTER TABLE physician
  ADD CONSTRAINT fk_physician_user_email
  FOREIGN KEY (email) REFERENCES users(email)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- ─── 7. Add FK: staff.email → users.email ────────────────────
ALTER TABLE staff
  ADD CONSTRAINT fk_staff_user_email
  FOREIGN KEY (email) REFERENCES users(email)
  ON UPDATE CASCADE ON DELETE SET NULL;
