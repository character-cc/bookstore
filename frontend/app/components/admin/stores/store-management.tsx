"use client"

import { useState, useEffect } from "react"
import { Edit, MapPin, StoreIcon, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface StoreType {
    id: number
    name: string
    address: string
    provinceId: number
    provinceName: string
    districtId: number
    districtName: string
    wardId: string
    wardName: string
    streetAddress: string
    phone?: string
    email?: string
    manager?: string
    status: "active" | "inactive"
    createdAt: string
    updatedAt: string
}

export default function StoreManagement() {
    const [store, setStore] = useState<StoreType | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    // Address API states
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])

    const [formData, setFormData] = useState({
        id: 0,
        name: "",
        province: "",
        district: "",
        ward: "",
        streetAddress: "",
        phone: "",
        email: "",
        manager: "",
        status: "active" as "active" | "inactive",
        description: "",
    })

    useEffect(() => {
        loadProvinces()
        loadStore()
    }, [])

    const loadStore = async () => {
        try {
            setLoading(true)
            const response = await fetch("http://localhost/api/admin/store") // Load store with ID 1
            const data = await response.json()
            setStore(data)
            console.log(data)

            if (data) {
                setFormData({
                    id: data.id,
                    name: data.name,
                    province: data.provinceId?.toString() || "",
                    district: data.districtId?.toString() || "",
                    ward: data.wardId?.toString() || "",
                    streetAddress: data.streetAddress || "",
                    phone: data.phoneNumber || "",
                    email: data.email || "",
                    manager: data.managerName || "",
                    status: data.isActive ? "active" : "inactive",
                    description: data.description || "",
                })

                if (data.provinceId) {
                    await loadDistricts(data.provinceId)
                }
                if (data.districtId) {
                    await loadWards(data.districtId)
                }
            }
        } catch (error) {
            console.log(error)
            toast("Không thể tải thông tin cửa hàng")
        } finally {
            setLoading(false)
        }
    }

    const loadProvinces = async () => {
        try {
            const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
                method: "GET",
                headers: {
                    ContentType: "application/json; charset=UTF-8",
                    Token: "27379565-4dda-11f0-b5e1-defdee9f0d5d",
                },
            })
            if (!response.ok) {
                throw new Error("Province not found")
            }
            const json = await response.json()
            console.log(json)
            setProvinces(json.data)
        } catch (err) {
            console.log(err)
        }
    }

    const loadDistricts = async (provinceId: number) => {
        try {
            console.log(provinceId)
            const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    Token: "27379565-4dda-11f0-b5e1-defdee9f0d5d",
                },
                body: JSON.stringify({
                    province_id: provinceId,
                }),
            })
            if (!response.ok) {
                throw new Error("District not found")
            }
            const json = await response.json()
            console.log(json)
            setDistricts(json.data)
        } catch (err) {
            console.log(err)
        }
    }

    const loadWards = async (districtId: number) => {
        console.log(districtId)
        try {
            const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    Token: "27379565-4dda-11f0-b5e1-defdee9f0d5d",
                },
                body: JSON.stringify({
                    district_id: districtId,
                }),
            })
            if (!response.ok) {
                throw new Error("Ward not found")
            }
            const json = await response.json()
            console.log(json)
            setWards(json.data)
        } catch (err) {
            console.log(err)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Tên cửa hàng là bắt buộc"
        }

        if (!formData.province) {
            newErrors.province = "Vui lòng chọn tỉnh/thành phố"
        }

        if (!formData.district) {
            newErrors.district = "Vui lòng chọn quận/huyện"
        }

        if (!formData.ward) {
            newErrors.ward = "Vui lòng chọn phường/xã"
        }

        if (!formData.streetAddress.trim()) {
            newErrors.streetAddress = "Địa chỉ chi tiết là bắt buộc"
        }

        if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
            newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)"
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = async (field: string, value: string) => {
        setFormData({ ...formData, [field]: value })

        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }

        if (field === "province") {
            console.log(value)
            await setDistricts([])
            await loadDistricts(Number(value))
            setFormData((prev) => ({ ...prev, district: "", ward: "" }))
            setWards([])
        } else if (field === "district") {
            console.log("District" + value)
            loadWards(Number(value))
            setFormData((prev) => ({ ...prev, ward: "" }))
        }
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
        setErrors({})
        if (store) {
            setFormData({
                id: store.id,
                name: store.name,
                province: store.provinceId?.toString() || "",
                district: store.districtId?.toString() || "",
                ward: store.wardId?.toString() || "",
                streetAddress: store.streetAddress || "",
                phone: store.phoneNumber || "",
                email: store.email || "",
                manager: store.managerName || "",
                status: store.isActive ? "active" : "inactive",
                description: store.description || "",
            })
        }
    }

    const handleSave = async () => {
        if (!validateForm()) return

        try {
            setLoading(true)
            const provinceName = provinces.find((p) => p.ProvinceID === Number(formData.province))?.ProvinceName
            const districtName = districts.find((d) => d.DistrictID === Number(formData.district))?.DistrictName
            const wardName = wards.find((d) => d.WardCode === formData.ward)?.WardName

            const storeData = {
                id: formData.id,
                name: formData.name,
                provinceId: Number(formData.province),
                districtId: Number(formData.district),
                wardId: Number(formData.ward),
                streetAddress: formData.streetAddress,
                fullAddress: formData.streetAddress + ", " + wardName + ", " + districtName + ", " + provinceName,
                phoneNumber: formData.phone,
                email: formData.email,
                managerName: formData.manager,
                isActive: formData.status === "active",
                description: formData.description,
            }

            console.log(storeData)

            try {
                 if(storeData.id == 0) {
                     const response = await fetch("http://localhost/api/admin/stores", {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify(storeData),
                     })
                     if (!response.ok) {
                         throw new Error("Loi update store")
                     }
                 }
                 else {
                     const response = await fetch("http://localhost/api/admin/stores", {
                         method: "PUT",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify(storeData),
                     })
                     if (!response.ok) {
                         throw new Error("Loi update store")
                     }
                 }

                await loadStore() // Reload store data
                setIsEditing(false)
                toast("Cập nhật cửa hàng thành công!")
            } catch (error) {
                console.error(error)
                toast("Có lỗi xảy ra khi cập nhật cửa hàng!")
            }
        } catch (error) {
            console.error("Save store failed:", error)
            toast("Có lỗi xảy ra khi lưu cửa hàng!")
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: boolean) => {
        return status ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hoạt động</Badge>
        ) : (
            <Badge variant="secondary">Tạm dừng</Badge>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (loading && !store) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Đang tải thông tin cửa hàng...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thông tin cửa hàng</h1>
                    <p className="text-gray-600 mt-1">Quản lý thông tin cửa hàng của bạn</p>
                </div>
                {!isEditing ? (
                    <Button onClick={handleEdit} disabled={loading} className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel} disabled={loading}>
                            <X className="h-4 w-4 mr-2" />
                            Hủy
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </div>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <StoreIcon className="h-5 w-5" />
                        Thông tin cửa hàng
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isEditing ? (
                        // Display Mode
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tên cửa hàng</Label>
                                    <div className="mt-1 text-lg font-medium">{store?.name || "Chưa có thông tin"}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Trạng thái</Label>
                                    <div className="mt-1">{store ? getStatusBadge(store.isActive) : "Chưa có thông tin"}</div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Label className="text-sm font-medium text-gray-500">Địa chỉ</Label>
                                <div className="mt-1 flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>{store?.fullAddress || "Chưa có thông tin"}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Số điện thoại</Label>
                                    <div className="mt-1">{store?.phoneNumber || "Chưa có thông tin"}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                                    <div className="mt-1">{store?.email || "Chưa có thông tin"}</div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-500">Quản lý cửa hàng</Label>
                                <div className="mt-1">{store?.managerName || "Chưa có thông tin"}</div>
                            </div>

                            {store?.description && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Ghi chú</Label>
                                    <div className="mt-1">{store.description}</div>
                                </div>
                            )}

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Ngày tạo</Label>
                                    <div className="mt-1">{store ? formatDate(store.createdAt) : "Chưa có thông tin"}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</Label>
                                    <div className="mt-1">{store ? formatDate(store.updatedAt) : "Chưa có thông tin"}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Edit Mode
                        <div className="space-y-4">
                            {/* Store Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Tên cửa hàng <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="VD: Cửa hàng Trung tâm"
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        placeholder="0901234567"
                                        className={errors.phone ? "border-red-500" : ""}
                                    />
                                    {errors.phone && <span className="text-sm text-red-500">{errors.phone}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="store@example.com"
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="manager">Quản lý cửa hàng</Label>
                                    <Input
                                        id="manager"
                                        value={formData.manager}
                                        onChange={(e) => handleInputChange("manager", e.target.value)}
                                        placeholder="Tên quản lý"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Trạng thái</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: "active" | "inactive") => handleInputChange("status", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Hoạt động</SelectItem>
                                            <SelectItem value="inactive">Tạm dừng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="province">
                                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
                                        <SelectTrigger className={errors.province ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Chọn tỉnh/thành" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {provinces.map((province) => (
                                                <SelectItem key={province.ProvinceID.toString()} value={province.ProvinceID.toString()}>
                                                    {province.ProvinceName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.province && <span className="text-sm text-red-500">{errors.province}</span>}
                                </div>

                                {/* District Select */}
                                <div className="grid gap-2">
                                    <Label htmlFor="district">
                                        Quận/Huyện <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.district}
                                        onValueChange={(value) => handleInputChange("district", value)}
                                        disabled={!formData.province}
                                    >
                                        <SelectTrigger className={errors.district ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Chọn quận/huyện" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.map((district) => (
                                                <SelectItem key={district.DistrictID.toString()} value={district.DistrictID.toString()}>
                                                    {district.DistrictName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.district && <span className="text-sm text-red-500">{errors.district}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="ward">
                                        Phường/Xã <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.ward}
                                        onValueChange={(value) => handleInputChange("ward", value)}
                                        disabled={!formData.district}
                                    >
                                        <SelectTrigger className={errors.ward ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Chọn phường/xã" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wards.map((ward) => (
                                                <SelectItem key={ward.WardCode.toString()} value={ward.WardCode.toString()}>
                                                    {ward.WardName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.ward && <span className="text-sm text-red-500">{errors.ward}</span>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="streetAddress">
                                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="streetAddress"
                                    value={formData.streetAddress}
                                    onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                                    placeholder="Số nhà, tên đường..."
                                    className={errors.streetAddress ? "border-red-500" : ""}
                                />
                                {errors.streetAddress && <span className="text-sm text-red-500">{errors.streetAddress}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Ghi chú</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Ghi chú thêm về cửa hàng..."
                                    className="min-h-[80px]"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
