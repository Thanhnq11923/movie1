const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticate,
  isAdmin,
  isStaff,
  isAdminOrStaff,
} = require("../middleware/auth");

// USER: Get own detail
router.get("/me", authenticate, userController.getUserDetail);

// USER: Edit own profile
router.put("/me", authenticate, userController.editSelf);

// USER: Change password
router.put("/change-password", authenticate, userController.changePassword);

// USER: Exchange points for E-gift
router.post("/exchange-egift", authenticate, userController.exchangeEgift);

// USER: Get point history
router.get("/point-history", authenticate, userController.getPointHistory);

// USER: Get user egifts
router.get("/egifts", authenticate, userController.getUserEgifts);

// USER: Get current user points
router.get("/points", authenticate, userController.getCurrentUserPoints);

// ADMIN: Get all users
router.get("/", authenticate, userController.getAllUsers);

// ADMIN: Create user
router.post("/", authenticate, isAdmin, userController.createUser);

// ADMIN: Get user detail by id
router.get("/:id", authenticate, isAdminOrStaff, userController.getUserDetail);

// ADMIN: Edit user by id
router.put("/:id", authenticate, isAdminOrStaff, userController.editUser);

// ADMIN: Change user password
router.put(
  "/:id/change-password",
  authenticate,
  isAdmin,
  userController.adminChangeUserPassword
);

// ADMIN: Delete user by id
router.delete("/:id", authenticate, isAdmin, userController.deleteUser);

// ADMIN: Get point history of any user by id
router.get(
  "/:id/point-history",
  authenticate,
  isAdmin,
  userController.getPointHistoryById
);

module.exports = router;
