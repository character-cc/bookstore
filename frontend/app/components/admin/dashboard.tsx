"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Truck, Cog, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"

interface OrderStats {
    pending: number
    shipping: number
    processing: number
    completed: number
    cancelled: number
}

interface RevenueData {
    period: string
    revenue: number
}

interface OrderStatusData {
    name: string
    value: number
    color: string
}

type RevenueView = "month" | "year"

export default function Dashboard() {
    const [orderStats, setOrderStats] = useState<OrderStats>({
        pending: 0,
        shipping: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
    })

    const [revenueData, setRevenueData] = useState<RevenueData[]>([])
    const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([])
    const [revenueView, setRevenueView] = useState<RevenueView>("month")
    const [loading, setLoading] = useState(true)

    // Load order statistics from API
    const loadOrderStats = async () => {
        try {
            const response = await fetch("http://localhost/api/admin/orders/status")
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setOrderStats(data)

            const statusData = [
                { name: "Hoàn thành", value: data.completed, color: "#22c55e" },
                { name: "Đang xử lý", value: data.processing, color: "#3b82f6" },
                { name: "Đang giao", value: data.shipping, color: "#8b5cf6" },
                { name: "Chờ xử lý", value: data.pending, color: "#f59e0b" },
                { name: "Đã hủy", value: data.cancelled, color: "#ef4444" },
            ]
            setOrderStatusData(statusData)
        } catch (error) {
            console.error("Error loading order status:", error)
            toast("Không thể tải thống kê đơn hàng")
        }
    }

    const loadRevenueData = async (view: RevenueView) => {
        try {
            let endpoint = ""

            if (view === "month") {
                endpoint = "http://localhost/api/admin/orders/revenue/month"
            } else {
                endpoint = "http://localhost/api/admin/orders/revenue/year"

            }

            const response = await fetch(endpoint)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()

            console.log("Revenue data received:", data) // Debug log
            setRevenueData(data)
        } catch (error) {
            console.error("Error loading revenue data:", error)
            toast("Không thể tải dữ liệu doanh thu")
        }
    }

    const loadDashboardData = async () => {
        try {
            setLoading(true)

            await loadOrderStats()

            await loadRevenueData(revenueView)
        } catch (error) {
            console.error("Error loading dashboard data:", error)
            toast("Không thể tải dữ liệu dashboard")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboardData()
    }, [])

    useEffect(() => {
        if (!loading) {
            loadRevenueData(revenueView)
        }
    }, [revenueView])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const formatYAxisTick = (value: number) => {
        console.log("formatYAxisTick input:", value) // Debug log

        const millions = value / 1000000

        if (millions >= 1000) {
            const billions = millions / 1000
            return `${billions.toFixed(1)} tỷ`
        }

        return `${millions.toFixed(1)} tr`
    }

    const getChartTitle = () => {
        if (revenueView === "month") {
            return "Doanh thu 12 tháng gần nhất"
        } else {
            return "Doanh thu 5 năm gần nhất"
        }
    }

    const handleRefreshData = () => {
        loadDashboardData()
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <Button onClick={handleRefreshData} disabled={loading}>
                        Làm mới
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-64 bg-gray-200 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-64 bg-gray-200 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Button onClick={handleRefreshData} disabled={loading}>
                    Làm mới
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">{orderStats.pending}</div>
                        <p className="text-xs text-muted-foreground">đơn hàng</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang giao</CardTitle>
                        <Truck className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">{orderStats.shipping}</div>
                        <p className="text-xs text-muted-foreground">đơn hàng</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                        <Cog className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{orderStats.processing}</div>
                        <p className="text-xs text-muted-foreground">đơn hàng</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{orderStats.completed}</div>
                        <p className="text-xs text-muted-foreground">đơn hàng</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{orderStats.cancelled}</div>
                        <p className="text-xs text-muted-foreground">đơn hàng</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{getChartTitle()}</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant={revenueView === "month" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setRevenueView("month")}
                                    disabled={loading}
                                >
                                    12 tháng
                                </Button>
                                <Button
                                    variant={revenueView === "year" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setRevenueView("year")}
                                    disabled={loading}
                                >
                                    5 năm
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="period"
                                        angle={revenueView === "month" ? -45 : 0}
                                        textAnchor={revenueView === "month" ? "end" : "middle"}
                                        height={revenueView === "month" ? 60 : 30}
                                    />
                                    <YAxis tickFormatter={formatYAxisTick} domain={["dataMin", "dataMax"]} />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                                        labelStyle={{ color: "#000" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">Không có dữ liệu doanh thu</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê trạng thái đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orderStatusData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={orderStatusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {orderStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => [value, "đơn hàng"]} />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Legend */}
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    {orderStatusData.map((entry) => (
                                        <div key={entry.name} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                            <span className="text-sm">
                        {entry.name}: {entry.value}
                      </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">Không có dữ liệu đơn hàng</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
