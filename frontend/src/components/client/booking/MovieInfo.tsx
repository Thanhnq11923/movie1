/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Movie } from "../../../types/movie";
import type { DateOption } from "../../../types/booking";
import type { Location, Format } from "../../../types/bookingData";

interface MovieInfoProps {
  movie: Movie;
  selectedDate?: string;
  selectedLocation?: Location;
  selectedTheater?: string;
  selectedFormat?: Format | "";
  selectedTime?: string;
  dates: DateOption[];
  theaters: any[];
}

export const MovieInfo = ({
  movie,
  selectedDate,
  selectedLocation,
  selectedTheater,
  selectedFormat,
  selectedTime,
  dates,
  theaters,
}: MovieInfoProps) => {
  const selectedDateInfo = dates.find((d) => d.fullDate === selectedDate);
  const selectedTheaterInfo = theaters.find((t) => t.id === selectedTheater);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-full sm:w-32 md:w-40 lg:w-48 h-48 sm:h-56 md:h-64 lg:h-72 rounded-lg overflow-hidden mx-auto sm:mx-0">
          <img
            src={movie.largeImage}
            alt={movie.versionMovieVn}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-self-start text-center sm:text-left">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            {movie.versionMovieEnglish}
          </h1>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600">
                Duration:
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                {movie.duration} minutes
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Rating:</span>
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded w-fit mx-auto sm:mx-0">
                {movie.rating}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Genre:</span>
              <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                {movie.movieTypes.map((g) => (
                  <span
                    key={g._id}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {g.typeName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Information */}
      {(selectedDate || selectedLocation || selectedFormat || selectedTime) && (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
            Booking Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
            {selectedDate && selectedDateInfo && (
              <div>
                <span className="text-orange-600">Date:</span>
                <p className="font-bold text-gray-500">
                  {selectedDateInfo.day} {selectedDateInfo.date}{" "}
                  {selectedDateInfo.month}
                </p>
              </div>
            )}
            {selectedLocation && (
              <div>
                <span className="text-orange-600">Location:</span>
                <p className="font-bold text-gray-500">{selectedLocation}</p>
              </div>
            )}
            {selectedTheater && selectedTheaterInfo && (
              <div>
                <span className="text-orange-600">Theater:</span>
                <p className="font-bold text-gray-500">
                  {selectedTheaterInfo.name}
                </p>
              </div>
            )}
            {selectedFormat && (
              <div>
                <span className="text-orange-600">Format:</span>
                <p className="font-bold text-gray-500">{selectedFormat}</p>
              </div>
            )}
            {selectedTime && (
              <div>
                <span className="text-orange-600">Time:</span>
                <p className="font-bold text-gray-500">{selectedTime}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
