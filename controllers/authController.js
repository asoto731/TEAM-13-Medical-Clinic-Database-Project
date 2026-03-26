const db      = require("../db");
const bcrypt  = require("bcryptjs");

const testRoute = (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json({ message: "Database connection works", result: results[0].result });
  });
};

const registerUser = (req, res) => {
  const { name, email, password, role, phone_number, date_of_birth } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  // ── Password strength rules (mirrors frontend checks) ──
  const pwErrors = [];
  if (password.length < 8)                       pwErrors.push("at least 8 characters");
  if (!/[A-Z]/.test(password))                   pwErrors.push("one uppercase letter");
  if (!/[0-9]/.test(password))                   pwErrors.push("one number");
  if (!/[^A-Za-z0-9]/.test(password))            pwErrors.push("one special character (e.g. !@#$)");
  if (pwErrors.length > 0) {
    return res.status(400).json({ error: `Password must contain: ${pwErrors.join(", ")}.` });
  }

  const checkEmailSql = "SELECT * FROM users WHERE username = ?";

  db.query(checkEmailSql, [email], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ error: "Error checking email" });
    }

    if (checkResults.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const insertSql =
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)";

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
      insertSql,
      [email, hashedPassword, role || "patient"],
      (insertErr, insertResult) => {
        if (insertErr) {
          return res.status(500).json({ error: "Error registering user" });
        }

        const newUserId = insertResult.insertId;

        // Only create a patient profile for patient-role registrations
        if ((role || "patient") !== "patient") {
          return res.status(201).json({ message: "User registered successfully", userId: newUserId });
        }

        // Split full name into first / last (everything after first space is last name)
        const nameParts = (name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "New";
        const lastName = nameParts.slice(1).join(" ") || "Patient";

        const patientSql = `INSERT INTO patient
          (patient_id, user_id, first_name, last_name, email, phone_number, date_of_birth)
          VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.query(patientSql, [newUserId, newUserId, firstName, lastName, email || null, phone_number || null, date_of_birth || null], (patErr) => {
          if (patErr) {
            console.error("Patient row creation failed:", patErr.message);
            // User was created — still return success, profile just incomplete
          }
          res.status(201).json({ message: "User registered successfully", userId: newUserId });
        });
      }
    );
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Login query failed" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];
    const stored = user.password_hash;

    // Support both bcrypt-hashed passwords (new) and legacy plain-text (seed data)
    const isHashed = stored && stored.startsWith("$2");
    const passwordMatch = isHashed
      ? bcrypt.compareSync(password, stored)
      : password === stored;

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.role !== "patient") {
      return res.status(403).json({ error: "Please use the Staff Portal to log in." });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.username,
        email: user.username,
        role: user.role
      }
    });
  });
};

module.exports = { testRoute, registerUser, loginUser };
