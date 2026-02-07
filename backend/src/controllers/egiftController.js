const Egift = require("../models/Egift");
const mongoose = require("mongoose");

// Get all active egifts (for client)
exports.getAllEgifts = async (req, res) => {
  try {
    const egifts = await Egift.find({ isActive: true }).select('-__v');
    
    // Ensure all egifts have the required fields
    const egiftsWithDefaults = egifts.map(egift => ({
      ...egift.toObject(),
      redeemed: egift.redeemed || 0,
      stock: egift.stock || 0,
      image: egift.image || ""
    }));
    
    res.status(200).json({ success: true, data: egiftsWithDefaults });
  } catch (error) {
    console.error("Error getting egifts:", error);
    res.status(500).json({
      success: false,
      message: "Error getting egifts",
      error: error.message,
    });
  }
};

// Get all egifts for admin (including inactive)
exports.getAllEgiftsForAdmin = async (req, res) => {
  try {
    const egifts = await Egift.find({}).select('-__v');
    
    // Ensure all egifts have the required fields
    const egiftsWithDefaults = egifts.map(egift => ({
      ...egift.toObject(),
      redeemed: egift.redeemed || 0,
      stock: egift.stock || 0,
      image: egift.image || ""
    }));
    
    res.status(200).json({ success: true, data: egiftsWithDefaults });
  } catch (error) {
    console.error("Error getting egifts for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error getting egifts for admin",
      error: error.message,
    });
  }
};

// Get single egift by ID
exports.getEgiftById = async (req, res) => {
  try {
    // Validar formato do ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid egift ID format",
      });
    }

    const egift = await Egift.findById(req.params.id);

    if (!egift) {
      return res.status(404).json({
        success: false,
        message: "Egift not found",
      });
    }

    res.status(200).json({ success: true, data: egift });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting egift",
      error: error.message,
    });
  }
};

// Create new egift
exports.createEgift = async (req, res) => {
  try {
    // Validate required fields
    const { title, description, points, category } = req.body;
    if (!title || !description || !points || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, points, category",
      });
    }

    const egift = await Egift.create(req.body);
    res.status(201).json({ success: true, data: egift });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
    console.error("Error creating egift:", error);
    res.status(500).json({
      success: false,
      message: "Error creating egift",
      error: error.message,
    });
  }
};

// Update egift
exports.updateEgift = async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid egift ID format",
      });
    }

    // Check if egift exists
    const existingEgift = await Egift.findById(req.params.id);
    if (!existingEgift) {
      return res.status(404).json({
        success: false,
        message: "Egift not found",
      });
    }

    const egift = await Egift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Ensure all fields are included in response
    const egiftResponse = {
      ...egift.toObject(),
      image: egift.image || "",
      stock: egift.stock || 0,
      redeemed: egift.redeemed || 0,
    };

    res.status(200).json({ success: true, data: egiftResponse });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
    console.error("Error updating egift:", error);
    res.status(500).json({
      success: false,
      message: "Error updating egift",
      error: error.message,
    });
  }
};

// Delete egift
exports.deleteEgift = async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid egift ID format",
      });
    }

    // Check if egift exists
    const egift = await Egift.findById(req.params.id);

    if (!egift) {
      return res.status(404).json({
        success: false,
        message: "Egift not found",
      });
    }

    // Check if egift has been redeemed (optional business logic)
    const redeemedCount = egift.redeemed || 0;
    if (redeemedCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete egift that has been redeemed by users",
      });
    }

    // Delete the egift using findByIdAndDelete
    const deletedEgift = await Egift.findByIdAndDelete(req.params.id);

    if (!deletedEgift) {
      return res.status(404).json({
        success: false,
        message: "Egift not found or already deleted",
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Egift deleted successfully",
      data: { deletedId: req.params.id }
    });
  } catch (error) {
    console.error("Error deleting egift:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting egift",
      error: error.message,
    });
  }
};
