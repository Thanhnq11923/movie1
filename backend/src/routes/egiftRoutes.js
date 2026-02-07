const express = require("express");
const router = express.Router();
const egiftController = require("../controllers/egiftController");
const { authenticate, isAdmin } = require("../middleware/auth");

// Public route
router.get("/", egiftController.getAllEgifts);

// Admin route to get all egifts (including inactive)
router.get("/admin/all", authenticate, isAdmin, egiftController.getAllEgiftsForAdmin);

// Admin only routes
router.get("/:id", authenticate, isAdmin, egiftController.getEgiftById);
router.post("/", authenticate, isAdmin, egiftController.createEgift);
router.put("/:id", authenticate, isAdmin, egiftController.updateEgift);
router.delete("/:id", authenticate, isAdmin, egiftController.deleteEgift);

module.exports = router;
