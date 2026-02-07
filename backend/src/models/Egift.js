const mongoose = require("mongoose");

const EgiftSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  price: { type: Number },
  material: { type: String },
  size: { type: String },
  design: { type: String },
  image: { type: String }, // Add image URL field
  stock: { type: Number, default: 0 },
  redeemed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Egift", EgiftSchema, "E-gift");
