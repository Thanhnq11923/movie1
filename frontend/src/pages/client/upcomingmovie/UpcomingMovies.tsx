import { useState, useEffect } from 'react';
import { MainLayout } from '../../../layouts/Layout';
import { movieService } from '../../../services/api/movieService';
import type { Movie } from '../../../types/movie';
import SearchBar from '../../../components/movies/SearchBar';
import FilterTabs, { type SelectedFilters } from '../../../components/movies/FilterTabs';
import MovieCard from '../../../components/movies/MovieCard';
import TrailerModal from '../../../components/movies/TrailerModal';

/**
 * Component UpcomingMovie - Trang hiển thị danh sách phim sắp chiếu
 * Tính năng chính:
 * - Hiển thị danh sách phim dạng grid
 * - Tìm kiếm phim theo tên
 * - Lọc phim theo định dạng, thể loại, quốc gia
 * - Xem trailer phim trong popup
 */
export default function UpcomingMovie() {
  // === STATE MANAGEMENT ===
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    format: '',
    category: '',
    nation: ''
  });
  const [showTrailer, setShowTrailer] = useState<boolean>(false);
  const [currentTrailer, setCurrentTrailer] = useState<string>('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getAllMovies();
        setMovies(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch movies');
        console.error('Failed to fetch movies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // === EVENT HANDLERS ===
  
  /**
   * Xử lý mở/đóng dropdown
   * Nếu dropdown đang mở thì đóng, ngược lại thì mở
   */
  const toggleDropdown = (dropdown: string): void => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  /**
   * Xử lý chọn bộ lọc
   * Nếu giá trị đã được chọn thì bỏ chọn, ngược lại thì chọn
   */
  const handleFilterSelect = (filterType: 'format' | 'category' | 'nation', value: string): void => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value
    }));
    setActiveDropdown(null); // Đóng dropdown sau khi chọn
  };

  /**
   * Xử lý xóa tất cả bộ lọc
   */
  const handleClearFilters = (): void => {
    setSelectedFilters({ format: '', category: '', nation: '' });
  };

  /**
   * Xử lý mở modal xem trailer
   */
  const openTrailer = (embedUrl: string): void => {
    setCurrentTrailer(embedUrl);
    setShowTrailer(true);
  };

  /**
   * Xử lý đóng modal xem trailer
   */
  const closeTrailer = (): void => {
    setShowTrailer(false);
    setCurrentTrailer('');
  };

  // === DATA PROCESSING ===
  
  // Lấy unique cho các trường dạng array hoặc object
  const getUniqueNations = (): string[] => {
    return [
      ...new Set(
        movies.flatMap((movie) => Array.isArray(movie.nation) ? movie.nation.map((n) => String(n)) : [String(movie.nation)])
      ),
    ];
  };
  const getUniqueFormats = (): string[] => {
    return [
      ...new Set(
        movies.flatMap((movie) => Array.isArray(movie.format) ? movie.format.map((f) => String(f)) : [String(movie.format)])
      ),
    ];
  };
  const getUniqueCategories = (): string[] => {
    return [
      ...new Set(
        movies.flatMap((movie) => Array.isArray(movie.movieTypes) ? movie.movieTypes.map((t) => t.typeName) : [])
      ),
    ];
  };
  const uniqueNations = getUniqueNations();
  const uniqueFormats = getUniqueFormats();
  const uniqueCategories = getUniqueCategories();

  /**
   * Lọc danh sách phim dựa trên từ khóa tìm kiếm và các bộ lọc
   */
  const filteredMovies = movies.filter((movie) => {
    // Kiểm tra từ khóa tìm kiếm (không phân biệt hoa thường)
    const matchesSearch = movie.versionMovieEnglish
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());

    // Kiểm tra bộ lọc định dạng
    const matchesFormat =
      !selectedFilters.format ||
      (Array.isArray(movie.format)
        ? movie.format.includes(selectedFilters.format)
        : movie.format === selectedFilters.format);

    // Kiểm tra bộ lọc thể loại
    const matchesCategory =
      !selectedFilters.category ||
      (Array.isArray(movie.movieTypes)
        ? movie.movieTypes.some((type) => type.typeName === selectedFilters.category)
        : false);

    // Kiểm tra bộ lọc quốc gia
    const matchesNation =
      !selectedFilters.nation ||
      (Array.isArray(movie.nation)
        ? movie.nation.includes(selectedFilters.nation)
        : movie.nation === selectedFilters.nation);

    //
    const matchesStatus = movie.status?.toLowerCase().trim() === "comingsoon";
    // Phim phải thỏa mãn tất cả điều kiện
    return (
      matchesSearch &&
      matchesFormat &&
      matchesCategory &&
      matchesNation &&
      matchesStatus
    );
  });

  // === RENDER COMPONENT ===
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          
          {/* Header: Bộ lọc và Thanh tìm kiếm */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
            {/* Các tab lọc */}
            <FilterTabs
              selectedFilters={selectedFilters}
              activeDropdown={activeDropdown}
              uniqueFormats={uniqueFormats}
              uniqueCategories={uniqueCategories}
              uniqueNations={uniqueNations}
              onToggleDropdown={toggleDropdown}
              onFilterSelect={handleFilterSelect}
              onClearFilters={handleClearFilters}
            />
            
            {/* Thanh tìm kiếm */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="inline-flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500"></div>
                <span className="text-sm sm:text-base lg:text-lg text-gray-600">Loading upcoming movies...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="inline-flex items-center space-x-3 text-red-500 mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg font-medium">Error</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Grid hiển thị phim */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {filteredMovies.length > 0 ? (
                // Hiển thị danh sách phim
                filteredMovies.map((movie) => (
                  <MovieCard
                    key={movie._id}
                    movie={{
                      ...movie,
                      nation: Array.isArray(movie.nation) ? movie.nation : [movie.nation]
                    }}
                    onTrailerClick={openTrailer}
                  />
                ))
              ) : (
                // Hiển thị thông báo khi không tìm thấy phim
                <div className="col-span-full text-center py-8 sm:py-12 md:py-16">
                  <div className="text-gray-400 text-4xl sm:text-5xl md:text-6xl mb-4">🎬</div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 mb-2 sm:mb-3">
                    No upcoming movies found
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                    {searchQuery 
                      ? `There are no upcoming movies that match the keyword "${searchQuery}"` 
                      : 'Không có phim sắp chiếu nào phù hợp với bộ lọc đã chọn'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Modal xem trailer */}
          <TrailerModal
            isOpen={showTrailer}
            embedUrl={currentTrailer}
            onClose={closeTrailer}
          />

        </div>
      </div>
    </MainLayout>
  );
}