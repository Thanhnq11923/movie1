import { User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import type { Ticket } from "../types/ticket"

interface CustomerInfoCardProps {
    ticket: Ticket
}

export function CustomerInfoCard({ ticket }: CustomerInfoCardProps) {
    return (
        <Card className="border border-gray-100">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Customer Information</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-gray-500">Name:</span>
                        <p className="font-medium">{ticket.customer.name}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Phone:</span>
                        <p className="font-medium">{ticket.customer.phone}</p>
                    </div>
                    <div className="col-span-2">
                        <span className="text-sm text-gray-500">Email:</span>
                        <p className="font-medium">{ticket.customer.email}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 