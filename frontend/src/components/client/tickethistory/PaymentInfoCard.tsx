import { CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import type { Ticket } from "../types/ticket"

interface PaymentInfoCardProps {
    ticket: Ticket
}

const getPaymentBadge = (status: string) => {
    switch (status) {
        case "paid":
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Paid</Badge>
        case "refunded":
            return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Refunded</Badge>
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
}

export function PaymentInfoCard({ ticket }: PaymentInfoCardProps) {
    return (
        <Card className="border border-gray-100">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Information</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-gray-500">Amount:</span>
                        <p className="font-medium text-lg">{ticket.payment.amount}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <div className="mt-1">{getPaymentBadge(ticket.payment.status)}</div>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Method:</span>
                        <p className="font-medium">{ticket.payment.method}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Transaction ID:</span>
                        <p className="font-medium font-mono text-sm">{ticket.payment.transactionId}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Payment Date:</span>
                        <p className="font-medium">{ticket.payment.date}</p>
                    </div>
                    {ticket.payment.refundDate && (
                        <div>
                            <span className="text-sm text-gray-500">Refund Date:</span>
                            <p className="font-medium">{ticket.payment.refundDate}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 