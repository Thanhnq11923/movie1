const Cinema = require("../models/Cinema");

// Create
exports.createCinema = async (req, res) => {
  try {
    const cinema = new Cinema(req.body);
    await cinema.save();
    res.status(201).json(cinema);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read all
exports.getAllCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find().populate("rooms");
    res.json(cinemas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
exports.getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id).populate("rooms");
    if (!cinema) return res.status(404).json({ error: "Not found" });
    res.json(cinema);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!cinema) return res.status(404).json({ error: "Not found" });
    res.json(cinema);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
