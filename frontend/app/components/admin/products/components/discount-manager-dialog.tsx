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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Save, X, Calendar, Percent } from "lucide-react"
// import { toast } from "react-hot-toast"

import { booksApi, type Discount } from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"

interface DiscountManagerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDiscountsUpdated: () => void
}

export default function DiscountManagerDialog({ open, onOpenChange, onDiscountsUpdated }: DiscountManagerDialogProps) {
    const [discounts, setDiscounts] = useState<Discount[]>([])
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const { loading: discountsLoading, execute: executeDiscounts } = useApi<Discount[]>()

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "percentage" as const,
        value: 0,
        startDate: "",
        endDate: "",
        minQuantity: undefined as number | undefined,
        isActive: true,
    })

    useEffect(() => {
        if (open) {
            loadDiscounts()
        }
    }, [open])

    const loadDiscounts = async () => {
        try {
            const result = await executeDiscounts(() => booksApi.getDiscounts())
            if (result) setDiscounts(result)
        } catch (error) {
            console.error("Failed to load discounts:", error)
            toast.error("Không thể tải danh sách giảm giá")
        }
    }

    const handleCreate = () => {
        setIsCreating(true)
        setEditingDiscount(null)
        const today = new Date().toISOString().split("T")[0]
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

        setFormData({
            name: "",
            description: "",
            type: "percentage",
            value: 0,
            startDate: today,
            endDate: nextWeek,
            minQuantity: undefined,
            isActive: true,
        })
    }

    const handleEdit = (discount: Discount) => {
        setEditingDiscount(discount)
        setIsCreating(false)
        setFormData({
            name: discount.name,
            description: discount.description || "",
            type: discount.type,
            value: discount.value,
            startDate: discount.startDate.split("T")[0],
            endDate: discount.endDate.split("T")[0],
            minQuantity: discount.minQuantity,
            isActive: discount.isActive,
        })
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("Tên chương trình không được để trống")
            return
        }

        if (!formData.startDate || !formData.endDate) {
            toast.error("Vui lòng chọn ngày bắt đầu và kết thúc")
            return
        }

        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            toast.error("Ngày kết thúc phải sau ngày bắt đầu")
            return
        }

        if (formData.value <= 0) {
            toast.error("Giá trị giảm giá phải lớn hơn 0")
            return
        }

        setIsSaving(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 800))

            if (isCreating) {
                const newDiscount: Discount = {
                    id: Date.now(),
                    name: formData.name,
                    description: formData.description,
                    type: formData.type,
                    value: formData.value,
                    startDate: formData.startDate + "T00:00:00Z",
                    endDate: formData.endDate + "T23:59:59Z",
                    minQuantity: formData.minQuantity,
                    isActive: formData.isActive,
                }
                setDiscounts([...discounts, newDiscount])
                toast.success("Tạo chương trình giảm giá thành công!")
            } else if (editingDiscount) {
                const updatedDiscounts = discounts.map((discount) =>
                    discount.id === editingDiscount.id
                        ? {
                            ...discount,
                            name: formData.name,
                            description: formData.description,
                            type: formData.type,
                            value: formData.value,
                            startDate: formData.startDate + "T00:00:00Z",
                            endDate: formData.endDate + "T23:59:59Z",
                            minQuantity: formData.minQuantity,
                            isActive: formData.isActive,
                        }
                        : discount,
                )
                setDiscounts(updatedDiscounts)
                toast.success("Cập nhật chương trình giảm giá thành công!")
            }

            setIsCreating(false)
            setEditingDiscount(null)
            onDiscountsUpdated()
        } catch (error) {
            console.error("Failed to save discount:", error)
            toast.error("Lỗi khi lưu chương trình giảm giá")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (discountId: number) => {
        if (!confirm("Bạn có chắc muốn xóa chương trình giảm giá này?")) return

        try {
            await new Promise((resolve) => setTimeout(resolve, 500))

            setDiscounts(discounts.filter((discount) => discount.id !== discountId))
            toast.success("Xóa chương trình giảm giá thành công!")
            onDiscountsUpdated()
        } catch (error) {
            console.error("Failed to delete discount:", error)
            toast.error("Lỗi khi xóa chương trình giảm giá")
        }
    }

    const handleCancel = () => {
        setIsCreating(false)
        setEditingDiscount(null)
    }

    const getTypeLabel = (type: string) => {
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Quản lý chương trình giảm giá</DialogTitle>
                    <DialogDescription>Tạo và quản lý các chương trình giảm giá cho sản phẩm</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Danh sách giảm giá */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Danh sách chương trình</h3>
                            <Button onClick={handleCreate} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm mới
                            </Button>
                        </div>

                        {discountsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                                <span className="text-sm text-gray-500 mt-2">Đang tải...</span>
                            </div>
                        ) : discounts.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Chưa có chương trình giảm giá nào</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {discounts.map((discount) => {
                                    const isActive = isDiscountActive(discount)

                                    return (
                                        <Card key={discount.id} className="p-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">{discount.name}</h4>
                                                        <Badge variant={isActive ? "default" : "secondary"}>
                                                            {isActive ? "Đang hoạt động" : "Không hoạt động"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(discount)}>
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(discount.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Percent className="h-3 w-3" />
                                                        <span>
                              {getTypeLabel(discount.type)}: {getDiscountValue(discount)}
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

                                                {discount.description && <p className="text-sm text-gray-600">{discount.description}</p>}
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Form tạo/chỉnh sửa */}
                    {(isCreating || editingDiscount) && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">
                                    {isCreating ? "Tạo chương trình mới" : "Chỉnh sửa chương trình"}
                                </h3>
                                <Button variant="outline" size="sm" onClick={handleCancel}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Tên chương trình *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ví dụ: Giảm giá mùa hè..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Mô tả chi tiết về chương trình..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="type">Loại giảm giá</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Phần trăm</SelectItem>
                                            <SelectItem value="fixed">Số tiền cố định</SelectItem>
                                            <SelectItem value="buy_x_get_y">Mua X tặng Y</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="value">
                                        {formData.type === "percentage"
                                            ? "Phần trăm giảm (%)"
                                            : formData.type === "fixed"
                                                ? "Số tiền giảm (đ)"
                                                : "Số lượng tặng"}
                                    </Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDate">Ngày kết thúc *</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {(formData.type === "buy_x_get_y" || formData.type === "fixed") && (
                                    <div>
                                        <Label htmlFor="minQuantity">Số lượng tối thiểu</Label>
                                        <Input
                                            id="minQuantity"
                                            type="number"
                                            value={formData.minQuantity || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    minQuantity: e.target.value ? Number(e.target.value) : undefined,
                                                })
                                            }
                                            placeholder="Không giới hạn"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                    />
                                    <Label htmlFor="isActive">Kích hoạt</Label>
                                </div>

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
