import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Plus,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Film,
  Building,
} from "lucide-react";
import AddScheduleModal from "./add-schedule-modal";
import ViewScheduleModal from "./view-schedule";
import EditScheduleModal from "./edit-schedule";
import { notify } from "../../../lib/toast";
import { movieScheduleService } from "../../../services/api/movieScheduleService";
import { movieService } from "../../../services/api/movieService";
import { cinemaService } from "../../../services/api/cinemaService";
import type { MovieSchedule } from "../../../types/schedule";
import type { Movie } from "../../../types/movie";

const ScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<MovieSchedule[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [movieFilter, setMovieFilter] = useState<string>("all");
  const [cinemaFilter, setCinemaFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] =
    useState<MovieSchedule | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  // Thêm state sort cho movie
  const [movieSort, setMovieSort] = useState<"asc" | "desc" | null>(null);

  const viewModalRef = useRef<HTMLDivElement>(
    null!
  ) as React.RefObject<HTMLDivElement>;
  const editModalRef = useRef<HTMLDivElement>(
    null!
  ) as React.RefObject<HTMLDivElement>;

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const [scheduleRes, movieRes, cinemaRes] = await Promise.all([
        movieScheduleService.getAllMovieSchedules(),
        movieService.getAllMovies(),
        cinemaService.getAllCinemas(),
      ]);
      console.log("scheduleRes", scheduleRes);
      console.log("movieRes", movieRes);
      console.log("cinemaRes", cinemaRes);
      setSchedules(
        Array.isArray(scheduleRes) ? scheduleRes : scheduleRes.data || []
      );
      setMovies(Array.isArray(movieRes) ? movieRes : movieRes.data || []);
      setCinemas(Array.isArray(cinemaRes) ? cinemaRes : cinemaRes.data || []);
      setCurrentPage(1); // Reset to first page when fetching new data
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to fetch schedules");
      notify.error(`Failed to fetch schedules: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Debug log dữ liệu để kiểm tra
  useEffect(() => {
    console.log("schedules", schedules);
    console.log("movies", movies);
    console.log("cinemas", cinemas);
  }, [schedules, movies, cinemas]);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const movie = movies.find(
        (m) => String(m._id) === String(schedule.movieId)
      );
      const cinema = cinemas.find(
        (c) => String(c._id) === String(schedule.cinemaId)
      );
      const room = cinema?.rooms?.find(
        (r: any) => String(r._id) === String(schedule.cinemaRoomId)
      );
      const search = searchTerm.toLowerCase();
      // Tìm kiếm theo tên phim, rạp, phòng
      const matchesSearch =
        !searchTerm ||
        movie?.versionMovieEnglish?.toLowerCase().includes(search) ||
        "" ||
        cinema?.name?.toLowerCase().includes(search) ||
        "" ||
        room?.roomName?.toLowerCase().includes(search) ||
        "" ||
        schedule.scheduleTime.some(
          (st) =>
            st.fulldate.includes(search) ||
            st.time.some((t) => t.includes(search))
        );
      // Lọc theo từng filter
      const matchesMovie =
        movieFilter === "all" ||
        String(schedule.movieId) === String(movieFilter);
      const matchesCinema =
        cinemaFilter === "all" ||
        String(schedule.cinemaId) === String(cinemaFilter);
      const matchesRoom =
        roomFilter === "all" ||
        String(schedule.cinemaRoomId) === String(roomFilter);
      const matchesFormat =
        formatFilter === "all" || schedule.format === formatFilter;
      // Bỏ matchesDate
      return (
        matchesSearch &&
        matchesMovie &&
        matchesCinema &&
        matchesRoom &&
        matchesFormat
      );
    });
  }, [
    schedules,
    searchTerm,
    movieFilter,
    cinemaFilter,
    roomFilter,
    formatFilter,
    movies,
    cinemas,
  ]);

  // Sau khi tính filteredSchedules, sort nếu có movieSort
  let sortedSchedules = [...filteredSchedules];
  if (movieSort) {
    sortedSchedules.sort((a, b) => {
      const movieA = movies.find((m) => String(m._id) === String(a.movieId));
      const movieB = movies.find((m) => String(m._id) === String(b.movieId));
      const nameA = movieA?.versionMovieEnglish?.toLowerCase() || "";
      const nameB = movieB?.versionMovieEnglish?.toLowerCase() || "";
      if (movieSort === "asc") return nameA.localeCompare(nameB);
      else return nameB.localeCompare(nameA);
    });
  } else {
    // Mặc định sort theo createdAt (mới tạo lên đầu), fallback theo _id hoặc showtime
    sortedSchedules.sort((a, b) => {
      const createdAtA = (a as any).createdAt || (a as any).created_at;
      const createdAtB = (b as any).createdAt || (b as any).created_at;
      
      // Nếu có createdAt, ưu tiên sort theo thời gian tạo (mới nhất lên đầu)
      if (createdAtA && createdAtB) {
        return new Date(createdAtB).getTime() - new Date(createdAtA).getTime();
      }
      
      // Nếu chỉ có 1 bên có createdAt, ưu tiên bên có createdAt
      if (createdAtA && !createdAtB) return -1;
      if (!createdAtA && createdAtB) return 1;
      
      // Nếu không có createdAt, thử sort theo _id (ObjectId mới thường có timestamp mới hơn)
      const idA = a._id;
      const idB = b._id;
      if (idA && idB && typeof idA === 'string' && typeof idB === 'string') {
        // ObjectId có thể được so sánh trực tiếp để xác định thứ tự tạo
        return idB.localeCompare(idA); // Mới nhất lên đầu
      }
      
      // Fallback cuối cùng: sort theo showtime
      const getEarliestShowtime = (schedule: any) => {
        if (!schedule.scheduleTime || !Array.isArray(schedule.scheduleTime) || schedule.scheduleTime.length === 0) {
          return new Date('9999-12-31');
        }
        
        let earliestDate = new Date('9999-12-31');
        
        schedule.scheduleTime.forEach((timeSlot: any) => {
          if (timeSlot.fulldate && Array.isArray(timeSlot.time)) {
            timeSlot.time.forEach((time: string) => {
              const dateTimeString = `${timeSlot.fulldate} ${time}`;
              const dateTime = new Date(dateTimeString);
              if (dateTime < earliestDate) {
                earliestDate = dateTime;
              }
            });
          }
        });
        
        return earliestDate;
      };
      
      const showtimeA = getEarliestShowtime(a);
      const showtimeB = getEarliestShowtime(b);
      
      return showtimeA.getTime() - showtimeB.getTime();
    });
  }

  // Pagination logic
  const totalPages = Math.ceil(sortedSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchedules = sortedSchedules.slice(startIndex, endIndex);

  // Unique options for filter
  const uniqueRooms = useMemo(() => {
    if (cinemaFilter === "all") return [];
    const cinema = cinemas.find((c) => c._id === cinemaFilter);
    return cinema?.rooms || [];
  }, [cinemaFilter, cinemas]);

  // CRUD handlers (giữ nguyên logic cũ)
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setOpenDropdownId(null);
    }
  };
  const handleAddSchedule = async (form: MovieSchedule) => {
    try {
      const loadingToast = notify.loading("Adding new schedule...");
      const addedSchedule = await movieScheduleService.addMovieSchedule(form);
      const res = await movieScheduleService.getAllMovieSchedules();
      let newSchedules = Array.isArray(res) ? res : res.data || [];
      
      // Debug: Log để kiểm tra
      console.log("🔍 Debug - movieSort:", movieSort);
      console.log("🔍 Debug - addedSchedule:", addedSchedule);
      console.log("🔍 Debug - newSchedules length:", newSchedules.length);
      
      // Đưa schedule vừa tạo lên đầu danh sách (nếu không sort theo movie)
      if (!movieSort && newSchedules.length > 0 && addedSchedule) {
        // Tìm schedule vừa được thêm dựa trên ID
        const addedId = addedSchedule._id;
        if (addedId) {
          const addedIndex = newSchedules.findIndex(s => 
            s._id === addedId
          );
          
          if (addedIndex > -1) {
            // Xóa schedule khỏi vị trí hiện tại và đưa lên đầu
            const [addedScheduleItem] = newSchedules.splice(addedIndex, 1);
            newSchedules.unshift(addedScheduleItem);
            console.log("✅ Moved newly added schedule to top:", addedScheduleItem);
          } else {
            // Fallback: Nếu không tìm thấy theo ID, đưa schedule cuối cùng lên đầu
            const lastSchedule = newSchedules[newSchedules.length - 1];
            newSchedules.pop();
            newSchedules.unshift(lastSchedule);
            console.log("✅ Fallback: Moved last schedule to top:", lastSchedule);
          }
        }
      }
      
      setSchedules(newSchedules);
      setCurrentPage(1); // Reset về trang 1 để thấy schedule mới ở đầu danh sách
      notify.dismiss(loadingToast);
      notify.success("Schedule added successfully!");
    } catch {
      notify.error("Failed to add schedule");
    }
  };
  const handleUpdateSchedule = async (form: MovieSchedule) => {
    try {
      if (!form._id) return;
      const loadingToast = notify.loading("Updating schedule...");
      await movieScheduleService.updateMovieSchedule(form._id, form);
      const res = await movieScheduleService.getAllMovieSchedules();
      let newSchedules = Array.isArray(res) ? res : res.data || [];
      
      // Đưa schedule vừa sửa lên đầu danh sách (nếu không sort theo movie)
      if (!movieSort) {
        const idx = newSchedules.findIndex((s) => 
          s._id === form._id
        );
        if (idx > -1) {
          const [edited] = newSchedules.splice(idx, 1);
          newSchedules.unshift(edited);
          console.log("✅ Moved updated schedule to top:", edited);
        }
      }
      
      setSchedules(newSchedules);
      setCurrentPage(1); // Reset về trang 1 để thấy schedule vừa sửa ở đầu danh sách
      setShowEditModal(null);
      notify.dismiss(loadingToast);
      notify.success("Schedule updated successfully!");
    } catch {
      notify.error("Failed to update schedule");
    }
  };
  const handleDeleteSchedule = (scheduleId: string) => {
    const schedule = schedules.find((s) => s._id === scheduleId);
    if (schedule) {
      setScheduleToDelete(schedule);
      setShowDeleteModal(true);
    }
  };
  const confirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    try {
      const loadingToast = notify.loading("Deleting schedule...");
      await movieScheduleService.deleteMovieSchedule(scheduleToDelete._id!);
      const res = await movieScheduleService.getAllMovieSchedules();
      setSchedules(Array.isArray(res) ? res : res.data || []);
      notify.dismiss(loadingToast);
      notify.success("Schedule deleted successfully!");
      setShowDeleteModal(false);
      setScheduleToDelete(null);
      if (currentSchedules.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch {
      notify.error("Failed to delete schedule");
    }
  };
  const getSelectedSchedule = (
    scheduleId: string | null
  ): MovieSchedule | null => {
    if (!scheduleId) return null;
    return schedules.find((s) => s._id === scheduleId) || null;
  };
  const handleViewSchedule = (scheduleId: string) => {
    setShowViewModal(scheduleId);
    setOpenDropdownId(null);
  };
  const handleEditSchedule = (scheduleId: string) => {
    setShowEditModal(scheduleId);
    setOpenDropdownId(null);
  };
  const toggleDropdown = (scheduleId: string) => {
    setOpenDropdownId(openDropdownId === scheduleId ? null : scheduleId);
  };
  const handleDropdownAction = (
    action: "view" | "edit" | "delete",
    scheduleId: string
  ) => {
    setOpenDropdownId(null);
    setTimeout(() => {
      switch (action) {
        case "view":
          handleViewSchedule(scheduleId);
          break;
        case "edit":
          handleEditSchedule(scheduleId);
          break;
        case "delete":
          handleDeleteSchedule(scheduleId);
          break;
      }
    }, 100);
  };
  const resetFilters = () => {
    setSearchTerm("");
    setMovieFilter("all");
    setCinemaFilter("all");
    setRoomFilter("all");
    setFormatFilter("all");
    setMovieSort(null);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Calendar className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load schedules
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSchedules}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 relative">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Schedule Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage movie schedules for all cinemas
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Schedule</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Schedules</p>
              <p className="text-3xl font-bold text-gray-900">
                {schedules.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                All schedules registered
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Showtimes</p>
              <p className="text-3xl font-bold text-green-600">
                {schedules.reduce(
                  (sum, s) =>
                    sum +
                    s.scheduleTime.reduce(
                      (sum2, st) => sum2 + st.time.length,
                      0
                    ),
                  0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">All sessions</p>
            </div>
            <Film className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Cinemas</p>
              <p className="text-3xl font-bold text-red-600">
                {cinemas.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </div>
            <Building className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>
      {/* Filter giống movie */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Schedule List
            </h2>
            <button
              onClick={fetchSchedules}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by movie, cinema, room..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={movieFilter}
              onChange={(e) => {
                setMovieFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Movies</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.versionMovieEnglish}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={movieSort || ""}
              onChange={(e) => {
                setMovieSort(e.target.value as "asc" | "desc" | null);
                setCurrentPage(1);
              }}
            >
              <option value="">Sort by Movie</option>
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
        {/* Bảng giống movie */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px] sm:min-w-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Movie
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Cinema
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Room
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Format
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Showtimes
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSchedules.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 text-sm sm:text-base"
                  >
                    No schedules found matching your filters.
                  </td>
                </tr>
              ) : (
                currentSchedules.map((schedule) => {
                  const movie = movies.find((m) => m._id === schedule.movieId);
                  const cinema = cinemas.find((c) => c._id === schedule.cinemaId);
                  const room = cinema?.rooms?.find(
                    (r: any) => r._id === schedule.cinemaRoomId
                  );
                  return (
                    <tr key={schedule._id} className="hover:bg-gray-50 relative">
                    <td className="px-4 py-3 whitespace-normal">
                      <div className="flex flex-col items-center justify-center min-h-[56px]">
                        {movie?.largeImage && (
                          <img
                            src={movie.largeImage}
                            alt={movie.versionMovieEnglish}
                            className="w-10 h-14 object-cover rounded shadow flex-shrink-0 mb-1"
                            style={{ minWidth: 40, minHeight: 56 }}
                          />
                        )}
                        <span className="block text-center break-words max-w-[120px] line-clamp-2">
                          {movie?.versionMovieEnglish || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-normal">
                      <span className="block break-words max-w-[120px] line-clamp-2">
                        {cinema?.name || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-normal">
                      <span className="block break-words max-w-[100px] line-clamp-2">
                        {room?.roomName || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {schedule.format}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {schedule.scheduleTime.map((st, idx) => (
                        <div key={idx} className="mb-1">
                          <span className="font-semibold">{st.fulldate}:</span>{" "}
                          {st.time.join(", ")}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {movie?.status ? (
                        <span
                          className={
                            "inline-block px-2 py-1 rounded text-xs font-semibold " +
                            (movie.status === "showing"
                              ? "bg-green-100 text-green-700"
                              : movie.status === "comingsoon"
                              ? "bg-yellow-100 text-yellow-700"
                              : movie.status === "ended"
                              ? "bg-gray-200 text-gray-600"
                              : "bg-blue-100 text-blue-700")
                          }
                        >
                          {movie.status}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <div className="relative">
                        <button
                          data-schedule-id={schedule._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(
                              openDropdownId === schedule._id ? null : schedule._id || null
                            );
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, sortedSchedules.length)} of{" "}
              {sortedSchedules.length} schedules
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Menu Portal - Positioned outside table */}
      {openDropdownId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdownId(null)}
        >
          <div
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
            style={(() => {
              const buttonElement = document.querySelector(
                `[data-schedule-id="${openDropdownId}"]`
              );
              if (!buttonElement) return {};

              const buttonRect = buttonElement.getBoundingClientRect();
              const dropdownHeight = 120; // Approximate height of dropdown with 3 items
              const viewportHeight = window.innerHeight;
              const spaceBelow = viewportHeight - buttonRect.bottom;
              const spaceAbove = buttonRect.top;

              // Check if dropdown should appear above or below
              const shouldAppearAbove =
                spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight;

              const left = Math.min(
                window.innerWidth - 170, // dropdown width + padding
                Math.max(10, buttonRect.right - 160)
              );

              const top = shouldAppearAbove
                ? buttonRect.top - dropdownHeight - 5
                : buttonRect.bottom + 5;

              return {
                left: `${left}px`,
                top: `${Math.max(
                  10,
                  Math.min(top, viewportHeight - dropdownHeight - 10)
                )}px`,
              };
            })()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  handleViewSchedule(openDropdownId);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              <button
                onClick={() => {
                  handleEditSchedule(openDropdownId);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => {
                  handleDeleteSchedule(openDropdownId);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal, Add Modal, View Modal, Edit Modal giữ nguyên logic cũ */}
      {showDeleteModal && scheduleToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Schedule
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this schedule?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {
                      movies.find((m) => m._id === scheduleToDelete.movieId)
                        ?.versionMovieEnglish
                    }
                  </p>
                  <p className="text-gray-600">
                    {
                      cinemas.find((c) => c._id === scheduleToDelete.cinemaId)
                        ?.name
                    }{" "}
                    • {scheduleToDelete.format}
                  </p>
                </div>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone. All related bookings will also
                be affected.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSchedule}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSchedule}
        movies={movies}
        cinemas={cinemas}
      />
      {showViewModal && getSelectedSchedule(showViewModal) && (
        <ViewScheduleModal
          isOpen={true}
          onClose={() => setShowViewModal(null)}
          schedule={getSelectedSchedule(showViewModal)!}
          movies={movies}
          cinemas={cinemas}
          modalRef={viewModalRef}
        />
      )}
      {showEditModal && getSelectedSchedule(showEditModal) && (
        <EditScheduleModal
          isOpen={true}
          onClose={() => setShowEditModal(null)}
          schedule={getSelectedSchedule(showEditModal)!}
          onUpdate={handleUpdateSchedule}
          movies={movies}
          cinemas={cinemas}
          modalRef={editModalRef}
        />
      )}
    </div>
  );
};

export default ScheduleManagement;

