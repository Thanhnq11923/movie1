const mongoose = require('mongoose');
const Movie = require('../models/Movie');

// @desc    Get all movies
// @route   GET /api/moviesss
// @access  Public
exports.getMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Cập nhật status động trước khi trả về
        const updatedMovies = await Promise.all(
            movies.map(async (movie) => {
                let newStatus = movie.status;
                if (!movie.releaseDate || !movie.toDate) return movie;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const release = new Date(movie.releaseDate);
                release.setHours(0, 0, 0, 0);
                const end = new Date(movie.toDate);
                end.setHours(0, 0, 0, 0);

                if (today < release) {
                    newStatus = "comingsoon";
                } else if (today >= release && today <= end) {
                    newStatus = "showing";
                } else if (today > end) {
                    newStatus = "ended";
                }

                if (newStatus !== movie.status) {
                    movie.status = newStatus;
                    await movie.save();
                }
                return movie;
            })
        );
        res.status(200).json({
            success: true,
            count: updatedMovies.length,
            data: updatedMovies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res) => {
    try {
        // Kiểm tra xem ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid movie ID format'
            });
        }

        const movie = await Movie.findById(req.params.id);
        console.log(movie);
        if (!movie) {
            return res.status(404).json({
                success: false,
                error: 'Movie not found'
            });
        }

        res.status(200).json({
            success: true,
            data: movie
        });
    } catch (error) {
        console.error('Error details:', error); // Log lỗi chi tiết
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message // Thêm thông báo lỗi chi tiết
        });
    }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res) => {
    try {
        const { releaseDate, toDate, ...otherFields } = req.body;
        let status = "comingsoon";
        if (releaseDate && toDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const release = new Date(releaseDate);
            release.setHours(0, 0, 0, 0);
            const end = new Date(toDate);
            end.setHours(0, 0, 0, 0);
            if (today < release) {
                status = "comingsoon";
            } else if (today >= release && today <= end) {
                status = "showing";
            } else if (today > end) {
                status = "ended";
            }
        }
        const movie = await Movie.create({ ...otherFields, releaseDate, toDate, status });
        res.status(201).json({
            success: true,
            data: movie
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Server Error',
                message: error.message
            });
        }
    }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid movie ID format'
            });
        }
        const { releaseDate, toDate, ...otherFields } = req.body;
        let status = "comingsoon";
        if (releaseDate && toDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const release = new Date(releaseDate);
            release.setHours(0, 0, 0, 0);
            const end = new Date(toDate);
            end.setHours(0, 0, 0, 0);
            if (today < release) {
                status = "comingsoon";
            } else if (today >= release && today <= end) {
                status = "showing";
            } else if (today > end) {
                status = "ended";
            }
        }
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            { ...otherFields, releaseDate, toDate, status },
            { new: true, runValidators: true }
        );
        if (!movie) {
            return res.status(404).json({
                success: false,
                error: 'Movie not found'
            });
        }
        res.status(200).json({
            success: true,
            data: movie
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Server Error',
                message: error.message
            });
        }
    }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid movie ID format'
            });
        }

        // Thử xóa trực tiếp bằng findByIdAndDelete thay vì .remove()
        const movie = await Movie.findByIdAndDelete(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                error: 'Movie not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete movie error:', error); // Thêm log chi tiết
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
};