import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Movie } from "../../../types/movie";

interface MovieCardListProps {
  movies: Movie[];
}

const MovieCardList: React.FC<MovieCardListProps> = ({ movies }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBookTicket = (movie: Movie) => {
    // Navigate to movie detail page with movie ID
    navigate(`/movie-detail/${movie._id}`, { replace: true });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 p-4 container mx-auto">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="relative overflow-hidden transition duration-300 ease-in-out"
          >
            <div
              className="relative transition-transform duration-300 hover:scale-105"
              onMouseEnter={() => setHoveredId(movie._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={movie.largeImage}
                alt={movie.versionMovieEnglish}
                className="w-full object-cover "
              />
              {hoveredId === movie._id && (
                <div className="absolute inset-0 font-sans flex flex-col items-center justify-center bg-black/40 transition ">
                  <button
                    className="bg-orange-300 hover:bg-orange-400 text-white px-4 py-3 rounded flex items-center mb-3"
                    onClick={() => handleBookTicket(movie)}
                  >
                    Book now
                  </button>
                  <button
                    className="border border-white hover:bg-gray-200 text-white px-7 py-2 rounded flex items-center"
                    onClick={() => setTrailerUrl(movie.trailerUrl)}
                  >
                    Trailer
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 text-center">
              <h2 className="text-lg font-sans">{movie.versionMovieEnglish}</h2>
            </div>
          </div>
        ))}
      </div>
      {/* Modal Trailer */}
      {trailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-80">
          <div className="bg-black rounded-lg overflow-hidden relative w-[1000px]">
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={() => setTrailerUrl(null)}
            >
              ×
            </button>
            <iframe
              width="100%"
              height="600px"
              src={trailerUrl.replace("watch?v=", "embed/")}
              title="Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCardList;
