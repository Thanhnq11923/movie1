const express = require("express");
const router = express.Router();
const cinemaController = require("../controllers/cinemaController");
const { authenticate, isAdmin } = require("../middleware/auth");

// Public routes
router.get("/", cinemaController.getAllCinemas);
router.get("/:id", cinemaController.getCinemaById);

// Admin only routes
router.post("/", authenticate, isAdmin, cinemaController.createCinema);
router.put("/:id", authenticate, isAdmin, cinemaController.updateCinema);
router.delete("/:id", authenticate, isAdmin, cinemaController.deleteCinema);

module.exports = router;
