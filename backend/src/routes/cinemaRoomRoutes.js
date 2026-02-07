const express = require("express");
const router = express.Router();
const cinemaRoomController = require("../controllers/cinemaRoomController");
const { authenticate, isAdmin } = require("../middleware/auth");

// Public routes
router.get("/", cinemaRoomController.getAllCinemaRooms);
router.get("/:id", cinemaRoomController.getCinemaRoomById);

// Admin only routes
router.post("/", authenticate, isAdmin, cinemaRoomController.createCinemaRoom);
router.put("/:id", authenticate, isAdmin, cinemaRoomController.updateCinemaRoom);
router.delete("/:id", authenticate, isAdmin, cinemaRoomController.deleteCinemaRoom);

module.exports = router;
