  "use client";

  import React, { useState, useEffect, useRef, useMemo } from "react";
  import {
    Search,
    Plus,
    Film,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Star,
    RefreshCw,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
  } from "lucide-react";
  import AddMovieModal from "./add-movie-modal";
  import ViewMovieModal from "./view-movie";
  import EditMovieModal from "./edit-movie";
  import { notify, MESSAGES } from "./././../../../lib/toast";
  import { movieService } from "../../../services/api/movieService";
  import type { Movie } from "../../../types/movie";

  // MovieForm type for form usage
  export interface MovieForm {
    _id?: string;
    title: string;
    titleVn?: string;
    genre: string[];
    format?: string[];
    duration: number;
    releaseDate: string;
    status: "Showing" | "Comingsoon" | "Ended";
    poster: string;
    banner?: string;
    embedUrl?: string;
    trailerUrl?: string;
    description?: string;
    director?: string;
    cast?: string[];
    production?: string[];
    language?: string;
    ageRating?: string;
    toDate?: string;
  }

  const MovieManagement: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("All Genres");
  const [dateFilter, setDateFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of movies per page
  const [lastModifiedMovieId, setLastModifiedMovieId] = useState<string | null>(null);
  // 1. Thêm state showDropdown
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

    const viewModalRef = useRef<HTMLDivElement>(
      null!
    ) as React.RefObject<HTMLDivElement>;
    const editModalRef = useRef<HTMLDivElement>(
      null!
    ) as React.RefObject<HTMLDivElement>;

    const uniqueGenres = useMemo(() => {
      const genres = new Set<string>();
      movies.forEach((movie) => {
        if (movie.movieTypes && movie.movieTypes.length > 0) {
          movie.movieTypes.forEach((type) => {
            if (type.typeName) genres.add(type.typeName);
          });
        }
      });
      return Array.from(genres);
    }, [movies]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          viewModalRef.current &&
          !viewModalRef.current.contains(event.target as Node) &&
          showViewModal
        ) {
          setShowViewModal(null);
        }
        if (
          editModalRef.current &&
          !editModalRef.current.contains(event.target as Node) &&
          showEditModal
        ) {
          setShowEditModal(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showViewModal, showEditModal]);

    const statistics = useMemo(() => {
      const totalMovies = movies.length;
      const nowShowing = movies.filter(
        (m) => m.status?.toLowerCase() === "showing"
      ).length;
      const comingSoon = movies.filter(
        (m) => m.status?.toLowerCase() === "comingsoon"
      ).length;

      return {
        totalMovies,
        nowShowing,
        comingSoon,
      };
    }, [movies]);

    const filteredMovies = useMemo(() => {
      let filtered = movies.filter((movie) => {
        const search = searchTerm.toLowerCase();
        const title = (movie.versionMovieEnglish || "").toLowerCase();
        const genre = (
          movie.movieTypes && movie.movieTypes.length > 0
            ? movie.movieTypes[0].typeName
            : ""
        ).toLowerCase();
        const director = (movie.director || "").toLowerCase();
        const language = (movie.language || "").toLowerCase();
        const status = (movie.status || "").toLowerCase();
        const matchesSearch =
          title.includes(search) ||
          genre.includes(search) ||
          director.includes(search) ||
          language.includes(search) ||
          status.includes(search);
        const matchesStatus =
          statusFilter === "all" || movie.status === statusFilter;
        const matchesGenre =
          genreFilter === "All Genres" ||
          (movie.movieTypes &&
            movie.movieTypes.some((type) => type.typeName === genreFilter));
        const matchesDate =
          dateFilter === "" || movie.releaseDate.includes(dateFilter);
        return matchesSearch && matchesStatus && matchesGenre && matchesDate;
      });

      // Custom sort logic
      filtered = filtered.sort((a, b) => {
        // 1. Last added/edited movie always on top
        if (lastModifiedMovieId) {
          if (a._id === lastModifiedMovieId) return -1;
          if (b._id === lastModifiedMovieId) return 1;
        }
        // 2. Showing > Comingsoon > others (e.g., Ended)
        const statusOrder = (status: string) => {
          if (status.toLowerCase() === "showing") return 1;
          if (status.toLowerCase() === "comingsoon") return 2;
          return 3;
        };
        const orderA = statusOrder(a.status || "");
        const orderB = statusOrder(b.status || "");
        if (orderA !== orderB) return orderA - orderB;
        // 3. Fallback: sort by releaseDate descending
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      });

      return filtered;
    }, [movies, searchTerm, statusFilter, genreFilter, dateFilter, lastModifiedMovieId]);

    // Pagination logic
    const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMovies = filteredMovies.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        setOpenDropdownId(null); // Close any open dropdown when changing pages
      }
    };

    // Mapping Movie (backend) -> MovieForm (UI)
    const mapMovieToForm = (movie: Movie): MovieForm => ({
      _id: movie._id,
      title: movie.versionMovieEnglish,
      titleVn: movie.versionMovieVn,
      genre: movie.movieTypes.map(t => t.typeName),
      format: movie.format,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
      status: movie.status as "Showing" | "Comingsoon" | "Ended",
      poster: movie.largeImage,
      banner: movie.smallImage,
      embedUrl: movie.embedUrl,
      trailerUrl: movie.trailerUrl,
      description: movie.content,
      director: movie.director,
      cast: movie.actors.map(a => a.name),
      production: typeof movie.movieProductionCompany === 'string' ? movie.movieProductionCompany.split(",").map(s => s.trim()) : [],
      language: movie.language,
      ageRating: movie.rating,
      toDate: movie.toDate,
    });

    // Mapping MovieForm (UI) -> Movie (backend body)
    const mapFormToMovie = (form: MovieForm, isUpdate = false): any => ({
      ...(isUpdate && form._id ? { _id: form._id } : {}),
      actors: form.cast?.map(name => ({ name, actorId: "" })) || [],
      content: form.description || "",
      director: form.director || "",
      duration: form.duration,
      fromDate: form.releaseDate,
      toDate: form.toDate || form.releaseDate, // Use toDate if available, otherwise releaseDate
      movieProductionCompany: form.production?.join(", ") || "",
      versionMovieEnglish: form.title,
      versionMovieVn: form.titleVn || "",
      largeImage: form.poster,
      smallImage: form.banner || "",
      trailerUrl: form.trailerUrl || "",
      releaseDate: form.releaseDate,
      keywords: [],
      movieTypes: form.genre.map(typeName => ({ typeName })),
      format: form.format ?? [],
      language: form.language || "English",
      subtitles: [],
      status: form.status,
      nation: "",
      embedUrl: form.embedUrl || "",
      rating: form.ageRating || "", // Thêm dòng này để map ageRating sang rating
    });

    // 6. Sửa lại các hàm handleAddMovie, handleUpdateMovie, handleDeleteMovie, getSelectedMovie, ...
    // handleAddMovie
    const handleAddMovie = async (form: MovieForm) => {
      try {
        const loadingToast = notify.loading("Adding new movie...");
        await movieService.addMovie(mapFormToMovie(form, false));
        const res = await movieService.getAllMovies();
        if (res.success) {
          setMovies(res.data);
          // Set last modified movie id to the newly added movie
          const added = res.data.find(
            (m: any) => m.versionMovieEnglish === form.title && m.releaseDate === form.releaseDate
          );
          if (added) setLastModifiedMovieId(added._id);
        }
        notify.dismiss(loadingToast);
        notify.success(MESSAGES.MOVIE.ADDED);
      } catch {
        notify.error(MESSAGES.MOVIE.ERROR);
      }
    };
    // handleUpdateMovie
    const handleUpdateMovie = async (form: MovieForm) => {
      try {
        if (!form._id) return;
        const loadingToast = notify.loading("Updating movie...");
        await movieService.updateMovie(form._id, mapFormToMovie(form, true));
        const res = await movieService.getAllMovies();
        if (res.success) {
          setMovies(res.data);
          setLastModifiedMovieId(form._id); // Set last modified movie id to the updated movie
        }
        setShowEditModal(null);
        notify.dismiss(loadingToast);
        // notify.success(MESSAGES.MOVIE.UPDATED);
      } catch {
        notify.error(MESSAGES.MOVIE.ERROR);
      }
    };
    // handleDeleteMovie
    const handleDeleteMovie = (movieId: string) => {
      const movie = movies.find((m) => m._id === movieId);
      if (movie) {
        setMovieToDelete(movie);
        setShowDeleteModal(true);
      }
    };
    const confirmDeleteMovie = async () => {
      if (!movieToDelete) return;
      try {
        const loadingToast = notify.loading("Deleting movie...");
        await movieService.deleteMovie(movieToDelete._id);
        const res = await movieService.getAllMovies();
        if (res.success) setMovies(res.data);
        notify.dismiss(loadingToast);
        notify.success(MESSAGES.MOVIE.DELETED);
        setShowDeleteModal(false);
        setMovieToDelete(null);
        if (currentMovies.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch {
        notify.error(MESSAGES.MOVIE.ERROR);
      }
    };
    // getSelectedMovie
    const getSelectedMovie = (movieId: string | null): Movie | null => {
      if (!movieId) return null;
      return movies.find((m) => m._id === movieId) || null;
    };

    const handleViewMovie = (movieId: string) => {
      const movie = movies.find((m) => m._id === movieId);
      setShowViewModal(movieId);
      setOpenDropdownId(null);
      if (movie) {
        notify.info(`Viewing details for "${movie.versionMovieEnglish}"`);
      }
    };

    const toggleDropdown = (movieId: string) => {
      setOpenDropdownId(openDropdownId === movieId ? null : movieId);
    };

    const handleDropdownAction = (
      action: "view" | "edit" | "delete",
      movieId: string
    ) => {
      setOpenDropdownId(null);
      setTimeout(() => {
        switch (action) {
          case "view":
            handleViewMovie(movieId);
            break;
          case "edit":
            handleEditMovie(movieId);
            break;
          case "delete":
            handleDeleteMovie(movieId);
            break;
        }
      }, 100);
    };

    const resetFilters = () => {
      setSearchTerm("");
      setStatusFilter("all");
      setGenreFilter("All Genres");
      setDateFilter("");
      setCurrentPage(1); // Reset to first page when resetting filters
      notify.success("Filters have been reset");
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const dropdown = document.querySelector(
          `[data-dropdown="${openDropdownId}"]`
        );
        if (!dropdown || !dropdown.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      };

      if (openDropdownId) {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
      }
    }, [openDropdownId]);

        const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await movieService.getAllMovies();
        if (res.success) {
          setMovies(res.data);
          setCurrentPage(1); // Reset to first page when fetching new data
        } else {
          throw new Error("Failed to fetch movies");
        }
      } catch (fetchError: unknown) {
        const error = fetchError as Error;
        setError(error.message || "Failed to fetch movies");
        notify.error(`Failed to fetch movies: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchMovies();
    }, []);

        const handleEditMovie = (movieId: string) => {
      setShowEditModal(movieId);
      setOpenDropdownId(null);
      notify.info("Opening movie editor...");
    };

    if (loading) {
      return (
        <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading movies...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Film className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load movies
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchMovies}
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
              <h1 className="text-2xl font-bold text-gray-900">Movie Management</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage movie list, schedules and statistics
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Movies</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalMovies}</p>
                <p className="text-xs text-gray-500 mt-1">In system</p>
              </div>
              <Film className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Now Showing</p>
                <p className="text-3xl font-bold text-green-600">{statistics.nowShowing}</p>
                <p className="text-xs text-gray-500 mt-1">Active movies</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coming Soon</p>
                <p className="text-3xl font-bold text-blue-600">{statistics.comingSoon}</p>
                <p className="text-xs text-gray-500 mt-1">Upcoming releases</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Movie List
              </h2>
              <button
                onClick={fetchMovies}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, genre, director..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent h-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
              </div>

              <div className="relative flex items-center">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none h-10"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                >
                  <option value="all">All Status</option>
                  {Array.from(new Set(movies.map((m) => m.status))).map(
                    (status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-4 h-4" />
              </div>

              <div className="relative flex items-center">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none h-10"
                  value={genreFilter}
                  onChange={(e) => {
                    setGenreFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                >
                  <option>All Genres</option>
                  {uniqueGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
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

          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-20 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poster
                  </th>
                  <th className="w-72 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Movie Title
                  </th>
                  <th className="w-32 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="w-32 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release Date
                  </th>
                  <th className="w-28 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets Sold
                  </th>
                  <th className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMovies.map((movie) => (
                  <tr
                    key={movie._id}
                    className="hover:bg-gray-50 text-center align-middle"
                  >
                    <td className="px-4 py-3 whitespace-nowrap flex justify-center items-center">
                      <img
                        src={movie.largeImage || "/placeholder.svg"}
                        alt={movie.versionMovieEnglish}
                        className="w-12 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {movie.versionMovieEnglish}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {movie.movieTypes && movie.movieTypes.length > 0
                          ? movie.movieTypes[0].typeName
                          : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {movie.duration} min
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString("vi-VN") : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${movie.status?.toLowerCase() === "showing"
                            ? "bg-green-100 text-green-800"
                            : movie.status?.toLowerCase() === "comingsoon"
                            ? "bg-blue-100 text-blue-800"
                            : movie.status?.toLowerCase() === "ended"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"}
                        `}
                      >
                        {movie.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {movie.userReviews && movie.userReviews.length > 0 ? (
                        <div className="flex items-center justify-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {(
                              movie.userReviews.reduce(
                                (acc, cur) => acc + cur.score,
                                0
                              ) / movie.userReviews.length
                            ).toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-gray-300">
                          <Star className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">-</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        <button
                          data-movie-id={movie._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropdown(showDropdown === movie._id ? null : movie._id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          type="button"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {showDropdown === movie._id && (
                          <div
                            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
                            style={(() => {
                              const buttonElement = document.querySelector(
                                `[data-movie-id="${showDropdown}"]`
                            );
                              if (!buttonElement) return {};
                              const buttonRect = buttonElement.getBoundingClientRect();
                              const dropdownHeight = 120; // Approximate height of dropdown
                              const viewportHeight = window.innerHeight;
                              const spaceBelow = viewportHeight - buttonRect.bottom;
                              const spaceAbove = buttonRect.top;
                              const shouldAppearAbove = spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight;
                              const left = Math.min(
                                window.innerWidth - 170,
                                Math.max(10, buttonRect.right - 160)
                            );
                              const top = shouldAppearAbove
                                ? buttonRect.top - dropdownHeight - 5
                                : buttonRect.bottom + 5;
                              return {
                                left: `${left}px`,
                                top: `${Math.max(10, Math.min(top, viewportHeight - dropdownHeight - 10))}px`,
                              };
                            })()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  const m = movies.find((m) => m._id === showDropdown);
                                  if (m) handleViewMovie(m._id!);
                                  setShowDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  const m = movies.find((m) => m._id === showDropdown);
                                  if (m) handleEditMovie(m._id!);
                                  setShowDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Movie
                              </button>
                              <button
                                onClick={() => {
                                  const m = movies.find((m) => m._id === showDropdown);
                                  if (m) handleDeleteMovie(m._id!);
                                  setShowDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentMovies.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No movies found matching the filter criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredMovies.length)} of{" "}
                {filteredMovies.length} movies
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

        {showDeleteModal && movieToDelete && (
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
                    Delete Movie
                  </h3>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Are you sure you want to delete this movie?
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">
                      {movieToDelete.versionMovieEnglish}
                    </p>
                    <p className="text-gray-600">
                      {movieToDelete.movieTypes &&
                      movieToDelete.movieTypes.length > 0
                        ? movieToDelete.movieTypes[0].typeName
                        : "-"} {" "}
                      • {movieToDelete.duration} minutes
                    </p>
                    <p className="text-gray-600">
                      Status: {movieToDelete.status}
                    </p>
                  </div>
                </div>
                <p className="text-red-600 text-sm mt-3 font-medium">
                  ⚠️ This action cannot be undone. All related schedules and
                  bookings will also be affected.
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
                  onClick={confirmDeleteMovie}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  Delete Movie
                </button>
              </div>
            </div>
          </div>
        )}
        <AddMovieModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddMovie}
        />

        {showViewModal && getSelectedMovie(showViewModal) && (
          <ViewMovieModal
            isOpen={true}
            onClose={() => setShowViewModal(null)}
            movie={mapMovieToForm(getSelectedMovie(showViewModal)!)}
            modalRef={viewModalRef}
          />
        )}

        {showEditModal && getSelectedMovie(showEditModal) && (
          <EditMovieModal
            isOpen={true}
            onClose={() => setShowEditModal(null)}
            movie={mapMovieToForm(getSelectedMovie(showEditModal)!)}
            onUpdate={handleUpdateMovie}
            modalRef={editModalRef}
          />
        )}
      </div>
    );  
  };

  export default MovieManagement;
