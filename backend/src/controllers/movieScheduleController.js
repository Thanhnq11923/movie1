const MovieSchedule = require("../models/MovieSchedule");
const CinemaRoom = require("../models/CinemaRoom");
const ScheduleSeat = require("../models/ScheduleSeat");

// Tạo mới lịch chiếu
exports.createMovieSchedule = async (req, res) => {
  try {
    const { movieId, cinemaId, cinemaRoomId, scheduleTime, format } = req.body;

    // 1. Lấy cấu hình ghế của phòng
    const cinemaRoom = await CinemaRoom.findById(cinemaRoomId);
    if (!cinemaRoom) {
      return res.status(404).json({ error: "Cinema room not found" });
    }

    if (!cinemaRoom.seatsConfig || cinemaRoom.seatsConfig.length === 0) {
      return res.status(400).json({
        error:
          "Phòng chiếu chưa có cấu hình ghế. Vui lòng cập nhật cấu hình ghế cho phòng trước.",
      });
    }

    const createdSchedules = [];

    // 2. Xử lý từng ngày và từng giờ
    for (const daySchedule of scheduleTime) {
      for (const time of daySchedule.time) {
        // Kiểm tra xem đã có lịch chiếu trùng lặp chưa
        const existingSchedule = await MovieSchedule.findOne({
          movieId,
          cinemaRoomId,
          format,
          "scheduleTime.fulldate": daySchedule.fulldate,
          "scheduleTime.time": time,
        });

        if (existingSchedule) {
          console.log(
            `Đã tồn tại lịch chiếu: ${daySchedule.fulldate} ${time} ${format}`
          );
          continue; // Bỏ qua giờ này, tiếp tục giờ tiếp theo
        }

        // 3. Tạo mảng ghế mới cho lịch chiếu này (tất cả status = 0)
        const seats = cinemaRoom.seatsConfig.map((seat) => ({
          seatId: seat.seatId,
          row: seat.row,
          col: seat.col,
          price: seat.price,
          seatStatus: 0, // ghế trống
        }));

        // 4. Tạo ScheduleSeat mới (mỗi giờ có mảng ghế riêng biệt)
        const scheduleSeat = new ScheduleSeat({
          movieId,
          cinemaRoomId,
          seats,
        });
        await scheduleSeat.save();

        // 5. Tạo MovieSchedule mới cho giờ này
        const movieSchedule = new MovieSchedule({
          movieId,
          cinemaId,
          cinemaRoomId,
          scheduleTime: [
            {
              ...daySchedule,
              time: [time], // Chỉ 1 giờ cho mỗi lịch chiếu
            },
          ],
          format,
          scheduleSeatsId: scheduleSeat._id, // Mỗi giờ có scheduleSeatsId riêng
        });
        await movieSchedule.save();

        // 6. Cập nhật scheduleId cho ScheduleSeat
        scheduleSeat.scheduleId = movieSchedule._id;
        await scheduleSeat.save();

        createdSchedules.push(movieSchedule);
      }
    }

    if (createdSchedules.length === 0) {
      return res.status(400).json({
        error: "Tất cả các giờ đã tồn tại hoặc không có giờ nào được tạo",
      });
    }

    // 7. Trả về thông tin các lịch chiếu đã tạo
    const result = await MovieSchedule.find({
      _id: { $in: createdSchedules.map((s) => s._id) },
    })
      .populate("scheduleSeatsId")
      .populate("movieId")
      .populate("cinemaRoomId");

    res.status(201).json({
      message: `Đã tạo thành công ${createdSchedules.length} lịch chiếu`,
      schedules: result,
      totalSchedules: createdSchedules.length,
    });
  } catch (err) {
    console.error("Error creating movie schedule:", err);
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả lịch chiếu
exports.getAllMovieSchedules = async (req, res) => {
  try {
    const schedules = await MovieSchedule.find();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy lịch chiếu theo ID
exports.getMovieScheduleById = async (req, res) => {
  try {
    const schedule = await MovieSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: "Not found" });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật lịch chiếu
exports.updateMovieSchedule = async (req, res) => {
  try {
    const schedule = await MovieSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!schedule) return res.status(404).json({ error: "Not found" });
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa lịch chiếu
exports.deleteMovieSchedule = async (req, res) => {
  try {
    const schedule = await MovieSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
