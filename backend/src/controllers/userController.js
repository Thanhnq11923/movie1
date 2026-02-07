const User = require("../models/User");
const mongoose = require("mongoose");
const PointHistory = require("../models/PointHistory");
const egiftApi = require("../utils/movieTheaterEgiftApi");
const Egift = require("../models/Egift");
const bcrypt = require("bcryptjs");
const { getUserPoints } = require("../utils/pointService");

// Get user detail (for self or admin)
exports.getUserDetail = async (req, res) => {
  try {
    const userId = req.params.id || req.user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("roleId", "roleName permissions");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting user detail",
      error: error.message,
    });
  }
};

// User self-edit (only allowed fields)
exports.editSelf = async (req, res) => {
  try {
    const userId = req.user.userId;
    const allowedFields = [
      "fullName",
      "phoneNumber",
      "address",
      "image",
      "dateOfBirth",
      "gender",
    ];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("roleId", "roleName permissions");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// ADMIN: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting users",
      error: error.message,
    });
  }
};

// ADMIN: Create user
exports.createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      image,
      roleId,
      status,
      member,
    } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }
    const user = new User({
      username,
      email,
      password,
      fullName,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      image,
      roleId,
      status,
      member,
    });
    await user.save();
    res
      .status(201)
      .json({ success: true, message: "User created", data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// ADMIN: Change user password
exports.adminChangeUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Hash new password manually
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password using findByIdAndUpdate to avoid pre-save hook
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.status(200).json({
      success: true,
      message: "User password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing user password",
      error: error.message,
    });
  }
};

// ADMIN: Edit user
exports.editUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }
    // Allow admin to update any field except password (should use reset password API)
    const forbiddenFields = [
      "_id",
      "password",
      "resetPasswordToken",
      "resetPasswordExpires",
    ];
    const updateData = { ...req.body };
    forbiddenFields.forEach((field) => delete updateData[field]);
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User updated", data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// ADMIN: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Đổi điểm lấy E-gift
exports.exchangeEgift = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.userId;
    const { egiftId } = req.body;

    const egift = await Egift.findById(egiftId).session(session);
    if (!egift || !egift.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "E-gift not found or not active" });
    }
    if (egift.stock !== undefined && egift.stock <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "E-gift out of stock" });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Ensure user score is a number to prevent NaN errors
    const currentScore =
      user.member && typeof user.member.score === "number"
        ? user.member.score
        : 0;

    if (currentScore < egift.points) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough points" });
    }

    // Trừ điểm và số lượng
    if (!user.member) {
      user.member = {};
    } // Ensure member object exists
    user.member.score = currentScore - egift.points;
    if (egift.stock !== undefined) {
      egift.stock -= 1;
    }

    // Lưu thông tin quà đã đổi vào user
    user.egifts.push({
      code: egift._id, // Hoặc một mã code quà tặng riêng nếu có
      type: egift.title,
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Ví dụ: hết hạn sau 30 ngày
    });

    // Lưu lịch sử
    const pointHistory = new PointHistory({
      user: user._id,
      points: -egift.points, // Lưu số điểm bị trừ
      egift: {
        _id: egift._id,
        title: egift.title,
      },
    });

    await user.save({ session });
    await egift.save({ session });
    await pointHistory.save({ session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ success: true, message: "Exchange successful", data: user });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: "Exchange failed",
      error: error.message,
    });
  }
};

// Lấy lịch sử đổi điểm của user
exports.getPointHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await PointHistory.find({ user: userId })
      .sort({ exchangedAt: -1 })
      .populate("user", "fullName email");
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting point history",
      error: error.message,
    });
  }
};

// ADMIN: Lấy lịch sử đổi điểm của user bất kỳ
exports.getPointHistoryById = async (req, res) => {
  try {
    const userId = req.params.id;
    const history = await PointHistory.find({ user: userId })
      .sort({ exchangedAt: -1 })
      .populate("user", "fullName email");
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting point history",
      error: error.message,
    });
  }
};

// Lấy danh sách E-gift của user
exports.getUserEgifts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("egifts member");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      data: {
        egifts: user.egifts,
        currentPoints: user.member.score,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting user egifts",
      error: error.message,
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password manually
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password using findByIdAndUpdate to avoid pre-save hook
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// Lấy thông tin điểm của user hiện tại
exports.getCurrentUserPoints = async (req, res) => {
  try {
    const userId = req.user.userId;
    const pointResult = await getUserPoints(userId);

    if (pointResult.success) {
      res.status(200).json({
        success: true,
        data: {
          score: pointResult.score,
          memberId: pointResult.memberId,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: pointResult.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting user points",
      error: error.message,
    });
  }
};
