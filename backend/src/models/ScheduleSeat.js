const mongoose = require("mongoose");

const scheduleSeatSchema = new mongoose.Schema(
  {
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    cinemaRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "CinemaRoom" },
    seats: [
      {
        seatId: String,
        row: String,
        col: Number,
        seatStatus: Number,
        price: Number,
        expiresAt: Date, // Thêm trường này để lưu thời điểm hết hạn giữ ghế
      },
    ],
  },
  { collection: "scheduleSeats" }
);

module.exports = mongoose.model("ScheduleSeat", scheduleSeatSchema);
