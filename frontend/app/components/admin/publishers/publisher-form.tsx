"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {useNavigate} from "react-router";

interface Publisher {
    id: number
    name: string
    description: string
    website: string
    logoUrl: string
    createdAt: string
    updatedAt: string
}

interface PublisherFormProps {
    publisherId?: number
    isEdit?: boolean
}

export default function PublisherForm({ publisherId, isEdit = false }: PublisherFormProps) {
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [logoPreview, setLogoPreview] = useState<string>("")

    const [formData, setFormData] = useState({
        id: 0,
        name: "",
        description: "",
        website: "",
        logoUrl: "",
    })

    useEffect(() => {
        if (isEdit && publisherId) {
            loadPublisher(publisherId)
        }
    }, [isEdit, publisherId])

    const loadPublisher = async (id: number) => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost/api/admin/publishers/${id}`)
            const data = await response.json()



            setFormData({
                id: data.id,
                name: data.name,
                description: data.description,
                website: data.website,
                logoUrl: data.logoUrl || "",
            })

            if (data.logoUrl) {
                setLogoPreview(data.logoUrl)
            }
        } catch (error) {
            console.log(error)
            toast("Không thể tải thông tin nhà xuất bản")
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Tên nhà xuất bản là bắt buộc"
        }

        if (formData.website && !isValidUrl(formData.website)) {
            newErrors.website = "Website không hợp lệ (phải bắt đầu bằng http:// hoặc https://)"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const isValidUrl = (url: string) => {
        try {
            new URL(url)
            return url.startsWith("http://") || url.startsWith("https://")
        } catch {
            return false
        }
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value })
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }
    }

    const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
                const logoUrl = uploadedUrls[0]
                setLogoPreview(logoUrl)
                handleInputChange("logoUrl", logoUrl)
                toast("Upload logo thành công!")
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast("Không thể upload logo. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    const removeLogo = () => {
        setLogoPreview("")
        handleInputChange("logoUrl", "")
        const fileInput = document.getElementById("logo-upload") as HTMLInputElement
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
                description: formData.description,
                website: formData.website,
                logoUrl: formData.logoUrl || "",
            }

            if (isEdit) {
                const response = await fetch(`http://localhost/api/admin/publishers/${publisherId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(submitData)
                })

                console.log("Updating publisher:", submitData)
                toast("Cập nhật nhà xuất bản thành công!")
            } else {
                const response = await fetch("http://localhost/api/admin/publishers", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(submitData)
                })

                console.log("Creating publisher:", submitData)
                toast("Thêm nhà xuất bản thành công!")
            }
            router("/admin/publishers")
        } catch (error) {
            console.error("Save publisher failed:", error)
            toast("Có lỗi xảy ra khi lưu nhà xuất bản!")
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        router("/admin/publishers")
        console.log("Navigate back to publisher list")
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? "Chỉnh sửa nhà xuất bản" : "Thêm nhà xuất bản mới"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isEdit ? "Cập nhật thông tin nhà xuất bản" : "Tạo nhà xuất bản mới cho hệ thống"}
                    </p>
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
                                Tên nhà xuất bản <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="VD: NXB Trẻ"
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
                                placeholder="Mô tả về nhà xuất bản, lĩnh vực hoạt động..."
                                className="min-h-[120px]"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => handleInputChange("website", e.target.value)}
                                placeholder="https://example.com"
                                className={errors.website ? "border-red-500" : ""}
                            />
                            {errors.website && <span className="text-sm text-red-500">{errors.website}</span>}
                            <div className="text-xs text-gray-500">Nhập đầy đủ URL bao gồm http:// hoặc https://</div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="logo-upload">Logo nhà xuất bản</Label>
                            <Input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="cursor-pointer"
                            />
                            <div className="text-xs text-gray-500">Chấp nhận: JPG, PNG, GIF. Tối đa 5MB.</div>
                            {logoPreview && (
                                <div className="mt-2">
                                    <img
                                        src={logoPreview || "/placeholder.svg"}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded border"
                                    />
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
                    {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo nhà xuất bản"}
                </Button>
            </div>
        </div>
    )
}
