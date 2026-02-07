const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { authenticate, isAdmin } = require("../middleware/auth");

// Public routes
// Get feedback for a specific movie (accessible to everyone)
router.get("/movie/:movieId", feedbackController.getFeedbacksByMovie);

// Protected routes (require authentication)
// Create new feedback
router.post("/", authenticate, feedbackController.createFeedback);

// Get user's own feedback
router.get("/user", authenticate, feedbackController.getUserFeedbacks);

// Get user's feedback for a specific movie
router.get("/user/movie/:movieId", authenticate, feedbackController.getUserFeedbackForMovie);

// Update user's feedback
router.put("/:id", authenticate, feedbackController.updateFeedback, isAdmin);

// Delete user's feedback
router.delete("/:id", authenticate, feedbackController.deleteFeedback, isAdmin);

// Get all feedback (admin) - placed at the end to avoid route conflicts
router.get("/", authenticate, feedbackController.getAllFeedbacks);

module.exports = router;