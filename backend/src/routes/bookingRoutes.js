const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.get("/booked-seats", bookingController.getBookedSeats);
router.get("/user/:userId", bookingController.getBookingsByUser);

// VNPay payment routes
router.get("/vnpay-return", bookingController.vnpayReturn);
router.get("/vnpay-ipn", bookingController.vnpayIpn);

// MoMo payment routes
router.get("/momo-return", bookingController.momoReturn);
router.post("/momo-ipn", bookingController.momoIpn);

// DELETE booking by ID
router.delete("/:id", bookingController.deleteBookingById);

module.exports = router;
