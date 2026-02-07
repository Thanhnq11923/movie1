import type { Movie } from "../../types/movie";
import { useNavigate } from "react-router-dom";

/**
 * Props cho component MovieCard
 */
interface MovieCardProps {
  movie: Movie; // Thông tin phim
  onTrailerClick: (embedUrl: string) => void; // Hàm xử lý khi click xem trailer
}

/**
 * Component MovieCard - Card hiển thị thông tin một bộ phim
 * Hiển thị poster, rating, thông tin cơ bản và các nút tương tác
 */
export default function MovieCard({ movie, onTrailerClick }: MovieCardProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-sm overflow-hidden transition-shadow">
      {/* Container cho poster phim */}
      <div className="relative h-130 group">
        {/* Hình ảnh poster */}
        <img
          src={movie.largeImage}
          alt={movie.versionMovieEnglish}
          className="h-full w-full object-cover rounded-sm"
        />

        {/* Overlay hiển thị thông tin phim */}
        <div className="absolute inset-0 bg-opacity-50 flex flex-col justify-between p-4 text-white">
          {/* Phần giữa: Các nút tương tác (hiện khi hover) */}
          <div className="absolute inset-0 rounded-sm bg-black/70 bg-opacity-70 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
            {/* Nút xem chi tiết */}
            <button
              className="bg-[#ff9800] hover:bg-[#ff8800] hover:text-white px-4 py-2 rounded-sm text-md font-medium transition-all flex items-center gap-2 min-w-[120px] justify-center"
              onClick={() => navigate(`/movie-detail/${movie._id}`)}
            >
              {/* Icon chi tiết */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Book now
            </button>

            {/* Nút xem trailer */}
            <button
              onClick={() => onTrailerClick(movie.embedUrl)}
              className="bg-transparent border border-white hover:bg-white hover:text-black px-7 py-2 rounded-sm text-md font-medium transition-all flex items-center gap-2 min-w-[120px] justify-center"
              title="Watch trailer on YouTube"
            >
              {/* Icon YouTube */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.94C18.1 6 12 6 12 6s-6.1 0-7.86.06a2.75 2.75 0 0 0-1.94 1.94A28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.94 1.94C5.9 18 12 18 12 18s6.1 0 7.86-.06a2.75 2.75 0 0 0 1.94-1.94A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.2-3.999zM10 15V9l5 3-5 3z" />
              </svg>
              Trailer
            </button>
          </div>

          {/* Phần dưới: Rating và độ tuổi */}
          <div className="flex justify-between items-end mt-auto">
            {/* Rating với icon sao */}
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="font-bold text-lg">
                {movie.userReviews && movie.userReviews.length > 0
                  ? (
                      movie.userReviews.reduce(
                        (sum, r) => sum + (r.score || 0),
                        0
                      ) / movie.userReviews.length
                    ).toFixed(1)
                  : ""}
              </span>
            </div>

            {/* Nhãn độ tuổi */}
            <div className="bg-orange-400 px-3 py-1 rounded-sm text-sm">
              {movie.rating}
            </div>
          </div>
        </div>
      </div>
      {/* Phần dưới: Tên phim và trạng thái */}
      <div className="p-left-3 mt-3 text-left">
        <h3 className="text-lg mb-1 leading-tight text-black text-left">
          {movie.versionMovieEnglish}
        </h3>
      </div>
    </div>
  );
}
