"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Settings, Calendar, Percent, Save } from "lucide-react"

import { booksApi, type Discount } from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"
import type { FormSection } from "./book-form-layout"

interface DiscountManagementProps {
    formData: any
    isLoading: boolean
    errors: any
    onInputChange: (field: string, value: any) => void
    onOpenDiscountManager: () => void
    onSaveSection: (section: FormSection) => void
}

export default function DiscountManagement({
                                               formData,
                                               isLoading,
                                               errors,
                                               onInputChange,
                                               onOpenDiscountManager,
                                               onSaveSection,
                                           }: DiscountManagementProps) {
    const [discounts, setDiscounts] = useState<Discount[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const { loading: discountsLoading, execute: executeDiscounts } = useApi<Discount[]>()

    useEffect(() => {
        loadDiscounts()
    }, [])

    const loadDiscounts = async () => {
        try {
            const result = await executeDiscounts(() => booksApi.getDiscounts())
            if (result) setDiscounts(result)
        } catch (error) {
            console.error("Failed to load discounts:", error)
        }
    }

    const handleDiscountToggle = (discountId: number, checked: boolean) => {
        const currentDiscounts = formData.appliedDiscounts || []

        if (checked) {
            onInputChange("appliedDiscounts", [...currentDiscounts, discountId])
        } else {
            onInputChange(
                "appliedDiscounts",
                currentDiscounts.filter((id: number) => id !== discountId),
            )
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSaveSection("discounts")
        } finally {
            setIsSaving(false)
        }
    }

    const getDiscountTypeLabel = (type: string) => {
        switch (type) {
            case "percentage":
                return "Phần trăm"
            case "fixed":
                return "Số tiền cố định"
            case "buy_x_get_y":
                return "Mua X tặng Y"
            default:
                return type
        }
    }

    const getDiscountValue = (discount: Discount) => {
        switch (discount.type) {
            case "percentage":
                return `${discount.value}%`
            case "fixed":
                return `${discount.value.toLocaleString()}đ`
            case "buy_x_get_y":
                return `Mua ${discount.minQuantity} tặng ${discount.value}`
            default:
                return discount.value.toString()
        }
    }

    const isDiscountActive = (discount: Discount) => {
        const now = new Date()
        const startDate = new Date(discount.startDate)
        const endDate = new Date(discount.endDate)

        return discount.isActive && now >= startDate && now <= endDate
    }

    const appliedDiscounts = formData.appliedDiscounts || []

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Quản lý giảm giá</CardTitle>
                        <CardDescription>Áp dụng các chương trình giảm giá cho sản phẩm</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={onOpenDiscountManager}>
                        <Settings className="h-4 w-4 mr-2" />
                        Quản lý giảm giá
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {discountsLoading ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                        <span className="text-sm text-gray-500 mt-2">Đang tải chương trình giảm giá...</span>
                    </div>
                ) : discounts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Chưa có chương trình giảm giá nào</p>
                        <Button variant="outline" onClick={onOpenDiscountManager}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo chương trình giảm giá
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {discounts.map((discount) => {
                            const isApplied = appliedDiscounts.includes(discount.id)
                            const isActive = isDiscountActive(discount)

                            return (
                                <div
                                    key={discount.id}
                                    className={`border rounded-lg p-4 ${isApplied ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={isApplied}
                                                onCheckedChange={(checked) => handleDiscountToggle(discount.id, checked as boolean)}
                                                disabled={isLoading || !isActive}
                                            />
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">{discount.name}</h4>
                                                    <Badge variant={isActive ? "default" : "secondary"}>
                                                        {isActive ? "Đang hoạt động" : "Không hoạt động"}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Percent className="h-3 w-3" />
                                                        <span>
                              {getDiscountTypeLabel(discount.type)}: {getDiscountValue(discount)}
                            </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                              {new Date(discount.startDate).toLocaleDateString("vi-VN")} -{" "}
                                                            {new Date(discount.endDate).toLocaleDateString("vi-VN")}
                            </span>
                                                    </div>
                                                </div>

                                                {discount.minQuantity && (
                                                    <div className="text-sm text-gray-600">Số lượng tối thiểu: {discount.minQuantity}</div>
                                                )}

                                                <div className="text-sm text-gray-600">
                                                    Đã sử dụng: {discount.currentUsage}/{discount.maxUsage || "∞"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {appliedDiscounts.length > 0 && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <h5 className="font-medium text-green-800 mb-2">Giảm giá được áp dụng:</h5>
                                <div className="space-y-1">
                                    {appliedDiscounts.map((discountId: number) => {
                                        const discount = discounts.find((d) => d.id === discountId)
                                        if (!discount) return null

                                        return (
                                            <div key={discountId} className="text-sm text-green-700">
                                                • {discount.name} - {getDiscountValue(discount)}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
                <Button onClick={handleSave} disabled={isLoading || isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Đang lưu..." : "Lưu giảm giá"}
                </Button>
            </CardFooter>
        </Card>
    )
}
