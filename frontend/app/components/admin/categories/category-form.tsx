"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {useNavigate} from "react-router";

interface Category {
    id: number
    name: string
    description: string
    imageUrl: string
    parentId?: number
    isShowOnHomepage: boolean
    homepageDisplayOrder: number
    isShowOnNavigationBar: boolean
    navigationDisplayOrder: number
    subCategories: Category[]
    createdAt: string
    updatedAt: string
}

interface CategoryFormProps {
    categoryId?: number
    isEdit?: boolean
}

// Mock data for parent categories
const mockParentCategories: Category[] = [
    {
        id: 1,
        name: "Văn học",
        description: "Sách văn học trong và ngoài nước",
        imageUrl: "/placeholder.svg?height=60&width=60",
        parentId: undefined,
        isShowOnHomepage: true,
        homepageDisplayOrder: 1,
        isShowOnNavigationBar: true,
        navigationDisplayOrder: 1,
        subCategories: [],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
    },
    {
        id: 4,
        name: "Khoa học - Công nghệ",
        description: "Sách về khoa học và công nghệ",
        imageUrl: "/placeholder.svg?height=60&width=60",
        parentId: undefined,
        isShowOnHomepage: true,
        homepageDisplayOrder: 2,
        isShowOnNavigationBar: true,
        navigationDisplayOrder: 2,
        subCategories: [],
        createdAt: "2024-01-16T10:00:00Z",
        updatedAt: "2024-01-16T10:00:00Z",
    },
]

export default function CategoryForm({ categoryId, isEdit = false }: CategoryFormProps) {
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [parentCategories, setParentCategories] = useState<Category[]>(mockParentCategories)
    const [imagePreview, setImagePreview] = useState<string>("")

    const [formData, setFormData] = useState({
        id: 0,
        name: "",
        description: "",
        parentId: null,
        isShowOnHomepage: false,
        homepageDisplayOrder: 0,
        isShowOnNavigationBar: false,
        navigationDisplayOrder: 0,
        imageUrl: "",
    })

    const router = useNavigate()

    useEffect(() => {
        loadParentCategories()
        if (isEdit && categoryId) {
            loadCategory(categoryId)
        }
    }, [isEdit, categoryId])

    const loadParentCategories = async () => {
        try {
            const id = categoryId  == null ? 0 : categoryId
            const response = await fetch("http://localhost/api/admin/categories/available-parents/" + id)
            const data = await response.json()
            setParentCategories(data)
        } catch (error) {
            console.log(error)
            toast("Không thể tải danh sách danh mục cha")
        }
    }

    const loadCategory = async (id: number) => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost/api/admin/categories/${id}`)
            const data = await response.json()

            console.log(data)


            setFormData({
                id: data.id,
                name: data.name,
                description: data.description,
                parentId: data.parentId || null,
                isShowOnHomepage: data.isShowOnHomepage,
                homepageDisplayOrder: data.homepageDisplayOrder,
                isShowOnNavigationBar: data.isShowOnNavigationBar,
                navigationDisplayOrder: data.navigationDisplayOrder,
                imageUrl: data.imageUrl || "",
            })

            if (data.imageUrl) {
                setImagePreview(data.imageUrl)
            }
        } catch (error) {
            console.log(error)
            toast("Không thể tải thông tin danh mục")
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Tên danh mục là bắt buộc"
        }

        if (formData.parentId && Number(formData.parentId) === formData.id) {
            newErrors.parentId = "Danh mục không thể là danh mục con của chính nó"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value })
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }
    }

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        const file = files[0]
        if (!file.type.startsWith("image/")) {
            toast("Vui lòng chọn file hình ảnh")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast("Kích thước file không được vượt quá 5MB")
            return
        }

        try {
            setLoading(true)

            const formUpload = new FormData()
            formUpload.append("files", file)

            const response = await fetch("/api/uploads", {
                method: "POST",
                body: formUpload,
            })

            if (!response.ok) {
                throw new Error("Lỗi khi upload ảnh")
            }

            const uploadedUrls: string[] = await response.json()

            if (uploadedUrls.length > 0) {
                const imageUrl = uploadedUrls[0]
                setImagePreview(imageUrl)
                handleInputChange("imageUrl", imageUrl)
                toast("Upload ảnh thành công!")
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast("Không thể upload ảnh. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    const removeImage = () => {
        setImagePreview("")
        handleInputChange("imageUrl", "")
        const fileInput = document.getElementById("image-upload") as HTMLInputElement
        if (fileInput) {
            fileInput.value = ""
        }
    }

    const handleSave = async () => {
        if (!validateForm()) return

        try {
            setLoading(true)

            const submitData = {
                id: formData.id,
                name: formData.name,
                description: formData.description,
                parentId: formData.parentId || null,
                isShowOnHomepage: formData.isShowOnHomepage,
                homepageDisplayOrder: formData.homepageDisplayOrder,
                isShowOnNavigationBar: formData.isShowOnNavigationBar,
                navigationDisplayOrder: formData.navigationDisplayOrder,
                imageUrl: formData.imageUrl || "",
            }

            if (isEdit) {
                const response = await fetch(`http://localhost/api/admin/categories/${categoryId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(submitData)
                })

                console.log("Updating category:", submitData)
                toast("Cập nhật danh mục thành công!")
            } else {
                const response = await fetch("http://localhost/api/admin/categories", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(submitData)
                })

                console.log("Creating category:", submitData)
                toast("Thêm danh mục thành công!")
            }
            router("/admin/categories")
        } catch (error) {
            console.error("Save category failed:", error)
            toast("Có lỗi xảy ra khi lưu danh mục!")
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
         router("/admin/categories")
        console.log("Navigate back to category list")
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h1>
                    <p className="text-gray-600 mt-1">
                        {isEdit ? "Cập nhật thông tin danh mục" : "Tạo danh mục mới cho hệ thống"}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Tên danh mục <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="VD: Văn học"
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Mô tả về danh mục..."
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="parentId">Danh mục cha</Label>
                                <Select
                                    value={formData.parentId?.toString()}
                                    onValueChange={(value) => handleInputChange("parentId", value)}
                                >
                                    <SelectTrigger className={errors.parentId ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Chọn danh mục cha (tùy chọn)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">Không có danh mục cha</SelectItem>
                                        {parentCategories
                                            .filter((cat) => cat.id !== formData.id)
                                            .map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.parentId && <span className="text-sm text-red-500">{errors.parentId}</span>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image-upload">Hình ảnh danh mục</Label>
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="cursor-pointer"
                                />
                                <div className="text-xs text-gray-500">Chấp nhận: JPG, PNG, GIF. Tối đa 5MB.</div>
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview || "/placeholder.svg"}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded border"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt hiển thị</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Homepage Display */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <Label htmlFor="isShowOnHomepage" className="text-sm font-medium">
                                            Hiển thị trên trang chủ
                                        </Label>
                                        <div className="text-xs text-gray-500">Danh mục sẽ được hiển thị trên trang chủ</div>
                                    </div>
                                    <Switch
                                        id="isShowOnHomepage"
                                        checked={formData.isShowOnHomepage}
                                        onCheckedChange={(checked) => handleInputChange("isShowOnHomepage", checked)}
                                    />
                                </div>

                                {formData.isShowOnHomepage && (
                                    <div className="grid gap-2 ml-4">
                                        <Label htmlFor="homepageDisplayOrder">Thứ tự hiển thị trên trang chủ</Label>
                                        <Input
                                            id="homepageDisplayOrder"
                                            type="number"
                                            value={formData.homepageDisplayOrder}
                                            onChange={(e) => handleInputChange("homepageDisplayOrder", Number(e.target.value))}
                                            min="0"
                                            placeholder="0"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <Label htmlFor="isShowOnNavigationBar" className="text-sm font-medium">
                                            Hiển thị trên menu điều hướng
                                        </Label>
                                        <div className="text-xs text-gray-500">Danh mục sẽ được hiển thị trên menu điều hướng</div>
                                    </div>
                                    <Switch
                                        id="isShowOnNavigationBar"
                                        checked={formData.isShowOnNavigationBar}
                                        onCheckedChange={(checked) => handleInputChange("isShowOnNavigationBar", checked)}
                                    />
                                </div>

                                {formData.isShowOnNavigationBar && (
                                    <div className="grid gap-2 ml-4">
                                        <Label htmlFor="navigationDisplayOrder">Thứ tự hiển thị trên menu</Label>
                                        <Input
                                            id="navigationDisplayOrder"
                                            type="number"
                                            value={formData.navigationDisplayOrder}
                                            onChange={(e) => handleInputChange("navigationDisplayOrder", Number(e.target.value))}
                                            min="0"
                                            placeholder="0"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                    Hủy
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo danh mục"}
                </Button>
            </div>
        </div>
    )
}
