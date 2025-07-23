"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {useNavigate} from "react-router";

interface Author {
    id: number
    name: string
    biography: string
    imageUrl: string
    isShownOnHomePage: boolean
    displayOrder: number
    createdAt: string
    updatedAt: string
}

interface AuthorFormProps {
    authorId?: number
    isEdit?: boolean
}

export default function AuthorForm({ authorId, isEdit = false }: AuthorFormProps) {
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [imagePreview, setImagePreview] = useState<string>("")

    const [formData, setFormData] = useState({
        id: 0,
        name: "",
        biography: "",
        isShownOnHomePage: false,
        displayOrder: 0,
        imageUrl: "",
    })

    useEffect(() => {
        if (isEdit && authorId) {
            loadAuthor(authorId)
        }
    }, [isEdit, authorId])

    const loadAuthor = async (id: number) => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost/api/admin/authors/${id}`)
            if(!response.ok){
                throw new Error("Error fetching author")
            }
            const data = await response.json()



            console.log(data)
            setFormData({
                id: data.id,
                name: data.name,
                biography: data.biography,
                isShownOnHomePage: data.isShownOnHomePage,
                displayOrder: data.displayOrder,
                imageUrl: data.imageUrl || "",
            })

            if (data.imageUrl) {
                setImagePreview(data.imageUrl)
            }
        } catch (error) {
            console.log(error)
            toast("Không thể tải thông tin tác giả")
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Tên tác giả là bắt buộc"
        }

        if (formData.isShownOnHomePage && formData.displayOrder < 0) {
            newErrors.displayOrder = "Thứ tự hiển thị phải là số dương"
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

        // Validate file type and size
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
        // Reset file input
        const fileInput = document.getElementById("image-upload") as HTMLInputElement
        if (fileInput) {
            fileInput.value = ""
        }
    }

    const router = useNavigate()

    const handleSave = async () => {
        if (!validateForm()) return

        try {
            setLoading(true)

            const submitData = {
                id: formData.id,
                name: formData.name,
                biography: formData.biography,
                isShownOnHomePage: formData.isShownOnHomePage,
                displayOrder: formData.displayOrder,
                imageUrl: formData.imageUrl || "",
            }

            if (isEdit) {
                // Update existing author
                const response = await fetch(`http://localhost/api/admin/authors/${authorId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(submitData)
                })

                console.log("Updating author:", submitData)
                toast("Cập nhật tác giả thành công!")
            } else {
                const response = await fetch("http://localhost/api/admin/authors", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(submitData)
                })

                console.log("Creating author:", submitData)
                toast("Thêm tác giả thành công!")
            }
            router("/admin/authors")
        } catch (error) {
            console.error("Save author failed:", error)
            toast("Có lỗi xảy ra khi lưu tác giả!")
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        router("/admin/authors")
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Chỉnh sửa tác giả" : "Thêm tác giả mới"}</h1>
                    <p className="text-gray-600 mt-1">{isEdit ? "Cập nhật thông tin tác giả" : "Tạo tác giả mới cho hệ thống"}</p>
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cơ bản</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Tên tác giả <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="VD: Dale Carnegie"
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="biography">Tiểu sử</Label>
                            <Textarea
                                id="biography"
                                value={formData.biography}
                                onChange={(e) => handleInputChange("biography", e.target.value)}
                                placeholder="Tiểu sử và thông tin về tác giả..."
                                className="min-h-[120px]"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image-upload">Hình ảnh tác giả</Label>
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
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <Label htmlFor="isShownOnHomePage" className="text-sm font-medium">
                                        Hiển thị trên trang chủ
                                    </Label>
                                    <div className="text-xs text-gray-500">Tác giả sẽ được hiển thị trên trang chủ</div>
                                </div>
                                <Switch
                                    id="isShownOnHomePage"
                                    checked={formData.isShownOnHomePage}
                                    onCheckedChange={(checked) => handleInputChange("isShownOnHomePage", checked)}
                                />
                            </div>

                            {formData.isShownOnHomePage && (
                                <div className="grid gap-2 ml-4">
                                    <Label htmlFor="displayOrder">Thứ tự hiển thị trên trang chủ</Label>
                                    <Input
                                        id="displayOrder"
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={(e) => handleInputChange("displayOrder", Number(e.target.value))}
                                        min="0"
                                        placeholder="0"
                                        className={errors.displayOrder ? "border-red-500" : ""}
                                    />
                                    {errors.displayOrder && <span className="text-sm text-red-500">{errors.displayOrder}</span>}
                                    <div className="text-xs text-gray-500">
                                        Số thứ tự càng nhỏ sẽ hiển thị càng trước (0 = hiển thị đầu tiên)
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                    Hủy
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo tác giả"}
                </Button>
            </div>
        </div>
    )
}
