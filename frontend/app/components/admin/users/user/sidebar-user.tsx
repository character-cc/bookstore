"use client"
import { User, MapPin, ShoppingBag, CreditCard, Bell, Shield, FileText } from "lucide-react"
import { Link } from "react-router";
import {useLocation} from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AdminUserSidebarProps {
    userId: string
}

export default function AdminUserSidebar({ userId }: AdminUserSidebarProps) {
    const pathname = useLocation().pathname

    const menuItems = [
        {
            id: "general",
            label: "Thông tin chung",
            icon: User,
            to: `/admin/users/edit/${userId}`,
            description: "Thông tin cá nhân, email, số điện thoại",
        },
        {
            id: "addresses",
            label: "Địa chỉ",
            icon: MapPin,
            to: `/admin/users/edit/${userId}/addresses`,
            description: "Quản lý địa chỉ giao hàng và thanh toán",
        },

    ]

    return (
        <Card className="w-full">
            <CardContent className="p-0">
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.to

                        return (
                            <Link
                                key={item.id}
                                to={item.to}
                                className={cn(
                                    "flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50 border-l-4 border-transparent",
                                    isActive && "bg-blue-50 border-l-blue-500 text-blue-700",
                                )}
                            >
                                <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", isActive ? "text-blue-600" : "text-gray-500")} />
                                <div className="flex-1 min-w-0">
                                    <div className={cn("font-medium", isActive ? "text-blue-700" : "text-gray-900")}>{item.label}</div>
                                    <div className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
