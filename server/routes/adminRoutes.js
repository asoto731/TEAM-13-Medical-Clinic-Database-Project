const express = require("express");
const router  = express.Router();
const {
  loginAdmin, getAdminDashboard, getClinicReport,
  getAllPhysicians, getAllStaff, getDepartments, getOffices,
  addPhysician, addStaff,
  getRevenueReport, getARReport, getAppointmentReport,
  getPhysicianProductivity, getReferralReport, getInsuranceBreakdown,
  getClinicAppointments
} = require("../controllers/adminController");
const { requireRole } = require("../middleware/auth");

router.post("/login",            loginAdmin);
router.get("/dashboard",         requireRole("admin"), getAdminDashboard);
router.get("/clinic-report",     requireRole("admin"), getClinicReport);
router.get("/physicians",        requireRole("admin"), getAllPhysicians);
router.get("/staff-members",     requireRole("admin"), getAllStaff);
router.get("/departments",       requireRole("admin"), getDepartments);
router.get("/offices",           requireRole("admin"), getOffices);
router.post("/add-physician",    requireRole("admin"), addPhysician);
router.post("/add-staff",        requireRole("admin"), addStaff);

router.get("/clinic-appointments",   requireRole("admin"), getClinicAppointments);

// Report endpoints
router.get("/reports/revenue",               requireRole("admin"), getRevenueReport);
router.get("/reports/ar",                    requireRole("admin"), getARReport);
router.get("/reports/appointments",          requireRole("admin"), getAppointmentReport);
router.get("/reports/physician-productivity",requireRole("admin"), getPhysicianProductivity);
router.get("/reports/referrals",             requireRole("admin"), getReferralReport);
router.get("/reports/insurance-breakdown",   requireRole("admin"), getInsuranceBreakdown);

module.exports = router;
