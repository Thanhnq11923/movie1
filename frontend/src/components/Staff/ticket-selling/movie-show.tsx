import React, { useState, useEffect } from "react";
import { Film, Clock, MapPin, Calendar, Monitor } from "lucide-react";
import { movieScheduleService } from "../../../services/api/movieScheduleService";
import { cinemaService } from "../../../services/api/cinemaService";
import type { MovieSchedule } from "../../../types/schedule";

// Custom Components with reduced padding
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-4 pb-2 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3
    className={`text-base font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-4 pt-0 ${className}`}>{children}</div>
);

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}> = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-900 text-white",
    secondary: "bg-gray-100 text-gray-900",
    outline: "border border-gray-300 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// Type definitions
export type Movie = {
  _id: string;
  versionMovieVn: string;
  versionMovieEnglish: string;
  duration: string;
  genre: string;
  rating: string;
  price?: number;
  largeImage?: string;
  smallImage?: string;
  status: string;
};

interface ShowtimeData {
  id: string;
  scheduleId: string;
  cinemaRoomId: string;
  time: string;
  format: string;
  date: string;
}

interface MovieShowtimeSelectionProps {
  movies: Movie[];
  selectedMovie: string;
  selectedShowtime: string;
  onMovieSelect: (movieId: string) => void;
  onShowtimeSelect: (showtimeData: ShowtimeData) => void;
  onContinue?: () => void;
}

const ShowtimeSelector: React.FC<{
  movieId: string;
  selectedShowtime: string;
  onShowtimeSelect: (showtimeData: ShowtimeData) => void;
  onContinue?: () => void;
}> = ({ movieId, selectedShowtime, onShowtimeSelect, onContinue }) => {
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [schedules, setSchedules] = useState<MovieSchedule[]>([]);
  const [cinemas, setCinemas] = useState<{_id: string, name: string, city?: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!movieId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching schedules for movie:", movieId);
        
        // Fetch schedules and cinemas in parallel
        const [schedulesResponse, cinemasResponse] = await Promise.all([
          movieScheduleService.getAllMovieSchedules(),
          cinemaService.getAllCinemas()
        ]);
        
        console.log("Schedules response:", schedulesResponse);
        console.log("Cinemas response:", cinemasResponse);
        
        // Handle schedules response like user implementation
        if (schedulesResponse.success && Array.isArray(schedulesResponse.data)) {
          const movieSchedules = schedulesResponse.data.filter(s => String(s.movieId) === String(movieId));
          console.log("Filtered movie schedules:", movieSchedules);
          setSchedules(movieSchedules);
        } else if (Array.isArray(schedulesResponse)) {
          // Handle case where response is directly an array
          const movieSchedules = schedulesResponse.filter(s => String(s.movieId) === String(movieId));
          console.log("Filtered movie schedules:", movieSchedules);
          setSchedules(movieSchedules);
        } else {
          console.error("Invalid schedules response:", schedulesResponse);
          setError("Failed to fetch schedules");
        }
        
        // Handle cinemas response like user implementation
        if (cinemasResponse.success && Array.isArray(cinemasResponse.data)) {
          setCinemas(cinemasResponse.data);
        } else if (Array.isArray(cinemasResponse)) {
          // Handle case where response is directly an array
          setCinemas(cinemasResponse);
        } else {
          console.error("Invalid cinemas response:", cinemasResponse);
          setError("Failed to fetch cinemas");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [movieId]);

  // Restore selected showtime when schedules are loaded
  useEffect(() => {
    if (selectedShowtime && schedules.length > 0) {
      // Find the schedule that matches the selected showtime
      const matchingSchedule = schedules.find(schedule => 
        schedule.scheduleTime.some(time => 
          time.time.some(t => 
            `${schedule._id}-${t}-${time.fulldate}` === selectedShowtime
          )
        )
      );
      
      if (matchingSchedule) {
        const matchingTime = matchingSchedule.scheduleTime.find(time => 
          time.time.some(t => 
            `${matchingSchedule._id}-${t}-${time.fulldate}` === selectedShowtime
          )
        );
        
        if (matchingTime) {
          const matchingTimeString = matchingTime.time.find(t => 
            `${matchingSchedule._id}-${t}-${matchingTime.fulldate}` === selectedShowtime
          );
          
          if (matchingTimeString) {
            setSelectedCinema(matchingSchedule.cinemaId);
            setSelectedDate(matchingTime.fulldate);
            setSelectedFormat(matchingSchedule.format);
            setSelectedTime(matchingTimeString);
          }
        }
      }
    }
  }, [selectedShowtime, schedules]);

  // Reset selections when movie changes, but preserve if it's the same movie
  useEffect(() => {
    if (!selectedShowtime) {
      setSelectedCinema("");
      setSelectedDate("");
      setSelectedFormat("");
      setSelectedTime("");
    }
  }, [movieId, selectedShowtime]);

  // Get available cinema IDs from schedules
  const availableCinemaIds = Array.from(new Set(schedules.map(s => String(s.cinemaId))));
  
  // Get cinema details for available cinemas
  const availableCinemas = cinemas.filter(c => availableCinemaIds.includes(String(c._id)));

  // Get dates for selected cinema
  const dates = selectedCinema
    ? Array.from(new Set(
        schedules
          .filter(s => String(s.cinemaId) === String(selectedCinema))
          .flatMap(s => s.scheduleTime.map(t => t.fulldate))
      )).sort() // Sort dates chronologically
    : [];

  // Get formats for selected cinema and date
  const formats = selectedCinema && selectedDate
    ? Array.from(new Set(
        schedules
          .filter(s => String(s.cinemaId) === String(selectedCinema))
          .filter(s => s.scheduleTime.some(t => t.fulldate === selectedDate))
          .map(s => s.format)
      ))
    : [];

  // Get times for selected cinema, date, and format
  const times = selectedCinema && selectedDate && selectedFormat
    ? schedules
        .filter(s => String(s.cinemaId) === String(selectedCinema) && s.format === selectedFormat)
        .flatMap(s => {
          const scheduleTime = s.scheduleTime.find(t => t.fulldate === selectedDate);
          if (!scheduleTime) return [];
          
          return scheduleTime.time.map(time => ({
            id: `${s._id || ''}-${time}-${s.cinemaRoomId}`,
            time,
            scheduleId: s._id || '',
            cinemaRoomId: s.cinemaRoomId,
            format: s.format,
            date: selectedDate
          }));
        })
        .sort((a, b) => a.time.localeCompare(b.time)) // Sort times chronologically
    : [];

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading schedules...</div>;
  }
  
  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (schedules.length === 0) {
    return <div className="text-center py-4 text-gray-500">No schedules available for this movie</div>;
  }

  if (availableCinemas.length === 0) {
    return <div className="text-center py-4 text-gray-500">No cinemas available for this movie</div>;
  }

  return (
    <div className="space-y-3">
      {/* Cinema Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Select Cinema
        </h3>
        <div className="space-y-1">
          {availableCinemas.map(cinema => (
            <button
              key={cinema._id}
              className={`w-full px-3 py-2 text-sm rounded-md transition-colors text-left ${
                selectedCinema === String(cinema._id)
                  ? "bg-blue-100 text-blue-700 border-blue-500"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              } border`}
              onClick={() => {
                setSelectedCinema(String(cinema._id));
                setSelectedDate("");
                setSelectedFormat("");
                setSelectedTime("");
              }}
            >
              {cinema.name} {cinema.city && `- ${cinema.city}`}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection - Only show if cinema is selected */}
      {selectedCinema && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Select Date
          </h3>
          <div className="grid grid-cols-2 gap-1">
            {dates.map(date => (
              <button
                key={date}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedDate === date
                    ? "bg-blue-100 text-blue-700 border-blue-500"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                } border`}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedFormat("");
                  setSelectedTime("");
                }}
              >
                {new Date(date).toLocaleDateString('vi-VN', { 
                  weekday: 'short', 
                  month: 'numeric', 
                  day: 'numeric' 
                })}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Format Selection - Only show if date is selected */}
      {selectedCinema && selectedDate && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Monitor className="h-3 w-3" />
            Select Format
          </h3>
          <div className="flex flex-wrap gap-1">
            {formats.map(format => (
              <button
                key={format}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedFormat === format
                    ? "bg-blue-100 text-blue-700 border-blue-500"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                } border`}
                onClick={() => {
                  setSelectedFormat(format);
                  setSelectedTime("");
                }}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time Selection - Only show if format is selected */}
      {selectedCinema && selectedDate && selectedFormat && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Available Times
          </h3>
          {times.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {times.map(({ id, time, scheduleId, cinemaRoomId, format, date }) => (
                <button
                  key={id}
                  className={`px-3 py-2 text-sm rounded-md transition-colors font-medium ${
                    selectedTime === id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                  onClick={() => {
                    setSelectedTime(id);
                    onShowtimeSelect({
                      id,
                      scheduleId,
                      cinemaRoomId,
                      time,
                      format,
                      date
                    });
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-3">
              No showtimes available for selected criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function MovieShowtimeSelection({
  movies,
  selectedMovie,
  selectedShowtime,
  onMovieSelect,
  onShowtimeSelect,
  onContinue,
}: MovieShowtimeSelectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
      {/* Movie Selection */}
      <Card className="lg:col-span-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Film className="h-4 w-4" />
            <span>Select Movie</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {movies.map((movie: Movie) => (
              <div
                key={movie._id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedMovie === movie._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onMovieSelect(movie._id)}
              >
                <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                  {movie.largeImage || movie.smallImage ? (
                    <img 
                      src={movie.largeImage || movie.smallImage} 
                      alt={movie.versionMovieEnglish} 
                      className="h-full w-full object-cover rounded"
                    />
                  ) : (
                    <Film className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <h3 className="font-medium text-gray-900 mb-1 text-sm">
                  {movie.versionMovieEnglish || movie.versionMovieVn}
                </h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>{movie.duration}</span>
                    <Badge variant="secondary">{movie.rating}</Badge>
                  </div>
                  <div>{movie.genre}</div>
                  {movie.price && (
                    <div className="font-medium text-blue-600">
                      {movie.price.toLocaleString()} VND
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Showtime Selection */}
      <Card className="border-gray-200 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Select Showtime</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedMovie ? (
            <ShowtimeSelector 
              movieId={selectedMovie}
              selectedShowtime={selectedShowtime}
              onShowtimeSelect={onShowtimeSelect}
              onContinue={onContinue}
            />
          ) : (
            <div className="text-center text-gray-500 py-4">
              Please select a movie first
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Next Step Button */}
      {selectedMovie && selectedShowtime && onContinue && (
        <div className="lg:col-span-3 mt-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <button
              onClick={onContinue}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <span>Next Step</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}