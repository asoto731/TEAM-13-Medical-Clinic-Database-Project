// ============================================================
//  Password Validation Utility — server/utils/validatePassword.js
//  Shared by authController and any future registration paths.
//
//  Rules (mirrored on the frontend in register.js):
//    • 8+ characters
//    • At least one uppercase letter
//    • At least one number
//    • At least one special character
// ============================================================

/**
 * validatePassword(password)
 * Returns null if the password is valid,
 * or an error string describing what is missing.
 */
function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }

  const errors = [];
  if (password.length < 8)            errors.push("at least 8 characters");
  if (!/[A-Z]/.test(password))        errors.push("one uppercase letter");
  if (!/[0-9]/.test(password))        errors.push("one number");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("one special character (e.g. !@#$)");

  if (errors.length > 0) {
    return `Password must contain: ${errors.join(", ")}.`;
  }
  return null; // valid
}

module.exports = { validatePassword };
