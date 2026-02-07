const mongoose = require("mongoose");

const watercornSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    image: String,
    description: String,
    category: String,
    status: String,
    stockQuantity: Number,
    createdAt: Date,
    updatedAt: Date,
  },
  { collection: "watercorn" }
);

module.exports = mongoose.model("Watercorn", watercornSchema);
