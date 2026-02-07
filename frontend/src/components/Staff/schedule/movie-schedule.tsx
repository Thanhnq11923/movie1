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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Film,
  Building,
} from "lucide-react";

import ViewScheduleModal from "./view-movie-schedule";
import { notify } from "../../../lib/toast";
import { movieScheduleService } from "../../../services/api/movieScheduleService";
import { movieService } from "../../../services/api/movieService";
import { cinemaService } from "../../../services/api/cinemaService";
import type { MovieSchedule } from "../../../types/schedule";
import type { Movie } from "../../../types/movie";

const formatOptions = ["2D", "3D", "IMAX"];

const MovieSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<MovieSchedule[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
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
  const [scheduleToDelete, setScheduleToDelete] = useState<MovieSchedule | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  // Thêm state sort cho movie
  const [movieSort, setMovieSort] = useState<'asc' | 'desc' | null>(null);

  const viewModalRef = useRef<HTMLDivElement>(null!) as React.RefObject<HTMLDivElement>;
  const editModalRef = useRef<HTMLDivElement>(null!) as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleRes, movieRes, cinemaRes] = await Promise.all([
          movieScheduleService.getAllMovieSchedules(),
          movieService.getAllMovies(),
          cinemaService.getAllCinemas(),
        ]);
        setSchedules(
          (Array.isArray(scheduleRes) ? scheduleRes : scheduleRes.data || []).sort((a, b) => {
            // Nếu có trường createdAt thì sort theo createdAt giảm dần
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
          })
        );
        setMovies(Array.isArray(movieRes) ? movieRes : movieRes.data || []);
        setCinemas(Array.isArray(cinemaRes) ? cinemaRes : cinemaRes.data || []);
      } catch (error) {
        notify.error("Failed to fetch data");
      }
    };
    fetchData();
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
      const movie = movies.find((m) => String(m._id) === String(schedule.movieId));
      const cinema = cinemas.find((c) => String(c._id) === String(schedule.cinemaId));
      const room = cinema?.rooms?.find((r: any) => String(r._id) === String(schedule.cinemaRoomId));
      const search = searchTerm.toLowerCase();
      // Tìm kiếm theo tên phim, rạp, phòng
      const matchesSearch =
        (!searchTerm ||
          (movie?.versionMovieEnglish?.toLowerCase().includes(search) || "") ||
          (cinema?.name?.toLowerCase().includes(search) || "") ||
          (room?.roomName?.toLowerCase().includes(search) || "") ||
          schedule.scheduleTime.some(st =>
            st.fulldate.includes(search) ||
            st.time.some(t => t.includes(search))
          )
        );
      // Lọc theo từng filter
      const matchesMovie = movieFilter === "all" || String(schedule.movieId) === String(movieFilter);
      const matchesCinema = cinemaFilter === "all" || String(schedule.cinemaId) === String(cinemaFilter);
      const matchesRoom = roomFilter === "all" || String(schedule.cinemaRoomId) === String(roomFilter);
      const matchesFormat = formatFilter === "all" || schedule.format === formatFilter;
      // Bỏ matchesDate
      return (
        matchesSearch && matchesMovie && matchesCinema && matchesRoom && matchesFormat
      );
    });
  }, [schedules, searchTerm, movieFilter, cinemaFilter, roomFilter, formatFilter, movies, cinemas]);

  // Sau khi tính filteredSchedules, sort nếu có movieSort
  let sortedSchedules = [...filteredSchedules];
  if (movieSort) {
    sortedSchedules.sort((a, b) => {
      const movieA = movies.find(m => String(m._id) === String(a.movieId));
      const movieB = movies.find(m => String(m._id) === String(b.movieId));
      const nameA = movieA?.versionMovieEnglish?.toLowerCase() || '';
      const nameB = movieB?.versionMovieEnglish?.toLowerCase() || '';
      if (movieSort === 'asc') return nameA.localeCompare(nameB);
      else return nameB.localeCompare(nameA);
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
      await movieScheduleService.addMovieSchedule(form);
      const res = await movieScheduleService.getAllMovieSchedules();
      setSchedules(
        (Array.isArray(res) ? res : res.data || []).sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
        })
      );
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
      // Nếu không sort theo tên phim, đưa lịch vừa edit lên đầu
      if (!movieSort) {
        const idx = newSchedules.findIndex(s => s._id === form._id);
        if (idx > -1) {
          const [edited] = newSchedules.splice(idx, 1);
          newSchedules.unshift(edited);
        }
      }
      setSchedules(newSchedules);
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
  const getSelectedSchedule = (scheduleId: string | null): MovieSchedule | null => {
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
    setCurrentPage(1);
    notify.success("Filters have been reset");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movie Schedule</h1>
          <p className="text-gray-600">View movie schedules for all cinemas</p>
        </div>
        {/* Xoá nút Add New Schedule */}
        {/* <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Schedule
        </button> */}
      </div>
      {/* Card statistics giống movie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Schedules</p>
              <p className="text-3xl font-bold text-gray-900">{schedules.length}</p>
              <p className="text-xs text-gray-500 mt-1">In system</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Showtimes</p>
              <p className="text-3xl font-bold text-green-600">{schedules.reduce((sum, s) => sum + s.scheduleTime.reduce((sum2, st) => sum2 + st.time.length, 0), 0)}</p>
              <p className="text-xs text-gray-500 mt-1">All sessions</p>
            </div>
            <Film className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Showtimes</p>
              <p className="text-3xl font-bold text-blue-600">{schedules.reduce((sum, s) => sum + s.scheduleTime.reduce((sum2, st) => sum2 + st.time.length, 0), 0)}</p>
              <p className="text-xs text-gray-500 mt-1">For today</p>
            </div>
            <Building className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>
      {/* Filter giống movie */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule List</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by movie, cinema, room..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent h-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="relative flex items-center">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none h-10"
                value={movieFilter}
                onChange={(e) => {
                  setMovieFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Movies</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>{m.versionMovieEnglish}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-4 h-4" />
            </div>
            <div className="relative flex items-center">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none h-10"
                value={cinemaFilter}
                onChange={(e) => {
                  setCinemaFilter(e.target.value);
                  setRoomFilter("all");
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Cinemas</option>
                {cinemas.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-4 h-4" />
            </div>
            <div className="relative flex items-center">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none h-10"
                value={roomFilter}
                onChange={(e) => {
                  setRoomFilter(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={cinemaFilter === "all"}
              >
                <option value="all">All Rooms</option>
                {uniqueRooms.map((r: any) => (
                  <option key={r._id} value={r._id}>{r.roomName}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-4 h-4" />
            </div>
            <div className="relative flex items-center">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none h-10"
                value={formatFilter}
                onChange={(e) => {
                  setFormatFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Formats</option>
                {formatOptions.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-4 h-4" />
            </div>
            <button
              onClick={resetFilters}
              className="w-full h-10 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
      {/* Grid card schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentSchedules.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No schedules found matching the filter criteria.</p>
          </div>
        )}
        {currentSchedules.map((schedule) => {
          const movie = movies.find((m) => m._id === schedule.movieId);
          const cinema = cinemas.find((c) => c._id === schedule.cinemaId);
          const room = cinema?.rooms?.find((r: any) => r._id === schedule.cinemaRoomId);
          return (
            <div key={schedule._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                {movie?.largeImage && (
                  <img
                    src={movie.largeImage}
                    alt={movie.versionMovieEnglish}
                    className="w-16 h-24 object-cover rounded shadow border"
                  />
                )}
                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-900 line-clamp-2">{movie?.versionMovieEnglish || "-"}</div>
                  <div className="text-sm text-gray-600 mt-1">{cinema?.name || "-"}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">Room: {room?.roomName || "-"}</span>
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">{schedule.format}</span>
                    {movie?.status && (
                      <span className={
                        "inline-block px-2 py-1 rounded text-xs font-semibold " +
                        (movie.status === "showing"
                          ? "bg-green-100 text-green-700"
                          : movie.status === "comingsoon"
                          ? "bg-yellow-100 text-yellow-700"
                          : movie.status === "ended"
                          ? "bg-gray-200 text-gray-600"
                          : "bg-blue-100 text-blue-700")
                      }>
                        {movie.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="font-semibold text-gray-700 mb-1">Showtimes:</div>
                <div className="space-y-2">
                  {schedule.scheduleTime.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900 min-w-[90px]">{st.fulldate}:</span>
                      {st.time.map((t, i) => (
                        <span key={i} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono font-semibold border border-blue-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleViewSchedule(schedule._id!)}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Pagination Controls giữ nguyên */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedSchedules.length)} of {sortedSchedules.length} schedules
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${currentPage === page ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
   
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
    
      
    </div>
  );
};

export default MovieSchedule; 