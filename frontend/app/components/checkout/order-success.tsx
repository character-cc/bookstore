"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Home } from "lucide-react"

import {useNavigate, useSearchParams} from "react-router";
import {useEffect} from "react";
import {toast} from "sonner";
export default function OrderSuccessPage() {
    const router = useNavigate()

    const [searchParams] = useSearchParams();

    const appTransId = searchParams.get("apptransid");
    const amount = searchParams.get("amount");
    const status = searchParams.get("status");





    return <>
        <div className="container mx-auto p-4 max-w-2xl">
            {(Number(status) == 1) ? (
                <div className="container mx-auto p-4 max-w-2xl">
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-500"/>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-green-600 mb-2">Đặt hàng thành công!</h1>
                            <p className="text-gray-600">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5"/>
                                    Thông tin đơn hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {appTransId && (<div className="flex justify-between">
                                    <span>Mã đơn hàng:</span>
                                    <span className="font-medium">{appTransId}</span>
                                </div>)}

                                <div className="flex justify-between">
                                    <span>Thời gian đặt:</span>
                                    <span>{new Date().toLocaleString("vi-VN")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phương thức thanh toán:</span>
                                    <span>{appTransId ? "Thanh toán quan thẻ ngân hàng" : "Thanh toán khi nhận hàng"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Trạng thái:</span>
                                    <span className="text-blue-600 font-medium">Đang xử lý</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                            </p>
                            <p className="text-sm text-gray-600">Đơn hàng sẽ được giao trong vòng 2-3 ngày làm việc.</p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={() => router("/")} className="flex items-center gap-2">
                                <Home className="h-4 w-4"/>
                                Về trang chủ
                            </Button>
                            <Button onClick={() => router("/me/orders")} className="flex items-center gap-2">
                                <Package className="h-4 w-4"/>
                                Xem đơn hàng
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (<div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-500 text-2xl">✕</span>
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại!</h1>
                    <p className="text-gray-600">Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.</p>
                </div>
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => router("/")} className="flex items-center gap-2">
                        <Home className="h-4 w-4"/>
                        Về trang chủ
                    </Button>
                    <Button onClick={() => router("/cart")} className="flex items-center gap-2">
                        <Package className="h-4 w-4"/>
                        Quay lại giỏ hàng
                    </Button>
                </div>
            </div>)}
        </div>
        </>
}
