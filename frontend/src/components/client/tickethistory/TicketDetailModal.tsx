import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import type { Ticket } from "../types/ticket"
import { MovieInfoCard } from "./MovieInfoCard"
import { ShowInfoCard } from "./ShowInfoCard"
import { CustomerInfoCard } from "./CustomerInfoCard"
import { PaymentInfoCard } from "./PaymentInfoCard"
import { PromotionsCard } from "./PromotionsCard"
import { TicketStatusCard } from "./TicketStatusCard"

interface TicketDetailModalProps {
    ticket: Ticket | null
    isOpen: boolean
    onClose: () => void
}

export function TicketDetailModal({ ticket, isOpen, onClose }: TicketDetailModalProps) {
    if (!ticket) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Ticket Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <MovieInfoCard ticket={ticket} />
                    <ShowInfoCard ticket={ticket} />
                    {/* Hiển thị ngày chiếu, giờ chiếu, rạp, định dạng */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold mb-2">Booking Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-sm text-gray-500">Date:</span> <span className="font-medium">{ticket.date}</span></div>
                            <div><span className="text-sm text-gray-500">Time:</span> <span className="font-medium">{ticket.time}</span></div>
                            <div><span className="text-sm text-gray-500">Theater:</span> <span className="font-medium">{ticket.theater}</span></div>
                            <div><span className="text-sm text-gray-500">Format:</span> <span className="font-medium">{ticket.format}</span></div>
                        </div>
                    </div>
                    {/* Hiển thị ghế đã chọn */}
                    {ticket.seats && ticket.seats.length > 0 && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-semibold mb-2">Selected Seats</h3>
                            <div className="flex flex-wrap gap-2">
                                {ticket.seats.map((seat, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded bg-orange-100 text-orange-800 font-semibold border border-orange-200 text-sm">
                                        {seat.row}{seat.col || seat.number}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Hiển thị concessions */}
                    {ticket.concessions && ticket.concessions.length > 0 && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-semibold mb-2">Concessions</h3>
                            <ul className="space-y-1">
                                {ticket.concessions.map((item, idx) => (
                                    <li key={idx} className="flex justify-between">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span>{item.price?.toLocaleString()}₫</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <CustomerInfoCard ticket={ticket} />
                    <PaymentInfoCard ticket={ticket} />
                    <PromotionsCard ticket={ticket} />
                    <TicketStatusCard ticket={ticket} />
                </div>
            </DialogContent>
        </Dialog>
    )
} 