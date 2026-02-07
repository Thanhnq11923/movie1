const User = require("../models/User");
const PointHistory = require("../models/PointHistory");
const mongoose = require("mongoose");

/**
 * Cộng điểm cho user sau khi thanh toán thành công
 * @param {string} userId - ID của user
 * @param {number} points - Số điểm cộng (mặc định 50)
 * @param {string} reason - Lý do cộng điểm (mặc định "Booking thành công")
 * @param {string} bookingId - ID của booking (optional)
 * @returns {Promise<Object>} - Kết quả cộng điểm
 */
exports.addPointsForBooking = async (
  userId,
  points = 50,
  reason = "Booking thành công",
  bookingId = null
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // Tìm user
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    // Khởi tạo member object nếu chưa có
    if (!user.member) {
      user.member = {
        memberId: `M${Date.now()}${Math.random()
          .toString(36)
          .substr(2, 5)
          .toUpperCase()}`,
        score: 0,
      };
    }

    // Cộng điểm
    const currentScore = user.member.score || 0;
    const newScore = currentScore + points;
    user.member.score = newScore;

    // Lưu user
    await user.save({ session });

    // Tạo lịch sử điểm
    const pointHistory = new PointHistory({
      user: user._id,
      points: points,
      egift: {
        type: "booking_reward",
        reason: reason,
        bookingId: bookingId,
        description: `Cộng ${points} điểm cho ${reason}`,
      },
      exchangedAt: new Date(),
    });

    await pointHistory.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log(
      `✅ Cộng ${points} điểm thành công cho user ${userId}. Điểm mới: ${newScore}`
    );

    return {
      success: true,
      previousScore: currentScore,
      newScore: newScore,
      pointsAdded: points,
      message: `Cộng ${points} điểm thành công`,
    };
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    console.error(`❌ Lỗi cộng điểm cho user ${userId}:`, error.message);

    return {
      success: false,
      error: error.message,
      message: "Lỗi cộng điểm",
    };
  }
};

/**
 * Lấy thông tin điểm của user
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} - Thông tin điểm
 */
exports.getUserPoints = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findById(userId).select("member");
    if (!user) {
      throw new Error("User not found");
    }

    return {
      success: true,
      score: user.member?.score || 0,
      memberId: user.member?.memberId || null,
    };
  } catch (error) {
    console.error(`❌ Lỗi lấy điểm user ${userId}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
