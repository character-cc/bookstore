"use client"

import { useState, useEffect } from "react"
import { Save, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface EditCombinationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    combination: AttributeCombination | null
    bookId?: number
    attributes: CustomAttribute[]
    onSaved: () => void
}

export function EditCombinationDialog({
                                          open,
                                          onOpenChange,
                                          combination,
                                          bookId,
                                          attributes,
                                          onSaved,
                                      }: EditCombinationDialogProps) {
    const [formData, setFormData] = useState<AttributeCombinationRequest>({
        bookId: bookId || 0,
        attributes: {},
        sku: "",
        price: 0,
        lowStockThreshold: 0,
        stockQuantity: 0,
        isActive: true,
    })

    const [error, setError] = useState<string | null>(null)

    const { loading: saveLoading, execute: executeSave } = useApi<AttributeCombination>()
    const { loading: deleteLoading, execute: executeDelete } = useApi<void>()

    // Load combination data when dialog opens
    useEffect(() => {
        if (open && combination) {
            setFormData({
                bookId: combination.bookId,
                attributes: combination.attributes,
                sku: combination.sku,
                price: combination.price,
                lowStockThreshold: combination.notifyAdminForQuantityBelow || 0,
                stockQuantity: combination.stockQuantity,
                isActive: combination.isActive,
            })
            setError(null)
        }
    }, [open, combination])

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
        setError(null)
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

    const handleSave = async () => {
        if (!bookId || !combination) {
            toast.error("Thiếu thông tin cần thiết để lưu")
            return
        }

        if (Object.keys(formData.attributes).length === 0) {
            toast.error("Vui lòng chọn ít nhất một thuộc tính")
            return
        }

        setError(null)

        try {
            await executeSave(() => booksApi.updateAttributeCombination(combination.id, formData), {
                successMessage: "Cập nhật tổ hợp thành công!",
            })

            onSaved()
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to save combination:", error)
            setError("Lỗi khi cập nhật tổ hợp")
        }
    }

    const handleDelete = async () => {
        if (!combination) return

        if (confirm("Bạn có chắc chắn muốn xóa tổ hợp này? Hành động này không thể hoàn tác.")) {
            try {
                await executeDelete(() => booksApi.deleteAttributeCombination(combination.id), {
                    successMessage: "Xóa tổ hợp thành công!",
                })

                onSaved()
                onOpenChange(false)
            } catch (error) {
                console.error("Failed to delete combination:", error)
                toast.error("Lỗi khi xóa tổ hợp")
            }
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

    const getAttributeName = (attributeId: number) => {
        return attributes.find((attr) => attr.id === attributeId)?.name || "Unknown"
    }

    const getAttributeValueName = (attributeId: number, valueId: number) => {
        const attribute = attributes.find((attr) => attr.id === attributeId)
        const value = attribute?.values?.find((val) => val.id === valueId)
        return value?.name || value?.label || "Unknown"
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Chỉnh sửa tổ hợp thuộc tính
                        {combination && (
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">SKU: {combination.sku}</Badge>
                                <Badge variant={combination.isActive ? "default" : "secondary"}>
                                    {combination.isActive ? "Hoạt động" : "Vô hiệu"}
                                </Badge>
                            </div>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {combination && (
                            <div className="text-sm text-gray-600">
                                Tổ hợp hiện tại:{" "}
                                {Object.entries(combination.attributes)
                                    .map(
                                        ([attrId, valueId]) =>
                                            `${getAttributeName(Number(attrId))}: ${getAttributeValueName(Number(attrId), valueId)}`,
                                    )
                                    .join(", ")}
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6">
                        {attributes.map((attribute) => (
                            <div key={attribute.id} className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right font-medium">
                                    {attribute.name}
                                    {attribute.isRequired && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                <div className="col-span-3">{renderAttributeControl(attribute)}</div>
                            </div>
                        ))}

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
                            <Input
                                id="sku"
                                value={formData.sku}
                                onChange={(e) => handleInputChange("sku", e.target.value)}
                                className="col-span-3"
                            />
                        </div>

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
                            />
                        </div>

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
                            />
                        </div>

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
                            />
                        </div>

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

                <div className="flex justify-between pt-4 border-t">
                    <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deleteLoading ? "Đang xóa..." : "Xóa"}
                    </Button>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleSave} disabled={saveLoading} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-2" />
                            {saveLoading ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
