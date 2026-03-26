const express = require("express");
const router = express.Router();
const { getPatientDashboard, updatePatientProfile, getCareCities, getPhysiciansByCity, getInsuranceOptions, assignCare } = require("../controllers/patientController");

router.get("/dashboard", getPatientDashboard);
router.put("/profile",   updatePatientProfile);
router.get("/care/cities",     getCareCities);
router.get("/care/physicians", getPhysiciansByCity);
router.get("/care/insurance",  getInsuranceOptions);
router.put("/care/assign",     assignCare);

module.exports = router;
