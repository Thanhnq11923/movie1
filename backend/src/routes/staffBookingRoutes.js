const express = require("express");
const router = express.Router();
const {
  createStaffBooking,
  getAllStaffBookings,
  getStaffBookingById,
  getStaffBookingsByStaffId,
  getStaffBookingsByCustomerPhone,
  updateStaffBookingStatus,
  deleteStaffBooking,
  getStaffBookingStats,
  testRoomNameSave,
} = require("../controllers/staffBookingController");

// Create a new staff booking
router.post("/", createStaffBooking);

// Get all staff bookings with pagination and filters
router.get("/", getAllStaffBookings);

// Get staff booking by booking ID
router.get("/:bookingId", getStaffBookingById);

// Get staff bookings by staff ID
router.get("/staff/:staffId", getStaffBookingsByStaffId);

// Get staff bookings by customer phone
router.get("/customer/:phone", getStaffBookingsByCustomerPhone);

// Update staff booking status
router.patch("/:bookingId/status", updateStaffBookingStatus);

// Delete staff booking
router.delete("/:bookingId", deleteStaffBooking);

// Get staff booking statistics
router.get("/stats/summary", getStaffBookingStats);

// ✅ THÊM: Test endpoint để debug roomName
router.post("/test/roomname", testRoomNameSave);

module.exports = router;
