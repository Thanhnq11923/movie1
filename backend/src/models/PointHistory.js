const mongoose = require("mongoose");

const PointHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
    required: true,
  },
  points: { type: Number, required: true },
  egift: { type: Object, required: true }, // Lưu thông tin egift đã đổi
  exchangedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PointHistory", PointHistorySchema);
