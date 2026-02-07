import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../ui/button";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";

interface SelectSeatHeaderProps {
  movieTitle: string;
  theaterName: string;
  showtime: string;
}

export function SelectSeatHeader({
  movieTitle,
  theaterName,
  showtime,
}: SelectSeatHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { date, time, theater, format, theaterId } = useSelector(
    (state: RootState) => state.booking
  );

  const handleBack = () => {
    navigate("/booking", {
      state: {
        date,
        time,
        theater,
        format,
        scheduleId: location.state?.scheduleId,
        cinemaRoomId: location.state?.cinemaRoomId,
        theaterId,
        preserveBooking: true,
      },
    });
  };

  return (
    <header className="bg-white shadow-sm py-4 mt-10">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="p-2"
          onClick={handleBack}
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">{movieTitle}</h1>
          <p className="text-sm text-gray-500">
            {theaterName} {showtime}
          </p>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>
    </header>
  );
}
