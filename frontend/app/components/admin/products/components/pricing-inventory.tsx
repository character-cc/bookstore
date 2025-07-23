"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface PricingInventoryProps {
    formData: any
    errors: Record<string, string>
    isLoading: boolean
    onInputChange: (field: string, value: any) => void
    onOpenInventorySettings: () => void
}

export default function PricingInventory({
                                             formData,
                                             errors,
                                             isLoading,
                                             onInputChange,
                                             onOpenInventorySettings,
                                         }: PricingInventoryProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price)
    }

    const getInventoryTypeLabel = (type: string) => {
        switch (type) {
            case "none":
                return "Không theo dõi"
            case "simple":
                return "Theo dõi đơn giản"
            case "by_attributes":
                return "Theo thuộc tính"
            default:
                return "Chưa thiết lập"
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Giá và kho hàng</CardTitle>
                <CardDescription>Thông tin về giá bán và quản lý tồn kho</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="originalPrice">
                            Giá gốc (VNĐ) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="originalPrice"
                            type="number"
                            value={formData.originalPrice}
                            onChange={(e) => onInputChange("originalPrice", Number.parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className={errors.originalPrice ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.originalPrice && <span className="text-sm text-red-500">{errors.originalPrice}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="price">
                            Giá bán (VNĐ) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => onInputChange("price", Number.parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className={errors.price ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.price && <span className="text-sm text-red-500">{errors.price}</span>}
                    </div>
                </div>

                {formData.originalPrice > 0 && formData.price > 0 && formData.originalPrice > formData.price && (
                    <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                            Giảm giá: {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% (
                            {formatPrice(formData.originalPrice - formData.price)} VNĐ)
                        </p>
                    </div>
                )}

                <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base font-medium">Quản lý tồn kho</Label>
                            <p className="text-sm text-gray-600">
                                Loại: <Badge variant="outline">{getInventoryTypeLabel(formData.inventoryTracking?.type)}</Badge>
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={onOpenInventorySettings}>
                            <Settings className="h-4 w-4 mr-2" />
                            Cài đặt
                        </Button>
                    </div>

                    {formData.inventoryTracking?.type === "simple" && (
                        <div className="grid gap-2">
                            <Label htmlFor="stock">
                                Số lượng tồn kho <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => onInputChange("stock", Number.parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className={errors.stock ? "border-red-500" : ""}
                                disabled={isLoading}
                            />
                            {errors.stock && <span className="text-sm text-red-500">{errors.stock}</span>}
                        </div>
                    )}

                    {formData.inventoryTracking?.type === "by_attributes" && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                Tồn kho được quản lý theo từng kết hợp thuộc tính. Vui lòng thiết lập trong phần "Cài đặt tồn kho".
                            </p>
                        </div>
                    )}

                    {formData.inventoryTracking?.type === "none" && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                                Không theo dõi tồn kho - Khách hàng có thể mua không giới hạn số lượng.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
