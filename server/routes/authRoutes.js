import express from "express";
import * as authController from "../controllers/authController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/request-otp", authController.requestOtp);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);

// OAuth routes
router.post("/google", authController.googleAuth);
router.get("/google/url", authController.getGoogleAuthUrl);
router.post("/linkedin", authController.linkedinAuth);
router.get("/linkedin/url", authController.getLinkedInAuthUrl);

// Protected routes (requires user role or higher)
router.get(
  "/profile",
  verifyToken,
  checkRole(["user", "manager", "admin", "recruiter"]),
  authController.getProfile
);
router.post(
  "/change-password",
  verifyToken,
  checkRole("user"),
  authController.changePassword
);
router.put(
  "/profile",
  verifyToken,
  checkRole("user"),
  authController.updateProfile
);

// Manager routes (requires manager role or higher)
router.get(
  "/users",
  verifyToken,
  checkPermission("settings.manage_users"),
  authController.getUsers
);

// Admin routes (requires admin role only)
router.delete("/users/:userId", verifyToken, checkPermission("settings.manage_users"), authController.deleteUser);
router.patch(
  "/users/:userId/role",
  verifyToken,
  checkPermission("settings.manage_users"),
  authController.changeUserRole
);

// Add this route with the other user-related routes
router.get("/users/counts", verifyToken, checkPermission("settings.manage_users"), authController.getUserCountsByRole);

// Check auth type
router.get("/check-auth-type", authController.checkAuthType);

// // Routes that require multiple roles
// router.get('/analytics', verifyToken, checkRole(['manager', 'admin']), authController.getAnalytics);
// router.post('/settings', verifyToken, checkRole(['manager', 'admin']), authController.updateSettings);

export default router;
