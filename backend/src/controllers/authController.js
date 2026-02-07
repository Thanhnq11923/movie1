const User = require("../models/User");
require("../models/Role"); // Đảm bảo model Role được đăng ký với mongoose
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  sendResetPasswordEmail,
  sendOTPEmail,
} = require("../utils/emailService");
const { generateTemporaryOTP, verifyOTPToken } = require("../utils/otpService");
const bcrypt = require("bcryptjs");
const axios = require("axios");

// Register new user
exports.register = async (req, res) => {
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
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Generate member ID
    const memberId = "MEM" + Math.floor(100000 + Math.random() * 900000);

    // Create new user
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
      member: {
        memberId,
        score: 0,
      },
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          roleId: user.roleId,
          member: user.member,
          image: user.image,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for username:", username);

    // Find user by username
    const user = await User.findOne({ username });
    console.log("User found:", user ? "Yes" : "No");
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Check if user is active
    console.log("User status:", user.status);
    if (user.status !== 1) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch ? "Yes" : "No");

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          roleId: user.roleId,
          member: user.member,
          image: user.image,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// Forgot password with OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email address",
      });
    }

    // Generate OTP
    const otp = generateTemporaryOTP();

    // Store OTP in user document
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 300000; // 5 minutes
    await user.save();

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Error sending OTP email",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing forgot password request",
      error: error.message,
    });
  }
};

// Verify OTP only
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or has expired",
      });
    }
    // Đánh dấu đã xác thực OTP (có thể dùng cờ tạm thời trong user)
    user.otpVerified = true;
    await user.save();
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

// Sửa resetPassword: chỉ cho đổi mật khẩu nếu đã xác thực OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({
      email,
      otpVerified: true,
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "OTP has not been verified or is invalid",
      });
    }
    // So sánh mật khẩu mới với mật khẩu cũ
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the old password",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.otpVerified = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};
