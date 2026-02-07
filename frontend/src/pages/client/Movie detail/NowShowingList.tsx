import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Movie } from "../../../types/movie";

const RightColumn = styled.div`
  width: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;

  @media (min-width: 1024px) {
    width: 380px;
  }
`;

const NowShowingTitle = styled.h3`
  font-size: 1rem;
  color: #1976d2;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-left: 4px solid #1976d2;
  padding-left: 0.7rem;

  @media (min-width: 640px) {
    font-size: 1.1rem;
  }
`;

const NowShowingMovie = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 0.7rem;
  background: none;
  border-radius: 0;
  box-shadow: none;
  min-height: 110px;
  width: 100%;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 3;
`;

const BuyButton = styled.button`
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 2px;
  padding: 0.5em 0.5em;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  transition: background 0.2s, transform 0.2s;
  &:hover {
    background: #ff9800;
    transform: translateY(-2px) scale(1.05);
  }

  @media (min-width: 640px) {
    padding: 0.4em 1.2em;
    font-size: 0.95rem;
  }
`;

const PosterWrapper = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  background: #f0f0f0;
  &:hover ${Overlay} {
    opacity: 1;
  }
`;

const ScoreAgeOverlay = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  z-index: 2;

  @media (min-width: 640px) {
    bottom: 12px;
    right: 12px;
    gap: 0.5rem;
  }
`;

const NowShowingPoster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: none;
  display: block;
`;

const NowShowingName = styled.div`
  font-weight: 400;
  color: #222;
  font-size: 0.95rem;
  margin-bottom: 0.1rem;
  text-align: left;
  width: 100%;
  padding-left: 2px;

  @media (min-width: 640px) {
    font-size: 1.08rem;
  }
`;

const AgeTag = styled.span`
  background: #ff9800;
  color: #fff;
  font-weight: 400;
  border-radius: 2px;
  padding: 0.2em 0.7em;
  font-size: 0.9rem;
  margin-left: 0.5em;

  @media (min-width: 640px) {
    font-size: 1rem;
  }
`;

const Star = styled.span`
  color: #ff9800;
  font-size: 1rem;
  margin-right: 0.2em;

  @media (min-width: 640px) {
    font-size: 1.2rem;
  }
`;

const SeeMoreButton = styled.button`
  display: flex;
  align-items: center;
  align-self: flex-end;
  margin-top: 8px;
  padding: 0.5em 1.8em 0.5em 1.2em;
  background: #ff9800;
  color: #ffffff;
  border-radius: 2px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  gap: 0.5em;
  transition: background 0.18s, color 0.18s, border 0.18s;
  &:hover {
    background: #ff8800;
    color: #fff;
    transform: translateY(-2px) scale(1.05);
  }

  @media (min-width: 640px) {
    padding: 0.6em 2.2em 0.6em 1.5em;
    font-size: 1.05rem;
  }
`;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Hàm shuffle để random danh sách phim
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const NowShowingList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNowShowing = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_BASE_URL}/movies?status=showing`
        );
        console.log("API Response:", response.data); // Debug log

        if (response.data.success) {
          // Shuffle danh sách phim để random thứ tự hiển thị
          const allMovies = response.data.data as Movie[];
          console.log("All movies from API:", allMovies); // Debug log

          // Thêm filter bổ sung để đảm bảo chỉ lấy phim có status "showing"
          const showingMovies = allMovies.filter(
            (movie) => movie.status?.toLowerCase() === "showing"
          );
          console.log("Filtered showing movies:", showingMovies); // Debug log

          const shuffledMovies = shuffleArray(showingMovies);
          setMovies(shuffledMovies);
        } else {
          setError("Không lấy được danh sách phim đang chiếu");
        }
      } catch (err) {
        console.error("Error fetching movies:", err); // Debug log
        setError("Lỗi khi lấy danh sách phim đang chiếu");
      } finally {
        setLoading(false);
      }
    };
    fetchNowShowing();
  }, []);

  const handleBuyTicket = (id: string) => {
    navigate(`/movie-detail/${id}`);
  };

  if (loading)
    return (
      <RightColumn>
        <div>Đang tải phim...</div>
      </RightColumn>
    );
  if (error)
    return (
      <RightColumn>
        <div style={{ color: "red" }}>{error}</div>
      </RightColumn>
    );

  return (
    <RightColumn>
      <NowShowingTitle>MOVIE NOW SHOWING</NowShowingTitle>
      {movies.slice(0, 4).map((movie) => (
        <NowShowingMovie key={movie._id}>
          <NowShowingName>{movie.versionMovieVn}</NowShowingName>
          <PosterWrapper>
            <NowShowingPoster
              src={movie.smallImage}
              alt={movie.versionMovieVn}
            />
            <Overlay>
              <BuyButton onClick={() => handleBuyTicket(movie._id)}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 12V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 8H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 12H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Book now
              </BuyButton>
            </Overlay>
            <ScoreAgeOverlay>
              <Star>★</Star>
              <span style={{ color: "#ff9800", fontWeight: 700 }}>
                {movie.userReviews && movie.userReviews.length > 0
                  ? (
                      movie.userReviews.reduce((sum, r) => sum + r.score, 0) /
                      movie.userReviews.length
                    ).toFixed(1)
                  : 0}
              </span>
              <AgeTag>{movie.rating}</AgeTag>
            </ScoreAgeOverlay>
          </PosterWrapper>
        </NowShowingMovie>
      ))}
      <SeeMoreButton onClick={() => navigate("/showtime")}>
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
        View more
      </SeeMoreButton>
    </RightColumn>
  );
};

export default NowShowingList;
