import React from "react";
import MovieCardList from "./MovieList";
import type { Movie } from "../../../types/movie";

interface MovieSectionProps {
  movies: Movie[];
  onSeeMore: () => void;
}

const MovieSection: React.FC<MovieSectionProps> = ({ movies, onSeeMore }) => {
  return (
    <div className="">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-san font-bold text-[#003B95]">
          MOVIE SELECTION
        </h2>
      </div>
      <MovieCardList movies={movies.slice(0, 8)} />
      <div className="text-center">
        <button
          className="inline-flex transition-all duration-300 hover:scale-110 items-center justify-center gap-2 hover:bg-amber-500 text-md py-3 px-6 rounded-sm border border-amber-500 hover:text-white text-amber-500 hover:border-amber-300"
          onClick={onSeeMore}
        >
          See more
          <svg
            aria-hidden="true"
            width={15}
            height={15}
            focusable="false"
            data-prefix="fas"
            data-icon="angle-right"
            className="svg-inline--fa fa-angle-right mt-1"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
          >
            <path
              fill="currentColor"
              d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MovieSection;
