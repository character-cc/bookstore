"use client"

import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import {Link} from "react-router";
import {useNavigate} from "react-router";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { customAttributesApi } from "~/lib/api"
import { useApi } from "~/hooks/useApi"

export default function AddAttributePage() {
    const router = useNavigate()
    const { loading, execute } = useApi<any>()
    const [errors, setErrors] = useState<Record<string, string>>({})

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

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Tên thuộc tính là bắt buộc"
        } else if (!/^[a-z_][a-z0-9_]*$/.test(formData.name)) {
            newErrors.name = "Tên thuộc tính chỉ được chứa chữ thường, số và dấu gạch dưới, bắt đầu bằng chữ cái"
        }

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

    const handleSave = async (continueEditing = false) => {
        if (!validateForm()) return

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

            const result = await execute(() => customAttributesApi.createAttribute(attributeData), {
                successMessage: "Tạo thuộc tính thành công!",
            })

            if (result) {
                if (continueEditing) {
                    router(`/admin/custom-attributes/${result.id}/edit`)
                } else {
                    router("/admin/custom-attributes")
                }
            }
        } catch (error) {
            console.error("Save attribute failed:", error)
        }
    }

    const needsValues = (type: string) => {
        return type === "select" || type === "multiselect"
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
                    <h1 className="text-2xl font-bold">Thêm thuộc tính mới</h1>
                    <p className="text-gray-600">Tạo thuộc tính tùy chỉnh mới để thu thập thông tin khách hàng</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>Thông tin chung về thuộc tính</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Tên thuộc tính <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="customer_level"
                                        className={errors.name ? "border-red-500" : ""}
                                    />
                                    {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}

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
                                    <Select value={formData.type} onValueChange={(value: any) => handleInputChange("type", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại dữ liệu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Văn bản</SelectItem>
                                            <SelectItem value="number">Số</SelectItem>
                                            <SelectItem value="select">Lựa chọn đơn</SelectItem>
                                            <SelectItem value="multiselect">Lựa chọn nhiều</SelectItem>
                                            <SelectItem value="boolean">Đúng/Sai</SelectItem>
                                            <SelectItem value="date">Ngày tháng</SelectItem>
                                            <SelectItem value="textarea">Văn bản dài</SelectItem>
                                        </SelectContent>
                                    </Select>
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

                    {needsValues(formData.type) && (
                        <Card>
                            <CardContent className="p-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <div className="text-blue-600 text-xl">ℹ️</div>
                                        <div>
                                            <h4 className="font-medium text-blue-900">Quản lý giá trị</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Sau khi lưu thuộc tính này, bạn có thể thêm các giá trị lựa chọn cho khách hàng bằng cách chọn
                                                "Lưu & Tiếp tục chỉnh sửa".
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hành động</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button onClick={() => handleSave(false)} className="w-full" disabled={loading}>
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? "Đang lưu..." : "Lưu thuộc tính"}
                            </Button>

                            <Button variant="outline" onClick={() => handleSave(true)} className="w-full" disabled={loading}>
                                <Save className="h-4 w-4 mr-2" />
                                Lưu & Tiếp tục chỉnh sửa
                            </Button>

                            <Separator />

                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/admin/custom-attributes">Hủy</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Trợ giúp</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-600 space-y-2">
                            <p>• Tên thuộc tính phải duy nhất và không thể thay đổi sau khi tạo</p>
                            <p>• Loại dữ liệu quyết định cách hiển thị và nhập liệu của thuộc tính</p>
                            <p>• Thuộc tính loại "Lựa chọn" cần thêm các giá trị sau khi tạo</p>
                            <p>• Thứ tự hiển thị quyết định vị trí của thuộc tính trong form</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
