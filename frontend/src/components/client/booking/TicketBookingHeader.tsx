import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";

export function TicketBookingHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm py-5 mt-10">
      <div className="container mx-auto px-4 flex items-center justify-between relative">
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="p-2 absolute left-4"
          onClick={() => navigate("/showtime")}
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Button>

        {/* Center title */}
        <div className="text-xl font-bold mx-auto">Select Show Time</div>
      </div>
    </header>
  );
}
