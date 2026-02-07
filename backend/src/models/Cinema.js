const mongoose = require("mongoose");

const cinemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    city: String,
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CinemaRoom",
      },
    ],
  },
  { collection: "cinemas" }
);

module.exports = mongoose.model("Cinema", cinemaSchema);
