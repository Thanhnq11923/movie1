const Booking = require("../models/Booking");
const vnpayService = require("../utils/vnpayService");
const momoService = require("../utils/momoService");
const moment = require("moment");
const { addPointsForBooking } = require("../utils/pointService");
const SeatLock = require("../models/SeatLock");

exports.createBooking = async (req, res) => {
  try {
    let booking;
    if (Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Chỉ nhận 1 booking chứa nhiều ghế (seats)",
      });
    }

    // Validate và làm sạch dữ liệu concessions
    if (req.body.concessions && Array.isArray(req.body.concessions)) {
      req.body.concessions = req.body.concessions
        .map((item) => ({
          productId: item.productId ? String(item.productId) : undefined,
          name: item.name || "",
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
        }))
        .filter((item) => item.quantity > 0); // Chỉ giữ lại items có quantity > 0
    }

    if (req.body.paymentMethod === "vnpay") {
      req.body.status = "pending";
      req.body.paymentStatus = "pending";

      // Tạo txnRef trước và lưu vào booking
      const txnRef = moment().format("YYYYMMDDHHmmss");
      console.log("Generated txnRef:", txnRef);
      req.body.paymentDetails = {
        txnRef: txnRef,
      };
    } else if (req.body.paymentMethod === "momo") {
      req.body.status = "pending";
      req.body.paymentStatus = "pending";

      // MoMo sẽ tạo orderId sau khi có bookingId
      req.body.paymentDetails = {
        paymentMethod: "momo",
      };
    } else if (!req.body.status) {
      req.body.status = "confirmed";
      req.body.paymentStatus = "completed";
    }

    booking = new Booking(req.body);
    await booking.save();
    console.log("Booking saved with txnRef:", booking.paymentDetails?.txnRef);

    // ✅ SỬA: Chỉ đánh dấu ghế khi không phải thanh toán online
    if (!["vnpay", "momo"].includes(req.body.paymentMethod)) {
      await markSeatsAsBooked(booking);

      // ✅ THÊM: Cộng điểm cho user khi thanh toán trực tiếp thành công
      let pointsAdded = 0;
      if (booking.userId) {
        const pointResult = await addPointsForBooking(
          booking.userId,
          50,
          "Thanh toán trực tiếp thành công",
          booking._id.toString()
        );

        if (pointResult.success) {
          console.log(
            `✅ Cộng điểm thành công cho booking ${booking._id}: ${pointResult.message}`
          );
          pointsAdded = pointResult.pointsAdded;
        } else {
          console.error(
            `❌ Lỗi cộng điểm cho booking ${booking._id}:`,
            pointResult.error
          );
        }
      }
    }

    // ✅ THÊM: Unlock tất cả ghế đã chọn sau khi booking thành công
    if (booking.seats && booking.seats.length > 0) {
      await unlockSeatsAfterBooking(booking);
    }

    // Xử lý thanh toán VNPay
    if (req.body.paymentMethod === "vnpay") {
      const amount = booking.amount || 0;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Số tiền thanh toán phải lớn hơn 0",
        });
      }

      const orderInfo = `Thanh_toan_don_hang`;

      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        "127.0.0.1";
      if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1")
        ipAddr = "127.0.0.1";

      const txnRef = booking.paymentDetails.txnRef;

      console.log("Creating VNPay payment:", {
        bookingId: booking._id.toString(),
        amount,
        orderInfo,
        ipAddr,
        txnRef,
      });

      const paymentUrl = vnpayService.createPaymentUrl({
        bookingId: booking._id.toString(),
        amount,
        orderInfo,
        ipAddr,
        txnRef: txnRef,
      });

      return res.status(201).json({
        success: true,
        data: booking,
        paymentUrl,
      });
    }

    // Xử lý thanh toán MoMo
    if (req.body.paymentMethod === "momo") {
      const amount = booking.amount || 0;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Số tiền thanh toán phải lớn hơn 0",
        });
      }

      const orderInfo = `Thanh toan dat ve phim`;

      console.log("Creating MoMo payment:", {
        bookingId: booking._id.toString(),
        amount,
        orderInfo,
      });

      try {
        const momoResult = await momoService.createPaymentUrl({
          bookingId: booking._id.toString(),
          amount,
          orderInfo,
        });

        if (momoResult.success) {
          // Lưu thông tin MoMo vào booking
          await Booking.findByIdAndUpdate(booking._id, {
            $set: {
              "paymentDetails.orderId": momoResult.orderId,
              "paymentDetails.requestId": momoResult.requestId,
              "paymentDetails.paymentMethod": "momo",
            },
          });

          return res.status(201).json({
            success: true,
            data: booking,
            paymentUrl: momoResult.payUrl,
            orderId: momoResult.orderId,
          });
        } else {
          throw new Error("Failed to create MoMo payment URL");
        }
      } catch (error) {
        console.error("MoMo payment creation failed:", error);
        return res.status(400).json({
          success: false,
          message: "Không thể tạo thanh toán MoMo: " + error.message,
        });
      }
    }

    return res.status(201).json({
      success: true,
      data: booking,
      pointsAdded: pointsAdded || 0,
    });
  } catch (err) {
    console.error("Error creating booking:", err);

    // Xử lý lỗi validation cụ thể
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: errors,
      });
    }

    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ Hàm helper để đánh dấu ghế
async function markSeatsAsBooked(booking) {
  if (!booking || !booking.seats || !booking.seats.length) return;

  const ScheduleSeat = require("../models/ScheduleSeat");
  for (const seat of booking.seats) {
    await ScheduleSeat.updateOne(
      {
        scheduleId: booking.scheduleId,
        cinemaRoomId: booking.cinemaRoomId,
        "seats.seatId": seat.seatId || `${seat.row}${seat.col}`,
      },
      { $set: { "seats.$.seatStatus": 1 } }
    );
  }
  console.log(
    `✅ Marked ${booking.seats.length} seats as booked for booking ${booking._id}`
  );
}

// ✅ Hàm helper để unlock ghế sau khi booking thành công
async function unlockSeatsAfterBooking(booking) {
  if (!booking || !booking.seats || !booking.seats.length) return;

  for (const seat of booking.seats) {
    const seatId = seat.seatId || `${seat.row}${seat.col}`;
    await SeatLock.deleteOne({
      scheduleId: booking.scheduleId,
      cinemaRoomId: booking.cinemaRoomId,
      seatId: seatId,
      userId: booking.userId,
    });
  }
  console.log(
    `✅ Unlocked ${booking.seats.length} seats after successful booking ${booking._id}`
  );
}

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("movieId", "versionMovieEnglish")
      .populate("cinemaRoomId", "roomName");
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookedSeats = async (req, res) => {
  try {
    const { scheduleId, cinemaRoomId } = req.query;
    if (!scheduleId || !cinemaRoomId) {
      return res.status(400).json({
        success: false,
        message: "Missing scheduleId or cinemaRoomId",
      });
    }
    const bookedSeats = await Booking.find({
      scheduleId,
      cinemaRoomId,
      seatStatus: 1,
    }).select("row col seatId seatStatus -_id");
    const result = bookedSeats.map((seat) => ({
      ...seat._doc,
      seatId: seat.seatId || `${seat.row}${seat.col}`,
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookingsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userId" });
    }
    const bookings = await Booking.find({ userId })
      .populate("movieId", "versionMovieEnglish")
      .populate("cinemaRoomId", "roomName");
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ SỬA: Sử dụng hàm releaseSeats thống nhất
    await releaseSeats(booking);

    res.json({
      success: true,
      message: "Booking deleted successfully",
      data: booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// VNPay Payment Return URL handler
exports.vnpayReturn = async (req, res) => {
  try {
    console.log("VNPay Return Params:", req.query);

    const isValid = vnpayService.verifyReturnUrl(req.query);

    if (!isValid) {
      console.error("Invalid VNPay signature");
      // Redirect về trang order-payment với lỗi chữ ký
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/order-payment?status=failed&message=${encodeURIComponent(
          "Chữ ký không hợp lệ"
        )}&reason=invalid_signature`
      );
    }

    const vnp_ResponseCode = req.query.vnp_ResponseCode;
    const vnp_TxnRef = req.query.vnp_TxnRef;
    const vnp_Amount = Number(req.query.vnp_Amount) / 100;
    const vnp_BankTranNo = req.query.vnp_BankTranNo;
    const vnp_TransactionNo = req.query.vnp_TransactionNo;
    const vnp_PayDate = req.query.vnp_PayDate;

    console.log("Looking for booking with TxnRef:", vnp_TxnRef);

    let booking = await Booking.findOne({
      "paymentDetails.txnRef": vnp_TxnRef,
    });

    console.log("Booking found:", booking ? booking._id : "null");
    if (booking) {
      console.log("Booking txnRef:", booking.paymentDetails?.txnRef);
      console.log("VNPay txnRef:", vnp_TxnRef);
    }

    // Nếu không tìm thấy, thử tìm booking gần đây nhất
    if (!booking) {
      console.error("Booking not found for TxnRef:", vnp_TxnRef);

      booking = await Booking.findOne({
        status: "pending",
        paymentMethod: "vnpay",
      }).sort({ createdAt: -1 });

      if (!booking) {
        return res.redirect(
          `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/order-payment?status=failed&message=${encodeURIComponent(
            "Không tìm thấy đơn đặt vé"
          )}&reason=booking_not_found`
        );
      }

      console.log("Using recent booking instead:", booking._id);
    }

    if (booking.amount !== vnp_Amount) {
      console.error(
        "Amount mismatch. Expected:",
        booking.amount,
        "Got:",
        vnp_Amount
      );
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/order-payment?status=failed&message=${encodeURIComponent(
          "Số tiền không khớp"
        )}&reason=amount_mismatch&expected=${
          booking.amount
        }&received=${vnp_Amount}`
      );
    }

    if (vnp_ResponseCode === "00") {
      // ✅ THANH TOÁN THÀNH CÔNG
      const updatedBooking = await Booking.findByIdAndUpdate(
        booking._id,
        {
          status: "confirmed",
          paymentStatus: "completed",
          paymentDetails: {
            ...booking.paymentDetails,
            transactionId: vnp_TransactionNo,
            bankTranNo: vnp_BankTranNo,
            paymentMethod: "vnpay",
            amount: vnp_Amount,
            bankCode: req.query.vnp_BankCode,
            cardType: req.query.vnp_CardType,
            date: vnp_PayDate,
            responseCode: vnp_ResponseCode,
          },
        },
        { new: true }
      );

      console.log(
        "Booking updated successfully:",
        updatedBooking ? "YES" : "NO"
      );
      console.log("New status:", updatedBooking?.status);
      console.log("New paymentStatus:", updatedBooking?.paymentStatus);

      // ✅ QUAN TRỌNG: Đánh dấu ghế khi thanh toán thành công
      await markSeatsAsBooked(booking);

      // ✅ REDIRECT VỀ TRANG ORDER-PAYMENT VỚI THÔNG TIN THÀNH CÔNG
      const successUrl =
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/order-payment?` +
        `status=success&` +
        `message=${encodeURIComponent("Payment Successful!")}&` +
        `bookingId=${booking._id}&` +
        `transactionId=${vnp_TransactionNo}&` +
        `amount=${vnp_Amount}&` +
        `bankCode=${req.query.vnp_BankCode}&` +
        `payDate=${vnp_PayDate}&` +
        `paymentMethod=vnpay`;

      return res.redirect(successUrl);
    } else {
      await Booking.findByIdAndUpdate(booking._id, {
        status: "payment_failed",
        paymentStatus: "failed",
        paymentDetails: {
          ...booking.paymentDetails,
          transactionId: vnp_TransactionNo,
          bankTranNo: vnp_BankTranNo,
          paymentMethod: "vnpay",
          amount: vnp_Amount,
          bankCode: req.query.vnp_BankCode,
          cardType: req.query.vnp_CardType,
          date: vnp_PayDate,
          responseCode: vnp_ResponseCode,
        },
      });

      // Giải phóng ghế nếu có
      await releaseSeats(booking);

      // Tạo thông báo lỗi dựa trên mã phản hồi VNPay
      let errorMessage = "Thanh toán thất bại";
      switch (vnp_ResponseCode) {
        case "07":
          errorMessage =
            "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).";
          break;
        case "09":
          errorMessage =
            "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.";
          break;
        case "10":
          errorMessage =
            "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
          break;
        case "11":
          errorMessage =
            "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.";
          break;
        case "12":
          errorMessage =
            "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.";
          break;
        case "13":
          errorMessage =
            "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).";
          break;
        case "24":
          errorMessage =
            "Giao dịch không thành công do: Khách hàng hủy giao dịch";
          break;
        case "51":
          errorMessage =
            "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.";
          break;
        case "65":
          errorMessage =
            "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.";
          break;
        case "75":
          errorMessage = "Ngân hàng thanh toán đang bảo trì.";
          break;
        case "79":
          errorMessage =
            "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.";
          break;
        default:
          errorMessage = `Thanh toán thất bại (Mã lỗi: ${vnp_ResponseCode})`;
      }

      // ✅ REDIRECT VỀ TRANG ORDER-PAYMENT VỚI THÔNG TIN THẤT BẠI
      const failedUrl =
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/order-payment?` +
        `status=failed&` +
        `message=${encodeURIComponent(errorMessage)}&` +
        `bookingId=${booking._id}&` +
        `reason=payment_failed&` +
        `responseCode=${vnp_ResponseCode}&` +
        `transactionId=${vnp_TransactionNo}&` +
        `paymentMethod=vnpay`;

      return res.redirect(failedUrl);
    }
  } catch (err) {
    console.error("Error in VNPay return:", err);
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/order-payment?status=failed&message=${encodeURIComponent(
        "Lỗi hệ thống"
      )}&reason=server_error`
    );
  }
};

// Hàm hỗ trợ để giải phóng ghế khi thanh toán thất bại
async function releaseSeats(booking) {
  if (!booking || !booking.seats || !booking.seats.length) return;

  const ScheduleSeat = require("../models/ScheduleSeat");
  for (const seat of booking.seats) {
    await ScheduleSeat.updateOne(
      {
        scheduleId: booking.scheduleId,
        cinemaRoomId: booking.cinemaRoomId,
        "seats.seatId": seat.seatId || `${seat.row}${seat.col}`,
      },
      { $set: { "seats.$.seatStatus": 0 } }
    );
  }
  console.log(
    `✅ Released ${booking.seats.length} seats for booking ${booking._id}`
  );
}

exports.vnpayIpn = async (req, res) => {
  try {
    console.log("VNPay IPN Params:", req.query);

    const isValid = vnpayService.verifyReturnUrl(req.query);

    if (!isValid) {
      console.error("Invalid VNPay signature in IPN");
      return res.status(200).json({
        RspCode: "97",
        Message: "Invalid signature",
      });
    }

    const vnp_ResponseCode = req.query.vnp_ResponseCode;
    const vnp_TxnRef = req.query.vnp_TxnRef;
    const vnp_Amount = Number(req.query.vnp_Amount) / 100;

    const booking = await Booking.findOne({
      "paymentDetails.txnRef": vnp_TxnRef,
    });

    if (!booking) {
      console.error("Booking not found in IPN for TxnRef:", vnp_TxnRef);
      return res.status(200).json({
        RspCode: "01",
        Message: "Order not found",
      });
    }

    if (booking.amount !== vnp_Amount) {
      console.error(
        "Amount mismatch in IPN. Expected:",
        booking.amount,
        "Got:",
        vnp_Amount
      );
      return res.status(200).json({
        RspCode: "04",
        Message: "Invalid amount",
      });
    }

    if (booking.paymentStatus === "completed") {
      return res.status(200).json({
        RspCode: "02",
        Message: "Order already confirmed",
      });
    }

    if (vnp_ResponseCode === "00") {
      await Booking.findByIdAndUpdate(booking._id, {
        status: "confirmed",
        paymentStatus: "completed", // ✅ SỬA: completed thay vì confirmed
        paymentDetails: {
          ...booking.paymentDetails,
          transactionId: req.query.vnp_TransactionNo,
          bankTranNo: req.query.vnp_BankTranNo,
          paymentMethod: "vnpay",
          amount: vnp_Amount,
          bankCode: req.query.vnp_BankCode,
          cardType: req.query.vnp_CardType,
          date: req.query.vnp_PayDate,
          responseCode: vnp_ResponseCode,
        },
      });

      // ✅ THÊM: Đánh dấu ghế trong IPN cũng
      await markSeatsAsBooked(booking);

      // ✅ THÊM: Cộng điểm cho user sau khi thanh toán thành công
      let pointsAdded = 0;
      if (booking.userId) {
        const pointResult = await addPointsForBooking(
          booking.userId,
          50,
          "Thanh toán VNPay thành công",
          booking._id.toString()
        );

        if (pointResult.success) {
          console.log(
            `✅ Cộng điểm thành công cho booking ${booking._id}: ${pointResult.message}`
          );
          pointsAdded = pointResult.pointsAdded;
        } else {
          console.error(
            `❌ Lỗi cộng điểm cho booking ${booking._id}:`,
            pointResult.error
          );
        }
      }

      return res.status(200).json({
        RspCode: "00",
        Message: "Confirm success",
        pointsAdded: pointsAdded,
      });
    } else {
      await Booking.findByIdAndUpdate(booking._id, {
        status: "payment_failed",
        paymentStatus: "failed",
        paymentDetails: {
          ...booking.paymentDetails,
          transactionId: req.query.vnp_TransactionNo,
          bankTranNo: req.query.vnp_BankTranNo,
          paymentMethod: "vnpay",
          amount: vnp_Amount,
          bankCode: req.query.vnp_BankCode,
          cardType: req.query.vnp_CardType,
          date: req.query.vnp_PayDate,
          responseCode: vnp_ResponseCode,
        },
      });

      // Giải phóng ghế
      await releaseSeats(booking);

      return res.status(200).json({
        RspCode: "00",
        Message: "Confirm success",
      });
    }
  } catch (err) {
    console.error("Error in VNPay IPN:", err);
    return res.status(200).json({
      RspCode: "99",
      Message: "Unknown error",
    });
  }
};

// MoMo Payment Return URL handler
exports.momoReturn = async (req, res) => {
  try {
    console.log("MoMo Return Params:", req.query);

    // Xác thực chữ ký từ MoMo
    const isValid = momoService.verifyCallback(req.query);

    if (!isValid) {
      console.error("Invalid MoMo signature");
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/order-payment?status=failed&message=${encodeURIComponent(
          "Chữ ký không hợp lệ"
        )}&reason=invalid_signature&paymentMethod=momo`
      );
    }

    const {
      resultCode,
      orderId,
      requestId,
      amount,
      transId,
      message,
      extraData,
      payType,
      responseTime,
    } = req.query;

    // Parse booking ID từ orderId hoặc extraData
    const bookingId = momoService.parseBookingId(orderId, extraData);

    if (!bookingId) {
      console.error("Cannot parse booking ID from MoMo response");
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/order-payment?status=failed&message=${encodeURIComponent(
          "Không thể xác định mã đặt vé"
        )}&reason=invalid_booking_id&paymentMethod=momo`
      );
    }

    console.log("Looking for booking with ID:", bookingId);

    // Tìm booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.error("Booking not found for ID:", bookingId);
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/order-payment?status=failed&message=${encodeURIComponent(
          "Không tìm thấy đơn đặt vé"
        )}&reason=booking_not_found&paymentMethod=momo`
      );
    }

    // Kiểm tra số tiền
    const momoAmount = parseInt(amount);
    if (booking.amount !== momoAmount) {
      console.error(
        "Amount mismatch. Expected:",
        booking.amount,
        "Got:",
        momoAmount
      );
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/order-payment?status=failed&message=${encodeURIComponent(
          "Số tiền không khớp"
        )}&reason=amount_mismatch&expected=${
          booking.amount
        }&received=${momoAmount}&paymentMethod=momo`
      );
    }

    if (resultCode === "0") {
      // ✅ THANH TOÁN THÀNH CÔNG
      const updatedBooking = await Booking.findByIdAndUpdate(
        booking._id,
        {
          status: "confirmed",
          paymentStatus: "completed",
          paymentDetails: {
            ...booking.paymentDetails,
            transactionId: transId,
            orderId: orderId,
            requestId: requestId,
            paymentMethod: "momo",
            amount: momoAmount,
            payType: payType,
            responseTime: responseTime,
            resultCode: resultCode,
            message: message,
          },
        },
        { new: true }
      );

      console.log(
        "MoMo booking updated successfully:",
        updatedBooking ? "YES" : "NO"
      );
      console.log("New status:", updatedBooking?.status);
      console.log("New paymentStatus:", updatedBooking?.paymentStatus);

      // ✅ QUAN TRỌNG: Đánh dấu ghế khi thanh toán thành công
      await markSeatsAsBooked(booking);

      // ✅ THÊM: Cộng điểm cho user sau khi thanh toán thành công
      let pointsAdded = 0;
      if (booking.userId) {
        const pointResult = await addPointsForBooking(
          booking.userId,
          50,
          "Thanh toán MoMo thành công",
          booking._id.toString()
        );

        if (pointResult.success) {
          console.log(
            `✅ Cộng điểm thành công cho booking ${booking._id}: ${pointResult.message}`
          );
          pointsAdded = pointResult.pointsAdded;
        } else {
          console.error(
            `❌ Lỗi cộng điểm cho booking ${booking._id}:`,
            pointResult.error
          );
        }
      }

      // ✅ REDIRECT VỀ TRANG ORDER-PAYMENT VỚI THÔNG TIN THÀNH CÔNG
      const successUrl =
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/order-payment?` +
        `status=success&` +
        `message=${encodeURIComponent("Thanh toán thành công")}&` +
        `bookingId=${booking._id}&` +
        `transactionId=${transId}&` +
        `amount=${momoAmount}&` +
        `payType=${payType}&` +
        `responseTime=${responseTime}&` +
        `paymentMethod=momo&` +
        `pointsAdded=${pointsAdded}`;

      return res.redirect(successUrl);
    } else {
      // ❌ THANH TOÁN THẤT BẠI
      await Booking.findByIdAndUpdate(booking._id, {
        status: "payment_failed",
        paymentStatus: "failed",
        paymentDetails: {
          ...booking.paymentDetails,
          transactionId: transId,
          orderId: orderId,
          requestId: requestId,
          paymentMethod: "momo",
          amount: momoAmount,
          payType: payType,
          responseTime: responseTime,
          resultCode: resultCode,
          message: message,
        },
      });

      // Giải phóng ghế nếu có
      await releaseSeats(booking);

      // Tạo thông báo lỗi dựa trên mã phản hồi MoMo
      let errorMessage = "Thanh toán thất bại";
      switch (resultCode) {
        case "1000":
          errorMessage =
            "Giao dịch được khởi tạo, chờ người dùng xác nhận thanh toán";
          break;
        case "1001":
          errorMessage = "Giao dịch thành công nhưng chưa hoàn tất";
          break;
        case "1002":
          errorMessage = "Giao dịch thất bại";
          break;
        case "1003":
          errorMessage = "Giao dịch bị hủy";
          break;
        case "1004":
          errorMessage = "Giao dịch bị từ chối";
          break;
        case "1005":
          errorMessage = "Giao dịch không được tìm thấy";
          break;
        case "1006":
          errorMessage = "Giao dịch bị lỗi";
          break;
        case "2001":
          errorMessage = "Sai tham số";
          break;
        case "2007":
          errorMessage = "Không đủ tiền để thanh toán";
          break;
        case "4001":
          errorMessage = "Số tiền giao dịch vượt quá hạn mức cho phép";
          break;
        case "4100":
          errorMessage = "Giao dịch bị từ chối bởi người dùng";
          break;
        default:
          errorMessage =
            message || `Thanh toán thất bại (Mã lỗi: ${resultCode})`;
      }

      // ✅ REDIRECT VỀ TRANG ORDER-PAYMENT VỚI THÔNG TIN THẤT BẠI
      const failedUrl =
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/order-payment?` +
        `status=failed&` +
        `message=${encodeURIComponent(errorMessage)}&` +
        `bookingId=${booking._id}&` +
        `reason=payment_failed&` +
        `resultCode=${resultCode}&` +
        `transactionId=${transId}&` +
        `paymentMethod=momo`;

      return res.redirect(failedUrl);
    }
  } catch (err) {
    console.error("Error in MoMo return:", err);
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/order-payment?status=failed&message=${encodeURIComponent(
        "Lỗi hệ thống"
      )}&reason=server_error&paymentMethod=momo`
    );
  }
};

// MoMo IPN (Instant Payment Notification) handler
exports.momoIpn = async (req, res) => {
  try {
    console.log("MoMo IPN Params:", req.body);

    // Xác thực chữ ký từ MoMo
    const isValid = momoService.verifyCallback(req.body);

    if (!isValid) {
      console.error("Invalid MoMo signature in IPN");
      return res.status(200).json({
        resultCode: 97,
        message: "Invalid signature",
      });
    }

    const {
      resultCode,
      orderId,
      requestId,
      amount,
      transId,
      message,
      extraData,
      payType,
      responseTime,
    } = req.body;

    // Parse booking ID
    const bookingId = momoService.parseBookingId(orderId, extraData);

    if (!bookingId) {
      console.error("Cannot parse booking ID from MoMo IPN");
      return res.status(200).json({
        resultCode: 1,
        message: "Invalid booking ID",
      });
    }

    // Tìm booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.error("Booking not found in IPN for ID:", bookingId);
      return res.status(200).json({
        resultCode: 1,
        message: "Booking not found",
      });
    }

    // Kiểm tra số tiền
    const momoAmount = parseInt(amount);
    if (booking.amount !== momoAmount) {
      console.error(
        "Amount mismatch in IPN. Expected:",
        booking.amount,
        "Got:",
        momoAmount
      );
      return res.status(200).json({
        resultCode: 4,
        message: "Invalid amount",
      });
    }

    // Kiểm tra trạng thái thanh toán
    if (booking.paymentStatus === "completed") {
      return res.status(200).json({
        resultCode: 2,
        message: "Order already confirmed",
      });
    }

    if (resultCode === "0") {
      // Thanh toán thành công
      await Booking.findByIdAndUpdate(booking._id, {
        status: "confirmed",
        paymentStatus: "completed",
        paymentDetails: {
          ...booking.paymentDetails,
          transactionId: transId,
          orderId: orderId,
          requestId: requestId,
          paymentMethod: "momo",
          amount: momoAmount,
          payType: payType,
          responseTime: responseTime,
          resultCode: resultCode,
          message: message,
        },
      });

      // ✅ THÊM: Đánh dấu ghế trong IPN cũng
      await markSeatsAsBooked(booking);

      return res.status(200).json({
        resultCode: 0,
        message: "Confirm success",
      });
    } else {
      // Thanh toán thất bại
      await Booking.findByIdAndUpdate(booking._id, {
        status: "payment_failed",
        paymentStatus: "failed",
        paymentDetails: {
          ...booking.paymentDetails,
          transactionId: transId,
          orderId: orderId,
          requestId: requestId,
          paymentMethod: "momo",
          amount: momoAmount,
          payType: payType,
          responseTime: responseTime,
          resultCode: resultCode,
          message: message,
        },
      });

      // Giải phóng ghế
      await releaseSeats(booking);

      return res.status(200).json({
        resultCode: 0,
        message: "Confirm success",
      });
    }
  } catch (err) {
    console.error("Error in MoMo IPN:", err);
    return res.status(200).json({
      resultCode: 99,
      message: "Unknown error",
    });
  }
};
