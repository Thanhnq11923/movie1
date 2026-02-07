export function SeatTypes() {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-6 justify-center mt-4 sm:mt-8 bg-white/50 backdrop-blur-sm py-3 sm:py-4 rounded-sm px-2 sm:px-4">
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white rounded-sm border border-gray-300"></div>
        <span className="text-xs sm:text-sm text-gray-700">Available</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-300 rounded-sm"></div>
        <span className="text-xs sm:text-sm text-gray-700">Booked</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-[#FF9800] rounded-sm"></div>
        <span className="text-xs sm:text-sm text-[#F57C00]">Selected</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-yellow-200 rounded-sm border border-yellow-400"></div>
        <span className="text-xs sm:text-sm text-yellow-700">Locked</span>
      </div>
    </div>
  );
}
