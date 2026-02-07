/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { movieService } from "../../../services/api/movieService";
import { MainLayout } from "../../../layouts/MainLayout";
import MovieSection from "../../../components/client/movieList/MovieSection";
import LatestNews from "../../../components/client/LatestNews";
import PromotionCarousel from "../../../components/client/carousel/PromotionCarousel";
import Carousel from "../../../components/client/carousel/Carousel";
import type { Movie } from "../../../types/movie";
import MovieCard from "../../../components/movies/MovieCard";
import TrailerModal from "../../../components/movies/TrailerModal";

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState<boolean>(false);
  const [currentTrailer, setCurrentTrailer] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await movieService.getAllMovies();
        setMovies(response.data as any);
        console.log(response.data);
      } catch (err) {
        setError("Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleTrailerClick = (embedUrl: string) => {
    if (embedUrl) {
      setCurrentTrailer(embedUrl);
      setShowTrailer(true);
    } else {
      console.warn("No trailer URL provided");
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setCurrentTrailer("");
  };

  const handleViewMore = () => {
    navigate("/showtime");
  };

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="re">
          {!loading && !error && movies.length > 0 && (
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <Carousel />
            </div>
          )}
        </div>
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 ">
          {loading && (
            <div className="text-center py-8 sm:py-12 lg:py-16">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500"></div>
                <span className="text-sm sm:text-base lg:text-lg text-gray-600">
                  Loading movies...
                </span>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center py-8 sm:py-12 lg:py-16">
              <div className="inline-flex items-center space-x-2 text-red-500">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm sm:text-base lg:text-lg">{error}</span>
              </div>
            </div>
          )}

          {/* Movies Grid Section */}
          {!loading && !error && movies.length > 0 && (
            <div className="mt-[300px] sm:mt-[400px] lg:mt-[500px] mb-12 sm:mb-16 lg:mb-20 container mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#034ea2] mb-4">
                  MOVIE SECTION
                </h2>
              </div>

              {/* Filter by status - showing movies (limit to 8) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4 lg:gap-4">
                {movies
                  .filter((movie) => movie.status === "showing")
                  .slice(0, 8) // Limit to 8 movies
                  .map((movie) => (
                    <div
                      key={movie._id}
                      className="transform transition-transform duration-300 hover:scale-105"
                    >
                      <MovieCard
                        movie={movie}
                        onTrailerClick={handleTrailerClick}
                      />
                    </div>
                  ))}
              </div>

              {/* View More Button */}
              {movies.filter((movie) => movie.status === "showing").length >
                8 && (
                <div className="text-center mt-8 sm:mt-12">
                  <button
                    onClick={handleViewMore}
                    className="inline-flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 px-8 rounded-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View More Movies
                  </button>
                </div>
              )}

              {/* Show message if no movies are currently showing */}
              {movies.filter((movie) => movie.status === "showing").length ===
                0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No movies currently showing
                  </h3>
                  <p className="text-gray-500">
                    Please check back later for the latest showtimes
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mb-12 sm:mb-16 lg:mb-20">
            <PromotionCarousel />
          </div>
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <LatestNews />
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailer}
        embedUrl={currentTrailer}
        onClose={closeTrailer}
      />
    </MainLayout>
  );
};

export default HomePage;
