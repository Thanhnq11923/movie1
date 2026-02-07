const ScheduleSeat = require("../models/ScheduleSeat");

/**
 * Cleanup expired locked seats: set seatStatus = 0 và xóa expiresAt nếu đã hết hạn giữ ghế
 */
async function cleanupExpiredSeats() {
  try {
    const now = new Date();
    // Lấy tất cả scheduleSeat
    const docs = await ScheduleSeat.find({ "seats.seatStatus": 2 });
    let unlockedCount = 0;
    for (const doc of docs) {
      let updated = false;
      for (const seat of doc.seats) {
        if (seat.seatStatus === 2 && seat.expiresAt && seat.expiresAt < now) {
          seat.seatStatus = 0;
          seat.expiresAt = undefined;
          updated = true;
          unlockedCount++;
        }
      }
      if (updated) {
        await doc.save();
      }
    }
    console.log(
      `✅ Unlocked ${unlockedCount} expired locked seats at ${now.toISOString()}`
    );
    return { success: true, unlockedCount, timestamp: now.toISOString() };
  } catch (error) {
    console.error("❌ Error cleaning up expired locked seats:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = { cleanupExpiredSeats };
