const express = require("express");
const router  = express.Router();
const {
  loginAdmin, getAdminDashboard, getClinicReport,
  getAllPhysicians, getAllStaff, getDepartments, getOffices,
  addPhysician, addStaff
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

module.exports = router;
