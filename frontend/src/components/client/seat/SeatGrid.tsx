import type { Seat } from "../../../types/seat"

interface SeatGridProps {
    rows: string[]
    getSeat: (row: string, col: number) => Seat | undefined
    handleSeatClick: (row: string, col: number) => void
    getSeatColor: (status: Seat["status"]) => string
}

export function SeatGrid({ rows, getSeat, handleSeatClick, getSeatColor }: SeatGridProps) {
    return (
        <div className="flex flex-col items-center space-y-2 sm:space-y-3 max-w-full overflow-x-auto">
            {rows.map((row) => (
                <div key={row} className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-max">
                    {/* Row label - ẩn trên mobile nhỏ */}
                    <span className="hidden sm:block w-4 sm:w-6 text-center font-medium text-gray-500 text-xs sm:text-sm">
                        {row}
                    </span>
                    
                    {/* Tất cả các cột 1-12 liên tục */}
                    <div className="flex gap-1 sm:gap-2">
                        {Array.from({ length: 12 }, (_, index) => {
                            const col = index + 1
                            const seat = getSeat(row, col)
                            return (
                                <button
                                    key={`${row}${col}`}
                                    onClick={() => handleSeatClick(row, col)}
                                    className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-md text-xs font-semibold transition-colors duration-200 ${getSeatColor(seat?.status || "available")}`}
                                    disabled={seat?.status === "booked"}
                                >
                                    {col}
                                </button>
                            )
                        })}
                    </div>
                    
                    {/* Row label bên phải - ẩn trên mobile nhỏ */}
                    <span className="hidden sm:block w-4 sm:w-6 text-center font-medium text-gray-500 text-xs sm:text-sm">
                        {row}
                    </span>
                </div>
            ))}
        </div>
    )
} 