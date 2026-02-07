/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { MovieInfo } from "../../../components/client/booking/MovieInfo";
import { DateSelector } from "../../../components/client/booking/DateSelector";
import { LocationSelector } from "../../../components/client/booking/LocationSelector";
import { TicketBookingHeader } from "../../../components/client/booking/TicketBookingHeader";
import type { Location, Format } from "../../../types/bookingData";
import { MainLayout } from "../../../layouts/Layout";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../store/store";
import { setBookingDetails } from "../../../store/bookingSlice";
import { setBookingMeta } from "../../../store/bookingSlice";
import { TheaterList } from "../../../components/client/booking/TheaterList";
import { cinemaService } from "../../../services/api";
import { movieScheduleService } from "../../../services/api";
import type { DateOption } from "../../../types/booking";

export default function TicketBooking() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { movie } = useSelector((state: RootState) => state.booking);
  const location = useLocation();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<Format | "">("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTheater, setSelectedTheater] = useState<string>("");
  const [expandedTheaters, setExpandedTheaters] = useState<{
    [key: string]: boolean;
  }>({});
  const [cinemas, setCinemas] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [movieSchedules, setMovieSchedules] = useState<any[]>([]);

  // Helper function to parse date string to Date object for comparison
  const parseDateString = (dateString: string): Date => {
    if (!dateString) return new Date(0);
    
    try {
      // Try parsing as ISO string first
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // If not ISO, try parsing as DD/MM/YYYY or other formats
      const parts = dateString.split(/[/-]/);
      if (parts.length === 3) {
        // Assume DD/MM/YYYY format
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      
      // If all parsing fails, return epoch date
      return new Date(0);
    } catch {
      return new Date(0);
    }
  };

  // Helper function to check if a date is in the future
  // const isFutureDate = (dateString: string): boolean => {
  //   if (!dateString) return false;
    
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0); // Set to start of day
    
  //   // Handle different date formats
  //   let targetDate: Date;
  //   try {
  //     // Try parsing as ISO string first
  //     targetDate = new Date(dateString);
  //     if (isNaN(targetDate.getTime())) {
  //       // If not ISO, try parsing as DD/MM/YYYY or other formats
  //       const parts = dateString.split(/[/-]/);
  //       if (parts.length === 3) {
  //         // Assume DD/MM/YYYY format
  //         targetDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  //       } else {
  //         console.log(`Invalid date format: ${dateString}`);
  //         return false; // Invalid date format
  //       }
  //     }
  //   } catch {
  //     console.log(`Error parsing date: ${dateString}`);
  //     return false; // Invalid date
  //   }
    
  //   targetDate.setHours(0, 0, 0, 0);
  //   const isFuture = targetDate >= today;
  //   console.log(`Date check: ${dateString} - Today: ${today.toISOString()}, Target: ${targetDate.toISOString()}, IsFuture: ${isFuture}`);
  //   return isFuture;
  // };

  // Helper function to check if a time is in the future for a given date
  // const isFutureTime = (dateString: string, timeString: string): boolean => {
  //   if (!dateString || !timeString) return false;
    
  //   const now = new Date();
  //   let targetDateTime: Date;
    
  //   try {
  //     // Try parsing as ISO string first
  //     targetDateTime = new Date(`${dateString}T${timeString}`);
  //     if (isNaN(targetDateTime.getTime())) {
  //       // If not ISO, try other formats
  //       const dateParts = dateString.split(/[/-]/);
  //       const timeParts = timeString.split(':');
        
  //       if (dateParts.length === 3 && timeParts.length === 2) {
  //         // Assume DD/MM/YYYY HH:MM format
  //         targetDateTime = new Date(
  //           parseInt(dateParts[2]), 
  //           parseInt(dateParts[1]) - 1, 
  //           parseInt(dateParts[0]),
  //           parseInt(timeParts[0]),
  //           parseInt(timeParts[1])
  //         );
  //       } else {
  //         return false;
  //       }
  //     }
  //   } catch {
  //     return false;
  //   }
    
  //   return targetDateTime > now;
  // };

  // Helper function to check if a date is today
  // const isToday = (dateString: string): boolean => {
  //   if (!dateString) return false;
    
  //   const today = new Date();
  //   let targetDate: Date;
    
  //   try {
  //     targetDate = new Date(dateString);
  //     if (isNaN(targetDate.getTime())) {
  //       const parts = dateString.split(/[/-]/);
  //       if (parts.length === 3) {
  //         targetDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  //       } else {
  //         return false;
  //       }
  //     }
  //   } catch {
  //     return false;
  //   }
    
  //   return today.toDateString() === targetDate.toDateString();
  // };

  // const currentTheaters = selectedLocation ? theatersByLocation[selectedLocation] || [] : []

  useEffect(() => {
    cinemaService.getAllCinemas().then((data) => setCinemas(data));

    movieScheduleService
      .getAllMovieSchedules()
      .then((data) =>
        setMovieSchedules(Array.isArray(data) ? data : data.data || [])
      );
    // .then((data) => setMovieSchedules(data))
  }, []);

  // Lọc movieSchedules theo movieId
  const filteredMovieSchedules =
    movie && movieSchedules.length > 0
      ? movieSchedules.filter((s) => String(s.movieId) === String(movie._id))
      : [];

  // Lấy danh sách cinemaId từ lịch chiếu phim này
  const availableCinemaIds = Array.from(
    new Set(filteredMovieSchedules.map((s) => String(s.cinemaId)))
  );
  // Lấy thông tin Cinema tương ứng
  const availableCinemas = cinemas.filter((c) =>
    availableCinemaIds.includes(String(c._id))
  );

  // Khi chọn city, lọc các rạp thuộc city đó
  const cinemasInSelectedCity = selectedLocation
    ? availableCinemas.filter((c) => c.city === selectedLocation)
    : availableCinemas;
  // Lấy danh sách cinemaId thuộc city đã chọn
  const availableCinemaIdsInCity = cinemasInSelectedCity.map((c) =>
    String(c._id)
  );

  // Lấy danh sách ngày chiếu theo cinemaId trong city đã chọn
  let filteredDates: DateOption[] = [];
  if (selectedLocation && filteredMovieSchedules.length > 0) {
    // Lấy lịch chiếu của các cinemaId thuộc city đã chọn
    const schedules = filteredMovieSchedules.filter((s) =>
      availableCinemaIdsInCity.includes(String(s.cinemaId))
    );
    
    // Lấy tất cả các ngày chiếu từ scheduleTime
    const allDates = schedules.flatMap((s) =>
      s.scheduleTime.map((st: any) => {
        const dateOption = {
          date: parseInt(st.date, 10),
          day: st.day,
          month: st.month,
          fullDate: st.fulldate || st.fullDate,
        };
        return dateOption;
      })
    );
    
    // Loại bỏ trùng lặp ngày
    const uniqueDates = allDates.filter(
      (d, idx, arr) => arr.findIndex((x) => x.fullDate === d.fullDate) === idx
    );
    
    // TEMPORARILY DISABLE DATE FILTERING TO DEBUG
    // Lọc chỉ những ngày trong tương lai
    // filteredDates = uniqueDates.filter((d) => {
    //   const isFuture = isFutureDate(d.fullDate);
    //   return isFuture;
    // });
    
    // Show all dates for now and sort from oldest to newest
    filteredDates = uniqueDates.sort((a, b) => {
      const dateA = parseDateString(a.fullDate);
      const dateB = parseDateString(b.fullDate);
      return dateA.getTime() - dateB.getTime(); // Sort from oldest to newest
    });
    
    console.log('All available dates:', uniqueDates.map(d => d.fullDate));
    console.log('Current date:', new Date().toISOString().split('T')[0]);
    console.log('Sorted dates:', filteredDates.map(d => d.fullDate));
  }

  // Khi chọn city, reset selectedTheater, selectedDate, selectedTime
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setSelectedTheater("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedFormat("");
    setExpandedTheaters({});
  };

  const toggleTheater = (theaterId: string) => {
    setExpandedTheaters((prev) => ({
      ...prev,
      [theaterId]: !prev[theaterId],
    }));
  };

  const handleTimeSelect = (time: string, theaterId: string) => {
    setSelectedTime(time);
    setSelectedTheater(theaterId);
  };

  const canProceedToSeat =
    selectedLocation &&
    selectedDate &&
    selectedFormat &&
    selectedTime &&
    selectedTheater;

  const handleSelectSeat = () => {
    if (!canProceedToSeat) return;

    const selectedSchedule = filteredMovieSchedules.find(
      (s) =>
        String(s.cinemaId) === String(selectedTheater) &&
        s.scheduleTime.some(
          (st: {
            date: string;
            day: string;
            month: string;
            fulldate?: string;
            fullDate?: string;
            time: string[];
          }) =>
            (st.fulldate === selectedDate || st.fullDate === selectedDate) &&
            st.time.includes(selectedTime)
        )
    );
    const scheduleId = selectedSchedule?._id;
    const cinemaRoomId = selectedSchedule?.cinemaRoomId;
    const theaterDetails = cinemas.find((c) => c._id === selectedTheater);

    // Lấy userId từ localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?._id || null;

    if (theaterDetails && scheduleId && cinemaRoomId) {
      dispatch(
        setBookingDetails({
          date: selectedDate,
          time: selectedTime,
          theater: theaterDetails.name,
          theaterId: theaterDetails._id,
          format: selectedFormat ? String(selectedFormat) : undefined,
        })
      );
      // Lưu vào Redux để các trang sau chỉ lấy từ Redux
      dispatch(setBookingMeta({ scheduleId, cinemaRoomId, userId }));
      if (scheduleId) localStorage.setItem("scheduleId", scheduleId);
      if (cinemaRoomId) localStorage.setItem("cinemaRoomId", cinemaRoomId);
      navigate("/select-seat", {
        state: { resetSeats: true, cinemaRoomId, scheduleId },
      });
    } else {
      alert("Không tìm thấy lịch chiếu hoặc phòng chiếu phù hợp!");
    }
  };

  // Chuyển đổi sang định dạng TheaterList cần
  const theatersFromCinema = availableCinemas.map((cinema) => {
    // Lấy tất cả các ngày chiếu của cinema này
    const schedules = filteredMovieSchedules.filter(
      (s) => String(s.cinemaId) === String(cinema._id)
    );
    // Lấy tất cả các suất chiếu (time) từ scheduleTime theo ngày đã chọn
    let showtimes: string[] = [];
    if (selectedDate) {
      showtimes = schedules.flatMap((s) => {
        const dateObj = s.scheduleTime.find(
          (st: any) =>
            st.fulldate === selectedDate || st.fullDate === selectedDate
        );
        if (dateObj) {
          // TEMPORARILY DISABLE TIME FILTERING TO DEBUG
          // Lọc chỉ những giờ chiếu trong tương lai cho ngày đã chọn
          // return dateObj.time.filter((time: string) => {
          //   // Nếu là ngày hôm nay, chỉ hiển thị giờ chiếu trong tương lai
          //   if (isToday(selectedDate)) {
          //     return isFutureTime(selectedDate, time);
          //   }
          //   // Nếu là ngày trong tương lai, hiển thị tất cả giờ chiếu
          //   return true;
          // });
          
          // Show all times for now
          return dateObj.time;
        }
        return [];
      });
    } else {
      // Nếu chưa chọn ngày, lấy tất cả giờ chiếu của các ngày trong tương lai
      showtimes = schedules.flatMap((s) =>
        s.scheduleTime.flatMap((st: any) => {
          // TEMPORARILY DISABLE DATE FILTERING FOR TIMES TOO
          // const scheduleDate = st.fulldate || st.fullDate;
          // if (isFutureDate(scheduleDate)) {
          //   // Nếu là ngày hôm nay, chỉ lấy giờ chiếu trong tương lai
          //   if (isToday(scheduleDate)) {
          //     return st.time.filter((time: string) => isFutureTime(scheduleDate, time));
          //   }
          //   // Nếu là ngày trong tương lai, lấy tất cả giờ chiếu
          //   return st.time;
          // }
          // return [];
          
          // Show all times for now
          return st.time;
        })
      );
    }
    // Loại bỏ trùng lặp
    const uniqueShowtimes = Array.from(new Set(showtimes));
    
    console.log(`Showtimes for ${cinema.name}:`, uniqueShowtimes);
    
    return {
      id: cinema._id,
      name: cinema.name,
      location: cinema.address,
      showtimes: uniqueShowtimes,
      isExpanded: false,
    };
  });

  // Tạo danh sách city thực tế từ các cinemaId có lịch chiếu phim này
  const availableCities: string[] = Array.from(
    new Set(availableCinemas.map((c) => c.city).filter(Boolean))
  );

  // Lấy danh sách format thực tế từ lịch chiếu thay vì dùng dữ liệu cứng
  // Chỉ lấy format của các showtime trong ngày đã chọn
  const availableFormats: string[] = (() => {
    if (!selectedDate) {
      // Nếu chưa chọn ngày, trả về tất cả format có trong lịch chiếu
      return Array.from(
        new Set(filteredMovieSchedules.map((s) => s.format).filter(Boolean))
      );
    }

    // Nếu đã chọn ngày, chỉ lấy format của các showtime trong ngày đó
    const formatsForSelectedDate = filteredMovieSchedules.flatMap((schedule) => {
      const dateObj = schedule.scheduleTime.find(
        (st: any) => st.fulldate === selectedDate || st.fullDate === selectedDate
      );
      
      if (dateObj && dateObj.time && dateObj.time.length > 0) {
        // Nếu có showtime trong ngày này, trả về format của schedule này
        return [schedule.format];
      }
      return [];
    });

    return Array.from(new Set(formatsForSelectedDate.filter(Boolean)));
  })();

  console.log('Selected date:', selectedDate);
  console.log('Available formats from schedules:', availableFormats);
  console.log('Hardcoded formats from movie data:', movie?.format);

  // Khi chọn ngày (date), reset selectedTheater, selectedTime, selectedFormat, expandedTheaters
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTheater("");
    setSelectedTime("");
    setSelectedFormat("");
    setExpandedTheaters({});
  };

  // Khi chọn format, reset selectedTime
  const handleFormatChange = (format: string) => {
    setSelectedFormat(format as Format);
    setSelectedTime("");
  };

  // Khôi phục state khi quay lại từ trang chọn ghế
  useEffect(() => {
    if (location.state?.preserveBooking) {
      const { date, time, format, scheduleId, cinemaRoomId } = location.state;

      // Tìm cinema từ scheduleId
      const schedule = movieSchedules.find((s) => s._id === scheduleId);
      if (schedule) {
        const cinema = cinemas.find((c) => c._id === schedule.cinemaId);
        if (cinema) {
          setSelectedLocation(cinema.city);
        }
      }

      // Set các giá trị đã chọn
      if (date) setSelectedDate(date);
      if (time) setSelectedTime(time);
      if (format) setSelectedFormat(format);

      // Tìm và set theater
      if (scheduleId && cinemaRoomId) {
        const schedule = movieSchedules.find((s) => s._id === scheduleId);
        if (schedule) {
          setSelectedTheater(schedule.cinemaId);
          setExpandedTheaters((prev) => ({
            ...prev,
            [schedule.cinemaId]: true,
          }));
        }
      }
    }
  }, [location.state, movieSchedules, cinemas]);

  if (!movie) {
    return (
      <MainLayout>
        <div className="text-center py-8 sm:py-12 md:py-16 lg:py-20 px-4">
          <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
            No movie selected. Please go back and select a movie.
          </p>
          <Button
            onClick={() => navigate("/movies")}
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
          >
            Go to Movies
          </Button>
        </div>
      </MainLayout>
    );
  }
  // Nếu phim không có lịch chiếu
  if (filteredMovieSchedules.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <main className="flex-1 mt-6 sm:mt-8 md:mt-10">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <TicketBookingHeader />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 bg-white p-3 sm:p-4 md:p-6 rounded-lg">
                {/* Left Column - Movie Info */}
                <div className="lg:sticky lg:top-20 h-fit">
                  <MovieInfo
                    movie={movie}
                    selectedDate={selectedDate}
                    selectedLocation={
                      selectedLocation as unknown as Location | undefined
                    }
                    selectedTheater={selectedTheater}
                    selectedFormat={selectedFormat as Format}
                    selectedTime={selectedTime}
                    dates={filteredDates}
                    theaters={theatersFromCinema}
                  />
                </div>
                {/* Right Column - Thông báo */}
                <div className="flex items-center justify-center">
                  <div className="text-center text-orange-600 font-semibold py-6 sm:py-8 text-sm sm:text-base md:text-lg">
                    This movie does not have a release date yet.
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* Main Content */} <TicketBookingHeader />
        <main className="flex-1 mt-6 sm:mt-8 md:mt-10">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 bg-white p-3 sm:p-2 md:p-4 rounded-lg">
              {/* Left Column - Movie Info and Booking Summary */}
              <div className="lg:sticky lg:top-20 h-fit">
                <div className="space-y-4 sm:space-y-6">
                  <MovieInfo
                    movie={movie}
                    selectedDate={selectedDate}
                    selectedLocation={
                      selectedLocation as unknown as Location | undefined
                    }
                    selectedTheater={selectedTheater}
                    selectedFormat={selectedFormat as Format}
                    selectedTime={selectedTime}
                    dates={filteredDates}
                    theaters={theatersFromCinema}
                  />
                  {canProceedToSeat && (
                    <Button
                      onClick={() => {
                        if (!canProceedToSeat) {
                          alert(
                            "Vui lòng chọn đủ thông tin: city, ngày, rạp, giờ chiếu!"
                          );
                          console.log({
                            selectedLocation,
                            selectedDate,
                            selectedTime,
                            selectedTheater,
                            theatersFromCinema,
                          });
                          return;
                        }
                        handleSelectSeat();
                      }}
                      className="w-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-sm text-sm sm:text-base"
                    >
                      Select Seat →
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Column - Booking Options */}
              <div className="space-y-6 sm:space-y-8">
                {/* Location Selection */}
                <div>
                  <LocationSelector
                    locations={availableCities as string[]}
                    selectedLocation={selectedLocation}
                    onLocationChange={handleLocationChange}
                  />
                </div>

                {/* Date Selection */}
                {selectedLocation && (
                  <div>
                    <DateSelector
                      dates={filteredDates}
                      selectedDate={selectedDate}
                      onDateSelect={handleDateChange}
                      selectedLocation={selectedLocation}
                    />
                  </div>
                )}

                {/* Theater List */}
                {selectedLocation && selectedDate && (
                  <TheaterList
                    locations={cinemasInSelectedCity.map((c) => c._id)}
                    selectedLocation={selectedTheater}
                    onLocationChange={handleLocationChange}
                    formats={availableFormats}
                    selectedFormat={selectedFormat}
                    onFormatChange={handleFormatChange}
                    theaters={theatersFromCinema}
                    expandedTheaters={expandedTheaters}
                    onTheaterToggle={toggleTheater}
                    selectedTime={selectedTime}
                    selectedTheater={selectedTheater}
                    onTimeSelect={handleTimeSelect}
                    selectedDate={selectedDate}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
