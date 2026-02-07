/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import type { Movie } from "../../../types/movie";
import { movieService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Carousel = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [animationKey, setAnimationKey] = useState(0); // Added to force animation

  // Helper function to sync selected movie with DOM
  const syncSelectedMovie = () => {
    setTimeout(() => {
      const secondItem = document.querySelector(".item:nth-child(2)");
      if (secondItem) {
        const index = parseInt(secondItem.getAttribute("data-index") || "0");
        if (movies[index]) {
          setAnimationKey((prev) => prev + 1);
          setSelectedMovie(movies[index]);
        }
      }
    }, 50);
  };

  const nextSlide = () => {
    const lists = document.querySelectorAll(".item");
    const slide = document.getElementById("slide");
    if (slide && lists.length > 0) {
      slide.appendChild(lists[0]);
      syncSelectedMovie();
    }
  };

  const prevSlide = () => {
    const lists = document.querySelectorAll(".item");
    const slide = document.getElementById("slide");
    if (slide && lists.length > 0) {
      slide.prepend(lists[lists.length - 1]);
      syncSelectedMovie();
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await movieService.getAllMovies();
        setMovies(response.data);
        if (response.data.length > 0) {
          // Set the second movie as selected since it's the one that shows content
          setSelectedMovie(response.data[1] || response.data[0]);
        }
      } catch (err) {
        setError("Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Additional useEffect to sync selected movie after DOM is ready
  useEffect(() => {
    if (movies.length > 0) {
      // Wait for DOM to be ready, then sync with the second item
      const syncAfterRender = () => {
        setTimeout(() => {
          const secondItem = document.querySelector(".item:nth-child(2)");
          if (secondItem) {
            const index = parseInt(
              secondItem.getAttribute("data-index") || "0"
            );
            if (movies[index]) {
              console.log(
                "Syncing banner with movie at index:",
                index,
                movies[index].versionMovieEnglish
              );
              setSelectedMovie(movies[index]);
            }
          }
        }, 200); // Increased timeout to ensure DOM is fully rendered
      };

      // Try multiple times to ensure sync
      syncAfterRender();
      setTimeout(syncAfterRender, 500);
    }
  }, [movies]);

  const handleSeeMore = (movieId: string) => {
    navigate(`/movie-detail/${movieId}`);
  };

  const handleItemClick = (movie: Movie, index: number) => {
    const lists = document.querySelectorAll(".item");
    const slide = document.getElementById("slide");
    if (slide && lists.length > 0) {
      const clickedItem = document.querySelector(
        `.item[data-index="${index}"]`
      );
      if (!clickedItem || clickedItem === lists[1]) return;

      // Rearrange DOM to put clicked item in second position
      const items = Array.from(lists);
      items.forEach((item) => slide.removeChild(item));
      slide.appendChild(items[0]);
      slide.appendChild(clickedItem);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item !== items[0] && item !== clickedItem) {
          slide.appendChild(item);
        }
      }

      // Immediately update selected movie to match clicked item
      setAnimationKey((prev) => prev + 1);
      setSelectedMovie(movie);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error || movies.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        Error loading movies
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Main Banner */}
        <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-screen overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 animate-jump-in" />
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {selectedMovie && (
              <img
                key={animationKey}
                src={selectedMovie?.smallImage}
                alt={selectedMovie?.versionMovieEnglish}
                className="w-full h-full object-cover animate-fade-in"
              />
            )}
          </div>
        </div>

        {/* Movie Carousel */}
        <div className="relative -mt-[30vh] sm:-mt-[35vh] md:-mt-[40vh] lg:-mt-[50vh] lg:ml-[50px] z-30">
          <div id="slide" className="flex justify-center">
            {movies.map((movie, index) => (
              <div
                key={movie._id}
                data-index={index}
                className="item group cursor-pointer"
                onClick={() => handleItemClick(movie, index)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${movie.largeImage})` }}
                />
                <div className="content relative z-10">
                  <div className="name">{movie.versionMovieEnglish}</div>
                  <div className="des">
                    {movie.content ? movie.content : "No description available"}
                  </div>
                  <button
                    className="bg-white/60 rounded-sm p-6 sm:p-5 transition-all duration-300 hover:scale-110 text-gray-900 text-sm sm:text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeeMore(movie._id);
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="buttons flex justify-center gap-4">
            <button id="prev" onClick={prevSlide}>
              <div className="p-2 sm:p-3 text-white">
                <ArrowLeft size={20} />
              </div>
            </button>
            <button id="next" onClick={nextSlide}>
              <div className="p-2 sm:p-3 text-white">
                <ArrowRight size={20} />
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
          #slide {
            width: 100%;
          }
          .item {
            width: 200px; /* Tăng từ 150px */
            height: 290px; /* Tăng từ 225px */
            background-position: 50% 50%;
            display: inline-block;
            transition: all 0.5s ease-in-out;
            background-size: cover;
            position: absolute;
            z-index: 1;
            top: 50%;
            transform: translate(0, -50%);
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
          }
          .item:nth-child(1) {
            left: 0;
            top: 0;
            border-radius: 0;
            width: 100%;
            height: 100%;
            box-shadow: none;
            transform: none;
          }
          .item:nth-child(2) {
            left: 0;
            top: 0;
            border-radius: 0;
            width: 100%;
            height: 100%;
            box-shadow: none;
            transform: none;
          }
          .item:nth-child(3) {
            left: calc(50% - 100px); /* Tăng từ -75px để cách xa hơn */
            transform: translate(0, -50%) scale(0.9);
          }
          .item:nth-child(4) {
            left: calc(50% + 120px); /* Tăng từ +90px để cách xa hơn */
            transform: translate(0, -50%) scale(0.8);
          }
          .item:nth-child(5) {
            left: calc(50% + 300px); /* Tăng từ +255px để cách xa hơn */
            transform: translate(0, -50%) scale(0.7);
          }
          .item:nth-child(n + 6) {
            left: calc(50% + 480px); /* Tăng từ +420px để cách xa hơn */
            opacity: 0;
            transform: translate(0, -50%) scale(0.6);
          }
          .item .content {
            position: absolute;
            top: 50%;
            left: 20px;
            width: 60%;
            max-width: 300px;
            text-align: left;
            color: #eee;
            transform: translate(0, -50%);
            display: none;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .item:nth-child(2) .content {
            display: block;
            z-index: 11111;
          }
          .item .name {
            font-size: 1.5rem;
            opacity: 0;
            animation: showcontent 1s ease-in-out 1 forwards;
          }
          .item .des {
            margin: 10px 0;
            font-size: 0.9rem;
            opacity: 0;
            animation: showcontent 1s ease-in-out 0.3s 1 forwards;
          }
          .item button {
            padding: 8px 16px;
            border: none;
            opacity: 0;
            animation: showcontent 1s ease-in-out 0.6s 1 forwards;
          }
          @keyframes showcontent {
            from {
              opacity: 0;
              transform: translate(0, 50px);
              filter: blur(20px);
            }
            to {
              opacity: 1;
              transform: translate(0, 0);
              filter: blur(0);
            }
          }

          @keyframes fade-in {
            0% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.8s cubic-bezier(0.42, 0.43, 0.83, 0.67);
          }

          .buttons {
            position: absolute;
            top: 20vh;
            z-index: 222222;
            width: 100%;
          }
          .buttons button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 1px solid #555;
            transition: 0.3s;
            background-color: rgba(0, 0, 0, 0.5);
          }
          .buttons button:hover {
            background-color: #ffffff;
            color: #000;
          }

          /* Responsive Styles */
          @media (min-width: 640px) {
            .item {
              width: 220px; /* Tăng từ 180px */
              height: 330px; /* Tăng từ 270px */
            }
            .item:nth-child(3) {
              left: calc(50% - 120px); /* Tăng từ -90px */
              transform: translate(0, -50%) scale(0.9);
            }
            .item:nth-child(4) {
              left: calc(50% + 140px); /* Tăng từ +110px */
              transform: translate(0, -50%) scale(0.8);
            }
            .item:nth-child(5) {
              left: calc(50% + 360px); /* Tăng từ +310px */
              transform: translate(0, -50%) scale(0.7);
            }
            .item:nth-child(n + 6) {
              left: calc(50% + 580px); /* Tăng từ +510px */
              transform: translate(0, -50%) scale(0.6);
            }
            .item .content {
              left: 30px;
              width: 30%;
              max-width: 350px;
            }
            .item .name {
              font-size: 2rem;
            }
            .item .des {
              font-size: 1rem;
            }
            .buttons {
              top: 25vh;
            }
            .buttons button {
              width: 50px;
              height: 50px;
            }
          }
          @media (max-width: 640px) {
            .item {
              width: 140px; /* Tăng từ 120px */
              height: 210px; /* Tăng từ 180px */
            }
            .item:nth-child(3) {
              left: calc(50% - 80px); /* Tăng từ -60px */
              transform: translate(0, -50%) scale(0.9);
            }
            .item:nth-child(4) {
              left: calc(50% + 90px); /* Tăng từ +75px */
              transform: translate(0, -50%) scale(0.8);
            }
            .item:nth-child(5) {
              left: calc(50% + 250px); /* Tăng từ +210px */
              transform: translate(0, -50%) scale(0.7);
            }
            .item:nth-child(n + 6) {
              left: calc(50% + 360px); /* Tăng từ +300px */
              transform: translate(0, -50%) scale(0.6);
            }
            .item .content {
              left: 20px;
              width: 50%;
              max-width: 150px;
            }
            .item .name {
              font-size: 1rem;
            }
            .item .des {
              font-size: 0.5rem;
            }
          }
          @media (min-width: 1024px) {
            .item {
              width: 240px; /* Tăng từ 200px */
              height: 360px; /* Tăng từ 300px */
            }
            .item:nth-child(3) {
              left: calc(50% - 130px); /* Tăng từ -100px */
              transform: translate(0, -50%) scale(0.9);
            }
            .item:nth-child(4) {
              left: calc(50% + 150px); /* Tăng từ +120px */
              transform: translate(0, -50%) scale(0.8);
            }
            .item:nth-child(5) {
              left: calc(50% + 400px); /* Tăng từ +340px */
              transform: translate(0, -50%) scale(0.7);
            }
            .item:nth-child(n + 6) {
              left: calc(50% + 640px); /* Tăng từ +560px */
              transform: translate(0, -50%) scale(0.6);
            }
            .item .content {
              left: 50px;
              width: 40%;
              max-width: 400px;
            }
            .item .name {
              font-size: 2.5rem;
            }
            .item .des {
              font-size: 1.1rem;
            }
            .buttons {
              top: 30vh;
            }
          }
      `}</style>
    </>
  );
};

export default Carousel;
