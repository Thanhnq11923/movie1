const ScheduleSeat = require("../models/ScheduleSeat");
const mongoose = require("mongoose");

// Lock ghế cho user: cập nhật seatStatus = 2 và expiresAt
exports.lockSeat = async (req, res) => {
  try {
    const { scheduleId, cinemaRoomId, seatId } = req.body;
    if (!scheduleId || !cinemaRoomId || !seatId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: scheduleId, cinemaRoomId, seatId",
      });
    }
    // Kiểm tra ghế đã booked chưa
    const scheduleSeat = await ScheduleSeat.findOne({
      scheduleId: new mongoose.Types.ObjectId(scheduleId),
      cinemaRoomId: new mongoose.Types.ObjectId(cinemaRoomId),
    });
    if (!scheduleSeat) {
      return res.status(404).json({
        success: false,
        message: "Schedule seat configuration not found",
      });
    }
    const seat = scheduleSeat.seats.find((s) => s.seatId === seatId);
    if (!seat) {
      return res
        .status(404)
        .json({ success: false, message: "Seat not found" });
    }
    if (seat.seatStatus === 1) {
      return res
        .status(400)
        .json({ success: false, message: "Seat is already booked" });
    }
    if (
      seat.seatStatus === 2 &&
      seat.expiresAt &&
      seat.expiresAt > new Date()
    ) {
      return res
        .status(409)
        .json({ success: false, message: "Seat is already locked" });
    }
    // Cập nhật seatStatus = 2 và expiresAt = 2 phút sau
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    await ScheduleSeat.updateOne(
      {
        scheduleId: scheduleId,
        cinemaRoomId: cinemaRoomId,
        "seats.seatId": seatId,
      },
      { $set: { "seats.$.seatStatus": 2, "seats.$.expiresAt": expiresAt } }
    );
    return res.json({
      success: true,
      message: "Seat locked",
      seatId,
      expiresAt,
    });
  } catch (error) {
    console.error("Error locking seat:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Unlock ghế: cập nhật seatStatus = 0 và xóa expiresAt
exports.unlockSeat = async (req, res) => {
  try {
    const { scheduleId, cinemaRoomId, seatId } = req.body;
    if (!scheduleId || !cinemaRoomId || !seatId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: scheduleId, cinemaRoomId, seatId",
      });
    }
    await ScheduleSeat.updateOne(
      {
        scheduleId: scheduleId,
        cinemaRoomId: cinemaRoomId,
        "seats.seatId": seatId,
      },
      { $set: { "seats.$.seatStatus": 0 }, $unset: { "seats.$.expiresAt": "" } }
    );
    return res.json({ success: true, message: "Seat unlocked", seatId });
  } catch (error) {
    console.error("Error unlocking seat:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy danh sách ghế đang bị lock (seatStatus = 2 và chưa hết hạn)
exports.getLockedSeats = async (req, res) => {
  try {
    const { scheduleId, cinemaRoomId } = req.query;
    if (!scheduleId || !cinemaRoomId) {
      return res.status(400).json({
        success: false,
        message: "Missing scheduleId or cinemaRoomId",
      });
    }
    const scheduleSeat = await ScheduleSeat.findOne({
      scheduleId: new mongoose.Types.ObjectId(scheduleId),
      cinemaRoomId: new mongoose.Types.ObjectId(cinemaRoomId),
    });
    if (!scheduleSeat) {
      return res.json({ success: true, data: [] });
    }
    const now = new Date();
    const lockedSeats = scheduleSeat.seats.filter(
      (s) => s.seatStatus === 2 && s.expiresAt && s.expiresAt > now
    );
    res.json({ success: true, data: lockedSeats });
  } catch (error) {
    console.error("Error getting locked seats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
