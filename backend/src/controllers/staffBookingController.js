const StaffBooking = require("../models/StaffBooking");
const ScheduleSeat = require("../models/ScheduleSeat");
const Watercorn = require("../models/Watercorn");
const mongoose = require("mongoose");

// Create a new staff booking
const createStaffBooking = async (req, res) => {
  try {
    console.log("Creating staff booking with data:", req.body);

    // ✅ THÊM: Debug logging cho roomName
    console.log("Room information received:");
    console.log("- cinemaRoomId:", req.body.cinemaRoomId);
    console.log("- roomName:", req.body.roomName);
    console.log("- roomName type:", typeof req.body.roomName);
    console.log("- roomName length:", req.body.roomName?.length);

    const {
      staffId,
      staffName,
      customerInfo,
      movieId,
      movieTitle,
      movieDuration,
      movieGenre,
      movieRating,
      scheduleId,
      cinemaRoomId,
      roomName,
      showtimeDate,
      showtimeTime,
      showtimeFormat,
      selectedSeats,
      selectedConcessions,
      paymentMethod,
      pricing,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !staffId ||
      !staffName ||
      !customerInfo ||
      !movieId ||
      !movieTitle ||
      !scheduleId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate showtime information
    if (
      !cinemaRoomId ||
      !roomName ||
      !showtimeDate ||
      !showtimeTime ||
      !showtimeFormat
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Showtime information is required (cinemaRoomId, roomName, showtimeDate, showtimeTime, showtimeFormat)",
      });
    }

    // ✅ THÊM: Validation chi tiết cho roomName
    if (!roomName || roomName.trim() === "" || roomName === "undefined" || roomName === "null") {
      return res.status(400).json({
        success: false,
        message: "roomName is required and cannot be empty, 'undefined', or 'null'",
        receivedRoomName: roomName,
        roomNameType: typeof roomName
      });
    }

    // ✅ THÊM: Đảm bảo roomName có giá trị hợp lệ
    const sanitizedRoomName = roomName && roomName.trim() !== "" ? roomName.trim() : "Unknown Room";
    console.log("Sanitized roomName:", sanitizedRoomName);

    // Validate customer info
    if (!customerInfo.name || !customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone are required",
      });
    }

    // Validate selected seats
    if (!selectedSeats || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one seat must be selected",
      });
    }

    // Validate selected seats structure
    for (const seat of selectedSeats) {
      if (
        !seat.seatId ||
        !seat.row ||
        typeof seat.col !== "number" ||
        typeof seat.price !== "number"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each seat must have seatId, row, col (number), and price (number)",
        });
      }
    }

    // Validate payment method
    if (!paymentMethod || !["cash", "card"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be either 'cash' or 'card'",
      });
    }

    // Validate pricing
    if (!pricing || typeof pricing.total !== "number") {
      return res.status(400).json({
        success: false,
        message: "Pricing information with total amount is required",
      });
    }

    // Validate pricing structure
    if (
      typeof pricing.subtotal !== "number" ||
      typeof pricing.tax !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Pricing must include subtotal and tax as numbers",
      });
    }

    // Validate selected concessions structure if provided
    if (selectedConcessions && selectedConcessions.length > 0) {
      for (const concession of selectedConcessions) {
        if (
          !concession.productId ||
          !concession.productName ||
          typeof concession.quantity !== "number" ||
          typeof concession.price !== "number" ||
          typeof concession.totalPrice !== "number"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Each concession must have productId, productName, quantity (number), price (number), and totalPrice (number)",
          });
        }
      }
    }

    // Validate scheduleId format
    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduleId format",
      });
    }

    // Validate movieId format
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movieId format",
      });
    }

    // Validate cinemaRoomId format
    if (!mongoose.Types.ObjectId.isValid(cinemaRoomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cinemaRoomId format",
      });
    }

    // Start a database transaction
    const session = await StaffBooking.startSession();
    session.startTransaction();

    try {
      // 1. Create new staff booking
      const newStaffBooking = new StaffBooking({
        staffId,
        staffName,
        customerInfo,
        movieId,
        movieTitle,
        movieDuration: movieDuration || "",
        movieGenre: movieGenre || "",
        movieRating: movieRating || "",
        scheduleId,
        cinemaRoomId,
        roomName: sanitizedRoomName,
        showtimeDate,
        showtimeTime,
        showtimeFormat,
        selectedSeats,
        selectedConcessions: selectedConcessions || [],
        paymentMethod,
        pricing,
        notes: notes || "",
      });

      // ✅ THÊM: Debug logging cho booking object
      console.log("Booking object before save:");
      console.log("- cinemaRoomId:", newStaffBooking.cinemaRoomId);
      console.log("- roomName:", newStaffBooking.roomName);
      console.log("- roomName type:", typeof newStaffBooking.roomName);

      // ✅ THÊM: Kiểm tra tất cả các field required
      console.log("All required fields check:");
      console.log("- staffId:", newStaffBooking.staffId);
      console.log("- staffName:", newStaffBooking.staffName);
      console.log("- movieId:", newStaffBooking.movieId);
      console.log("- movieTitle:", newStaffBooking.movieTitle);
      console.log("- movieDuration:", newStaffBooking.movieDuration);
      console.log("- movieGenre:", newStaffBooking.movieGenre);
      console.log("- movieRating:", newStaffBooking.movieRating);
      console.log("- scheduleId:", newStaffBooking.scheduleId);
      console.log("- cinemaRoomId:", newStaffBooking.cinemaRoomId);
      console.log("- roomName:", newStaffBooking.roomName);
      console.log("- showtimeDate:", newStaffBooking.showtimeDate);
      console.log("- showtimeTime:", newStaffBooking.showtimeTime);
      console.log("- showtimeFormat:", newStaffBooking.showtimeFormat);

      // Save to database
      const savedBooking = await newStaffBooking.save({ session });
      console.log("Staff booking saved successfully:", savedBooking.bookingId);

      // ✅ THÊM: Debug logging cho saved booking
      console.log("Saved booking data:");
      console.log("- cinemaRoomId:", savedBooking.cinemaRoomId);
      console.log("- roomName:", savedBooking.roomName);
      console.log("- Full booking object:", JSON.stringify(savedBooking, null, 2));

      // 2. Update seat status to booked (status = 1 for booked)
      if (selectedSeats && selectedSeats.length > 0) {
        console.log(
          "Updating seat status for seats:",
          selectedSeats.map((s) => s.seatId)
        );

        try {
          const scheduleSeat = await ScheduleSeat.findOne({
            scheduleId: new mongoose.Types.ObjectId(scheduleId),
          }).session(session);

          if (scheduleSeat) {
            console.log("Found schedule seat, updating seat status...");
            // Update each selected seat status to booked (1)
            for (const selectedSeat of selectedSeats) {
              const seatIndex = scheduleSeat.seats.findIndex(
                (s) => s.seatId === selectedSeat.seatId
              );
              if (seatIndex !== -1) {
                scheduleSeat.seats[seatIndex].seatStatus = 1; // 1 = booked
                console.log(
                  `Updated seat ${selectedSeat.seatId} to booked status`
                );
              } else {
                console.log(
                  `Seat ${selectedSeat.seatId} not found in schedule`
                );
                throw new Error(
                  `Seat ${selectedSeat.seatId} not found in schedule`
                );
              }
            }

            await scheduleSeat.save({ session });
            console.log("Schedule seat updated successfully");
          } else {
            throw new Error(
              `Schedule seat not found for scheduleId: ${scheduleId}`
            );
          }
        } catch (error) {
          console.error("Error updating seat status:", error.message);
          throw new Error(`Failed to update seat status: ${error.message}`);
        }
      }

      // 3. Update concession stock
      if (selectedConcessions && selectedConcessions.length > 0) {
        console.log(
          "Updating concession stock for:",
          selectedConcessions.map((c) => c.productName)
        );

        try {
          for (const concession of selectedConcessions) {
            const watercorn = await Watercorn.findById(
              concession.productId
            ).session(session);

            if (watercorn) {
              console.log(
                `Processing concession: ${watercorn.name}, current stock: ${watercorn.stockQuantity}, requested: ${concession.quantity}`
              );
              // Check if enough stock is available
              if (watercorn.stockQuantity < concession.quantity) {
                throw new Error(
                  `Insufficient stock for ${watercorn.name}. Available: ${watercorn.stockQuantity}, Requested: ${concession.quantity}`
                );
              }

              // Reduce stock
              watercorn.stockQuantity -= concession.quantity;
              watercorn.updatedAt = new Date();

              await watercorn.save({ session });
              console.log(
                `Updated stock for ${watercorn.name}: ${watercorn.stockQuantity}`
              );
            } else {
              throw new Error(
                `Product not found with ID: ${concession.productId}`
              );
            }
          }
        } catch (error) {
          console.error("Error updating concession stock:", error.message);
          throw new Error(
            `Failed to update concession stock: ${error.message}`
          );
        }
      }

      // Commit the transaction
      await session.commitTransaction();
      console.log("Transaction committed successfully");

      res.status(201).json({
        success: true,
        message:
          "Staff booking created successfully with seat and concession updates",
        data: {
          bookingId: savedBooking.bookingId,
          booking: savedBooking,
        },
      });
    } catch (error) {
      // Rollback the transaction on error
      console.error("Error in transaction, rolling back:", error.message);
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
      console.log("Database session ended");
    }
  } catch (error) {
    console.error("Error creating staff booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all staff bookings
const getAllStaffBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      staffId,
      startDate,
      endDate,
    } = req.query;

    // Build query
    let query = {};

    if (status) {
      query.status = status;
    }

    if (staffId) {
      query.staffId = staffId;
    }

    if (startDate && endDate) {
      query.showtimeDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const bookings = await StaffBooking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await StaffBooking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting staff bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get staff booking by ID
const getStaffBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await StaffBooking.findOne({ bookingId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Staff booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error getting staff booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get staff bookings by staff ID
const getStaffBookingsByStaffId = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    let query = { staffId };

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const bookings = await StaffBooking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await StaffBooking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting staff bookings by staff ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get staff bookings by customer phone
const getStaffBookingsByCustomerPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const bookings = await StaffBooking.find({ "customerInfo.phone": phone })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await StaffBooking.countDocuments({
      "customerInfo.phone": phone,
    });

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting staff bookings by customer phone:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update staff booking status
const updateStaffBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ["confirmed", "cancelled", "completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: confirmed, cancelled, completed",
      });
    }

    // Find and update booking
    const updatedBooking = await StaffBooking.findOneAndUpdate(
      { bookingId },
      {
        status: status || "confirmed",
        notes: notes || "",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Staff booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating staff booking status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete staff booking
const deleteStaffBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const deletedBooking = await StaffBooking.findOneAndDelete({ bookingId });

    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        message: "Staff booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff booking deleted successfully",
      data: deletedBooking,
    });
  } catch (error) {
    console.error("Error deleting staff booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get staff booking statistics
const getStaffBookingStats = async (req, res) => {
  try {
    const { staffId, startDate, endDate } = req.query;

    // Build query
    let query = {};

    if (staffId) {
      query.staffId = staffId;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get statistics
    const totalBookings = await StaffBooking.countDocuments(query);
    const confirmedBookings = await StaffBooking.countDocuments({
      ...query,
      status: "confirmed",
    });
    const cancelledBookings = await StaffBooking.countDocuments({
      ...query,
      status: "cancelled",
    });
    const completedBookings = await StaffBooking.countDocuments({
      ...query,
      status: "completed",
    });

    // Calculate total revenue
    const revenueData = await StaffBooking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricing.total" },
          averageTicketPrice: { $avg: "$pricing.total" },
        },
      },
    ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    const averageTicketPrice =
      revenueData.length > 0 ? revenueData[0].averageTicketPrice : 0;

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue,
        averageTicketPrice,
      },
    });
  } catch (error) {
    console.error("Error getting staff booking statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ THÊM: Test endpoint để debug roomName
const testRoomNameSave = async (req, res) => {
  try {
    console.log("=== TEST ROOM NAME SAVE ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const testBooking = new StaffBooking({
      staffId: "TEST_STAFF_001",
      staffName: "Test Staff",
      customerInfo: {
        name: "Test Customer",
        phone: "0123456789"
      },
      movieId: "TEST_MOVIE_001",
      movieTitle: "Test Movie",
      movieDuration: "120 min",
      movieGenre: "Action",
      movieRating: "PG-13",
      scheduleId: "TEST_SCHEDULE_001",
      cinemaRoomId: req.body.cinemaRoomId || "TEST_ROOM_001",
      roomName: req.body.roomName || "Test Room Name",
      showtimeDate: "2024-01-01",
      showtimeTime: "19:00",
      showtimeFormat: "2D",
      selectedSeats: [{
        seatId: "A1",
        row: "A",
        col: 1,
        price: 100000
      }],
      selectedConcessions: [],
      paymentMethod: "cash",
      pricing: {
        subtotal: 100000,
        tax: 10000,
        total: 110000
      }
    });

    console.log("Before save - roomName:", testBooking.roomName);

    const savedBooking = await testBooking.save();

    console.log("After save - roomName:", savedBooking.roomName);
    console.log("Saved booking ID:", savedBooking.bookingId);

    // Query lại từ database để kiểm tra
    const queriedBooking = await StaffBooking.findById(savedBooking._id);
    console.log("Queried from DB - roomName:", queriedBooking.roomName);

    res.json({
      success: true,
      message: "Test completed",
      data: {
        beforeSave: testBooking.roomName,
        afterSave: savedBooking.roomName,
        queriedFromDB: queriedBooking.roomName,
        fullBooking: queriedBooking
      }
    });

  } catch (error) {
    console.error("Test error:", error);
    res.status(500).json({
      success: false,
      message: "Test failed",
      error: error.message
    });
  }
};

module.exports = {
  createStaffBooking,
  getAllStaffBookings,
  getStaffBookingById,
  getStaffBookingsByStaffId,
  getStaffBookingsByCustomerPhone,
  updateStaffBookingStatus,
  deleteStaffBooking,
  getStaffBookingStats,
  testRoomNameSave,
};
