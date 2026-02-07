const mongoose = require("mongoose");

const seatTypeSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },
    cinemaRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CinemaRoom",
    },
    seatId: String,
    seatStatus: Number,
  },
  { collection: "seatTypes" }
);

module.exports = mongoose.model("SeatType", seatTypeSchema);
