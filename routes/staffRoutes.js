const express = require("express");
const router = express.Router();
const { loginStaff, getPhysicianDashboard, getStaffDashboard, getAllSchedules } = require("../controllers/staffController");

router.post("/login",                loginStaff);
router.get("/physician/dashboard",   getPhysicianDashboard);
router.get("/staff/dashboard",       getStaffDashboard);
router.get("/all-schedules",         getAllSchedules);

module.exports = router;
