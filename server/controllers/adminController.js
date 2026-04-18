const db     = require("../db");
const bcrypt = require("bcryptjs");
const { auditLog } = require("./authController");

// ── In-memory rate limiter ──
const loginAttempts = new Map();
function isRateLimited(ip, username) {
  const key = `${ip}:${(username || "").toLowerCase()}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  if (!loginAttempts.has(key)) loginAttempts.set(key, []);
  const attempts = loginAttempts.get(key).filter(t => now - t < windowMs);
  loginAttempts.set(key, attempts);
  if (attempts.length >= 5) return true;
  attempts.push(now);
  loginAttempts.set(key, attempts);
  return false;
}
function clearRateLimit(ip, username) { loginAttempts.delete(`${ip}:${(username || "").toLowerCase()}`); }

/* ─────────────────────────────────────────────
   POST /api/admin/login
───────────────────────────────────────────── */
const loginAdmin = (req, res) => {
  const { email, password } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  if (isRateLimited(ip, email))
    return res.status(429).json({ message: "Too many login attempts. Please wait 15 minutes." });

  db.query("SELECT * FROM users WHERE email = ? AND role = 'admin'", [email], (err, rows) => {
    if (err) return res.status(500).json({ message: "Login query failed" });
    if (!rows.length) return res.status(401).json({ message: "Invalid email or password" });

    const user = rows[0];
    if (!bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ message: "Invalid email or password" });

    clearRateLimit(ip, email);
    auditLog(user.user_id, "ADMIN_LOGIN", "user", user.user_id, ip);

    res.json({
      message: "Login successful",
      user: { id: user.user_id, email: user.email, role: user.role }
    });
  });
};

/* ─────────────────────────────────────────────
   GET /api/admin/dashboard
   Returns clinic-wide stats for the overview
───────────────────────────────────────────── */
const getAdminDashboard = (req, res) => {
  const statsSql = `
    SELECT
      (SELECT COUNT(*) FROM physician)  AS total_physicians,
      (SELECT COUNT(*) FROM staff)      AS total_staff,
      (SELECT COUNT(*) FROM patient)    AS total_patients,
      (SELECT COUNT(*) FROM appointment WHERE appointment_date >= CURDATE()) AS upcoming_appointments,
      (SELECT IFNULL(SUM(patient_owed),0) FROM billing WHERE payment_status != 'Paid') AS outstanding_revenue,
      (SELECT IFNULL(SUM(total_amount),0) FROM billing) AS total_billed`;

  const clinicsSql = `
    SELECT c.clinic_id, c.clinic_name, c.city, c.state,
      COUNT(DISTINCT d.department_id) AS departments,
      COUNT(DISTINCT ph.physician_id) AS physicians,
      COUNT(DISTINCT a.appointment_id) AS appointments_this_month
    FROM clinic c
    LEFT JOIN department d ON d.clinic_id = c.clinic_id
    LEFT JOIN office o ON o.clinic_id = c.clinic_id
    LEFT JOIN appointment a ON a.office_id = o.office_id
      AND MONTH(a.appointment_date) = MONTH(CURDATE())
      AND YEAR(a.appointment_date) = YEAR(CURDATE())
    LEFT JOIN physician ph ON ph.department_id = d.department_id
    GROUP BY c.clinic_id, c.clinic_name, c.city, c.state
    ORDER BY c.clinic_name`;

  const recentApptSql = `
    SELECT a.appointment_id, a.appointment_date, a.appointment_time,
      CONCAT(pt.first_name,' ',pt.last_name) AS patient_name,
      CONCAT(ph.first_name,' ',ph.last_name) AS physician_name,
      s.status_name, o.city
    FROM appointment a
    JOIN patient pt ON a.patient_id = pt.patient_id
    JOIN physician ph ON a.physician_id = ph.physician_id
    JOIN appointment_status s ON a.status_id = s.status_id
    JOIN office o ON a.office_id = o.office_id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
    LIMIT 10`;

  let data = {};
  let done = 0;
  const total = 3;
  function finish() { done++; if (done === total) res.json(data); }

  db.query(statsSql,      (e, r) => { data.stats        = e ? null : r[0]; finish(); });
  db.query(clinicsSql,    (e, r) => { data.clinics      = e ? []   : r;    finish(); });
  db.query(recentApptSql, (e, r) => { data.recentAppts  = e ? []   : r;    finish(); });
};

/* ─────────────────────────────────────────────
   GET /api/admin/clinic-report
   Full report per clinic: appointments, revenue, physicians, staff
───────────────────────────────────────────── */
const getClinicReport = (req, res) => {
  const sql = `
    SELECT
      c.clinic_id,
      c.clinic_name,
      c.city,
      c.state,
      COUNT(DISTINCT ph.physician_id)   AS total_physicians,
      COUNT(DISTINCT st.staff_id)       AS total_staff,
      COUNT(DISTINCT a.appointment_id)  AS total_appointments,
      SUM(CASE WHEN aps.status_name = 'Completed'  THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN aps.status_name = 'No-Show'    THEN 1 ELSE 0 END) AS no_shows,
      SUM(CASE WHEN aps.status_name = 'Cancelled'  THEN 1 ELSE 0 END) AS cancelled,
      IFNULL(SUM(b.total_amount), 0)    AS total_billed,
      IFNULL(SUM(b.patient_owed), 0)    AS outstanding_balance,
      IFNULL(SUM(CASE WHEN b.payment_status = 'Paid' THEN b.total_amount ELSE 0 END), 0) AS total_collected
    FROM clinic c
    LEFT JOIN office o          ON o.clinic_id      = c.clinic_id
    LEFT JOIN department d      ON d.clinic_id      = c.clinic_id
    LEFT JOIN physician ph      ON ph.department_id = d.department_id
    LEFT JOIN staff st          ON st.department_id = d.department_id
    LEFT JOIN appointment a     ON a.office_id      = o.office_id
    LEFT JOIN appointment_status aps ON a.status_id = aps.status_id
    LEFT JOIN billing b         ON b.appointment_id = a.appointment_id
    GROUP BY c.clinic_id, c.clinic_name, c.city, c.state
    ORDER BY c.clinic_name`;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Query failed: " + err.message });
    res.json({ clinics: rows });
  });
};

/* ─────────────────────────────────────────────
   GET /api/admin/physicians  — list all
───────────────────────────────────────────── */
const getAllPhysicians = (req, res) => {
  db.query(
    `SELECT ph.physician_id, ph.first_name, ph.last_name, ph.email,
            ph.phone_number, ph.specialty, ph.physician_type, ph.hire_date,
            d.department_name, c.clinic_name
     FROM physician ph
     LEFT JOIN department d ON ph.department_id = d.department_id
     LEFT JOIN clinic c ON d.clinic_id = c.clinic_id
     ORDER BY ph.last_name, ph.first_name`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Query failed" });
      res.json(rows);
    }
  );
};

/* ─────────────────────────────────────────────
   GET /api/admin/staff-members  — list all
───────────────────────────────────────────── */
const getAllStaff = (req, res) => {
  db.query(
    `SELECT st.staff_id, st.first_name, st.last_name, st.email,
            st.phone_number, st.role, st.hire_date, st.shift_start, st.shift_end,
            d.department_name, c.clinic_name
     FROM staff st
     LEFT JOIN department d ON st.department_id = d.department_id
     LEFT JOIN clinic c ON d.clinic_id = c.clinic_id
     ORDER BY st.last_name, st.first_name`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Query failed" });
      res.json(rows);
    }
  );
};

/* ─────────────────────────────────────────────
   GET /api/admin/departments  — for dropdowns
───────────────────────────────────────────── */
const getDepartments = (req, res) => {
  db.query(
    `SELECT d.department_id, d.department_name, c.clinic_name
     FROM department d JOIN clinic c ON d.clinic_id = c.clinic_id
     ORDER BY c.clinic_name, d.department_name`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Query failed" });
      res.json(rows);
    }
  );
};

/* ─────────────────────────────────────────────
   GET /api/admin/offices  — for dropdowns
───────────────────────────────────────────── */
const getOffices = (req, res) => {
  db.query(
    `SELECT o.office_id, o.city, o.street_address, c.clinic_name
     FROM office o JOIN clinic c ON o.clinic_id = c.clinic_id
     ORDER BY c.clinic_name, o.city`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Query failed" });
      res.json(rows);
    }
  );
};

/* ─────────────────────────────────────────────
   POST /api/admin/add-physician
   Body: { first_name, last_name, phone_number, specialty,
           physician_type, department_id, hire_date, password,
           schedule: [{ office_id, day_of_week, start_time, end_time }] }
   Email is auto-generated: lastnameNNN@audittrailhealth.com
───────────────────────────────────────────── */

/* Generate a unique lastnameNNN@audittrailhealth.com email */
function generateStaffEmail(lastName, cb) {
  const base = lastName.toLowerCase().replace(/[^a-z]/g, "");
  const tryEmail = () => {
    const num   = Math.floor(100 + Math.random() * 900); // 100–999
    const email = `${base}${num}@audittrailhealth.com`;
    db.query("SELECT user_id FROM users WHERE email = ?", [email], (err, rows) => {
      if (err) return cb(err);
      if (rows.length) return tryEmail(); // collision — try again
      cb(null, email);
    });
  };
  tryEmail();
}

const addPhysician = (req, res) => {
  const {
    first_name, last_name, phone_number,
    specialty, physician_type, department_id, hire_date,
    password, schedule
  } = req.body;

  if (!first_name || !last_name || !password)
    return res.status(400).json({ message: "first_name, last_name, and password are required" });

  // Auto-generate unique email: lastnameNNN@audittrailhealth.com
  generateStaffEmail(last_name, (genErr, autoEmail) => {
    if (genErr) return res.status(500).json({ message: "Could not generate email" });

    const hash = bcrypt.hashSync(password, 10);

    // Insert user FIRST (physician.email FK references users.email)
    db.query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'physician')",
      [autoEmail, hash],
      (uErr, uResult) => {
        if (uErr) return res.status(500).json({ message: "Could not create user account: " + uErr.message });

        const user_id = uResult.insertId;

        const phSql = `INSERT INTO physician
          (first_name, last_name, email, phone_number, specialty, physician_type, department_id, hire_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(phSql, [
          first_name, last_name, autoEmail, phone_number || null,
          specialty || null, physician_type || "primary",
          department_id || null, hire_date || null
        ], (phErr, phResult) => {
          if (phErr) {
            db.query("DELETE FROM users WHERE user_id = ?", [user_id], () => {});
            return res.status(500).json({ message: "Could not insert physician: " + phErr.message });
          }

          const physician_id = phResult.insertId;

          // Link physician_id back to the user row
          db.query("UPDATE users SET physician_id = ? WHERE user_id = ?", [physician_id, user_id], () => {});

          if (schedule && schedule.length > 0) {
            const schSql = "INSERT IGNORE INTO work_schedule (physician_id, office_id, day_of_week, start_time, end_time) VALUES ?";
            const schVals = schedule.map(s => [physician_id, s.office_id, s.day_of_week, s.start_time, s.end_time]);
            db.query(schSql, [schVals], () => {});
          }

          res.status(201).json({ message: "Physician added successfully", physician_id, email: autoEmail });
        });
      }
    );
  });
};

/* ─────────────────────────────────────────────
   POST /api/admin/add-staff
   Body: { first_name, last_name, phone_number, role,
           department_id, hire_date, shift_start, shift_end, password }
   Email is auto-generated: lastnameNNN@audittrailhealth.com
───────────────────────────────────────────── */
const addStaff = (req, res) => {
  const {
    first_name, last_name, phone_number,
    role, department_id, hire_date,
    shift_start, shift_end, password
  } = req.body;

  if (!first_name || !last_name || !password)
    return res.status(400).json({ message: "first_name, last_name, and password are required" });

  generateStaffEmail(last_name, (genErr, autoEmail) => {
    if (genErr) return res.status(500).json({ message: "Could not generate email" });

    const hash = bcrypt.hashSync(password, 10);

    // Insert user FIRST (staff.email FK references users.email)
    db.query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'staff')",
      [autoEmail, hash],
      (uErr, uResult) => {
        if (uErr) return res.status(500).json({ message: "Could not create user account: " + uErr.message });

        const user_id = uResult.insertId;

        const stSql = `INSERT INTO staff
          (first_name, last_name, email, phone_number, role, department_id, hire_date, shift_start, shift_end)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(stSql, [
          first_name, last_name, autoEmail, phone_number || null,
          role || "Receptionist", department_id || null,
          hire_date || null, shift_start || null, shift_end || null
        ], (stErr, stResult) => {
          if (stErr) {
            db.query("DELETE FROM users WHERE user_id = ?", [user_id], () => {});
            return res.status(500).json({ message: "Could not insert staff: " + stErr.message });
          }

          const staff_id = stResult.insertId;

          // Link staff_id back to the user row
          db.query("UPDATE users SET staff_id = ? WHERE user_id = ?", [staff_id, user_id], () => {});

          res.status(201).json({ message: "Staff member added successfully", staff_id, email: autoEmail });
        });
      }
    );
  });
};

module.exports = {
  loginAdmin, getAdminDashboard, getClinicReport,
  getAllPhysicians, getAllStaff, getDepartments, getOffices,
  addPhysician, addStaff
};
