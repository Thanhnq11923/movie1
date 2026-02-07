const mongoose = require('mongoose');

const actorSchema = new mongoose.Schema({
    actorId: String,
    name: String
});

const movieTypeSchema = new mongoose.Schema({
    _id: String,
    typeName: String
});

const userReviewSchema = new mongoose.Schema({
    userId: String,
    score: Number,
    comment: String,
    reviewDate: Date
});

const movieSchema = new mongoose.Schema({
    actors: [actorSchema],
    content: String,
    director: String,
    duration: Number,
    fromDate: Date,
    toDate: Date,
    movieProductionCompany: String,
    versionMovieEnglish: String,
    versionMovieVn: String,
    largeImage: String,
    smallImage: String,
    trailerUrl: String,
    releaseDate: Date,
    keywords: [String],
    movieTypes: [movieTypeSchema],
    format: [String],
    language: String,
    subtitles: [String],
    rating: String,
    userReviews: [userReviewSchema],
    status: String,
    embedUrl: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema); 