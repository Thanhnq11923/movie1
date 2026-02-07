const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  scheduleId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "MovieSchedule",
  },
  movieId: { type: Schema.Types.ObjectId, required: true, ref: "Movie" },
  cinemaRoomId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "CinemaRoom",
  },
  seats: [
    {
      row: { type: String, required: true },
      col: { type: Number, required: true },
      seatId: { type: String },
    },
  ],
  seatStatus: { type: Number, required: true }, // 1 = booked, 0 = available, etc.
  bookedAt: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  concessions: [
    {
      productId: {
        type: String, // Thay đổi từ ObjectId thành String để hỗ trợ các ID đơn giản
        required: false // Không bắt buộc
      },
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  amount: { type: Number },
  totalAmount: { type: Number }, // Tổng số tiền bao gồm phụ phí, thuế, v.v.
  promotion: { type: String },
  date: { type: String },
  time: { type: String },
  theater: { type: String },
  format: { type: String },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "payment_failed"],
    default: "confirmed",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "vnpay", "momo", "zalopay"],
    default: "cash"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  paymentDetails: {
    // VNPay fields
    txnRef: { type: String },
    transactionId: { type: String },
    bankTranNo: { type: String },
    bankCode: { type: String },
    cardType: { type: String },

    // MoMo fields
    orderId: { type: String },
    requestId: { type: String },
    payType: { type: String },
    responseTime: { type: String },

    // Common fields
    paymentMethod: { type: String },
    amount: { type: Number },
    date: { type: String },
    responseCode: { type: String },
    resultCode: { type: String },
    message: { type: String }
  }
});

module.exports = mongoose.model("Booking", bookingSchema);