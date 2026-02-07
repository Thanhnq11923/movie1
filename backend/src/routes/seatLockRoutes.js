const express = require("express");
const router = express.Router();
const seatLockController = require("../controllers/seatLockController");
const { authenticate } = require("../middleware/auth");
const { cleanupExpiredSeats } = require("../utils/cleanupExpiredSeats");

// Lock ghế
router.post("/lock", authenticate, seatLockController.lockSeat);

// Unlock ghế
router.post("/unlock", authenticate, seatLockController.unlockSeat);

// Lấy danh sách ghế đang bị lock
router.get("/locked", seatLockController.getLockedSeats);

// Cleanup expired locked seats (có thể gọi định kỳ hoặc test)
router.post("/cleanup-expired", async (req, res) => {
  const result = await cleanupExpiredSeats();
  res.json(result);
});

// Get seat lock statistics (nếu còn dùng)
// router.get("/stats", seatLockController.getSeatLockStats);

module.exports = router;
