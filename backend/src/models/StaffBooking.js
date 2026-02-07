const mongoose = require("mongoose");

const staffBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        "SB" +
        Date.now() +
        Math.random().toString(36).substr(2, 5).toUpperCase(),
    },

    // Staff Information
    staffId: {
      type: String,
      required: true,
    },
    staffName: {
      type: String,
      required: true,
    },

    // Customer Information
    customerInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        default: "",
      },
      isMember: {
        type: Boolean,
        default: false,
      },
      memberId: {
        type: String,
        default: "",
      },
      promotionCode: {
        type: String,
        default: "",
      },
    },

    // Movie Information
    movieId: {
      type: String,
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    movieDuration: {
      type: String,
      required: true,
    },
    movieGenre: {
      type: String,
      required: true,
    },
    movieRating: {
      type: String,
      required: true,
    },

    // Showtime Information
    scheduleId: {
      type: String,
      required: true,
    },
    cinemaRoomId: {
      type: String,
      required: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    showtimeDate: {
      type: String,
      required: true,
    },
    showtimeTime: {
      type: String,
      required: true,
    },
    showtimeFormat: {
      type: String,
      required: true,
    },

    // Seats Information
    selectedSeats: [
      {
        seatId: {
          type: String,
          required: true,
        },
        row: {
          type: String,
          required: true,
        },
        col: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    // Concessions Information
    selectedConcessions: [
      {
        productId: {
          type: String,
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
      },
    ],

    // Payment Information
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "card"],
    },

    // Pricing Information
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      tax: {
        type: Number,
        required: true,
      },
      promotionDiscount: {
        type: Number,
        default: 0,
      },
      memberDiscount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },

    // Booking Status
    status: {
      type: String,
      required: true,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },

    // Timestamps
    bookingDate: {
      type: Date,
      default: Date.now,
    },

    // Additional Information
    notes: {
      type: String,
      default: "",
    },

    // For tracking purposes
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
staffBookingSchema.index({ bookingId: 1 });
staffBookingSchema.index({ staffId: 1 });
staffBookingSchema.index({ customerInfo: { phone: 1 } });
staffBookingSchema.index({ showtimeDate: 1 });
staffBookingSchema.index({ status: 1 });
staffBookingSchema.index({ createdAt: -1 });

// Pre-save middleware to update the updatedAt field
staffBookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for total seats count
staffBookingSchema.virtual("totalSeats").get(function () {
  return this.selectedSeats.length;
});

// Virtual for total concessions count
staffBookingSchema.virtual("totalConcessions").get(function () {
  return this.selectedConcessions.reduce(
    (total, item) => total + item.quantity,
    0
  );
});

// Method to calculate total amount
staffBookingSchema.methods.calculateTotal = function () {
  const seatsTotal = this.selectedSeats.reduce(
    (total, seat) => total + seat.price,
    0
  );
  const concessionsTotal = this.selectedConcessions.reduce(
    (total, item) => total + item.totalPrice,
    0
  );
  const subtotal = seatsTotal + concessionsTotal;
  const tax = subtotal * 0.1;
  const total =
    subtotal +
    tax -
    this.pricing.promotionDiscount -
    this.pricing.memberDiscount;

  return {
    subtotal,
    tax,
    total,
  };
};

// Static method to find bookings by date range
staffBookingSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    showtimeDate: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ showtimeDate: 1, showtimeTime: 1 });
};

// Static method to find bookings by staff
staffBookingSchema.statics.findByStaff = function (staffId) {
  return this.find({ staffId }).sort({ createdAt: -1 });
};

// Static method to find bookings by customer phone
staffBookingSchema.statics.findByCustomerPhone = function (phone) {
  return this.find({ "customerInfo.phone": phone }).sort({ createdAt: -1 });
};

const StaffBooking = mongoose.model("StaffBooking", staffBookingSchema);

module.exports = StaffBooking;
