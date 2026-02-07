const express = require("express");
const router = express.Router();
const watercornController = require("../controllers/watercornController");
const { authenticate, isAdmin } = require("../middleware/auth");

// Only admins can create, update, or delete
router.post("/", authenticate, isAdmin, watercornController.createWatercorn);
router.put("/:id", authenticate, isAdmin, watercornController.updateWatercorn);
router.delete("/:id", authenticate, isAdmin, watercornController.deleteWatercorn);

// Anyone (authenticated or not) can view
router.get("/all", watercornController.getAllWatercorn);
router.get("/:id", watercornController.getWatercornById);

module.exports = router;
