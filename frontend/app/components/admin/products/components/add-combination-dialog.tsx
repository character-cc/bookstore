"use client"

import { useState, useEffect } from "react"
import { Plus, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

import { booksApi, type CustomAttribute, type AttributeCombination } from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"

interface AttributeCombinationRequest {
    bookId: number
    attributes: { [key: string]: string }
    sku: string
    price: number
    lowStockThreshold: number
    stockQuantity: number
    isActive: boolean
}

interface AddCombinationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    bookId?: number
    attributes: CustomAttribute[]
    onSaved: () => void
}

export function AddCombinationDialog({ open, onOpenChange, bookId, attributes, onSaved }: AddCombinationDialogProps) {
    const [formData, setFormData] = useState<AttributeCombinationRequest>({
        bookId: bookId || 0,
        attributes: {},
        sku: "",
        price: 0,
        lowStockThreshold: 0,
        stockQuantity: 0,
        isActive: true,
    })

    const { loading, execute } = useApi<AttributeCombination>()

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setFormData({
                bookId: bookId || 0,
                attributes: {},
                sku: "",
                price: 0,
                lowStockThreshold: 0,
                stockQuantity: 0,
                isActive: true,
            })
        }
    }, [open, bookId])

    const handleAttributeChange = (attributeId: number, valueId: number | string) => {
        setFormData((prev) => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attributeId.toString()]: valueId.toString(),
            },
        }))
    }

    const handleInputChange = (field: keyof AttributeCombinationRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleCheckboxChange = (attributeId: number, valueIds: number[], checked: boolean, valueId: number) => {
        let newValueIds: number[]
        if (checked) {
            newValueIds = [...valueIds, valueId]
        } else {
            newValueIds = valueIds.filter((id) => id !== valueId)
        }

        setFormData((prev) => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attributeId.toString()]: newValueIds.join(","),
            },
        }))
    }

    const generateSKU = () => {
        if (!bookId || Object.keys(formData.attributes).length === 0) return

        const attributeParts = Object.entries(formData.attributes).map(([attrId, valueId]) => {
            const attribute = attributes.find((attr) => attr.id === Number(attrId))
            const value = attribute?.values?.find((val) => val.id === Number(valueId))
            return value?.name?.substring(0, 3).toUpperCase() || "XXX"
        })

        const generatedSKU = `BOOK-${bookId}-${attributeParts.join("-")}`
        setFormData((prev) => ({ ...prev, sku: generatedSKU }))
    }

    const handleSave = async () => {
        if (!bookId) {
            toast.error("Cần có ID sách để tạo tổ hợp")
            return
        }

        if (Object.keys(formData.attributes).length === 0) {
            toast.error("Vui lòng chọn ít nhất một thuộc tính")
            return
        }

        try {
            await execute(() => booksApi.createAttributeCombination(formData), {
                successMessage: "Tạo tổ hợp thành công!",
            })

            onSaved()
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to save combination:", error)
            toast.error("Lỗi khi tạo tổ hợp")
        }
    }

    const renderAttributeControl = (attribute: CustomAttribute) => {
        const currentValue = formData.attributes[attribute.id.toString()] || ""
        const currentValues = currentValue ? currentValue.split(",").map(Number) : []

        switch (attribute.controlType) {
            case "dropdown":
                return (
                    <Select value={currentValue} onValueChange={(value) => handleAttributeChange(attribute.id, value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn giá trị..." />
                        </SelectTrigger>
                        <SelectContent>
                            {attribute.values?.map((value) => (
                                <SelectItem key={value.id} value={value.id.toString()}>
                                    {value.name || value.label}
                                    {value.priceAdjustment !== 0 && (
                                        <span className="text-sm text-gray-500 ml-2">
                      ({value.priceAdjustment > 0 ? "+" : ""}
                                            {value.priceAdjustment.toLocaleString()}đ)
                    </span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )

            case "radio":
                return (
                    <RadioGroup
                        value={currentValue}
                        onValueChange={(value) => handleAttributeChange(attribute.id, value)}
                        className="flex gap-4 flex-wrap"
                    >
                        {attribute.values?.map((value) => (
                            <div key={value.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={value.id.toString()} id={`${attribute.id}-${value.id}`} />
                                <Label htmlFor={`${attribute.id}-${value.id}`} className="text-sm">
                                    {value.name || value.label}
                                    {value.priceAdjustment !== 0 && (
                                        <span className="text-xs text-gray-500 ml-1">
                      ({value.priceAdjustment > 0 ? "+" : ""}
                                            {value.priceAdjustment.toLocaleString()}đ)
                    </span>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )

            case "checkbox":
                return (
                    <div className="flex gap-4 flex-wrap">
                        {attribute.values?.map((value) => (
                            <div key={value.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${attribute.id}-${value.id}`}
                                    checked={currentValues.includes(value.id)}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange(attribute.id, currentValues, checked as boolean, value.id)
                                    }
                                />
                                <Label htmlFor={`${attribute.id}-${value.id}`} className="text-sm">
                                    {value.name || value.label}
                                    {value.priceAdjustment !== 0 && (
                                        <span className="text-xs text-gray-500 ml-1">
                      ({value.priceAdjustment > 0 ? "+" : ""}
                                            {value.priceAdjustment.toLocaleString()}đ)
                    </span>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </div>
                )

            case "textbox":
                return (
                    <Input
                        value={currentValue}
                        onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                        placeholder={`Nhập ${attribute.name.toLowerCase()}...`}
                    />
                )

            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Thêm tổ hợp thuộc tính</DialogTitle>
                    <DialogDescription>Tạo tổ hợp mới với các thuộc tính và thông tin chi tiết</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-6">
                        {/* Attribute Selection */}
                        {attributes.map((attribute) => (
                            <div key={attribute.id} className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right font-medium">
                                    {attribute.name}
                                    {attribute.isRequired && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                <div className="col-span-3">{renderAttributeControl(attribute)}</div>
                            </div>
                        ))}

                        {attributes.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>Không có thuộc tính nào được định nghĩa cho sách này.</p>
                                <p className="text-sm mt-2">Vui lòng thêm thuộc tính trước khi tạo tổ hợp.</p>
                            </div>
                        )}

                        {/* SKU */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sku" className="text-right font-medium flex items-center gap-2">
                                SKU
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                      <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                        ?
                      </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Mã định danh duy nhất cho tổ hợp này</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                            <div className="col-span-3 flex gap-2">
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => handleInputChange("sku", e.target.value)}
                                    placeholder="Nhập SKU hoặc để trống để tự động tạo"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generateSKU}
                                    disabled={Object.keys(formData.attributes).length === 0}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Tạo tự động
                                </Button>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right font-medium flex items-center gap-2">
                                Giá
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                      <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                        ?
                      </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Giá bán cho tổ hợp này (VNĐ)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => handleInputChange("price", Number(e.target.value))}
                                className="col-span-3"
                                placeholder="0"
                            />
                        </div>

                        {/* Stock Quantity */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stockQuantity" className="text-right font-medium flex items-center gap-2">
                                Số lượng tồn kho
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                      <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                        ?
                      </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Số lượng hiện có trong kho</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                            <Input
                                id="stockQuantity"
                                type="number"
                                value={formData.stockQuantity}
                                onChange={(e) => handleInputChange("stockQuantity", Number(e.target.value))}
                                className="col-span-3"
                                placeholder="0"
                            />
                        </div>

                        {/* Low Stock Threshold */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lowStockThreshold" className="text-right font-medium flex items-center gap-2">
                                Ngưỡng cảnh báo hết hàng
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                      <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                        ?
                      </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Cảnh báo khi số lượng tồn kho dưới mức này</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                            <Input
                                id="lowStockThreshold"
                                type="number"
                                value={formData.lowStockThreshold}
                                onChange={(e) => handleInputChange("lowStockThreshold", Number(e.target.value))}
                                className="col-span-3"
                                placeholder="0"
                            />
                        </div>

                        {/* Is Active */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right font-medium flex items-center gap-2">
                                Trạng thái hoạt động
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                      <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                        ?
                      </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Tổ hợp có được hiển thị và bán hay không</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                            <div className="col-span-3">
                                <Checkbox
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                                />
                                <span className="ml-2 text-sm">Kích hoạt tổ hợp này</span>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Đang lưu..." : "Lưu"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
