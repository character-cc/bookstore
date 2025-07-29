"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
    booksApi,
    type CustomAttribute,
    type InventoryTracking,
    type InventoryAttributeCombination,
} from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"

interface InventorySettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    inventoryTracking: InventoryTracking
    onConfirm: (settings: InventoryTracking) => void
}

export default function InventorySettingsDialog({
                                                    open,
                                                    onOpenChange,
                                                    inventoryTracking,
                                                    onConfirm,
                                                }: InventorySettingsDialogProps) {
    const [settings, setSettings] = useState<InventoryTracking>(inventoryTracking)
    const [attributes, setAttributes] = useState<CustomAttribute[]>([])
    const [combinations, setCombinations] = useState<InventoryAttributeCombination[]>([])

    const { loading: attributesLoading, execute: executeAttributes } = useApi<CustomAttribute[]>()

    useEffect(() => {
        if (open) {
            setSettings(inventoryTracking)
            setCombinations(inventoryTracking.attributeCombinations || [])
            loadAttributes()
        }
    }, [open, inventoryTracking])

    const loadAttributes = async () => {
        try {
            const result = await executeAttributes(() => booksApi.getCustomAttributes())
            if (result) {
                setAttributes(result.filter((attr) => attr.type === "select"))
            }
        } catch (error) {
            console.error("Failed to load attributes:", error)
        }
    }

    const handleTypeChange = (type: "none" | "simple" | "by_attributes") => {
        setSettings((prev) => ({
            ...prev,
            type,
            attributeCombinations: type === "by_attributes" ? combinations : undefined,
        }))
    }

    const addCombination = () => {
        const newCombination: InventoryAttributeCombination = {
            id: Date.now(),
            attributeValues: {},
            sku: "",
            quantity: 0,
            price: undefined,
        }
        setCombinations([...combinations, newCombination])
    }

    const updateCombination = (index: number, field: keyof InventoryAttributeCombination, value: any) => {
        const updated = [...combinations]
        updated[index] = { ...updated[index], [field]: value }
        setCombinations(updated)
    }

    const updateCombinationAttribute = (index: number, attributeId: number, valueId: number) => {
        const updated = [...combinations]
        updated[index] = {
            ...updated[index],
            attributeValues: {
                ...updated[index].attributeValues,
                [attributeId]: valueId,
            },
        }
        setCombinations(updated)
    }

    const removeCombination = (index: number) => {
        setCombinations(combinations.filter((_, i) => i !== index))
    }

    const handleConfirm = () => {
        const finalSettings = {
            ...settings,
            attributeCombinations: settings.type === "by_attributes" ? combinations : undefined,
        }
        onConfirm(finalSettings)
        onOpenChange(false)
    }

    const getAttributeValueName = (attributeId: number, valueId: number) => {
        const attribute = attributes.find((attr) => attr.id === attributeId)
        const value = attribute?.values?.find((val) => val.id === valueId)
        return value?.displayName || "Unknown"
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Cài đặt quản lý tồn kho</DialogTitle>
                    <DialogDescription>Thiết lập cách thức theo dõi và quản lý số lượng tồn kho</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 flex-1 overflow-y-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Loại theo dõi tồn kho</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="none"
                                        name="trackingType"
                                        checked={settings.type === "none"}
                                        onChange={() => handleTypeChange("none")}
                                    />
                                    <Label htmlFor="none" className="flex-1">
                                        <div>
                                            <div className="font-medium">Không theo dõi</div>
                                            <div className="text-sm text-gray-600">Khách hàng có thể mua không giới hạn số lượng</div>
                                        </div>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="simple"
                                        name="trackingType"
                                        checked={settings.type === "simple"}
                                        onChange={() => handleTypeChange("simple")}
                                    />
                                    <Label htmlFor="simple" className="flex-1">
                                        <div>
                                            <div className="font-medium">Theo dõi đơn giản</div>
                                            <div className="text-sm text-gray-600">Chỉ nhập một số lượng tồn kho chung cho sản phẩm</div>
                                        </div>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="by_attributes"
                                        name="trackingType"
                                        checked={settings.type === "by_attributes"}
                                        onChange={() => handleTypeChange("by_attributes")}
                                    />
                                    <Label htmlFor="by_attributes" className="flex-1">
                                        <div>
                                            <div className="font-medium">Theo thuộc tính</div>
                                            <div className="text-sm text-gray-600">Quản lý tồn kho riêng cho từng kết hợp thuộc tính</div>
                                        </div>
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {settings.type !== "none" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt bổ sung</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Cho phép đặt hàng khi hết hàng</Label>
                                        <p className="text-sm text-gray-600">Khách hàng vẫn có thể đặt hàng khi sản phẩm hết hàng</p>
                                    </div>
                                    <Switch
                                        checked={settings.allowBackorders}
                                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, allowBackorders: checked }))}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="lowStockThreshold">Ngưỡng cảnh báo hết hàng</Label>
                                    <Input
                                        id="lowStockThreshold"
                                        type="number"
                                        min="0"
                                        value={settings.lowStockThreshold || ""}
                                        onChange={(e) =>
                                            setSettings((prev) => ({
                                                ...prev,
                                                lowStockThreshold: Number.parseInt(e.target.value) || undefined,
                                            }))
                                        }
                                        placeholder="Để trống nếu không cần cảnh báo"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {settings.type === "by_attributes" && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Kết hợp thuộc tính</CardTitle>
                                    <Button onClick={addCombination} size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm kết hợp
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {attributesLoading ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                                        <span className="text-sm text-gray-500 mt-2">Đang tải thuộc tính...</span>
                                    </div>
                                ) : combinations.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">Chưa có kết hợp thuộc tính nào</div>
                                ) : (
                                    <div className="space-y-4">
                                        {combinations.map((combination, index) => (
                                            <div key={combination.id} className="border rounded-lg p-4 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium">Kết hợp #{index + 1}</h4>
                                                    <Button variant="ghost" size="icon" onClick={() => removeCombination(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Attribute Values */}
                                                    <div className="space-y-3">
                                                        <Label>Thuộc tính</Label>
                                                        {attributes.map((attribute) => (
                                                            <div key={attribute.id} className="grid gap-2">
                                                                <Label className="text-sm">{attribute.displayName}</Label>
                                                                <Select
                                                                    value={combination.attributeValues[attribute.id]?.toString() || ""}
                                                                    onValueChange={(value) =>
                                                                        updateCombinationAttribute(index, attribute.id, Number.parseInt(value))
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Chọn giá trị" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {attribute.values?.map((value) => (
                                                                            <SelectItem key={value.id} value={value.id.toString()}>
                                                                                {value.displayName}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="grid gap-2">
                                                            <Label>SKU</Label>
                                                            <Input
                                                                value={combination.sku}
                                                                onChange={(e) => updateCombination(index, "sku", e.target.value)}
                                                                placeholder="Mã SKU riêng"
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>Số lượng</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={combination.quantity}
                                                                onChange={(e) =>
                                                                    updateCombination(index, "quantity", Number.parseInt(e.target.value) || 0)
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>Giá riêng (tùy chọn)</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={combination.price || ""}
                                                                onChange={(e) =>
                                                                    updateCombination(index, "price", Number.parseInt(e.target.value) || undefined)
                                                                }
                                                                placeholder="Để trống dùng giá chung"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t">
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(combination.attributeValues).map(([attrId, valueId]) => (
                                                            <Badge key={attrId} variant="outline">
                                                                {getAttributeValueName(Number.parseInt(attrId), valueId)}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleConfirm}>Lưu cài đặt</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
