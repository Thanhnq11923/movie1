import { QrCode } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import type { Ticket } from "../types/ticket"

interface TicketStatusCardProps {
    ticket: Ticket
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "confirmed":
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
        case "cancelled":
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
}

export function TicketStatusCard({ ticket }: TicketStatusCardProps) {
    return (
        <Card className="border border-gray-100">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5" />
                    <span>Ticket Status</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div>
                            <span className="text-sm text-gray-500">Status:</span>
                            <div className="mt-1">{getStatusBadge(ticket.status)}</div>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Booking Date:</span>
                            <p className="font-medium">{new Date(ticket.bookingDate).toLocaleString()}</p>
                        </div>
                        {ticket.cancellationReason && (
                            <div>
                                <span className="text-sm text-gray-500">Cancellation Reason:</span>
                                <p className="font-medium text-red-600">{ticket.cancellationReason}</p>
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <img
                            src={ticket.qrCode || "/placeholder.svg"}
                            alt="QR Code"
                            className="w-32 h-32 border rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-2">Scan for entry</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 