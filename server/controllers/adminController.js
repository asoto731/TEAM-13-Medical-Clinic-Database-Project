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
  const { username, password } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";

  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  if (isRateLimited(ip, username))
    return res.status(429).json({ message: "Too many login attempts. Please wait 15 minutes." });

  db.query(
    `SELECT u.*, a.first_name, a.last_name, a.admin_id
     FROM users u
     LEFT JOIN admin a ON u.admin_id = a.admin_id
     WHERE u.username = ? AND u.role = 'admin'`,
    [username],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Login query failed" });
      if (!rows.length) return res.status(401).json({ message: "Invalid username or password" });

      const user = rows[0];
      if (!bcrypt.compareSync(password, user.password_hash))
        return res.status(401).json({ message: "Invalid username or password" });

      clearRateLimit(ip, username);
      auditLog(user.user_id, "ADMIN_LOGIN", "user", user.user_id, ip);

      res.json({
        message: "Login successful",
        user: {
          id:         user.user_id,
          adminId:    user.admin_id,
          username:   user.username,
          firstName:  user.first_name,
          lastName:   user.last_name,
          role:       user.role,
          clinicId:   user.clinic_id,           // null = global admin
          isGlobal:   user.clinic_id === null
        }
      });
    }
  );
};

/* ─────────────────────────────────────────────
   GET /api/admin/dashboard
───────────────────────────────────────────── */
const getAdminDashboard = (req, res) => {
  const cid = req.clinicId; // null = global

  const clinicFilter   = cid ? "WHERE c.clinic_id = ?"         : "";
  const officeFilter   = cid ? "WHERE o.clinic_id = ?"         : "";
  const deptFilter     = cid ? "WHERE d.clinic_id = ?"         : "";
  const apptJoinFilter = cid ? "AND o2.clinic_id = ?"          : "";
  const params         = cid ? [cid]                           : [];

  const statsSql = `
    SELECT
      (SELECT COUNT(*) FROM physician ph
         JOIN department d ON ph.department_id = d.department_id
         ${cid ? "WHERE d.clinic_id = ?" : ""})        AS total_physicians,
      (SELECT COUNT(*) FROM staff st
         JOIN department d ON st.department_id = d.department_id
         ${cid ? "WHERE d.clinic_id = ?" : ""})        AS total_staff,
      (SELECT COUNT(*) FROM patient)                    AS total_patients,
      (SELECT COUNT(*) FROM appointment a
         JOIN office o2 ON a.office_id = o2.office_id
         WHERE a.appointment_date >= CURDATE()
         ${apptJoinFilter})                             AS upcoming_appointments,
      (SELECT IFNULL(SUM(b.patient_owed),0) FROM billing b
         JOIN appointment a ON b.appointment_id = a.appointment_id
         JOIN office o2 ON a.office_id = o2.office_id
         WHERE b.payment_status != 'Paid'
         ${apptJoinFilter})                             AS outstanding_revenue,
      (SELECT IFNULL(SUM(b.total_amount),0) FROM billing b
         JOIN appointment a ON b.appointment_id = a.appointment_id
         JOIN office o2 ON a.office_id = o2.office_id
         ${apptJoinFilter})                             AS total_billed`;

  const statsParams = cid ? [cid, cid, cid, cid, cid] : [];

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
    ${clinicFilter}
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
    ${cid ? "WHERE o.clinic_id = ?" : ""}
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
    LIMIT 10`;

  let data = {}, done = 0;
  const total = 3;
  function finish() { done++; if (done === total) res.json(data); }

  db.query(statsSql,      statsParams,                  (e, r) => { data.stats       = e ? null : r[0]; finish(); });
  db.query(clinicsSql,    params,                       (e, r) => { data.clinics     = e ? []   : r;    finish(); });
  db.query(recentApptSql, cid ? [cid] : [],             (e, r) => { data.recentAppts = e ? []   : r;    finish(); });
};

/* ─────────────────────────────────────────────
   GET /api/admin/clinic-report
───────────────────────────────────────────── */
const getClinicReport = (req, res) => {
  const cid = req.clinicId;
  const filter = cid ? "WHERE c.clinic_id = ?" : "";
  const params = cid ? [cid] : [];

  const sql = `
    SELECT
      c.clinic_id, c.clinic_name, c.city, c.state,
      COUNT(DISTINCT ph.physician_id)  AS total_physicians,
      COUNT(DISTINCT st.staff_id)      AS total_staff,
      COUNT(DISTINCT a.appointment_id) AS total_appointments,
      SUM(CASE WHEN aps.status_name = 'Completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN aps.status_name = 'No-Show'   THEN 1 ELSE 0 END) AS no_shows,
      SUM(CASE WHEN aps.status_name = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled,
      IFNULL(SUM(b.total_amount), 0)   AS total_billed,
      IFNULL(SUM(b.patient_owed), 0)   AS outstanding_balance,
      IFNULL(SUM(CASE WHEN b.payment_status = 'Paid' THEN b.total_amount ELSE 0 END), 0) AS total_collected
    FROM clinic c
    LEFT JOIN office o          ON o.clinic_id      = c.clinic_id
    LEFT JOIN department d      ON d.clinic_id      = c.clinic_id
    LEFT JOIN physician ph      ON ph.department_id = d.department_id
    LEFT JOIN staff st          ON st.department_id = d.department_id
    LEFT JOIN appointment a     ON a.office_id      = o.office_id
    LEFT JOIN appointment_status aps ON a.status_id = aps.status_id
    LEFT JOIN billing b         ON b.appointment_id = a.appointment_id
    ${filter}
    GROUP BY c.clinic_id, c.clinic_name, c.city, c.state
    ORDER BY c.clinic_name`;

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ message: "Query failed: " + err.message });
    res.json({ clinics: rows });
  });
};

/* ─────────────────────────────────────────────
   GET /api/admin/physicians
───────────────────────────────────────────── */
const getAllPhysicians = (req, res) => {
  const cid = req.clinicId;
  const filter = cid ? "WHERE d.clinic_id = ?" : "";
  const params = cid ? [cid] : [];

  db.query(
    `SELECT ph.physician_id, ph.first_name, ph.last_name, ph.email,
            ph.phone_number, ph.specialty, ph.physician_type, ph.hire_date,
            d.department_name, c.clinic_name
     FROM physician ph
     LEFT JOIN department d ON ph.department_id = d.department_id
     LEFT JOIN clinic c ON d.clinic_id = c.clinic_id
     ${filter}
     ORDER BY ph.last_name, ph.first_name`,
    params,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Query failed" });
      res.json(rows);
    }
  );
};

/* ─────────────────────────────────────────────
   GET /api/admin/staff-members
───────────────────────────────────────────── */
const getAllStaff = (req, res) => {
  const cid = req.clinicId;
  const filter = cid ? "WHERE d.clinic_id = ?" : "";
  const params = cid ? [cid] : [];

  db.query(
    `SELECT st.staff_id, st.first_name, st.last_name, st.email,
            st.phone_number, st.role, st.hire_date, st.shift_start, st.shift_end,
            d.department_name, c.clinic_name
     FROM staff st
     LEFT JOIN department d ON st.department_id = d.department_id
     LEFT JOIN clinic c ON d.clinic_id = c.clinic_id
     ${filter}
     ORDER BY st.last_name, st.first_name`,
    params,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Query failed" });
      res.json(rows);
    }
  );
};

/* ─────────────────────────────────────────────
   GET /api/admin/departments
───────────────────────────────────────────── */
const getDepartments = (req, res) => {
  const cid = req.clinicId;
  const filter = cid ? "WHERE d.clinic_id = ?" : "";
  const params = cid ? [cid] : [];

  db.query(
    `SELECT d.department_id, d.department_name, c.clinic_name
     FROM department d JOIN clinic c ON d.clinic_id = c.clinic_id
     ${filter}
     ORDER BY c.clinic_name, d.department_name`,
    params,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Query failed" });
      res.json(rows);
    }
  );
};

/* ─────────────────────────────────────────────
   GET /api/admin/offices
───────────────────────────────────────────── */
const getOffices = (req, res) => {
  const cid = req.clinicId;
  const filter = cid ? "WHERE o.clinic_id = ?" : "";
  const params = cid ? [cid] : [];

  db.query(
    `SELECT o.office_id, o.city, o.street_address, c.clinic_name
     FROM office o JOIN clinic c ON o.clinic_id = c.clinic_id
     ${filter}
     ORDER BY c.clinic_name, o.city`,
    params,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Query failed" });
      res.json(rows);
    }
  );
};

/* ─────────────────────────────────────────────
   POST /api/admin/add-physician
───────────────────────────────────────────── */
const addPhysician = (req, res) => {
  const {
    first_name, last_name, email, phone_number,
    specialty, physician_type, department_id, hire_date,
    username, password, schedule
  } = req.body;

  if (!first_name || !last_name || !username || !password)
    return res.status(400).json({ message: "first_name, last_name, username, and password are required" });

  db.query("SELECT user_id FROM users WHERE username = ?", [username], (err, existing) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (existing.length) return res.status(409).json({ message: "Username already taken" });

    const phSql = `INSERT INTO physician
      (first_name, last_name, email, phone_number, specialty, physician_type, department_id, hire_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(phSql, [
      first_name, last_name, email || null, phone_number || null,
      specialty || null, physician_type || "primary",
      department_id || null, hire_date || null
    ], (phErr, phResult) => {
      if (phErr) return res.status(500).json({ message: "Could not insert physician: " + phErr.message });

      const physician_id = phResult.insertId;
      const hash = bcrypt.hashSync(password, 10);

      db.query(
        "INSERT INTO users (username, password_hash, role, physician_id) VALUES (?, ?, 'physician', ?)",
        [username, hash, physician_id],
        (uErr) => {
          if (uErr) return res.status(500).json({ message: "Could not create user account: " + uErr.message });

          if (schedule && schedule.length > 0) {
            const schSql = "INSERT IGNORE INTO work_schedule (physician_id, office_id, day_of_week, start_time, end_time) VALUES ?";
            const schVals = schedule.map(s => [physician_id, s.office_id, s.day_of_week, s.start_time, s.end_time]);
            db.query(schSql, [schVals], () => {});
          }

          res.status(201).json({ message: "Physician added successfully", physician_id });
        }
      );
    });
  });
};

/* ─────────────────────────────────────────────
   POST /api/admin/add-staff
───────────────────────────────────────────── */
const addStaff = (req, res) => {
  const {
    first_name, last_name, email, phone_number,
    role, department_id, hire_date,
    shift_start, shift_end,
    username, password
  } = req.body;

  if (!first_name || !last_name || !username || !password)
    return res.status(400).json({ message: "first_name, last_name, username, and password are required" });

  db.query("SELECT user_id FROM users WHERE username = ?", [username], (err, existing) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (existing.length) return res.status(409).json({ message: "Username already taken" });

    const stSql = `INSERT INTO staff
      (first_name, last_name, email, phone_number, role, department_id, hire_date, shift_start, shift_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(stSql, [
      first_name, last_name, email || null, phone_number || null,
      role || "Receptionist", department_id || null,
      hire_date || null, shift_start || null, shift_end || null
    ], (stErr, stResult) => {
      if (stErr) return res.status(500).json({ message: "Could not insert staff: " + stErr.message });

      const staff_id = stResult.insertId;
      const hash = bcrypt.hashSync(password, 10);

      db.query(
        "INSERT INTO users (username, password_hash, role, staff_id) VALUES (?, ?, 'staff', ?)",
        [username, hash, staff_id],
        (uErr) => {
          if (uErr) return res.status(500).json({ message: "Could not create user account: " + uErr.message });
          res.status(201).json({ message: "Staff member added successfully", staff_id });
        }
      );
    });
  });
};

module.exports = {
  loginAdmin, getAdminDashboard, getClinicReport,
  getAllPhysicians, getAllStaff, getDepartments, getOffices,
  addPhysician, addStaff
};
