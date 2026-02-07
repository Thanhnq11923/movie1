import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import type { Ticket } from "../../../types/ticket"

interface MovieInfoCardProps {
    ticket: Ticket
}

export function MovieInfoCard({ ticket }: MovieInfoCardProps) {
    return (
        <Card className="border border-gray-100">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <span>Movie Information</span>
                    <Badge variant="outline">{ticket.movieDetails.rating}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <h3 className="text-xl font-semibold">{ticket.movieName}</h3>
                    <p className="text-gray-600">Directed by {ticket.movieDetails.director}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-gray-500">Duration:</span>
                        <p className="font-medium">{ticket.movieDetails.duration}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Genre:</span>
                        <p className="font-medium">{ticket.movieDetails.genre}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 