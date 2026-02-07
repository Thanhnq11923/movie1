import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import type { Ticket } from "../types/ticket"

interface ShowInfoCardProps {
    ticket: Ticket
}

const getSeatTypeBadge = (type: string) => {
    switch (type) {
        case "Premium":
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Premium</Badge>
        case "VIP":
            return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">VIP</Badge>
        case "Standard":
            return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Standard</Badge>
        default:
            return <Badge variant="secondary">{type}</Badge>
    }
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

export function ShowInfoCard({ ticket }: ShowInfoCardProps) {
    return (
        <Card className="border border-gray-100">
            <CardHeader>
                <CardTitle>Show Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-gray-500">Date & Time:</span>
                        <p className="font-medium">
                            {formatDate(ticket.showTime.date)} at {ticket.showTime.time}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Screen:</span>
                        <p className="font-medium">{ticket.showTime.screen}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Hall:</span>
                        <p className="font-medium">{ticket.showTime.room}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Seat:</span>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">{ticket.seat.number}</span>
                            {getSeatTypeBadge(ticket.seat.type)}
                        </div>
                        <p className="text-sm text-gray-500">{ticket.seat.location}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 