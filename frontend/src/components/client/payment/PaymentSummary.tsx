interface PaymentSummaryProps {
    movieInfo: {
        title: string
        date: string
        time: string
        room: string
        seats: string[]
    }
    concessions: {
        name: string
        quantity: number
        price: number
    }[]
    subtotal: number
    discount: number
    total: number
}

// Thêm hàm formatVND nếu chưa có
const formatVND = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export function PaymentSummary({ movieInfo, concessions, subtotal, discount, total }: PaymentSummaryProps) {
    const ticketPrice = 12.00; // Price per ticket
    const ticketsTotal = ticketPrice * movieInfo.seats.length;

    // Tính tổng giá trị bắp nước nếu chưa có props concessionsTotal
    const concessionsTotal = Array.isArray(concessions)
        ? concessions.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
        : 0;

    return (
        <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-orange-900">Ticket Summary</h2>

            {/* Movie Info */}
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-orange-700">Movie:</span>
                    <span className="font-medium text-orange-900">{movieInfo.title}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-orange-700">Date & Time:</span>
                    <span className="font-medium text-orange-900">{movieInfo.date} at {movieInfo.time}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-orange-700">Room:</span>
                    <span className="font-medium text-orange-900">{movieInfo.room}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-orange-700">Seat:</span>
                    <span className="font-medium text-orange-900">{movieInfo.seats.join(", ")}</span>
                </div>
            </div>

            {/* Tickets Cost */}
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-orange-700">Tickets:</span>
                    <span className="font-medium text-orange-900">{formatVND(ticketsTotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-orange-700">Snacks:</span>
                    <span className="font-medium text-orange-900">{formatVND(concessionsTotal)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-orange-700">Promotion Discount:</span>
                        <span className="font-medium text-green-700">- {formatVND(discount)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatVND(total)}</span>
                </div>
            </div>

            {/* Concessions */}
            {concessions.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-orange-900">Concessions</h3>
                    {concessions.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span className="text-orange-700">
                                {item.name} x{item.quantity}
                            </span>
                            <span className="font-medium text-orange-900">
                                ${(item.price * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Total */}
            <div className="space-y-2 pt-4 border-t border-orange-200">
                <div className="flex justify-between">
                    <span className="text-orange-700">Tickets:</span>
                    <span className="font-medium text-orange-900">${ticketsTotal.toFixed(2)}</span>
                </div>
                {concessions.length > 0 && (
                    <div className="flex justify-between">
                        <span className="text-orange-700">Concessions:</span>
                        <span className="font-medium text-orange-900">
                            ${(subtotal - ticketsTotal).toFixed(2)}
                        </span>
                    </div>
                )}
                {/* <div className="flex justify-between">
                    <span className="text-orange-700">Subtotal:</span>
                    <span className="font-medium text-orange-900">${subtotal.toFixed(2)}</span>
                </div> */}
                {discount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-orange-700">Discount:</span>
                        <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-lg font-semibold">
                    <span className="text-orange-900">Total Amount:</span>
                    <span className="text-[#FF9800]">${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    )
} 