const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const movieScheduleController = require("../controllers/movieScheduleController");

// Các route yêu cầu xác thực và phân quyền
router.post("/", authenticate, movieScheduleController.createMovieSchedule);
router.put("/:id", authenticate, movieScheduleController.updateMovieSchedule);
router.delete("/:id", authenticate, movieScheduleController.deleteMovieSchedule);

// Các route xem thông tin có thể công khai (tùy yêu cầu hệ thống)
router.get("/", movieScheduleController.getAllMovieSchedules);
router.get("/:id", movieScheduleController.getMovieScheduleById);

module.exports = router;
