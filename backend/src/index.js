const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bookingRoutes = require("./routes/bookingRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use(express.json());

// Middleware - CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  }),
);

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// Movie routes
app.use("/api/movies", require("./routes/movieRoutes"));

// Promotion routes
app.use("/api/promotions", require("./routes/promotionRoutes"));

// User routes
app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/egifts", require("./routes/egiftRoutes"));

// CinemaRoom routes
app.use("/api/cinemarooms", require("./routes/cinemaRoomRoutes"));

// Cinema routes
app.use("/api/cinemas", require("./routes/cinemaRoutes"));

// ScheduleSeat routes
app.use("/api/scheduleSeat", require("./routes/scheduleSeatRoutes"));

// Watercorn routes
app.use("/api/watercorn", require("./routes/watercornRoutes"));

// SeatType routes
app.use("/api/seattypes", require("./routes/seatTypeRoutes"));

// SeatLock routes
app.use("/api/seatlocks", require("./routes/seatLockRoutes"));

// MovieSchedule routes
app.use("/api/movieschedules", require("./routes/movieScheduleRoutes"));

// Booking routes
app.use("/api/bookings", bookingRoutes);

// Feedback routes
app.use("/api/feedbacks", feedbackRoutes);

// Staff Booking routes
app.use("/api/staff-bookings", require("./routes/staffBookingRoutes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server is running on port ${PORT}`);
});
