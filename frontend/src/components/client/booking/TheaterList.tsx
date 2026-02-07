import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../ui/button";
import type { Theater } from "../../../types/booking";

interface TheaterListProps {
  locations: string[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  formats: string[];
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  theaters: Theater[];
  expandedTheaters: { [key: string]: boolean };
  onTheaterToggle: (theaterId: string) => void;
  selectedTime: string;
  selectedTheater: string;
  onTimeSelect: (time: string, theaterId: string) => void;
}

export const TheaterList = ({
  selectedLocation,
  formats,
  selectedFormat,
  onFormatChange,
  theaters,
  expandedTheaters,
  onTheaterToggle,
  selectedTime,
  selectedTheater,
  onTimeSelect,
}: TheaterListProps) => {
  const handleFormatClick = (format: string) => {
    if (selectedFormat === format) {
      onFormatChange(""); // Reset to empty
    } else {
      onFormatChange(format);
    }
  };

  const handleTimeClick = (time: string, theaterId: string) => {
    if (selectedTime === time && selectedTheater === theaterId) {
      onTimeSelect("", ""); // Reset selection
    } else {
      onTimeSelect(time, theaterId);
    }
  };

  return (
    <div>
      {/* List of Theaters Header with Location Selector */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg">LIST OF THEATERS</h2>
      </div>

      {/* Format Selection */}
      {selectedLocation !== "LOCATION" && (
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          {formats.map((format) => (
            <Button
              key={format}
              variant="ghost"
              className={`px-3 sm:px-4 md:px-6 py-2 rounded-sm transition-colors text-xs sm:text-sm ${
                selectedFormat === format
                  ? "bg-orange-100 text-gray-900 hover:bg-orange-100 "
                  : "bg-white text-gray-900 hover:bg-orange-100 border border-gray-300"
              }`}
              onClick={() => handleFormatClick(format)}
            >
              {format}
            </Button>
          ))}
        </div>
      )}

      {/* Theater Listings */}
      {selectedLocation !== "LOCATION" &&
        theaters.map((theater) => (
          <div
            key={theater.id}
            className="bg-white rounded-sm overflow-hidden mb-3 sm:mb-4 border border-gray-300"
          >
            <div
              className="p-3 sm:p-4 cursor-pointer flex items-center justify-between"
              onClick={() => onTheaterToggle(theater.id)}
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  {theater.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  {theater.location}
                </p>
              </div>
              {expandedTheaters[theater.id] ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
              )}
            </div>

            {expandedTheaters[theater.id] && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
                  {theater.showtimes.map((time, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className={`h-7 sm:h-8 text-xs rounded-sm transition-colors ${
                        selectedTime === time && selectedTheater === theater.id
                          ? "bg-orange-100 text-gray-900 hover:bg-[#F57C00]"
                          : "bg-white text-gray-900 hover:bg-orange-100 border border-gray-300"
                      }`}
                      onClick={() => handleTimeClick(time, theater.id)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};
