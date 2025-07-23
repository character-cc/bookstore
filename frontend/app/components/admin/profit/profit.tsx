"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {CalendarIcon, RefreshCw, Search} from "lucide-react"
import { toast } from "sonner"

interface ProfitSummary {
    totalProfit: number
    totalRevenue: number
    totalBaseCost: number
    totalShippingFee: number
    orderCount: number
}

interface Order {
    id: number
    customerName: string
    customerPhone: string
    customerEmail: string
    status: string
    isPaid: boolean
    shippingFee: number
    discountCode: string
    discountAmount: number
    totalAmount: number
    totalBaseCost: number
    profit: number
    createdAt: string
    transactionId: string
}

export default function ProfitStatisticsSimple() {
    const [profitSummary, setProfitSummary] = useState<ProfitSummary>({
        totalProfit: 0,
        totalRevenue: 0,
        totalBaseCost: 0,
        totalShippingFee: 0,
        orderCount: 0,
    })

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)
    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState("")

    const [totalPages, setTotalPages] = useState(10)

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
    const loadProfitSummary = async () => {
        try {
            const today = new Date()
            const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            let start;
            let end;
            if(startDate?.length > 0) {
                start = startDate
            }
            else {
                start = thirtyDaysAgo.toISOString().split("T")[0]
            }
            if(endDate?.length > 0) {
                end = endDate
            }
            else {
                end = today.toISOString().split("T")[0]
            }
            const response = await fetch(`/api/admin/profit/summary?startDate=${start}&endDate=${end}`)
            const data = await response.json()
            console.log(data)
            setProfitSummary(data)

        } catch (error) {
            console.error("Error loading profit summary:", error)
            toast("Không thể tải tổng quan lợi nhuận")
        }
    }

    const loadOrders = async () => {
        try {
            const today = new Date()
            const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            let start;
            let end;
            if(startDate?.length > 0) {
                start = startDate
            }
            else {
                start = thirtyDaysAgo.toISOString().split("T")[0]
            }
            if(endDate?.length > 0) {
                end = endDate
            }
            else {
                end = today.toISOString().split("T")[0]
            }
            const response = await fetch(`/api/admin/orders/profit`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    StartDate: start,
                    EndDate: end,
                    searchTerm: searchTerm,
                    pageIndex: currentPage - 1,
                    pageSize: itemsPerPage,
                }),
            })
            const data = await response.json()
            console.log(data)
            setOrders(data.items)

            setTotalPages(data.totalPages)

        } catch (error) {
            console.error("Error loading orders:", error)
            toast("Không thể tải danh sách đơn hàng")
        }
    }

    const loadData = async () => {
        // if (!startDate || !endDate) {
        //     toast("Vui lòng chọn khoảng thời gian")
        //     return
        // }
        setLoading(true)

        try {
            loadProfitSummary()
            loadOrders()
        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getOrderStatusLabel = (status: string): string => {
        console.log(status)
        switch (status) {
            case "Pending":
                return " Chờ xử lý "
            case "Shipping":
                return "Đang vận chuyển"
            case "Processing":
                return "Đang xử lý"
            case "Completed":
                return "Hoàn tất"
            case "Cancelled":
                return "Đã hủy"
            default:
                return "Không xác định"
        }
    }
    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "default"
            case "pending":
                return "secondary"
            case "cancelled":
                return "destructive"
            default:
                return "outline"
        }
    }

    const handleSearch = () => {
        setCurrentPage(1)
        loadOrders()
    }

    useEffect(() => {
        loadOrders()
    }, [currentPage]);

    // useEffect(() => {
    //     if (startDate && endDate) {
    //         loadData()
    //     }
    // }, [startDate, endDate])

    useEffect(() => {
        const today = new Date()
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        setEndDate(today.toISOString().split("T")[0])
        setStartDate(thirtyDaysAgo.toISOString().split("T")[0])
        loadData()
    },[])
    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Thống kê lợi nhuận</h1>
                <Button onClick={loadData} disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-2"/>
                    Làm mới
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Chọn khoảng thời gian</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="startDate">Từ ngày</Label>
                            <Input id="startDate" type="date" value={startDate}
                                   onChange={(e) => setStartDate(e.target.value)}/>
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="endDate">Đến ngày</Label>
                            <Input id="endDate" type="date" value={endDate}
                                   onChange={(e) => setEndDate(e.target.value)}/>
                        </div>
                        <Button onClick={loadData} disabled={loading || !startDate || !endDate}>
                            <CalendarIcon className="h-4 w-4 mr-2"/>
                            Xem báo cáo
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tổng lợi nhuận</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-2xl font-bold text-green-600">{formatCurrency(profitSummary.totalProfit)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-2xl font-bold text-blue-600">{formatCurrency(profitSummary.totalRevenue)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tổng giá vốn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-2xl font-bold text-red-600">{formatCurrency(profitSummary.totalBaseCost)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Phí vận chuyển</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-2xl font-bold text-orange-600">{formatCurrency(profitSummary.totalShippingFee)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Số đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-2xl font-bold text-purple-600">{profitSummary.orderCount.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex gap-2 w-120">
                    <Input
                        placeholder="Tìm kiếm theo mã giao dịch hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={loading} variant="outline">
                        <Search className="h-4 w-4 mr-2"/>
                        Tìm kiếm
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-2">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Mã đơn</th>
                                    <th className="text-left p-3">Mã giao dịch</th>
                                    <th className="text-left p-3">Khách hàng</th>
                                    <th className="text-left p-3">Điện thoại</th>
                                    <th className="text-right p-3">Doanh thu</th>
                                    <th className="text-right p-3">Giá vốn</th>
                                    <th className="text-right p-3">Phí ship</th>
                                    <th className="text-right p-3">Giảm giá</th>
                                    <th className="text-right p-3">Lợi nhuận</th>
                                    <th className="text-center p-3">Trạng thái</th>
                                    <th className="text-center p-3">Ngày tạo</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-8 text-gray-500">
                                            Không có dữ liệu trong khoảng thời gian đã chọn
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium">#{order.id}</td>
                                            <td className="p-3 font-medium">{order.transactionId}</td>
                                            <td className="p-3">
                                                <div>
                                                    <div className="font-medium">{order.customerName}</div>
                                                    <div className="text-sm text-gray-500">{order.customerEmail}</div>
                                                </div>
                                            </td>
                                            <td className="p-3">{order.customerPhone}</td>
                                            <td className="text-right p-3">{formatCurrency(order.totalAmount)}</td>
                                            <td className="text-right p-3 ">{formatCurrency(order.totalBaseCost)}</td>
                                            <td className="text-right p-3 ">{formatCurrency(order.shippingFee)}</td>
                                            <td className="text-right p-3 ">
                                                {order.discountAmount > 0 ? (
                                                    <div>
                                                        <div>{formatCurrency(order.discountAmount)}</div>
                                                        <div
                                                            className="text-xs text-gray-500">{order.discountCode}</div>
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td className="text-right p-3  ">{formatCurrency(order.profit)}</td>
                                            <td className="text-center p-3">
                                                <Badge
                                                    variant={getStatusVariant(order.status)}>{getOrderStatusLabel(order.status)}</Badge>
                                            </td>
                                            <td className="text-center p-3 text-sm">{formatDate(order.createdAt)}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                    {/*Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} trong tổng số{" "}*/}
                    {/*{filteredOrders.length} đơn hàng*/}
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
