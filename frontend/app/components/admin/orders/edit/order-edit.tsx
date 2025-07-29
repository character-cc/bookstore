"use client"

import { Label } from "~/components/ui/label"

import {useEffect, useState} from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { Input } from "~/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { ArrowLeft, Package, Clock, CreditCard, Truck, CheckCircle, XCircle, Plus, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {toast} from "sonner";
import {useNavigate} from "react-router"
const mockOrder = {
    id: 1,
    customerName: "Nguyễn Văn A",
    status: 1, // Paid
    totalAmount: 600000,
    createdAt: "2025-06-20T10:30:00Z",
    tracking: [
        {
            id: 1,
            orderId: 1,
            trackingCode: "VN123456789",
            provider: "Viettel Post",
            status: 1, // Shipping
            createdAt: "2025-06-20T12:00:00Z",
            updatedAt: "2025-06-20T14:00:00Z",
        },
    ],
}

interface TrackingInfo {
    id?: number
    trackingCode: string
    provider: string
    status: string
    createdAt?: string
    updatedAt?: string
}

interface OrderEditPageProps {
    orderId: string
}

export default function OrderEditPage({ orderId }: OrderEditPageProps) {
    const router = useNavigate()
    const [order, setOrder] = useState(mockOrder)
    const [newStatus, setNewStatus] = useState(order.status.toString())
    const [notes, setNotes] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const [trackingList, setTrackingList] = useState([])
    const [showTrackingDialog, setShowTrackingDialog] = useState(false)
    const [editingTracking, setEditingTracking] = useState<TrackingInfo | null>(null)
    const [trackingForm, setTrackingForm] = useState<TrackingInfo>({
        trackingCode: "",
        provider: "",
        status: "",
    })

    useEffect(() => {
        loadOrderDetails()
    },[])

    const loadOrderDetails = async () => {
        try {
            const response = await fetch("http://localhost/api/orders/" + orderId)
            if(!response.ok) {
                throw new Error(response.statusText)
            }

            const data = await response.json()
            console.log(data)
            setOrder(data)
            setNewStatus(data.status)
            setTrackingList(data.tracking)
        }
        catch (error) {
            console.log(error)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    }


    const handleUpdateStatus = async () => {
        setIsLoading(true)
        try {


            console.log(newStatus)
            console.log(trackingList)
            const list  = trackingList.map((item, index) => ({
                ...item,
                id: 0
            }));

            const response = await fetch("http://localhost/api/orders/" + orderId,{
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body : JSON.stringify({
                    status: newStatus,
                    shippingTrackings : list
                }),
            })
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            console.log(response)

            toast(
          "Đã cập nhật trạng thái đơn hàng và thông tin vận chuyển")

            router(`/admin/orders/${orderId}`)
        } catch (error) {
            toast(
                 "Có lỗi xảy ra khi cập nhật"

            )
        } finally {
            setIsLoading(false)
        }
    }

    const getShippingStatusLabel = (status: string): string => {
        switch (status) {
            case "NotShipped":
                return "Chưa giao hàng";
            case "Shipping":
                return "Đang giao hàng";
            case "Delivered":
                return "Đã giao hàng";
            case "Failed":
                return "Giao hàng thất bại";
            case "Returned":
                return "Đã hoàn trả";
            default:
                return "Không xác định";
        }
    };


    const getOrderStatusLabel = (status: string): string => {
        switch (status) {
            case "Paid":
                return "Đã thanh toán";
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


    const openTrackingDialog = (tracking?: TrackingInfo) => {
        if (tracking) {
            setEditingTracking(tracking)
            setTrackingForm({
                trackingCode: tracking.trackingCode,
                provider: tracking.provider,
                status: tracking.status,
            })
        } else {
            setEditingTracking(null)
            setTrackingForm({
                trackingCode: "",
                provider: "",
                status: 0,
            })
        }
        setShowTrackingDialog(true)
    }

    const handleSaveTracking = () => {
        if (!trackingForm.trackingCode.trim() || !trackingForm.provider) {
            toast(
          "Vui lòng nhập đầy đủ thông tin vận chuyển"

            )
            return
        }

        if (editingTracking) {
            // Update existing tracking
            setTrackingList((prev) =>
                prev.map((track) =>
                    track.id === editingTracking.id
                        ? {
                            ...track,
                            trackingCode: trackingForm.trackingCode,
                            provider: trackingForm.provider,
                            status: trackingForm.status,
                            updatedAt: new Date().toISOString(),
                        }
                        : track,
                ),
            )
            toast(
      "Đã cập nhật thông tin vận chuyển"
            )
        } else {
            const newTracking: TrackingInfo = {
                id: Date.now(),
                trackingCode: trackingForm.trackingCode,
                provider: trackingForm.provider,
                status: trackingForm.status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            setTrackingList((prev) => [...prev, newTracking])
            toast(
                "Đã thêm thông tin vận chuyển mới"
            )
        }

        setShowTrackingDialog(false)
        setEditingTracking(null)
        setTrackingForm({
            trackingCode: "",
            provider: "",
            status: 0,
        })
    }

    const handleDeleteTracking = (trackingId: number) => {
        setTrackingList((prev) => prev.filter((track) => track.id !== trackingId))
        toast(
            "Đã xóa thông tin vận chuyển"
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline"  className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cập nhật đơn hàng #{order.id}</h1>
                    <p className="text-gray-600 mt-1">Thay đổi trạng thái và quản lý thông tin vận chuyển</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1  gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Thông tin đơn hàng
                            </CardTitle>
                        </CardHeader>
                        {/*<CardContent className="space-y-4">*/}
                        {/*    <div className="flex justify-between">*/}
                        {/*        <span>Mã đơn hàng:</span>*/}
                        {/*        <span className="font-medium">#{order.id}</span>*/}
                        {/*    </div>*/}
                        {/*    <div className="flex justify-between">*/}
                        {/*        <span>Khách hàng:</span>*/}
                        {/*        <span className="font-medium">{order.customerName}</span>*/}
                        {/*    </div>*/}
                        {/*    <div className="flex justify-between">*/}
                        {/*        <span>Tổng tiền:</span>*/}
                        {/*        <span className="font-medium">{formatPrice(order.totalAmount)}</span>*/}
                        {/*    </div>*/}
                        {/*    <div className="flex justify-between">*/}
                        {/*        <span>Trạng thái hiện tại:</span>*/}
                        {/*        <Select value={newStatus} onValueChange={setNewStatus}>*/}
                        {/*            <SelectTrigger>*/}
                        {/*                <SelectValue />*/}
                        {/*            </SelectTrigger>*/}
                        {/*            <SelectContent>*/}
                        {/*                <SelectItem value="Pending">Đang xử lý</SelectItem>*/}
                        {/*                <SelectItem value="Paid">Đã thanh toán</SelectItem>*/}
                        {/*                <SelectItem value="Shipping">Đang giao hàng</SelectItem>*/}
                        {/*                <SelectItem value="Processing">Đang xử lý</SelectItem>*/}
                        {/*                <SelectItem value="Completed">Hoàn thành</SelectItem>*/}
                        {/*                <SelectItem value="Cancelled">Đã hủy</SelectItem>*/}
                        {/*            </SelectContent>*/}
                        {/*        </Select>*/}
                        {/*    </div>*/}
                        {/*</CardContent>*/}
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-[150px_1fr] items-center gap-2">
                                <span className="text-muted-foreground">Mã đơn hàng:</span>
                                <span className="font-medium">#{order.id}</span>

                                <span className="text-muted-foreground">Khách hàng:</span>
                                <span className="font-medium">{order.customerName}</span>

                                <span className="text-muted-foreground">Tổng tiền:</span>
                                <span className="font-medium">{formatPrice(order.totalAmount)}</span>

                                <span className="text-muted-foreground">Trạng thái hiện tại:</span>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Chưa xử lý</SelectItem>
                                        {/*<SelectItem value="Paid">Đã thanh toán</SelectItem>*/}
                                        <SelectItem value="Shipping">Đang giao hàng</SelectItem>
                                        <SelectItem value="Processing">Đang xử lý</SelectItem>
                                        <SelectItem value="Completed">Hoàn thành</SelectItem>
                                        <SelectItem value="Cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>


                </div>



                {/* Shipping Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5"/>
                                Quản lý vận chuyển
                            </div>
                            <Button onClick={() => openTrackingDialog()} className="flex items-center gap-2">
                                <Plus className="h-4 w-4"/>
                                Thêm vận chuyển
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {trackingList.length > 0 ? (
                            <div className="space-y-3">
                                {trackingList.map((track) => (
                                    <div key={track.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="font-medium">{track.trackingCode}</div>
                                                <div className="text-sm text-gray-600">{track.provider}</div>
                                                <div className="mt-1">{getShippingStatusLabel(track.status)}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openTrackingDialog(track)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Edit className="h-3 w-3"/>
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => track.id && handleDeleteTracking(track.id)}
                                                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3"/>
                                                    Xóa
                                                </Button>
                                            </div>
                                        </div>
                                        {track.createdAt && (
                                            <div className="text-xs text-gray-500">
                                                <div>Tạo: {formatDate(track.createdAt)}</div>
                                                {track.updatedAt && track.updatedAt !== track.createdAt && (
                                                    <div>Cập nhật: {formatDate(track.updatedAt)}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Truck className="h-12 w-12 mx-auto mb-2 text-gray-300"/>
                                <p>Chưa có thông tin vận chuyển</p>
                                <Button className="mt-4" onClick={() => openTrackingDialog()}>
                                    Thêm thông tin vận chuyển
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline">
                    Hủy
                </Button>
                <Button onClick={handleUpdateStatus} disabled={isLoading}>
                    {isLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
                </Button>
            </div>

            {/* Tracking Dialog */}
            <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingTracking ? "Sửa thông tin vận chuyển" : "Thêm thông tin vận chuyển"}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="trackingCode">Mã vận đơn *</Label>
                            <Input
                                id="trackingCode"
                                value={trackingForm.trackingCode}
                                onChange={(e) => setTrackingForm((prev) => ({ ...prev, trackingCode: e.target.value }))}
                                placeholder="VD: VN123456789"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="provider">Đơn vị vận chuyển *</Label>
                            <Select
                                value={trackingForm.provider}
                                onValueChange={(value) => setTrackingForm((prev) => ({ ...prev, provider: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn đơn vị vận chuyển" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Viettel Post">Viettel Post</SelectItem>
                                    <SelectItem value="Vietnam Post">Vietnam Post</SelectItem>
                                    <SelectItem value="GHN">Giao Hàng Nhanh</SelectItem>
                                    <SelectItem value="GHTK">Giao Hàng Tiết Kiệm</SelectItem>
                                    <SelectItem value="J&T Express">J&T Express</SelectItem>
                                    <SelectItem value="Shopee Express">Shopee Express</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="shippingStatus">Trạng thái vận chuyển</Label>
                            <Select
                                value={trackingForm.status.toString()}
                                onValueChange={(value) => setTrackingForm((prev) => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NotShipped">Chưa giao</SelectItem>
                                    <SelectItem value="Shipping">Đang giao</SelectItem>
                                    <SelectItem value="Delivered">Đã giao</SelectItem>
                                    <SelectItem value="Failed">Giao thất bại</SelectItem>
                                    <SelectItem value="Returned">Hoàn trả</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowTrackingDialog(false)}>
                            Hủy
                        </Button>
                        <Button type="button" onClick={handleSaveTracking}>
                            {editingTracking ? "Cập nhật" : "Thêm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
