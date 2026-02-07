const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatId: String,
  seatColumn: String,
  seatRow: Number,
  seatTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SeatType",
  },
});

const cinemaRoomSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: true,
    },
    roomName: { type: String, required: true },
    seatQuantity: { type: Number, required: true },
    seats: [seatSchema],
    // Thêm cấu hình ghế gốc cho phòng
    seatsConfig: [
      {
        seatId: String,
        row: String,
        col: Number,
        price: Number,
      },
    ],
  },
  { collection: "cinemaRooms" }
);

module.exports = mongoose.model("CinemaRoom", cinemaRoomSchema);
