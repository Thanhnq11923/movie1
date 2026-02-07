import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { MainLayout } from "../../../layouts/MainLayout";
import type { Movie } from "../../../types/movie";
import { movieService } from "../../../services/movieService";
import NowShowingList from "./NowShowingList";
import { useDispatch } from "react-redux";
import { setBookingMovie } from "../../../store/bookingSlice";
import { feedbackService } from "../../../services/api";
import type { Feedback } from "../../../services/api/feedbackService";
import { authService } from "../../../services/api";
import { notify } from "../../../lib/toast";
import axios from "axios";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ff9800;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Banner = styled.div<{ backgroundImage: string }>`
  width: 100%;
  height: 400px;
  background-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.3) 50%,
      rgba(0, 0, 0, 0.2) 100%
    ),
    url(${(props) => props.backgroundImage});
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (min-width: 640px) {
    height: 600px;
  }

  @media (min-width: 768px) {
    height: 700px;
  }

  @media (min-width: 1024px) {
    height: 900px;
  }
`;

const PlayButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background 0.2s;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  &:hover {
    background: #fff;
  }

  @media (min-width: 640px) {
    width: 70px;
    height: 70px;
  }

  @media (min-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContent = styled.div`
  background: #000;
  border-radius: 20px;
  padding: 0;
  position: relative;
  width: 98vw;
  max-width: 1100px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${scaleIn} 0.35s cubic-bezier(0.4, 0.8, 0.2, 1);

  @media (min-width: 640px) {
    width: 95vw;
    max-width: 1000px;
  }
  @media (min-width: 1024px) {
    max-width: 1100px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  &:hover {
    background: #ff9800;
    color: #fff;
    transform: scale(1.15) rotate(10deg);
    box-shadow: 0 2px 8px #ff9800aa;
  }

  @media (min-width: 640px) {
    width: 36px;
    height: 36px;
    font-size: 1.5rem;
  }
`;

const MainContentWrapper = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  background: none;
  padding: 2rem 1rem 0 1rem;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 3rem;
    padding: 3rem 1rem 0 1rem;
  }
`;

const Poster = styled.img`
  width: 200px;
  height: 280px;
  border-radius: 8px;
  flex-shrink: 0;
  background: none;
  box-shadow: none;
  margin-bottom: 0;
  object-fit: cover;
  object-position: center;

  @media (min-width: 640px) {
    width: 250px;
    height: 350px;
  }

  @media (min-width: 768px) {
    width: 280px;
    height: 392px;
  }

  @media (min-width: 1024px) {
    width: 300px;
    height: 420px;
  }
`;

const InfoColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1rem;
  background: none;
  min-width: 0;

  @media (min-width: 640px) {
    gap: 1.2rem;
  }
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;

  @media (min-width: 640px) {
    font-size: 1.8rem;
  }

  @media (min-width: 768px) {
    font-size: 2rem;
  }

  @media (min-width: 1024px) {
    font-size: 2.2rem;
  }
`;

const AgeTag = styled.span`
  background: rgb(241, 181, 91);
  color: #fff;
  font-weight: 400;
  border-radius: 2px;
  padding: 0.2em 0.7em;
  font-size: 0.9rem;
  @media (min-width: 640px) {
    font-size: 1rem;
    margin-left: 0.5em;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  color: #666;
  font-size: 0.9rem;
  text-align: left;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    font-size: 1rem;
  }
`;

const MetaLabel = styled.span`
  min-width: 70px;
  font-weight: 500;
  color: #666;
`;

const TagList = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Star = styled.span`
  color: #ff9800;
  font-size: 1.4rem;
  margin-right: 0.1em;
  line-height: 1;
  display: inline-flex;
  align-items: center;

  @media (min-width: 640px) {
    font-size: 1.8rem;
  }
`;

const Tag = styled.span`
  display: inline-block;
  background: transparent;
  color: #222;
  border-radius: 5px;
  border: 1px solid rgba(128, 128, 128, 0.18);
  padding: 0.2em 0.8em;
  margin-right: 0.5em;
  margin-bottom: 0.3em;
  font-size: 0.9rem;

  @media (min-width: 640px) {
    font-size: 1rem;
  }
`;

const SectionTitle = styled.h2`
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
    font-size: 1.2rem;
  }
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.7;
  color: #222;

  @media (min-width: 640px) {
    font-size: 1.1rem;
  }
`;

const MovieHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  width: 100%;

  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 0.1rem;
    align-items: flex-start;
  }
`;

const MovieDescription = styled.div`
  margin-top: 2rem;

  @media (min-width: 640px) {
    margin-top: 2.5rem;
  }
`;

const MovieBlockWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
`;

const BookTicketButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #f57c00;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 640px) {
    padding: 1rem;
    font-size: 1.1rem;
  }
`;

const PosterWrapper = styled.div`
  margin-top: -50px;
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 640px) {
    margin-top: -70px;
  }

  @media (min-width: 1024px) {
    margin-top: -100px;
    margin-right: 2.5rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
  color: #666;
`;

const Subtitle = styled.h2`
  font-size: 1.2rem;
  margin: 0;
  font-weight: 500;
  color: #666;

  @media (min-width: 640px) {
    font-size: 1.4rem;
  }

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

// New styled components for feedback section
const FeedbackSection = styled.div`
  margin: 2rem 0;
`;

const FeedbackForm = styled.form`
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border-radius: 2px;
  border: 1px solid #ced4da;
  min-height: 30px;
  font-family: inherit;
  rows: 1;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #3182ce;
  }

  @media (min-width: 640px) {
    min-height: 50px; /* Tăng nhẹ cho màn hình lớn hơn */
    rows: 2; /* Giữ 2 dòng */
  }
`;

const ScoreSelector = styled.div`
  display: flex;
  align-items: center;
`;

const ScoreLabel = styled.label`
  margin-right: 1rem;
  font-weight: 600;
`;

const ScoreOption = styled.div<{ selected: boolean }>`
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 0.5rem;
  background: ${(props) => (props.selected ? "#ff9800" : "#e9ecef")};
  color: ${(props) => (props.selected ? "#212529" : "#6c757d")};
  cursor: pointer;
  font-weight: ${(props) => (props.selected ? "600" : "400")};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.selected ? "#ffc107" : "#dee2e6")};
  }
`;

const SubmitButton = styled.button`
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 2px;
  padding: 20px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2c5282;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Update the FeedbackItem component to include admin response
const FeedbackItem = styled.div`
  background-color: white;
  border-bottom: 1px solid #e9ecef;
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0;
`;

const UserName = styled.h4`
  font-weight: 600;
  margin: 0;
`;

const FeedbackDate = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const FeedbackScore = styled.div`
  padding: 4px 10px;
  border-radius: 20px;
  color: #2a67d4;
`;

const FeedbackContent = styled.p`
  margin-top: 10px;
  line-height: 1.6;
`;

const AdminResponse = styled.div`
  background-color: #f8f9fa;
  margin-left: 50px;
  padding: 12px;
  border-radius: 0 4px 4px 0;
  margin-bottom: 20px;
`;

const AdminResponseHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const AdminBadge = styled.span`
  font-size: 15px;
  border-radius: 12px;
  margin-right: 8px;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  border: 2px solid #e9ecef;
  background-color: #f8f9fa;
`;

const DefaultAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  margin-right: 12px;
  border: 2px solid #e9ecef;
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const LoginLink = styled.a`
  color: #3182ce;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedScore, setSelectedScore] = useState<number>(5); // Default to 5
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const movieData = await movieService.getMovieById(id);
        console.log("Fetched movie data:", movieData); // Debug log
        setMovie(movieData);
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // Fetch approved feedbacks for this movie
  useEffect(() => {
    const fetchApprovedFeedbacks = async () => {
      if (!id) return;

      try {
        setLoadingFeedbacks(true);
        const feedbackData =
          await feedbackService.getApprovedFeedbacksByMovieId(id);
        console.log("Feedback data structure:", feedbackData);
        // Debug: Log each feedback's userId structure
        feedbackData.forEach((feedback, index) => {
          console.log(`Feedback ${index} userId:`, feedback.userId);
        });
        setFeedbacks(feedbackData);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      } finally {
        setLoadingFeedbacks(false);
      }
    };

    fetchApprovedFeedbacks();
  }, [id]);

  const handleBookTicket = () => {
    if (movie) {
      dispatch(setBookingMovie(movie));
      navigate("/booking");
    }
  };

  const handlePlayTrailer = () => {
    if (youtubeId) {
      setVideoLoading(true);
      setVideoError(false);
      setShowTrailer(true);
      // Reset loading after a short delay to allow iframe to load
      setTimeout(() => setVideoLoading(false), 1000);
    }
  };

  const handleCloseTrailer = () => {
    setShowTrailer(false);
    setVideoLoading(false);
    setVideoError(false);
  };

  // Handle escape key to close trailer
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showTrailer) {
        handleCloseTrailer();
      }
    };

    if (showTrailer) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }
  }, [showTrailer]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAverageScore = () => {
    if (!movie?.userReviews || movie.userReviews.length === 0) return "0.0";
    const total = movie.userReviews.reduce(
      (sum, review) => sum + review.score,
      0
    );
    return (total / movie.userReviews.length).toFixed(1);
  };

  const extractYouTubeId = (url: string | undefined | null) => {
    if (!url) {
      return null;
    }
    console.log("Extracting YouTube ID from:", url); // Debug log

    // Handle youtube.com/watch?v= format
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      console.log("YouTube ID found (watch format):", videoId); // Debug log
      return videoId && videoId.length === 11 ? videoId : null;
    }

    // Handle youtu.be/ format
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      console.log("YouTube ID found (short format):", videoId); // Debug log
      return videoId && videoId.length === 11 ? videoId : null;
    }

    // Fallback regex method
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]{11})/
    );
    console.log("Regex match result:", match); // Debug log
    if (match && match[1]) {
      console.log("YouTube ID found (regex):", match[1]); // Debug log
      return match[1];
    }

    console.log("No YouTube ID found"); // Debug log
    return null;
  };

  // Submit feedback function
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !feedbackText.trim() || !isAuthenticated) return;

    try {
      setSubmittingFeedback(true);

      await feedbackService.createMovieFeedback(
        id,
        feedbackText.trim(),
        selectedScore,
        "507f1f77bcf86cd799439011" // Hardcoded valid ObjectId
      );

      // Clear form
      setFeedbackText("");
      setSelectedScore(5);

      // Refresh the feedbacks list
      const refreshFeedbacks = async () => {
        if (!id) return;
        try {
          const updatedFeedbacks =
            await feedbackService.getApprovedFeedbacksByMovieId(id);
          console.log("Refreshed feedback data structure:", updatedFeedbacks);
          // Debug: Log each feedback's userId structure
          updatedFeedbacks.forEach((feedback, index) => {
            console.log(`Refreshed Feedback ${index} userId:`, feedback.userId);
          });
          setFeedbacks(updatedFeedbacks);
        } catch (err) {
          console.error("Error refreshing feedbacks:", err);
        }
      };

      refreshFeedbacks();

      notify.success("Thank you for your feedback! It has been published.");
    } catch (err) {
      console.error("Error submitting feedback:", err);

      // Extract error message
      let errorMessage = "Failed to submit feedback. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = `Error: ${err.response.data.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      notify.error(errorMessage);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner>Loading movie details...</LoadingSpinner>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </MainLayout>
    );
  }

  if (!movie) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>Movie not found</h2>
          <p>Movie ID: {id}</p>
        </div>
      </MainLayout>
    );
  }

  // Debug: Log movie object to check structure
  console.log("Movie object structure:", {
    id: movie._id,
    title: movie.versionMovieVn,
    actors: movie.actors?.length,
    movieTypes: movie.movieTypes?.length,
    userReviews: movie.userReviews?.length,
    format: movie.format?.length,
    trailerUrl: movie.trailerUrl,
    smallImage: movie.smallImage,
    largeImage: movie.largeImage,
  });

  console.log("Trailer URL:", movie.trailerUrl); // Debug log
  const youtubeId = extractYouTubeId(movie.trailerUrl);
  console.log("Extracted YouTube ID:", youtubeId); // Debug log

  // Debug: Log if trailer URL exists but no YouTube ID was extracted
  if (movie.trailerUrl && !youtubeId) {
    console.warn(
      "Trailer URL exists but no valid YouTube ID was extracted:",
      movie.trailerUrl
    );
  }

  try {
    return (
      <MainLayout>
        <Banner backgroundImage={movie.smallImage || movie.largeImage || ""}>
          {youtubeId ? (
            <PlayButton onClick={handlePlayTrailer}>
              <svg
                width="100"
                height="100"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon points="16,13 28,20 16,27" fill="#ff9800" />
              </svg>
            </PlayButton>
          ) : movie.trailerUrl ? (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0, 0, 0, 0.7)",
                color: "white",
                padding: "1rem 2rem",
                borderRadius: "8px",
                fontSize: "1.1rem",
                textAlign: "center",
              }}
            >
              <div>⚠️</div>
              <div>Invalid trailer URL</div>
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0, 0, 0, 0.7)",
                color: "white",
                padding: "1rem 2rem",
                borderRadius: "8px",
                fontSize: "1.1rem",
                textAlign: "center",
              }}
            >
              <div>🎬</div>
              <div>Trailer not available</div>
            </div>
          )}
          {showTrailer && youtubeId && (
            <ModalOverlay onClick={handleCloseTrailer}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={handleCloseTrailer}>×</CloseButton>
                {videoLoading && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "600px",
                      color: "white",
                      fontSize: "1.2rem",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <Spinner />
                    <div>Loading trailer...</div>
                  </div>
                )}
                {videoError && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "600px",
                      color: "white",
                      fontSize: "1.2rem",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div>❌</div>
                    <div>Failed to load video</div>
                    <button
                      onClick={() => {
                        setVideoError(false);
                        setVideoLoading(true);
                        setTimeout(() => setVideoLoading(false), 1000);
                      }}
                      style={{
                        background: "#ff9800",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginTop: "1rem",
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                )}
                <div
                  style={{
                    width: "100%",
                    display: videoLoading || videoError ? "none" : "flex",
                    justifyContent: "center",
                  }}
                >
                  <iframe
                    width="100%"
                    height="600"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&mute=0`}
                    title="Movie Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                      borderRadius: 20,
                      background: "#000",
                      maxWidth: "1100px",
                      minWidth: "320px",
                      minHeight: "350px",
                      maxHeight: "80vh",
                      display: videoLoading || videoError ? "none" : "block",
                    }}
                    onLoad={() => setVideoLoading(false)}
                    onError={() => {
                      setVideoLoading(false);
                      setVideoError(true);
                      notify.error("Failed to load video. Please try again.");
                    }}
                  />
                </div>
              </ModalContent>
            </ModalOverlay>
          )}
        </Banner>

        <MainContentWrapper>
          <MovieBlockWrapper>
            <MovieHeader>
              <PosterWrapper>
                <Poster
                  src={movie.largeImage || movie.smallImage || ""}
                  alt={movie.versionMovieVn || "Movie poster"}
                />
                {movie.status === "showing" && (
                  <BookTicketButton onClick={handleBookTicket}>
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
                    Booking Ticket
                  </BookTicketButton>
                )}
              </PosterWrapper>

              <InfoColumn>
                <TitleRow>
                  <Title>{movie.versionMovieVn}</Title>
                  <AgeTag>{movie.rating}</AgeTag>
                </TitleRow>
                <Subtitle>{movie.versionMovieEnglish}</Subtitle>
                <MetaInfo>
                  <span>{formatDuration(movie.duration)}</span>
                  <span>• {formatDate(movie.releaseDate)}</span>
                </MetaInfo>
                <MetaInfo>
                  <Star>★</Star>
                  <span style={{ color: "#ff9800", fontWeight: 700 }}>
                    {getAverageScore()}
                  </span>
                  <span>({movie.userReviews?.length || 0} reviews)</span>
                </MetaInfo>

                <MetaInfo>
                  <MetaLabel>Director:</MetaLabel>
                  <span>{movie.director}</span>
                </MetaInfo>
                <MetaInfo>
                  <MetaLabel>Production:</MetaLabel>
                  <span>{movie.movieProductionCompany}</span>
                </MetaInfo>
                <MetaInfo>
                  <MetaLabel>Genre:</MetaLabel>
                  <TagList>
                    {movie.movieTypes?.map((type) => (
                      <Tag key={type._id}>{type.typeName}</Tag>
                    )) || <Tag>Unknown</Tag>}
                  </TagList>
                </MetaInfo>
                <MetaInfo>
                  <MetaLabel>Cast:</MetaLabel>
                  <TagList>
                    {movie.actors?.map((actor) => (
                      <Tag key={actor._id}>{actor.name}</Tag>
                    )) || <Tag>Unknown</Tag>}
                  </TagList>
                </MetaInfo>

                <MetaInfo>
                  <MetaLabel>Format:</MetaLabel>
                  <TagList>
                    {movie.format && movie.format.length > 0 ? (
                      movie.format.map((format) => (
                        <Tag key={format}>{format}</Tag>
                      ))
                    ) : (
                      <Tag>Unknown</Tag>
                    )}
                  </TagList>
                </MetaInfo>
              </InfoColumn>
            </MovieHeader>

            <MovieDescription>
              <SectionTitle>Movie Content</SectionTitle>
              <Description style={{ whiteSpace: "pre-line" }}>
                {movie.content}
              </Description>
            </MovieDescription>

            {/* Add feedback section here - inside the MovieBlockWrapper */}
            <FeedbackSection>
              <SectionTitle>Feedback & Reviews</SectionTitle>

              <FeedbackList>
                {loadingFeedbacks ? (
                  <p>Loading reviews...</p>
                ) : feedbacks.length > 0 ? (
                  feedbacks.map((feedback) => (
                    <FeedbackItem key={feedback._id}>
                      <FeedbackHeader>
                        <UserInfo>
                          {feedback.userId?.image ? (
                            <UserAvatar
                              src={feedback.userId.image}
                              alt={feedback.userId?.fullName || "User"}
                              onError={(e) => {
                                // If image fails to load, replace with default avatar
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const defaultAvatar =
                                  target.nextElementSibling as HTMLElement;
                                if (defaultAvatar) {
                                  defaultAvatar.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <DefaultAvatar
                            style={{
                              display: feedback.userId?.image ? "none" : "flex",
                            }}
                          >
                            {(feedback.userId?.fullName || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </DefaultAvatar>
                          <div>
                            <UserName>
                              {feedback.userId?.fullName || "User"}
                            </UserName>
                            <FeedbackDate>
                              {new Date(
                                feedback.createdAt
                              ).toLocaleDateString()}
                            </FeedbackDate>
                            <FeedbackContent>{feedback.review}</FeedbackContent>
                          </div>
                        </UserInfo>
                        <FeedbackScore>{feedback.score}/10</FeedbackScore>
                      </FeedbackHeader>

                      {/* Add Admin Response if available */}
                      {feedback.respondMessage && (
                        <AdminResponse>
                          <AdminResponseHeader>
                            <AdminBadge>Admin</AdminBadge>
                            <FeedbackDate>
                              {feedback.updatedAt &&
                                new Date(
                                  feedback.updatedAt
                                ).toLocaleDateString()}
                            </FeedbackDate>
                          </AdminResponseHeader>
                          <p>{feedback.respondMessage}</p>
                        </AdminResponse>
                      )}
                    </FeedbackItem>
                  ))
                ) : null}
                {isAuthenticated ? (
                  <FeedbackForm onSubmit={handleSubmitFeedback}>
                    <FormRow>
                      <ScoreLabel>Your Rating:</ScoreLabel>
                      <ScoreSelector>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <ScoreOption
                            key={score}
                            selected={selectedScore === score}
                            onClick={() => setSelectedScore(score)}
                          >
                            {score}
                          </ScoreOption>
                        ))}
                      </ScoreSelector>
                    </FormRow>

                    <div className="flex gap-2">
                      <div className="flex-1 w-full">
                        {" "}
                        <FormRow>
                          <TextArea
                            placeholder="Write your review here..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            required
                            minLength={5}
                            maxLength={500}
                          />
                        </FormRow>
                      </div>

                      <div className="">
                        <SubmitButton
                          type="submit"
                          disabled={!feedbackText.trim() || submittingFeedback}
                        >
                          {submittingFeedback
                            ? "Submitting..."
                            : "Submit Review"}
                        </SubmitButton>
                      </div>
                    </div>
                  </FeedbackForm>
                ) : (
                  <LoginPrompt>
                    <p>
                      Please{" "}
                      <LoginLink onClick={() => navigate("/login")}>
                        login
                      </LoginLink>{" "}
                      to share your feedback.
                    </p>
                  </LoginPrompt>
                )}
              </FeedbackList>
            </FeedbackSection>
          </MovieBlockWrapper>
          <NowShowingList />
        </MainContentWrapper>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error rendering MovieDetail:", error);
    return (
      <MainLayout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>Error rendering movie details</h2>
          <p>Please try refreshing the page</p>
          <pre
            style={{
              textAlign: "left",
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </MainLayout>
    );
  }
};

export default MovieDetail;
