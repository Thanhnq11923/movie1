const mongoose = require("mongoose");

const seatLockSchema = new mongoose.Schema(
  {
    scheduleId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Schedule",
      required: true 
    },
    cinemaRoomId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "CinemaRoom",
      required: true 
    },
    seatId: { 
      type: String, 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    },
    lockedAt: { 
      type: Date, 
      default: Date.now,
      expires: 120 // Tự động xóa sau 2 phút (120 giây)
    },
    expiresAt: { 
      type: Date, 
      required: true 
    }
  },
  { 
    collection: "seatLocks",
    timestamps: true 
  }
);

// Index để tối ưu query
seatLockSchema.index({ scheduleId: 1, cinemaRoomId: 1, seatId: 1 });
seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("SeatLock", seatLockSchema); 