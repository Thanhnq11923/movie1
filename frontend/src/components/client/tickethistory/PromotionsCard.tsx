import { Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import type { Ticket } from "../../../types/ticket"

interface PromotionsCardProps {
    ticket: Ticket
}

export function PromotionsCard({ ticket }: PromotionsCardProps) {
    if (ticket.promotions.applied.length === 0 && ticket.promotions.available.length === 0) {
        return null
    }

    return (
        <Card className="border border-gray-100">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Tag className="w-5 h-5" />
                    <span>Promotions</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {ticket.promotions.applied.length > 0 && (
                    <div>
                        <h4 className="font-medium text-green-800 mb-2">Applied Promotions</h4>
                        <div className="space-y-2">
                            {ticket.promotions.applied.map((promo) => (
                                <div key={promo.id} className="bg-green-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-green-800">{promo.name}</p>
                                            <p className="text-sm text-green-600">{promo.description}</p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800">Saved {promo.savings}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {ticket.promotions.available.length > 0 && (
                    <div>
                        <h4 className="font-medium text-blue-800 mb-2">Available Promotions</h4>
                        <div className="space-y-2">
                            {ticket.promotions.available.map((promo) => (
                                <div key={promo.id} className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-blue-800">{promo.name}</p>
                                            <p className="text-sm text-blue-600">{promo.description}</p>
                                            {promo.code && (
                                                <p className="text-xs text-blue-500 font-mono mt-1">Code: {promo.code}</p>
                                            )}
                                        </div>
                                        {promo.validUntil && (
                                            <Badge variant="outline" className="text-xs">
                                                Until {promo.validUntil}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 