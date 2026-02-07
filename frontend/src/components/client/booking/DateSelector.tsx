import type { DateOption } from "../../../types/booking";

interface DateSelectorProps {
  dates: DateOption[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  selectedLocation: string | null;
  cityName?: string;
}

export const DateSelector = ({
  dates,
  selectedDate,
  onDateSelect,
  selectedLocation,
  cityName,
}: DateSelectorProps) => {
  const handleDateClick = (date: DateOption) => {
    if (!selectedLocation) {
      alert("Please select a location first");
      return;
    }
    if (selectedDate === date.fullDate) {
      onDateSelect(""); // Deselect if clicking the same date
    } else {
      onDateSelect(date.fullDate);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {cityName && (
        <div className="text-xs sm:text-sm text-gray-500 mb-1">
          City: <span className="font-semibold">{cityName}</span>
        </div>
      )}
      <h2 className="text-base sm:text-lg">Select Date</h2>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dates.slice(0, 7).map((date, index) => (
          <DateCell
            key={index}
            date={date}
            isSelected={selectedDate === date.fullDate}
            onClick={() => handleDateClick(date)}
            disabled={!selectedLocation}
          />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dates.slice(7, 14).map((date, index) => (
          <DateCell
            key={index + 7}
            date={date}
            isSelected={selectedDate === date.fullDate}
            onClick={() => handleDateClick(date)}
            disabled={!selectedLocation}
          />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dates.slice(14).map((date, index) => (
          <DateCell
            key={index + 14}
            date={date}
            isSelected={selectedDate === date.fullDate}
            onClick={() => handleDateClick(date)}
            disabled={!selectedLocation}
          />
        ))}
      </div>
    </div>
  );
};

interface DateCellProps {
  date: DateOption;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

const DateCell = ({ date, isSelected, onClick, disabled }: DateCellProps) => {
  return (
    <div
      className={`p-2 sm:p-3 rounded-sm text-center cursor-pointer transition-colors ${
        isSelected
          ? "bg-orange-100 text-gray-900"
          : disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white text-gray-900 hover:bg-orange-100 border border-gray-200"
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="text-xs font-medium">{date.month}</div>
      <div className="text-sm sm:text-lg font-bold">{date.date}</div>
      <div className="text-xs">{date.day}</div>
    </div>
  );
};
