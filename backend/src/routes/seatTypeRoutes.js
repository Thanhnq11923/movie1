const express = require("express");
const router = express.Router();
const seatTypeController = require("../controllers/seatTypeController");

const { authenticate, isAdmin } = require("../middleware/auth");

// Chỉ admin mới có quyền tạo, cập nhật và xóa seat type
router.post("/", authenticate, isAdmin, seatTypeController.createSeatType);
router.put("/:id", authenticate, isAdmin, seatTypeController.updateSeatType);
router.delete("/:id", authenticate, isAdmin, seatTypeController.deleteSeatType);

// Lấy danh sách hoặc thông tin seat type không yêu cầu xác thực
router.get("/", seatTypeController.getAllSeatTypes);
router.get("/:id", seatTypeController.getSeatTypeById);

module.exports = router;
