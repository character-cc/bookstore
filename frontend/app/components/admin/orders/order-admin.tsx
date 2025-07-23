"use client"

import {useEffect, useState} from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { startOfToday, startOfWeek, startOfMonth, endOfToday, endOfWeek, endOfMonth } from "date-fns";
import {
    Search,
    Eye,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    RefreshCw,
    Edit,
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {useNavigate} from "react-router";
enum OrderStatus {
    Pending = 0,
    Paid = 1,
    Shipping = 2,
    Processing = 3,
    Completed = 4,
    Cancelled = 5,
}

interface OrderItem {
    id: number
    orderId: number
    bookId: number
    bookName: string
    pictureUrl: string
    shortDescription: string
    selectedAttributes: string
    quantity: number
    unitPrice: number
}

interface ShippingTracking {
    id: number
    orderId: number
    trackingCode: string
    provider: string
    status: number
    createdAt: string
    updatedAt: string
}

interface Order {
    id: number
    userId: number
    shippingAddress: string
    transactionId: string
    status: OrderStatus
    shippingFee: number
    isFreeShipping: boolean
    discountCode: string
    discountAmount: number
    totalAmount: number
    isComplete: boolean
    createdAt: string
    updatedAt: string
    items: OrderItem[]
    tracking: ShippingTracking[]
    customerName?: string
    customerPhone?: string
    customerEmail?: string
}



export default function OrderAdmin() {
    const router =useNavigate()
    const [orders, setOrders] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [dateFilter, setDateFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [totalPages, setTotalPages] = useState(10)
    useEffect(() => {
        loadOrders()
    },[currentPage])
    const loadOrders = async () => {
        try {
            const { fromDate, toDate } = getDateRange(dateFilter);
            const response = await fetch("http://localhost/api/admin/orders/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    keyword: searchTerm,
                    pageIndex: currentPage - 1,
                    pageSize: itemsPerPage,
                    fromDate: fromDate,
                    toDate: toDate,
                    status: statusFilter === "all" ? undefined : statusFilter,
                }),
            })
            if(!response.ok) {
                throw new Error("Failed to fetch orders.")
            }
            const data = await response.json()
            console.log(data)
            setTotalPages(data.totalPages)
            setOrders(data.items)
        }
        catch (error) {

            console.log(error)
        }
    }

    const renderPageButtons = () => {
        const pages = [];
        const maxVisible = 3;

        pages.push(
            <Button
                key={1}
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
            >
                1
            </Button>
        );

        if (currentPage > maxVisible + 2) {
            pages.push(<span key="start-ellipsis">...</span>);
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </Button>
            );
        }

        if (currentPage < totalPages - maxVisible - 1) {
            pages.push(<span key="end-ellipsis">...</span>);
        }

        if (totalPages > 1) {
            pages.push(
                <Button
                    key={totalPages}
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                >
                    {totalPages}
                </Button>
            );
        }

        return pages;
    };

    const handleSearch = async () => {
        setCurrentPage(1)
        loadOrders()
    }

    const getDateRange = (filter: string): { fromDate?: string; toDate?: string } => {
        const today = new Date();

        switch (filter) {
            case "today":
                return {
                    fromDate: startOfToday().toISOString(),
                    toDate: endOfToday().toISOString(),
                };
            case "week":
                return {
                    fromDate: startOfWeek(today, { weekStartsOn: 1 }).toISOString(), // Monday start
                    toDate: endOfWeek(today, { weekStartsOn: 1 }).toISOString(),
                };
            case "month":
                return {
                    fromDate: startOfMonth(today).toISOString(),
                    toDate: endOfMonth(today).toISOString(),
                };
            default:
                return {}; // all → không filter
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    }


    const getOrderStatusLabel = (status: string): string => {
        switch (status) {
            case "Pending":
                return "Chờ xử lý";
            case "Shipping":
                return "Đang vận chuyển";
            case "Processing":
                return "Đang xử lý";
            case "Completed":
                return "Hoàn tất";
            case "Cancelled":
                return "Đã hủy";
            default:
                return "Không xác định";
        }
    };

    const handleViewOrder = (orderId: number) => {
        router(`/admin/orders/${orderId}`)
    }

    const handleEditOrder = (orderId: number) => {
        router(`/admin/orders/${orderId}/edit`)
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                    <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
                </div>
                <div className="flex gap-3">

                </div>
            </div>


            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm theo tên khách hàng, mã giao dịch hoặc mã đơn hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="Pending"> Chờ xử lý </SelectItem>
                                <SelectItem value="Shipping">Đang giao hàng</SelectItem>
                                <SelectItem value="Processing">Đang xử lý</SelectItem>
                                <SelectItem value="Completed">Hoàn thành</SelectItem>
                                <SelectItem value="Cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="today">Hôm nay</SelectItem>
                                <SelectItem value="week">Tuần này</SelectItem>
                                <SelectItem value="month">Tháng này</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSearch} variant="outline">
                            <Search className="h-4 w-4 mr-2"/>
                            Tìm kiếm
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Mã đơn hàng</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                {/*<TableHead>Sản phẩm</TableHead>*/}
                                <TableHead>Tổng tiền</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="w-32">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <div>
                                            <div className="font-semibold">#{order.id}</div>
                                            {order.transactionId && <div className="text-sm text-gray-500">TXN: {order.transactionId}</div>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                        </div>
                                    </TableCell>
                                    {/*<TableCell>*/}
                                    {/*    <div className="flex items-center gap-2">*/}
                                    {/*        <div className="w-10 h-10 bg-gray-100 rounded">*/}
                                    {/*            <img*/}
                                    {/*                src={order.items[0]?.pictureUrl || "/placeholder.svg?height=40&width=40"}*/}
                                    {/*                alt="Product"*/}
                                    {/*                width={40}*/}
                                    {/*                height={40}*/}
                                    {/*                className="w-full h-full object-cover rounded"*/}
                                    {/*            />*/}
                                    {/*        </div>*/}
                                    {/*        <div>*/}
                                    {/*            <div className="font-medium text-sm">{order.items[0]?.bookName}</div>*/}
                                    {/*            <div className="text-xs text-gray-500">*/}
                                    {/*                {order.items.length > 1*/}
                                    {/*                    ? `+${order.items.length - 1} sản phẩm khác`*/}
                                    {/*                    : `SL: ${order.items[0]?.quantity}`}*/}
                                    {/*            </div>*/}
                                    {/*        </div>*/}
                                    {/*    </div>*/}
                                    {/*</TableCell>*/}
                                    <TableCell>
                                        <div>
                                            <div className="font-semibold">{formatPrice(order.totalAmount)}</div>
                                            {order.discountAmount > 0 && (
                                                <div className="text-sm ">Giảm: {formatPrice(order.discountAmount)}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getOrderStatusLabel(order.status)}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{formatDate(order.createdAt)}</div>
                                            {order.updatedAt !== order.createdAt && (
                                                <div className="text-gray-500">Cập nhật: {formatDate(order.updatedAt)}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order.id)} title="Xem chi tiết">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditOrder(order.id)}
                                                title="Sửa trạng thái"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            {/*{(order.status === OrderStatus.Paid || order.status === OrderStatus.Processing) && (*/}
                                            {/*    <Button*/}
                                            {/*        variant="ghost"*/}
                                            {/*        size="sm"*/}
                                            {/*        onClick={() => handleShipOrder(order.id)}*/}
                                            {/*        className="text-blue-600"*/}
                                            {/*        title="Giao hàng"*/}
                                            {/*    >*/}
                                            {/*        <Truck className="h-4 w-4" />*/}
                                            {/*    </Button>*/}
                                            {/*)}*/}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">

                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        Trước
                    </Button>

                    {renderPageButtons()}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Sau
                    </Button>
                </div>
            </div>
        </div>
    )
}
