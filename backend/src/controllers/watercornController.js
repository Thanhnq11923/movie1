const Watercorn = require("../models/Watercorn");

// Create
exports.createWatercorn = async (req, res) => {
  try {
    const watercorn = new Watercorn(req.body);
    await watercorn.save();
    res.status(201).json(watercorn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read all
exports.getAllWatercorn = async (req, res) => {
  try {
    const watercorns = await Watercorn.find();
    console.log("Watercorns:", watercorns);
    res.json(watercorns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
exports.getWatercornById = async (req, res) => {
  try {
    const watercorn = await Watercorn.findById(req.params.id);
    if (!watercorn) return res.status(404).json({ error: "Not found" });
    res.json(watercorn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateWatercorn = async (req, res) => {
  try {
    const watercorn = await Watercorn.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!watercorn) return res.status(404).json({ error: "Not found" });
    res.json(watercorn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteWatercorn = async (req, res) => {
  try {
    const watercorn = await Watercorn.findByIdAndDelete(req.params.id);
    if (!watercorn) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
