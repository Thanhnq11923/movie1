interface LocationSelectorProps {
  locations: string[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export const LocationSelector = ({
  locations,
  selectedLocation,
  onLocationChange,
}: LocationSelectorProps) => {
  const handleLocationClick = (location: string) => {
    if (selectedLocation === location) {
      onLocationChange("");
    } else {
      onLocationChange(location);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-base sm:text-lg">Select Location</h2>
      <div className="flex flex-wrap gap-2">
        {locations
          .filter((loc) => loc !== "LOCATION")
          .map((location) => (
            <button
              key={location}
              onClick={() => handleLocationClick(location)}
              className={`px-3 sm:px-4 py-2 rounded-sm text-xs sm:text-sm transition-colors ${
                selectedLocation === location
                  ? "bg-orange-100 text-gray-900"
                  : "bg-white text-gray-500 border border-gray-300"
              }`}
            >
              {location}
            </button>
          ))}
      </div>
    </div>
  );
};
