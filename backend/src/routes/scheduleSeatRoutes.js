const express = require("express");
const router = express.Router();

const { authenticate, hasPermission } = require("../middleware/auth");
const scheduleSeatController = require("../controllers/scheduleSeatController");

// Các route yêu cầu xác thực và phân quyền
router.post(
  "/",
  authenticate,
  hasPermission("manage_schedule"),
  scheduleSeatController.createScheduleSeat
);
router.put(
  "/:id",
  authenticate,
  hasPermission("manage_schedule"),
  scheduleSeatController.updateScheduleSeat
);
router.delete(
  "/:id",
  authenticate,
  hasPermission("manage_schedule"),
  scheduleSeatController.deleteScheduleSeat
);

// Các route xem dữ liệu (GET) không cần bảo vệ
router.get("/", scheduleSeatController.getAllScheduleSeats);
router.get("/:id", scheduleSeatController.getScheduleSeatById);

// Routes mới cho việc quản lý ghế theo từng lịch chiếu
router.get(
  "/schedule/:scheduleId",
  scheduleSeatController.getSeatsByScheduleId
);
router.put("/seat/status", scheduleSeatController.updateSeatStatus);

module.exports = router;
