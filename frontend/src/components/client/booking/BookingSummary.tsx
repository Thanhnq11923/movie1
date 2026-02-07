import type { DateOption, Theater } from "../../../types/booking";
import type { Location, Format } from "../../../types/bookingData";

interface BookingSummaryProps {
    selectedDate: string;
    selectedLocation: Location;
    selectedTheater: string;
    selectedFormat: Format;
    selectedTime: string;
    dates: DateOption[];
    theaters: Theater[];
}

export const BookingSummary = ({
    selectedDate,
    selectedLocation,
    selectedTheater,
    selectedFormat,
    selectedTime,
    dates,
    theaters,
}: BookingSummaryProps) => {
    if (!selectedDate || !selectedLocation || !selectedFormat || !selectedTime || !selectedTheater) {
        return null;
    }

    const selectedDateInfo = dates.find((d) => d.fullDate === selectedDate);
    const selectedTheaterInfo = theaters.find((t) => t.id === selectedTheater);

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Your Selection</h3>
            <div className="space-y-1 text-sm text-green-700">
                <p>
                    <strong>Date:</strong> {selectedDateInfo?.day}{" "}
                    {selectedDateInfo?.date}{" "}
                    {selectedDateInfo?.month}
                </p>
                <p>
                    <strong>Location:</strong> {selectedLocation}
                </p>
                <p>
                    <strong>Theater:</strong> {selectedTheaterInfo?.name}
                </p>
                <p>
                    <strong>Format:</strong> {selectedFormat}
                </p>
                <p>
                    <strong>Time:</strong> {selectedTime}
                </p>
            </div>
        </div>
    );
}; 