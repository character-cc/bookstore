"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    ArrowLeft,
    Calendar,
    MapPin,
    Loader2,
    User,
    Phone,
    Mail,
} from "lucide-react"
import { toast } from "sonner"

interface OrderItemDto {
    id: number
    orderId: number
    bookId: number
    bookName: string
    pictureUrl: string
    shortDescription: string
    selectedAttributes: string | any[] // Allow both string and array
    quantity: number
    unitPrice: number
    createdAt: string
    updatedAt: string
}

interface OrderDto {
    id: number
    userId: number
    shippingAddress: string
    transactionId: string
    status: string
    customerName: string
    customerPhone: string
    customerEmail: string
    shippingFee: number
    isFreeShipping: boolean
    discountCode: string
    discountAmount: number
    totalAmount: number
    isComplete: boolean
    createdAt: string
    updatedAt: string
    items: OrderItemDto[]
}


export default function MyOrders() {
    const [orders, setOrders] = useState<OrderDto[]>([])
    const [activeTab, setActiveTab] = useState("all")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadOrders(activeTab)
    }, [activeTab])

    const loadOrders = async (status: string) => {
        setLoading(true)
        try {

            const response = await fetch(`/api/orders/me?status=${status === 'all' ? '' : status}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            })

            if (!response.ok) {
              throw new Error('Failed to fetch orders')
            }

            const data = await response.json()
            setOrders(data)


        } catch (error) {
            console.error("Error loading orders:", error)
            toast.error("Không thể tải danh sách đơn hàng")
            setOrders([])
        } finally {
            setLoading(false)
        }
    }


    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatSelectedAttributes = (attributes: string | any[]) => {
        if (typeof attributes === "string") {
            try {
                const parsed = JSON.parse(attributes)
                if (Array.isArray(parsed)) {
                    return parsed.map((attr) => attr.Value || attr.value || attr).join(", ")
                }
                return attributes
            } catch {
                return attributes
            }
        }

        if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
            return "Không có thuộc tính"
        }

        return attributes.map((attr) => attr.Value || attr.value || attr).join(", ")
    }

    const getStatusInfo = (status: string) => {
        const statusLower = status.toLowerCase()
        switch (statusLower) {
            case "pending":
                return {
                    label: "Chờ xác nhận",
                    color: "bg-yellow-100 text-yellow-800",
                    icon: <Clock className="h-4 w-4" />,
                }
            case "processing":
                return {
                    label: "Đã xử lý",
                    color: "bg-blue-100 text-blue-800",
                    icon: <CheckCircle className="h-4 w-4" />,
                }
            case "shipping":
                return {
                    label: "Đang giao hàng",
                    color: "bg-purple-100 text-purple-800",
                    icon: <Truck className="h-4 w-4" />,
                }
            case "completed":
                return {
                    label: "Hoàn thành",
                    color: "bg-green-100 text-green-800",
                    icon: <CheckCircle className="h-4 w-4" />,
                }
            case "cancelled":
                return {
                    label: "Đã hủy",
                    color: "bg-red-100 text-red-800",
                    icon: <XCircle className="h-4 w-4" />,
                }
            default:
                return {
                    label: "Không xác định",
                    color: "bg-gray-100 text-gray-800",
                    icon: <Package className="h-4 w-4" />,
                }
        }
    }



    const handleTabChange = (value: string) => {
        setActiveTab(value)
    }

    const OrderCard = ({ order }: { order: OrderDto }) => {
        const statusInfo = getStatusInfo(order.status)

        return (
            <Card className="mb-4 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <CardTitle className="text-lg">Đơn hàng #{order.id}</CardTitle>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(order.createdAt)}</span>
                                </div>
                                {order.transactionId && <div className="text-xs text-gray-500 mt-1">Mã GD: {order.transactionId}</div>}
                            </div>
                        </div>
                        <Badge className={statusInfo.color}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-600">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-600">{order.customerPhone}</span>
                            </div>
                            {/*<div className="flex items-center gap-1">*/}
                            {/*    <Mail className="h-3 w-3 text-gray-500" />*/}
                            {/*    <span className="text-gray-600 truncate">{order.customerEmail}</span>*/}
                            {/*</div>*/}
                        </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <img
                                    src={item.pictureUrl || "/placeholder.svg?height=48&width=48"}
                                    alt={item.bookName}
                                    className="w-12 h-12 object-cover rounded border"
                                />
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm line-clamp-1">{item.bookName}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-1">{item.shortDescription}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                        <span>SL: {item.quantity}</span>
                                        <span>•</span>
                                        <span>{formatPrice(item.unitPrice)}</span>
                                    </div>
                                    {item.selectedAttributes && (
                                        <div className="mt-1">
                                            <Badge variant="outline" className="text-xs px-1 py-0">
                                                {formatSelectedAttributes(item.selectedAttributes)}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {order.items.length > 2 && (
                            <p className="text-sm text-gray-600 pl-15">và {order.items.length - 2} sản phẩm khác...</p>
                        )}
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{order.shippingAddress}</span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phí vận chuyển:</span>
                                <span className={order.isFreeShipping ? "text-green-600" : ""}>
                  {order.isFreeShipping ? "Miễn phí" : formatPrice(order.shippingFee)}
                </span>
                            </div>
                            {order.discountCode && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mã giảm giá ({order.discountCode}):</span>
                                    <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                                </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                                <span>Tổng tiền:</span>
                                <span className="text-lg text-green-600">{formatPrice(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/*<Button>Hủy đơn hàng</Button>*/}

                </CardContent>
            </Card>
        )
    }

    const EmptyState = ({ message }: { message: string }) => (
        <Card>
            <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
                <p className="text-gray-600 mb-4">
                    {activeTab === "all"
                        ? "Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!"
                        : "Không có đơn hàng nào ở trạng thái này."}
                </p>
            </CardContent>
        </Card>
    )

    const LoadingState = () => (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải đơn hàng...</span>
        </div>
    )

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                {/*<Button variant="outline" size="sm">*/}
                {/*    <ArrowLeft className="h-4 w-4 mr-2" />*/}
                {/*    Quay lại*/}
                {/*</Button>*/}
                <div>
                    <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
                    <p className="text-gray-600">Quản lý và theo dõi đơn hàng</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
                    <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
                    <TabsTrigger value="shipping">Đang giao</TabsTrigger>
                    <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
                    <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
                </TabsList>

                {["all", "pending", "processing", "shipping", "completed", "cancelled"].map((status) => (
                    <TabsContent key={status} value={status} className="mt-6">
                        {loading ? (
                            <LoadingState />
                        ) : orders.length === 0 ? (
                            <EmptyState message={status === "all" ? "Chưa có đơn hàng nào" : "Không có đơn hàng nào"} />
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
