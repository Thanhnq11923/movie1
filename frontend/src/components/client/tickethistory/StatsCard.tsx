import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "../../../components/ui/card"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    iconBgColor: string
    iconColor: string
}

export function StatsCard({ title, value, icon: Icon, iconBgColor, iconColor }: StatsCardProps) {
    return (
        <Card className="border border-gray-100">
            <CardContent className="pt-6">
                <div className="flex items-center">
                    <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 