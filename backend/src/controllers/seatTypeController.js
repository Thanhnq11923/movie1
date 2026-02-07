const SeatType = require("../models/SeatType");

// Create
exports.createSeatType = async (req, res) => {
  try {
    const seatType = new SeatType(req.body);
    await seatType.save();
    res.status(201).json(seatType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read all
exports.getAllSeatTypes = async (req, res) => {
  try {
    const seatTypes = await SeatType.find();
    res.json(seatTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
exports.getSeatTypeById = async (req, res) => {
  try {
    const seatType = await SeatType.findById(req.params.id);
    if (!seatType) return res.status(404).json({ error: "Not found" });
    res.json(seatType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateSeatType = async (req, res) => {
  try {
    const seatType = await SeatType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!seatType) return res.status(404).json({ error: "Not found" });
    res.json(seatType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteSeatType = async (req, res) => {
  try {
    const seatType = await SeatType.findByIdAndDelete(req.params.id);
    if (!seatType) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
