const ScheduleSeat = require("../models/ScheduleSeat");
const mongoose = require("mongoose");

// Create
exports.createScheduleSeat = async (req, res) => {
  try {
    const scheduleSeat = new ScheduleSeat(req.body);
    await scheduleSeat.save();
    res.status(201).json(scheduleSeat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read all
exports.getAllScheduleSeats = async (req, res) => {
  try {
    const { cinemaRoomId, scheduleId } = req.query;
    const filter = {};
    if (cinemaRoomId) filter.cinemaRoomId = cinemaRoomId;
    if (scheduleId) filter.scheduleId = new mongoose.Types.ObjectId(scheduleId);
    const scheduleSeats = await ScheduleSeat.find(filter);
    res.json(scheduleSeats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy ghế theo scheduleId (quan trọng: mỗi lịch chiếu có mảng ghế riêng)
exports.getSeatsByScheduleId = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    if (!scheduleId) {
      return res.status(400).json({ error: "ScheduleId is required" });
    }

    const scheduleSeat = await ScheduleSeat.findOne({
      scheduleId: new mongoose.Types.ObjectId(scheduleId),
    });

    if (!scheduleSeat) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy ghế cho lịch chiếu này" });
    }

    res.json({
      scheduleId: scheduleId,
      seats: scheduleSeat.seats,
      totalSeats: scheduleSeat.seats.length,
      availableSeats: scheduleSeat.seats.filter((seat) => seat.seatStatus === 0)
        .length,
    });
  } catch (err) {
    console.error("Error getting seats by scheduleId:", err);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật trạng thái ghế cho một lịch chiếu cụ thể
exports.updateSeatStatus = async (req, res) => {
  try {
    const { scheduleId, seatId, seatStatus } = req.body;

    if (!scheduleId || !seatId || seatStatus === undefined) {
      return res.status(400).json({
        error: "ScheduleId, seatId và seatStatus là bắt buộc",
      });
    }

    const scheduleSeat = await ScheduleSeat.findOne({
      scheduleId: new mongoose.Types.ObjectId(scheduleId),
    });

    if (!scheduleSeat) {
      return res.status(404).json({ error: "Không tìm thấy lịch chiếu" });
    }

    // Tìm và cập nhật ghế cụ thể
    const seatIndex = scheduleSeat.seats.findIndex(
      (seat) => seat.seatId === seatId
    );
    if (seatIndex === -1) {
      return res.status(404).json({ error: "Không tìm thấy ghế" });
    }

    // Cập nhật trạng thái ghế
    scheduleSeat.seats[seatIndex].seatStatus = seatStatus;
    await scheduleSeat.save();

    res.json({
      message: "Cập nhật trạng thái ghế thành công",
      seat: scheduleSeat.seats[seatIndex],
    });
  } catch (err) {
    console.error("Error updating seat status:", err);
    res.status(500).json({ error: err.message });
  }
};

// Read one
exports.getScheduleSeatById = async (req, res) => {
  try {
    const scheduleSeat = await ScheduleSeat.findById(req.params.id);
    if (!scheduleSeat) return res.status(404).json({ error: "Not found" });
    res.json(scheduleSeat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateScheduleSeat = async (req, res) => {
  try {
    const scheduleSeat = await ScheduleSeat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!scheduleSeat) return res.status(404).json({ error: "Not found" });
    res.json(scheduleSeat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteScheduleSeat = async (req, res) => {
  try {
    const scheduleSeat = await ScheduleSeat.findByIdAndDelete(req.params.id);
    if (!scheduleSeat) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
