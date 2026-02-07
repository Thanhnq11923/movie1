const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  review: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["New", "Approved", "Rejected"],
    default: "New"
  },
  respondMessage: {
    type: String,
    default: ""
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "accounts"
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  movieId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Movie"
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "Booking"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("feedbacks", feedbackSchema);
