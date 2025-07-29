"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import {toast, Toaster} from "sonner";

import { booksApi, type CustomAttribute, type AttributeValue } from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"

interface AttributeManagerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAttributesUpdated: () => void
}

export default function AttributeManagerDialog({
                                                   open,
                                                   onOpenChange,
                                                   onAttributesUpdated,
                                               }: AttributeManagerDialogProps) {
    const [attributes, setAttributes] = useState<CustomAttribute[]>([])
    const [editingAttribute, setEditingAttribute] = useState<CustomAttribute | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const { loading: attributesLoading, execute: executeAttributes } = useApi<CustomAttribute[]>()

    const [formData, setFormData] = useState({
        displayName: "",
        type: "text" as const,
        isRequired: false,
        affectPrice: false,
        values: [] as AttributeValue[],
    })

    useEffect(() => {
        if (open) {
            loadAttributes()
        }
    }, [open])

    const loadAttributes = async () => {
        try {
            const result = await executeAttributes(() => booksApi.getCustomAttributes())
            if (result) setAttributes(result)
        } catch (error) {
            console.error("Failed to load attributes:", error)
            toast.error("Không thể tải danh sách thuộc tính")
        }
    }

    const handleCreate = () => {
        setIsCreating(true)
        setEditingAttribute(null)
        setFormData({
            displayName: "",
            type: "text",
            isRequired: false,
            affectPrice: false,
            values: [],
        })
    }

    const handleEdit = (attribute: CustomAttribute) => {
        setEditingAttribute(attribute)
        setIsCreating(false)
        setFormData({
            displayName: attribute.displayName,
            type: attribute.type,
            isRequired: attribute.isRequired,
            affectPrice: attribute.affectPrice,
            values: attribute.values || [],
        })
    }

    const handleSave = async () => {
        if (!formData.displayName.trim()) {
            toast.error("Tên thuộc tính không được để trống")
            return
        }

        setIsSaving(true)
        try {
            // Fake API call
            await new Promise((resolve) => setTimeout(resolve, 800))

            if (isCreating) {
                const newAttribute: CustomAttribute = {
                    id: Date.now(),
                    displayName: formData.displayName,
                    type: formData.type,
                    isRequired: formData.isRequired,
                    affectPrice: formData.affectPrice,
                    values: formData.values,
                }
                setAttributes([...attributes, newAttribute])
                toast.success("Tạo thuộc tính thành công!")
            } else if (editingAttribute) {
                const updatedAttributes = attributes.map((attr) =>
                    attr.id === editingAttribute.id
                        ? {
                            ...attr,
                            displayName: formData.displayName,
                            type: formData.type,
                            isRequired: formData.isRequired,
                            affectPrice: formData.affectPrice,
                            values: formData.values,
                        }
                        : attr,
                )
                setAttributes(updatedAttributes)
                toast.success("Cập nhật thuộc tính thành công!")
            }

            setIsCreating(false)
            setEditingAttribute(null)
            onAttributesUpdated()
        } catch (error) {
            console.error("Failed to save attribute:", error)
            toast.error("Lỗi khi lưu thuộc tính")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (attributeId: number) => {
        if (!confirm("Bạn có chắc muốn xóa thuộc tính này?")) return

        try {
            await new Promise((resolve) => setTimeout(resolve, 500))

            setAttributes(attributes.filter((attr) => attr.id !== attributeId))
            toast.success("Xóa thuộc tính thành công!")
            onAttributesUpdated()
        } catch (error) {
            console.error("Failed to delete attribute:", error)
            toast.error("Lỗi khi xóa thuộc tính")
        }
    }

    const handleCancel = () => {
        setIsCreating(false)
        setEditingAttribute(null)
    }

    const addValue = () => {
        const newValue: AttributeValue = {
            id: Date.now(),
            displayName: "",
            priceAdjustment: 0,
            priceAdjustmentType: "fixed",
        }
        setFormData({
            ...formData,
            values: [...formData.values, newValue],
        })
    }

    const updateValue = (index: number, field: keyof AttributeValue, value: any) => {
        const updatedValues = formData.values.map((val, i) => (i === index ? { ...val, [field]: value } : val))
        setFormData({ ...formData, values: updatedValues })
    }

    const removeValue = (index: number) => {
        setFormData({
            ...formData,
            values: formData.values.filter((_, i) => i !== index),
        })
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "text":
                return "Văn bản"
            case "number":
                return "Số"
            case "select":
                return "Lựa chọn"
            case "boolean":
                return "Có/Không"
            case "color":
                return "Màu sắc"
            case "date":
                return "Ngày tháng"
            default:
                return type
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Quản lý thuộc tính tùy chỉnh</DialogTitle>
                    <DialogDescription>Tạo và quản lý các thuộc tính tùy chỉnh cho sản phẩm</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Danh sách thuộc tính</h3>
                            <Button onClick={handleCreate} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm mới
                            </Button>
                        </div>

                        {attributesLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                                <span className="text-sm text-gray-500 mt-2">Đang tải...</span>
                            </div>
                        ) : attributes.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Chưa có thuộc tính nào</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {attributes.map((attribute) => (
                                    <Card key={attribute.id} className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">{attribute.displayName}</h4>
                                                    <Badge variant="outline">{getTypeLabel(attribute.type)}</Badge>
                                                    {attribute.isRequired && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Bắt buộc
                                                        </Badge>
                                                    )}
                                                    {attribute.affectPrice && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Ảnh hưởng giá
                                                        </Badge>
                                                    )}
                                                </div>
                                                {attribute.values && attribute.values.length > 0 && (
                                                    <p className="text-sm text-gray-500 mt-1">{attribute.values.length} giá trị</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(attribute)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(attribute.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {(isCreating || editingAttribute) && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">{isCreating ? "Tạo thuộc tính mới" : "Chỉnh sửa thuộc tính"}</h3>
                                <Button variant="outline" size="sm" onClick={handleCancel}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="displayName">Tên thuộc tính *</Label>
                                    <Input
                                        id="displayName"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        placeholder="Ví dụ: Kích thước, Màu sắc..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="type">Loại thuộc tính</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Văn bản</SelectItem>
                                            <SelectItem value="number">Số</SelectItem>
                                            <SelectItem value="select">Lựa chọn</SelectItem>
                                            <SelectItem value="boolean">Có/Không</SelectItem>
                                            <SelectItem value="color">Màu sắc</SelectItem>
                                            <SelectItem value="date">Ngày tháng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isRequired"
                                        checked={formData.isRequired}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
                                    />
                                    <Label htmlFor="isRequired">Bắt buộc</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="affectPrice"
                                        checked={formData.affectPrice}
                                        onCheckedChange={(checked) => setFormData({ ...formData, affectPrice: checked })}
                                    />
                                    <Label htmlFor="affectPrice">Ảnh hưởng đến giá</Label>
                                </div>

                                {formData.type === "select" && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Các giá trị</Label>
                                            <Button variant="outline" size="sm" onClick={addValue}>
                                                <Plus className="h-3 w-3 mr-1" />
                                                Thêm giá trị
                                            </Button>
                                        </div>

                                        {formData.values.map((value, index) => (
                                            <Card key={value.id} className="p-3">
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Tên giá trị"
                                                            value={value.displayName}
                                                            onChange={(e) => updateValue(index, "displayName", e.target.value)}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeValue(index)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    {formData.affectPrice && (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Input
                                                                type="number"
                                                                placeholder="Điều chỉnh giá"
                                                                value={value.priceAdjustment}
                                                                onChange={(e) => updateValue(index, "priceAdjustment", Number(e.target.value))}
                                                            />
                                                            <Select
                                                                value={value.priceAdjustmentType}
                                                                onValueChange={(val: any) => updateValue(index, "priceAdjustmentType", val)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="fixed">Số tiền cố định</SelectItem>
                                                                    <SelectItem value="percentage">Phần trăm</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                <Separator />

                                <div className="flex gap-2">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSaving ? "Đang lưu..." : "Lưu"}
                                    </Button>
                                    <Button variant="outline" onClick={handleCancel}>
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
