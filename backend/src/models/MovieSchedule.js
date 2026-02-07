const mongoose = require("mongoose");

const scheduleTimeSchema = new mongoose.Schema(
  {
    date: String,
    day: String,
    month: String,
    fulldate: String,
    time: [String],
  },
  { _id: false }
);

const movieScheduleSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: true,
    },
    cinemaRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CinemaRoom",
      required: true,
    },
    scheduleTime: [scheduleTimeSchema],
    format: { type: String, required: true },
    // Thêm trường liên kết tới ScheduleSeat
    scheduleSeatsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduleSeat",
    },
  },
  { collection: "movieSchedules" }
);

module.exports = mongoose.model("MovieSchedule", movieScheduleSchema);
