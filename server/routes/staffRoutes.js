const express = require("express");
const router = express.Router();
const { loginStaff, getPhysicianDashboard, getStaffDashboard, getAllSchedules, getPhysicianReferrals, updateReferralStatus, addPhysicianNote } = require("../controllers/staffController");
const { requireRole } = require("../middleware/auth");

router.post("/login",                        loginStaff);
router.get("/physician/dashboard",           requireRole("physician"), getPhysicianDashboard);
router.get("/staff/dashboard",               requireRole("staff"),     getStaffDashboard);
router.get("/all-schedules",                 requireRole("physician", "staff"), getAllSchedules);
router.get("/physician/referrals",           requireRole("physician"), getPhysicianReferrals);
router.put("/referral/:referral_id/status",  requireRole("physician"), updateReferralStatus);
router.post("/physician/note",               requireRole("physician"), addPhysicianNote);

module.exports = router;
