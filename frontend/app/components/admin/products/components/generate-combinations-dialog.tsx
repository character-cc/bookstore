"use client"

import { useState, useEffect } from "react"
import { Wand2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { booksApi, type CustomAttribute } from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"

interface GenerateCombinationsRequest {
    bookId: number
    selectedCombinations: { [key: string]: string }[]
    generateAll: boolean
    basePrice: number
    lowStockThreshold: number
    stockQuantity: number
}

interface GenerateCombinationsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    bookId?: number
    attributes: CustomAttribute[]
    onSaved: () => void
}

export function GenerateCombinationsDialog({
                                               open,
                                               onOpenChange,
                                               bookId,
                                               attributes,
                                               onSaved,
                                           }: GenerateCombinationsDialogProps) {
    const [selectedValues, setSelectedValues] = useState<{ [attributeId: number]: number[] }>({})
    const [formData, setFormData] = useState<GenerateCombinationsRequest>({
        bookId: bookId || 0,
        selectedCombinations: [],
        generateAll: false,
        basePrice: 0,
        lowStockThreshold: 0,
        stockQuantity: 0,
    })

    const [previewCombinations, setPreviewCombinations] = useState<{ [key: string]: string }[]>([])

    const { loading, execute } = useApi<any>()

    useEffect(() => {
        if (open) {
            const initialSelected: { [attributeId: number]: number[] } = {}
            attributes.forEach((attr) => {
                initialSelected[attr.id] = []
            })
            setSelectedValues(initialSelected)
            setFormData({
                bookId: bookId || 0,
                selectedCombinations: [],
                generateAll: false,
                basePrice: 0,
                lowStockThreshold: 0,
                stockQuantity: 0,
            })
        }
    }, [open, attributes, bookId])

    useEffect(() => {
        generatePreview()
    }, [selectedValues, attributes])

    const handleValueSelection = (attributeId: number, valueId: number, checked: boolean) => {
        setSelectedValues((prev) => {
            const current = prev[attributeId] || []
            if (checked) {
                return { ...prev, [attributeId]: [...current, valueId] }
            } else {
                return { ...prev, [attributeId]: current.filter((id) => id !== valueId) }
            }
        })
    }

    const handleSelectAll = (attributeId: number, checked: boolean) => {
        const attribute = attributes.find((attr) => attr.id === attributeId)
        if (!attribute) return

        if (checked) {
            setSelectedValues((prev) => ({
                ...prev,
                [attributeId]: attribute.values?.map((val) => val.id) || [],
            }))
        } else {
            setSelectedValues((prev) => ({
                ...prev,
                [attributeId]: [],
            }))
        }
    }

    const generatePreview = () => {
        const selectedAttributeIds = Object.keys(selectedValues)
            .map(Number)
            .filter((attrId) => selectedValues[attrId].length > 0)

        if (selectedAttributeIds.length === 0) {
            setPreviewCombinations([])
            return
        }

        const combinations: { [key: string]: string }[] = []

        const generateCombos = (index: number, currentCombo: { [key: string]: string }) => {
            if (index >= selectedAttributeIds.length) {
                combinations.push({ ...currentCombo })
                return
            }

            const attributeId = selectedAttributeIds[index]
            const valueIds = selectedValues[attributeId]

            valueIds.forEach((valueId) => {
                generateCombos(index + 1, {
                    ...currentCombo,
                    [attributeId.toString()]: valueId.toString(),
                })
            })
        }

        generateCombos(0, {})
        setPreviewCombinations(combinations)
    }

    const handleInputChange = (field: keyof GenerateCombinationsRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleGenerate = async () => {
        if (!bookId) {
            toast.error("Cần có ID sách để tạo tổ hợp")
            return
        }

        if (previewCombinations.length === 0) {
            toast.error("Vui lòng chọn ít nhất một giá trị thuộc tính")
            return
        }

        try {
            const requestData: GenerateCombinationsRequest = {
                ...formData,
                selectedCombinations: previewCombinations,
                generateAll: false,
            }

            await execute(() => booksApi.generateAttributeCombinations(bookId, requestData), {
                successMessage: `Đã tạo ${previewCombinations.length} tổ hợp thành công!`,
            })

            onSaved()
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to generate combinations:", error)
            toast.error("Lỗi khi tạo tổ hợp")
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
            <DialogContent className="max-w-6xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Tạo tổ hợp thuộc tính</DialogTitle>
                    <DialogDescription>Chọn các giá trị thuộc tính để tạo tổ hợp tự động</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-medium mb-4">Chọn giá trị thuộc tính</h3>
                            <ScrollArea className="h-64 border rounded-md p-4">
                                <div className="space-y-6">
                                    {attributes.map((attribute) => (
                                        <div key={attribute.id} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="font-medium">
                                                    {attribute.name}
                                                    {attribute.isRequired && <span className="text-red-500 ml-1">*</span>}
                                                </Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const allSelected = attribute.values?.every((val) =>
                                                            selectedValues[attribute.id]?.includes(val.id),
                                                        )
                                                        handleSelectAll(attribute.id, !allSelected)
                                                    }}
                                                >
                                                    {attribute.values?.every((val) => selectedValues[attribute.id]?.includes(val.id))
                                                        ? "Bỏ chọn tất cả"
                                                        : "Chọn tất cả"}
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2">
                                                {attribute.values?.map((value) => (
                                                    <div key={value.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`attr-${attribute.id}-val-${value.id}`}
                                                            checked={selectedValues[attribute.id]?.includes(value.id) || false}
                                                            onCheckedChange={(checked) =>
                                                                handleValueSelection(attribute.id, value.id, checked as boolean)
                                                            }
                                                        />
                                                        <Label htmlFor={`attr-${attribute.id}-val-${value.id}`} className="text-sm flex-1">
                                                            {value.name || value.label}
                                                            {value.priceAdjustment !== 0 && (
                                                                <span className="text-xs text-gray-500 ml-2">
                                  ({value.priceAdjustment > 0 ? "+" : ""}
                                                                    {value.priceAdjustment.toLocaleString()}đ)
                                </span>
                                                            )}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-medium">Cài đặt mặc định cho tất cả tổ hợp</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="basePrice" className="flex items-center gap-2">
                                        Giá cơ bản
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                          <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                            ?
                          </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Giá cơ bản sẽ được áp dụng cho tất cả tổ hợp</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Input
                                        id="basePrice"
                                        type="number"
                                        value={formData.basePrice}
                                        onChange={(e) => handleInputChange("basePrice", Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="stockQuantity" className="flex items-center gap-2">
                                        Số lượng tồn kho
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                          <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                            ?
                          </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Số lượng tồn kho mặc định cho mỗi tổ hợp</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Input
                                        id="stockQuantity"
                                        type="number"
                                        value={formData.stockQuantity}
                                        onChange={(e) => handleInputChange("stockQuantity", Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="lowStockThreshold" className="flex items-center gap-2">
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
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Xem trước tổ hợp ({previewCombinations.length})</h3>
                        </div>

                        <ScrollArea className="h-80 border rounded-md p-4">
                            {previewCombinations.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Chọn giá trị thuộc tính để xem trước tổ hợp</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {previewCombinations.map((combo, index) => (
                                        <div key={index} className="p-3 border rounded-lg">
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(combo).map(([attrId, valueId]) => (
                                                    <Badge key={attrId} variant="outline" className="text-xs">
                                                        {getAttributeName(Number(attrId))}: {getAttributeValueName(Number(attrId), Number(valueId))}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                SKU: BOOK-{bookId}-{Object.values(combo).join("-")}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || previewCombinations.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Wand2 className="h-4 w-4 mr-2" />
                        {loading ? "Đang tạo..." : `Tạo ${previewCombinations.length} tổ hợp`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
