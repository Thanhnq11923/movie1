const express = require("express");
const router = express.Router();
const {
    getMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie
} = require("../controllers/movieController");
const { authenticate, isAdmin } = require("../middleware/auth");

// Public routes
router.route("/").get(getMovies);
router.route("/:id").get(getMovie);

// Protected routes (admin only)
router.route("/").post(authenticate, isAdmin, createMovie);
router.route("/:id").put(authenticate, isAdmin, updateMovie);
router.route("/:id").delete(authenticate, isAdmin, deleteMovie);

module.exports = router;
