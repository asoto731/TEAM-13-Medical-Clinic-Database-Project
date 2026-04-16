const express = require("express");
const router = express.Router();

const { testRoute, registerUser, loginUser, getInsurancePlans } = require("../controllers/authController");

router.get("/test", testRoute);
router.get("/insurance-plans", getInsurancePlans);   // public — used on registration page
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
