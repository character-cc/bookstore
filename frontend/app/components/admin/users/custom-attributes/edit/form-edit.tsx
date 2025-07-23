"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, Plus, Edit, Trash2, Star, StarOff, ArrowUp, ArrowDown } from "lucide-react"
import { Link } from "react-router";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { customAttributesApi, type CustomAttribute, type AttributeValue } from "~/lib/api"
import { useApi } from "~/hooks/useApi"

interface EditAttributePageProps {
    attributeId: number
}

export default function EditAttributePage({ attributeId }: EditAttributePageProps) {
    const router = useNavigate()
    const [attribute, setAttribute] = useState<CustomAttribute | null>(null)
    const [values, setValues] = useState<AttributeValue[]>([])
    const [isValueDialogOpen, setIsValueDialogOpen] = useState(false)
    const [editingValue, setEditingValue] = useState<AttributeValue | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [activeTab, setActiveTab] = useState("general")

    const { loading: attributeLoading, execute: executeAttribute } = useApi<any>()
    const { loading: valuesLoading, execute: executeValues } = useApi<any>()

    const [formData, setFormData] = useState({
        name: "",
        label: "",
        type: "text" as "text" | "number" | "textarea",
        description: "",
        isRequired: false,
        isActive: true,
        sortOrder: 1,
        validation: {
            minLength: undefined as number | undefined,
            maxLength: undefined as number | undefined,
            min: undefined as number | undefined,
            max: undefined as number | undefined,
            pattern: "",
        },
    })

    const [valueFormData, setValueFormData] = useState({
        value: "",
        label: "",
        isDefault: false,
        sortOrder: 1,
        isActive: true,
    })

    useEffect(() => {
        loadAttribute()
        loadValues()
    }, [attributeId])

    const loadAttribute = async () => {
        try {
            const attributeData = await executeAttribute(() => customAttributesApi.getAttribute(attributeId), {
                errorMessage: "Không thể tải thông tin thuộc tính",
            })
            if (attributeData) {
                setAttribute(attributeData)
                setFormData({
                    name: attributeData.name,
                    label: attributeData.label,
                    type: attributeData.type,
                    description: attributeData.description || "",
                    isRequired: attributeData.isRequired,
                    isActive: attributeData.isActive,
                    sortOrder: attributeData.sortOrder,
                    validation: {
                        minLength: attributeData.validation?.minLength,
                        maxLength: attributeData.validation?.maxLength,
                        min: attributeData.validation?.min,
                        max: attributeData.validation?.max,
                        pattern: attributeData.validation?.pattern || "",
                    },
                })
            }
        } catch (error) {
            console.error("Failed to load attribute:", error)
        }
    }

    const loadValues = async () => {
        try {
            const valueData = await executeValues(() => customAttributesApi.getAttributeValues(attributeId), {
                errorMessage: "Không thể tải danh sách giá trị",
            }) as AttributeValue[]
            if (valueData) {
                setValues(valueData.sort((a, b) => a.sortOrder - b.sortOrder))
            }
        } catch (error) {
            console.error("Failed to load values:", error)
        }
    }

    const validateAttributeForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.label.trim()) {
            newErrors.label = "Nhãn hiển thị là bắt buộc"
        }

        if (formData.type === "number") {
            if (formData.validation.min !== undefined && formData.validation.max !== undefined) {
                if (formData.validation.min >= formData.validation.max) {
                    newErrors.validation = "Giá trị tối thiểu phải nhỏ hơn giá trị tối đa"
                }
            }
        }

        if (formData.type === "text" || formData.type === "textarea") {
            if (formData.validation.minLength !== undefined && formData.validation.maxLength !== undefined) {
                if (formData.validation.minLength >= formData.validation.maxLength) {
                    newErrors.validation = "Độ dài tối thiểu phải nhỏ hơn độ dài tối đa"
                }
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateValueForm = () => {
        const newErrors: Record<string, string> = {}

        if (!valueFormData.value.trim()) {
            newErrors.value = "Giá trị là bắt buộc"
        }

        if (!valueFormData.label.trim()) {
            newErrors.label = "Nhãn hiển thị là bắt buộc"
        }

        const existingValue = values.find(
            (v) => v.value === valueFormData.value && (!editingValue || v.id !== editingValue.id),
        )
        if (existingValue) {
            newErrors.value = "Giá trị này đã tồn tại"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: string, value: any) => {
        if (field.startsWith("validation.")) {
            const validationField = field.split(".")[1]
            setFormData({
                ...formData,
                validation: {
                    ...formData.validation,
                    [validationField]: value === "" ? undefined : value,
                },
            })
        } else {
            setFormData({ ...formData, [field]: value })
        }

        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }
    }

    const handleValueInputChange = (field: string, value: any) => {
        setValueFormData({ ...valueFormData, [field]: value })
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }
    }

    const handleSaveAttribute = async () => {
        if (!validateAttributeForm()) return

        try {
            const attributeData = {
                name: formData.name,
                label: formData.label,
                type: formData.type,
                description: formData.description,
                isRequired: formData.isRequired,
                isActive: formData.isActive,
                sortOrder: formData.sortOrder,
                validation: Object.fromEntries(
                    Object.entries(formData.validation).filter(([_, value]) => value !== undefined && value !== ""),
                ),
            }

            await executeAttribute(() => customAttributesApi.updateAttribute(attributeId, attributeData), {
                successMessage: "Cập nhật thuộc tính thành công!",
                onSuccess: () => {
                    loadAttribute()
                },
            })
        } catch (error) {
            console.error("Save attribute failed:", error)
        }
    }

    const openAddValueDialog = () => {
        setEditingValue(null)
        setValueFormData({
            value: "",
            label: "",
            isDefault: false,
            sortOrder: values.length + 1,
            isActive: true,
        })
        setErrors({})
        setIsValueDialogOpen(true)
    }

    const openEditValueDialog = (value: AttributeValue) => {
        setEditingValue(value)
        setValueFormData({
            value: value.value,
            label: value.label,
            isDefault: value.isDefault,
            sortOrder: value.sortOrder,
            isActive: value.isActive,
        })
        setErrors({})
        setIsValueDialogOpen(true)
    }

    const handleSaveValue = async () => {
        if (!validateValueForm()) return

        try {
            const valueData = {
                attributeId,
                value: valueFormData.value,
                label: valueFormData.label,
                isDefault: valueFormData.isDefault,
                sortOrder: valueFormData.sortOrder,
                isActive: valueFormData.isActive,
            }

            if (editingValue) {
                await executeValues(() => customAttributesApi.updateAttributeValue(editingValue.id, valueData), {
                    successMessage: "Cập nhật giá trị thành công!",
                    onSuccess: () => {
                        setIsValueDialogOpen(false)
                        loadValues()
                    },
                })
            } else {
                await executeValues(() => customAttributesApi.createAttributeValue(valueData), {
                    successMessage: "Thêm giá trị thành công!",
                    onSuccess: () => {
                        setIsValueDialogOpen(false)
                        loadValues()
                    },
                })
            }
        } catch (error) {
            console.error("Save value failed:", error)
        }
    }

    const handleDeleteValue = async (valueId: number) => {
        try {
            await executeValues(() => customAttributesApi.deleteAttributeValue(valueId), {
                successMessage: "Xóa giá trị thành công!",
                onSuccess: () => loadValues(),
            })
        } catch (error) {
            console.error("Delete value failed:", error)
        }
    }

    const handleSetDefaultValue = async (valueId: number) => {
        try {
            const currentDefault = values.find((v) => v.isDefault)
            if (currentDefault && currentDefault.id !== valueId) {
                await executeValues(() => customAttributesApi.updateAttributeValue(currentDefault.id, { isDefault: false }))
            }

            await executeValues(() => customAttributesApi.updateAttributeValue(valueId, { isDefault: true }), {
                successMessage: "Đã đặt làm giá trị mặc định!",
                onSuccess: () => loadValues(),
            })
        } catch (error) {
            console.error("Set default value failed:", error)
        }
    }

    const handleReorderValue = async (valueId: number, direction: "up" | "down") => {
        const currentIndex = values.findIndex((v) => v.id === valueId)
        if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === values.length - 1)) {
            return
        }

        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
        const currentValue = values[currentIndex]
        const swapValue = values[newIndex]

        try {
            await executeValues(() =>
                customAttributesApi.updateAttributeValue(currentValue.id, { sortOrder: swapValue.sortOrder }),
            )
            await executeValues(() =>
                customAttributesApi.updateAttributeValue(swapValue.id, { sortOrder: currentValue.sortOrder }),
            )

            loadValues()
        } catch (error) {
            console.error("Reorder failed:", error)
        }
    }

    const needsValues = (type: string) => {
        return type === "select" || type === "multiselect"
    }

    const getTypeLabel = (type: string) => {
        const labels = {
            text: "Văn bản",
            number: "Số",
            select: "Lựa chọn đơn",
            multiselect: "Lựa chọn nhiều",
            boolean: "Đúng/Sai",
            date: "Ngày tháng",
            textarea: "Văn bản dài",
        }
        return labels[type as keyof typeof labels] || type
    }

    if (!attribute) {
        return (
            <div className="container mx-auto py-6 max-w-7xl">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Đang tải...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 max-w-7xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/admin/custom-attributes">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Chỉnh sửa thuộc tính: {attribute.label}</h1>
                    <p className="text-gray-600">
                        Tên thuộc tính: {attribute.name} • Loại: {getTypeLabel(attribute.type)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                            {needsValues(attribute.type) && <TabsTrigger value="values">Giá trị ({values.length})</TabsTrigger>}
                        </TabsList>

                        <TabsContent value="general" className="space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin cơ bản</CardTitle>
                                    <CardDescription>Thông tin chung về thuộc tính</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Tên thuộc tính</Label>
                                            <Input id="name" value={formData.name} disabled className="bg-gray-50" />
                                            <span className="text-xs text-gray-500">Tên thuộc tính không thể thay đổi sau khi tạo.</span>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="label">
                                                Nhãn hiển thị <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="label"
                                                value={formData.label}
                                                onChange={(e) => handleInputChange("label", e.target.value)}
                                                placeholder="Cấp độ khách hàng"
                                                className={errors.label ? "border-red-500" : ""}
                                            />
                                            {errors.label && <span className="text-sm text-red-500">{errors.label}</span>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Loại dữ liệu</Label>
                                            <Input id="type" value={getTypeLabel(formData.type)} disabled className="bg-gray-50" />
                                            <span className="text-xs text-gray-500">Loại dữ liệu không thể thay đổi sau khi tạo.</span>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                                            <Input
                                                id="sortOrder"
                                                type="number"
                                                value={formData.sortOrder}
                                                onChange={(e) => handleInputChange("sortOrder", Number.parseInt(e.target.value) || 1)}
                                                min="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Mô tả</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange("description", e.target.value)}
                                            placeholder="Mô tả về thuộc tính này..."
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {(formData.type === "text" || formData.type === "textarea" || formData.type === "number") && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quy tắc xác thực</CardTitle>
                                        <CardDescription>Thiết lập các quy tắc xác thực cho dữ liệu nhập vào</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {(formData.type === "text" || formData.type === "textarea") && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="minLength">Độ dài tối thiểu</Label>
                                                    <Input
                                                        id="minLength"
                                                        type="number"
                                                        value={formData.validation.minLength || ""}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "validation.minLength",
                                                                e.target.value ? Number.parseInt(e.target.value) : undefined,
                                                            )
                                                        }
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="maxLength">Độ dài tối đa</Label>
                                                    <Input
                                                        id="maxLength"
                                                        type="number"
                                                        value={formData.validation.maxLength || ""}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "validation.maxLength",
                                                                e.target.value ? Number.parseInt(e.target.value) : undefined,
                                                            )
                                                        }
                                                        min="1"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {formData.type === "number" && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="min">Giá trị tối thiểu</Label>
                                                    <Input
                                                        id="min"
                                                        type="number"
                                                        value={formData.validation.min || ""}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "validation.min",
                                                                e.target.value ? Number.parseInt(e.target.value) : undefined,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="max">Giá trị tối đa</Label>
                                                    <Input
                                                        id="max"
                                                        type="number"
                                                        value={formData.validation.max || ""}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "validation.max",
                                                                e.target.value ? Number.parseInt(e.target.value) : undefined,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {formData.type === "text" && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="pattern">Mẫu regex (tùy chọn)</Label>
                                                <Input
                                                    id="pattern"
                                                    value={formData.validation.pattern || ""}
                                                    onChange={(e) => handleInputChange("validation.pattern", e.target.value)}
                                                    placeholder="^[A-Za-z0-9]+$"
                                                />
                                                <span className="text-xs text-gray-500">Mẫu biểu thức chính quy để xác thực dữ liệu</span>
                                            </div>
                                        )}

                                        {errors.validation && <span className="text-sm text-red-500">{errors.validation}</span>}
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Cài đặt</CardTitle>
                                    <CardDescription>Thiết lập các tùy chọn cho thuộc tính</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Bắt buộc</Label>
                                            <div className="text-sm text-gray-600">Khách hàng phải điền thông tin này</div>
                                        </div>
                                        <Switch
                                            checked={formData.isRequired}
                                            onCheckedChange={(checked) => handleInputChange("isRequired", checked)}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Hoạt động</Label>
                                            <div className="text-sm text-gray-600">Hiển thị thuộc tính này trong form</div>
                                        </div>
                                        <Switch
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {needsValues(attribute.type) && (
                            <TabsContent value="values" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Danh sách giá trị</CardTitle>
                                                <CardDescription>Quản lý các giá trị lựa chọn cho thuộc tính này</CardDescription>
                                            </div>
                                            <Button onClick={openAddValueDialog} disabled={valuesLoading}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Thêm giá trị
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Giá trị</TableHead>
                                                        <TableHead>Nhãn hiển thị</TableHead>
                                                        <TableHead>Mặc định</TableHead>
                                                        <TableHead>Trạng thái</TableHead>
                                                        <TableHead>Thứ tự</TableHead>
                                                        <TableHead className="w-32">Hành động</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {valuesLoading ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center py-8">
                                                                <div className="flex items-center justify-center">
                                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                                                    <span className="ml-2">Đang tải...</span>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : values.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                                <div className="space-y-2">
                                                                    <p>Chưa có giá trị nào</p>
                                                                    <Button onClick={openAddValueDialog} size="sm" variant="outline">
                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                        Thêm giá trị đầu tiên
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        values.map((value, index) => (
                                                            <TableRow key={value.id}>
                                                                <TableCell>
                                                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{value.value}</code>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="font-medium">{value.label}</span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {value.isDefault ? (
                                                                        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                                                                            <Star className="h-3 w-3 mr-1" />
                                                                            Mặc định
                                                                        </Badge>
                                                                    ) : (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleSetDefaultValue(value.id)}
                                                                            disabled={valuesLoading}
                                                                        >
                                                                            <StarOff className="h-3 w-3 mr-1" />
                                                                            Đặt mặc định
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={value.isActive ? "default" : "secondary"}>
                                                                        {value.isActive ? "Hoạt động" : "Không hoạt động"}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-sm">{value.sortOrder}</span>
                                                                        <div className="flex flex-col">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-4 w-4"
                                                                                onClick={() => handleReorderValue(value.id, "up")}
                                                                                disabled={valuesLoading || index === 0}
                                                                            >
                                                                                <ArrowUp className="h-3 w-3" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-4 w-4"
                                                                                onClick={() => handleReorderValue(value.id, "down")}
                                                                                disabled={valuesLoading || index === values.length - 1}
                                                                            >
                                                                                <ArrowDown className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => openEditValueDialog(value)}
                                                                            disabled={valuesLoading}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleDeleteValue(value.id)}
                                                                            disabled={valuesLoading}
                                                                            className="text-red-600 hover:text-red-700"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hành động</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button onClick={handleSaveAttribute} className="w-full" disabled={attributeLoading}>
                                <Save className="h-4 w-4 mr-2" />
                                {attributeLoading ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>

                            <Separator />

                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/admin/custom-attributes">Quay lại danh sách</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin thuộc tính</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">ID</Label>
                                <p className="text-sm">{attribute.id}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Tên thuộc tính</Label>
                                <p className="text-sm">{attribute.name}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Loại dữ liệu</Label>
                                <p className="text-sm">{getTypeLabel(attribute.type)}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Ngày tạo</Label>
                                <p className="text-sm">{attribute.createdAt}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Cập nhật cuối</Label>
                                <p className="text-sm">{attribute.updatedAt}</p>
                            </div>
                            {needsValues(attribute.type) && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Số giá trị</Label>
                                    <p className="text-sm">{values.length} giá trị</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingValue ? "Chỉnh sửa giá trị" : "Thêm giá trị mới"}</DialogTitle>
                        <DialogDescription>
                            {editingValue ? "Cập nhật thông tin giá trị lựa chọn" : "Thêm giá trị lựa chọn mới cho thuộc tính"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="value">
                                    Giá trị <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="value"
                                    value={valueFormData.value}
                                    onChange={(e) => handleValueInputChange("value", e.target.value)}
                                    placeholder="bronze"
                                    className={errors.value ? "border-red-500" : ""}
                                />
                                {errors.value && <span className="text-sm text-red-500">{errors.value}</span>}
                                <span className="text-xs text-gray-500">Giá trị được lưu trong database</span>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="label">
                                    Nhãn hiển thị <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="label"
                                    value={valueFormData.label}
                                    onChange={(e) => handleValueInputChange("label", e.target.value)}
                                    placeholder="Đồng"
                                    className={errors.label ? "border-red-500" : ""}
                                />
                                {errors.label && <span className="text-sm text-red-500">{errors.label}</span>}
                                <span className="text-xs text-gray-500">Nhãn hiển thị cho người dùng</span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                            <Input
                                id="sortOrder"
                                type="number"
                                value={valueFormData.sortOrder}
                                onChange={(e) => handleValueInputChange("sortOrder", Number.parseInt(e.target.value) || 1)}
                                min="1"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Giá trị mặc định</Label>
                                    <div className="text-sm text-gray-600">Được chọn mặc định khi tạo mới</div>
                                </div>
                                <Switch
                                    checked={valueFormData.isDefault}
                                    onCheckedChange={(checked) => handleValueInputChange("isDefault", checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Hoạt động</Label>
                                    <div className="text-sm text-gray-600">Hiển thị trong danh sách lựa chọn</div>
                                </div>
                                <Switch
                                    checked={valueFormData.isActive}
                                    onCheckedChange={(checked) => handleValueInputChange("isActive", checked)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsValueDialogOpen(false)} disabled={valuesLoading}>
                            Hủy
                        </Button>
                        <Button onClick={handleSaveValue} disabled={valuesLoading}>
                            {valuesLoading ? "Đang lưu..." : editingValue ? "Cập nhật" : "Thêm giá trị"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
