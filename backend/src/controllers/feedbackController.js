const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const Movie = require("../models/Movie");
const Booking = require("../models/Booking");
const Role = require("../models/Role");
const User = require("../models/User");

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { review, score, movieId, status } = req.body;
    const userId = req.user.userId;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    // Check if user has already submitted feedback for this movie
    const existingFeedback = await Feedback.findOne({ userId, movieId });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: "You have already submitted feedback for this movie" });
    }

    const feedback = new Feedback({
      review,
      score,
      userId,
      movieId,
      status
    });

    await feedback.save();

    await feedback.populate([
      { path: 'userId', select: 'username fullName image' },
      { path: 'movieId', select: 'versionMovieVn versionMovieEnglish' }
    ]);

    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all feedback (admin)
exports.getAllFeedbacks = async (req, res) => {
  try {
    const { status, movieId, userId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (movieId) filter.movieId = movieId;
    if (userId) filter.userId = userId;

    const feedbacks = await Feedback.find(filter)
      .populate('userId', 'username fullName image')
      .populate('movieId', 'versionMovieVn versionMovieEnglish')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedbacks
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all feedback for a movie
exports.getFeedbacksByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    console.log("Đang tìm feedback cho movieId:", movieId); // Debug log

    const feedbacks = await Feedback.find({
      movieId: new mongoose.Types.ObjectId(movieId),
      status: 'Approved'
    })
      .populate('userId', 'username fullName image')
      .sort({ createdAt: -1 });

    console.log("Số lượng feedback tìm thấy:", feedbacks.length); // Debug log

    // Calculate average score
    const avgScore = await Feedback.aggregate([
      { $match: { movieId: new mongoose.Types.ObjectId(movieId), status: 'Approved' } },
      { $group: { _id: null, avgScore: { $avg: '$score' }, totalReviews: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: feedbacks,
      statistics: {
        averageScore: avgScore.length > 0 ? avgScore[0].avgScore : 0,
        totalReviews: avgScore.length > 0 ? avgScore[0].totalReviews : 0
      }
    });
  } catch (err) {
    console.error("Lỗi khi lấy feedback:", err); // Debug log
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get user's feedback for a movie
exports.getUserFeedbackForMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.userId;

    const feedback = await Feedback.findOne({ userId, movieId })
      .populate('movieId', 'versionMovieVn versionMovieEnglish');

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update feedback (admin can update all fields, users can only update their own feedback)
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { review, score, status, respondMessage } = req.body;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }
    if (review !== undefined) feedback.review = review;
    if (score !== undefined) feedback.score = score;

    if (status !== undefined) feedback.status = status;
    if (respondMessage !== undefined) feedback.respondMessage = respondMessage;
    await feedback.save();

    await feedback.populate([
      { path: 'userId', select: 'username fullName image' },
      { path: 'movieId', select: 'versionMovieVn versionMovieEnglish' }
    ]);

    res.json({ success: true, data: feedback });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete user's feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    await Feedback.findByIdAndDelete(id);

    res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get user's feedback
exports.getUserFeedbacks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const feedbacks = await Feedback.find({ userId })
      .populate('movieId', 'versionMovieVn versionMovieEnglish largeImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedbacks
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};