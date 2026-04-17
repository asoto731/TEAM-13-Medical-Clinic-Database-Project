const express = require("express");
const router = express.Router();
const { getPatientDashboard, updatePatientProfile, getCareCities, getPhysiciansByCity, getInsuranceOptions, assignCare, getSpecialistsByCity, requestReferral, getPhysicianSchedule, getAvailableSlots, bookAppointment, cancelAppointment, getIntakeForm, submitIntakeForm } = require("../controllers/patientController");
const { requireRole } = require("../middleware/auth");

router.get("/dashboard",       requireRole("patient"), getPatientDashboard);
router.put("/profile",         requireRole("patient"), updatePatientProfile);
router.get("/care/cities",     requireRole("patient"), getCareCities);
router.get("/care/physicians", requireRole("patient"), getPhysiciansByCity);
router.get("/care/insurance",  requireRole("patient"), getInsuranceOptions);
router.put("/care/assign",            requireRole("patient"), assignCare);
router.get("/referral/specialists",       requireRole("patient"), getSpecialistsByCity);
router.post("/referral/request",          requireRole("patient"), requestReferral);
router.get("/appointments/physician-schedule", requireRole("patient"), getPhysicianSchedule);
router.get("/appointments/slots",         requireRole("patient"), getAvailableSlots);
router.post("/appointments/book",         requireRole("patient"), bookAppointment);
router.put("/appointments/:id/cancel",    requireRole("patient"), cancelAppointment);
router.get("/intake/:appointment_id",     requireRole("patient"), getIntakeForm);
router.post("/intake/:appointment_id",    requireRole("patient"), submitIntakeForm);

module.exports = router;
