/**
 * create_admin.js
 * ─────────────────────────────────────────────────────────────
 * Run this ONCE to create the single admin account.
 *
 *   node database/create_admin.js
 *
 * You will be prompted for a password, or you can pass one:
 *
 *   ADMIN_PASSWORD="MyStr0ng!Pass" node database/create_admin.js
 *
 * Default username : admin@audittrailhealth.com
 * ─────────────────────────────────────────────────────────────
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const db     = require("../server/db");

const ADMIN_USERNAME = "admin@audittrailhealth.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@1234!";

async function run() {
  console.log("\n── Admin Account Setup ──────────────────────────────");

  // Check if an admin already exists
  db.query("SELECT user_id, username FROM users WHERE role = 'admin'", (err, rows) => {
    if (err) { console.error("DB error:", err.message); process.exit(1); }

    if (rows.length > 0) {
      console.log("⚠  An admin account already exists:");
      rows.forEach(r => console.log(`   user_id=${r.user_id}  username=${r.username}`));
      console.log("   Only one admin is allowed. Exiting.");
      process.exit(0);
    }

    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

    db.query(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')",
      [ADMIN_USERNAME, hash],
      (insertErr, result) => {
        if (insertErr) {
          console.error("❌  Could not create admin:", insertErr.message);
          process.exit(1);
        }
        console.log("✅  Admin account created successfully!");
        console.log(`   Username : ${ADMIN_USERNAME}`);
        console.log(`   Password : ${ADMIN_PASSWORD}`);
        console.log(`   user_id  : ${result.insertId}`);
        console.log("\n⚠  IMPORTANT: Change this password after your first login.");
        console.log("─────────────────────────────────────────────────────\n");
        process.exit(0);
      }
    );
  });
}

run();
