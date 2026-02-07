const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const egiftSubSchema = new mongoose.Schema(
  {
    code: { type: String },
    type: { type: String },
    expiredAt: { type: Date },
    receivedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    status: {
      type: Number,
      default: 1,
    },
    registerDate: {
      type: Date,
      default: Date.now,
    },
    member: {
      memberId: {
        type: String,
        unique: true,
      },
      score: {
        type: Number,
        default: 0,
      },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    otpSecret: String,
    otpEnabled: {
      type: Boolean,
      default: false,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    egifts: [egiftSubSchema],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("accounts", userSchema);

module.exports = User;
