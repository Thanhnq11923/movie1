const SeatLock = require("../models/SeatLock");
const ScheduleSeat = require("../models/ScheduleSeat");

/**
 * Cleanup expired seat locks
 * Có thể chạy định kỳ bằng cron job hoặc gọi thủ công
 */
async function cleanupExpiredLocks() {
  try {
    // Lấy danh sách lock hết hạn
    const expiredLocks = await SeatLock.find({
      expiresAt: { $lt: new Date() },
    });
    // Cập nhật seatStatus = 0 cho từng ghế
    for (const lock of expiredLocks) {
      await ScheduleSeat.updateOne(
        {
          scheduleId: lock.scheduleId,
          cinemaRoomId: lock.cinemaRoomId,
          "seats.seatId": lock.seatId,
        },
        { $set: { "seats.$.seatStatus": 0 } }
      );
    }
    // Xóa lock hết hạn
    const result = await SeatLock.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    console.log(
      `✅ Cleaned up ${
        result.deletedCount
      } expired seat locks at ${new Date().toISOString()}`
    );
    return {
      success: true,
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error cleaning up expired locks:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get statistics about seat locks
 */
async function getSeatLockStats() {
  try {
    const totalLocks = await SeatLock.countDocuments();
    const expiredLocks = await SeatLock.countDocuments({
      expiresAt: { $lt: new Date() },
    });
    const activeLocks = totalLocks - expiredLocks;

    return {
      success: true,
      stats: {
        total: totalLocks,
        active: activeLocks,
        expired: expiredLocks,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error getting seat lock stats:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = {
  cleanupExpiredLocks,
  getSeatLockStats,
};
