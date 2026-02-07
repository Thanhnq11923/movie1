const CinemaRoom = require("../models/CinemaRoom");
const ScheduleSeat = require("../models/ScheduleSeat");

// Create
exports.createCinemaRoom = async (req, res) => {
  try {
    const cinemaRoom = new CinemaRoom(req.body);
    await cinemaRoom.save();
    res.status(201).json(cinemaRoom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read all
exports.getAllCinemaRooms = async (req, res) => {
  try {
    const rooms = await CinemaRoom.find();
    // Lấy seats cho từng phòng
    const roomsWithSeats = await Promise.all(
      rooms.map(async (room) => {
        const seats = await ScheduleSeat.find({ cinemaRoomId: room._id });
        return {
          ...room.toObject(),
          seats,
        };
      })
    );
    res.json(roomsWithSeats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
exports.getCinemaRoomById = async (req, res) => {
  try {
    const room = await CinemaRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ error: "Not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateCinemaRoom = async (req, res) => {
  try {
    const room = await CinemaRoom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!room) return res.status(404).json({ error: "Not found" });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteCinemaRoom = async (req, res) => {
  try {
    const room = await CinemaRoom.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
